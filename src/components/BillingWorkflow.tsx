import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  RefreshCw,
  Eye,
  Brain,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Target,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useBillingStatements } from '@/hooks/useBillingStatements';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const BillingWorkflow: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentCompany } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const { dashboardMetrics, loading: analyticsLoading, getDashboardMetrics } = useAnalytics();
  const { statements, loading: statementsLoading, fetchStatements } = useBillingStatements();
  const [chartData, setChartData] = useState<any[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  const recentStatements = statements.slice(0, 5);

  // Fetch chart data
  useEffect(() => {
    fetchChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCompany]);

  const fetchChartData = async () => {
    try {
      setLoadingCharts(true);
      
      // Fetch claims for the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const professionalQuery = supabase
        .from('professional_claims' as any)
        .select('id, status, total_charges, created_at, company_id')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (currentCompany?.id) {
        professionalQuery.or(`company_id.eq.${currentCompany.id},company_id.is.null`);
      }

      const legacyQuery = supabase
        .from('claims' as any)
        .select('id, status, total_charges, created_at')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      const [professionalResult, legacyResult] = await Promise.all([
        professionalQuery,
        legacyQuery
      ]);

      const allClaims = [
        ...(professionalResult.data || []),
        ...(legacyResult.data || [])
      ];

      // Group by month
      const monthlyData = new Map<string, { month: string; revenue: number; claims: number }>();
      
      allClaims.forEach((claim: any) => {
        const date = new Date(claim.created_at);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const amount = parseFloat(claim.total_charges || 0) || 0;
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { month: monthKey, revenue: 0, claims: 0 });
        }
        
        const monthData = monthlyData.get(monthKey)!;
        monthData.revenue += amount;
        monthData.claims += 1;
      });

      // Convert to array and sort by month
      const chartDataArray = Array.from(monthlyData.values()).sort((a, b) => {
        return new Date(a.month).getTime() - new Date(b.month).getTime();
      });

      setChartData(chartDataArray);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoadingCharts(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([getDashboardMetrics(), fetchStatements(), fetchChartData()]);
    toast({
      title: 'Dashboard refreshed',
      description: 'Dashboard data has been updated.',
    });
  };

  // Calculate chart data for status distribution
  const statusDistributionData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      'Paid': dashboardMetrics.billing.paid,
      'Pending': dashboardMetrics.billing.pending,
      'Total': dashboardMetrics.billing.totalStatements
    };
    
    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
  }, [dashboardMetrics]);

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

  // AI Analytics data
  const aiInsights = useMemo(() => {
    const totalClaims = dashboardMetrics.billing.totalStatements;
    const paidRate = totalClaims > 0 ? (dashboardMetrics.billing.paid / totalClaims) * 100 : 0;
    const pendingRate = totalClaims > 0 ? (dashboardMetrics.billing.pending / totalClaims) * 100 : 0;
    
    return {
      overallHealthScore: paidRate > 70 ? 85 : paidRate > 50 ? 65 : 45,
      denialRiskScore: pendingRate > 50 ? 75 : pendingRate > 30 ? 55 : 35,
      recommendations: [
        {
          priority: 'high',
          title: 'Improve Claim Submission Rate',
          description: `${pendingRate.toFixed(1)}% of claims are pending. Focus on faster processing.`,
          impact: 'High',
          action: 'Review pending claims workflow'
        },
        {
          priority: pendingRate > 50 ? 'high' : 'medium',
          title: 'Optimize Payment Collection',
          description: `Current paid rate: ${paidRate.toFixed(1)}%. Implement follow-up automation.`,
          impact: 'Medium',
          action: 'Set up automated payment reminders'
        },
        {
          priority: 'medium',
          title: 'Revenue Growth Opportunity',
          description: `Total revenue potential: $${dashboardMetrics.billing.totalAmount.toLocaleString()}. Focus on converting pending claims.`,
          impact: 'High',
          action: 'Prioritize high-value pending claims'
        }
      ],
      trends: {
        revenueTrend: chartData.length > 1 
          ? ((chartData[chartData.length - 1].revenue - chartData[0].revenue) / chartData[0].revenue * 100)
          : 0,
        claimsTrend: chartData.length > 1
          ? ((chartData[chartData.length - 1].claims - chartData[0].claims) / chartData[0].claims * 100)
          : 0
      }
    };
  }, [dashboardMetrics, chartData]);

  const handleNewClaim = () => {
    navigate('/claims');
  };

  const handleVerifyEligibility = () => {
    navigate('/eligibility-verification');
  };

  const handleViewReports = () => {
    navigate('/reports');
  };

  const handleManagePatients = () => {
    navigate('/patients');
  };

  const handleViewStatement = (statementId: string) => {
    // Navigate to statement details or open a modal
    toast({
      title: 'Viewing statement',
      description: `Opening statement ${statementId}...`,
    });
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (analyticsLoading || statementsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading billing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing Workflow</h1>
          <p className="text-muted-foreground">Manage your billing operations and track claim status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={analyticsLoading || statementsLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${(analyticsLoading || statementsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleNewClaim}>
            <FileText className="w-4 h-4 mr-2" />
            New Claim
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Statements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.billing.totalStatements.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time statements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Statements</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.billing.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Statements</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.billing.paid}</div>
            <p className="text-xs text-muted-foreground">
              Successfully paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardMetrics.billing.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time billing amount
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts & Analytics</TabsTrigger>
          <TabsTrigger value="ai-analytics">
            <Brain className="h-4 w-4 mr-2" />
            AI Analytics
          </TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Claims */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Statements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentStatements.length > 0 ? (
                    recentStatements.map((statement) => (
                      <div key={statement.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleViewStatement(statement.id)}>
                        <div className="space-y-1">
                          <p className="font-medium">{statement.patient_name}</p>
                          <p className="text-sm text-muted-foreground">{statement.id} • Patient ID: {statement.patient_id}</p>
                          <p className="text-sm text-muted-foreground">{new Date(statement.statement_date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className="font-medium">${statement.amount_due.toLocaleString()}</p>
                            <Badge className={getStatusColor(statement.status)}>
                              {statement.status || 'pending'}
                            </Badge>
                          </div>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No statements found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={handleNewClaim}>
                    <FileText className="h-6 w-6 mb-2" />
                    <span className="text-sm">New Claim</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={handleVerifyEligibility}>
                    <CheckCircle className="h-6 w-6 mb-2" />
                    <span className="text-sm">Verify Eligibility</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={handleViewReports}>
                    <TrendingUp className="h-6 w-6 mb-2" />
                    <span className="text-sm">View Reports</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={handleManagePatients}>
                    <Users className="h-6 w-6 mb-2" />
                    <span className="text-sm">Manage Patients</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Statements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statements.length > 0 ? (
                  statements.map((statement) => (
                    <div key={statement.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleViewStatement(statement.id)}>
                      <div className="space-y-1">
                        <p className="font-medium">{statement.patient_name}</p>
                        <p className="text-sm text-muted-foreground">{statement.id} • Patient ID: {statement.patient_id}</p>
                        <p className="text-sm text-muted-foreground">{new Date(statement.statement_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-medium">${statement.amount_due.toLocaleString()}</p>
                          <Badge className={getStatusColor(statement.status)}>
                            {statement.status || 'pending'}
                          </Badge>
                        </div>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No statements found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Revenue Trends (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCharts ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <p>No data available for the selected period</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Claims Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Claims Volume (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCharts ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="claims" fill="#10b981" name="Claims" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <p>No data available for the selected period</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Claim Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statusDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <p>No status data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Combined Revenue & Claims Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue vs Claims Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCharts ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
                      <Bar yAxisId="right" dataKey="claims" fill="#10b981" name="Claims" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <p>No data available for the selected period</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-analytics" className="space-y-4">
          {/* AI Health Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Overall Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - aiInsights.overallHealthScore / 100)}`}
                        className={aiInsights.overallHealthScore >= 70 ? 'text-green-500' : aiInsights.overallHealthScore >= 50 ? 'text-yellow-500' : 'text-red-500'}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">{aiInsights.overallHealthScore}</span>
                    </div>
                  </div>
                </div>
                <p className="text-center mt-4 text-sm text-muted-foreground">
                  {aiInsights.overallHealthScore >= 70 ? 'Excellent' : aiInsights.overallHealthScore >= 50 ? 'Good' : 'Needs Improvement'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Denial Risk Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - aiInsights.denialRiskScore / 100)}`}
                        className={aiInsights.denialRiskScore >= 60 ? 'text-red-500' : aiInsights.denialRiskScore >= 40 ? 'text-yellow-500' : 'text-green-500'}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">{aiInsights.denialRiskScore}</span>
                    </div>
                  </div>
                </div>
                <p className="text-center mt-4 text-sm text-muted-foreground">
                  {aiInsights.denialRiskScore >= 60 ? 'High Risk' : aiInsights.denialRiskScore >= 40 ? 'Medium Risk' : 'Low Risk'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Revenue Change</span>
                    <span className={`text-2xl font-bold ${aiInsights.trends.revenueTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {aiInsights.trends.revenueTrend >= 0 ? '+' : ''}{aiInsights.trends.revenueTrend.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Claims Change</span>
                    <span className={`text-2xl font-bold ${aiInsights.trends.claimsTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {aiInsights.trends.claimsTrend >= 0 ? '+' : ''}{aiInsights.trends.claimsTrend.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    className={`border rounded-lg p-4 ${rec.priority === 'high' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={rec.priority === 'high' ? 'destructive' : 'default'}>
                            {rec.priority.toUpperCase()} PRIORITY
                          </Badge>
                          <Badge variant="outline">{rec.impact} Impact</Badge>
                        </div>
                        <h4 className="font-semibold text-lg mb-1">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">{rec.action}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Take Action
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={() => navigate('/reports')}>
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span className="text-sm">Revenue Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={() => navigate('/reports')}>
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">Claims Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={() => navigate('/reports')}>
                  <AlertCircle className="h-6 w-6 mb-2" />
                  <span className="text-sm">Denial Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={() => navigate('/reports')}>
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-sm">Monthly Summary</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Billing configuration settings will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingWorkflow;
