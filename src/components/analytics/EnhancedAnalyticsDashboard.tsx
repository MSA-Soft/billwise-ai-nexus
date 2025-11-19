import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
  Calendar,
  Target,
  Activity,
  Users,
  Building,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Simple chart components (using CSS for visualization)
// In production, you'd use a library like recharts or chart.js

interface AnalyticsData {
  // Authorization metrics
  totalAuthorizations: number;
  pendingAuthorizations: number;
  approvedAuthorizations: number;
  deniedAuthorizations: number;
  approvalRate: number;
  averageProcessingDays: number;
  
  // Revenue metrics
  totalRevenue: number;
  collectedRevenue: number;
  outstandingRevenue: number;
  collectionRate: number;
  
  // Payer performance
  payerStats: Array<{
    payerName: string;
    totalRequests: number;
    approved: number;
    denied: number;
    approvalRate: number;
    averageDays: number;
  }>;
  
  // Trend data
  monthlyTrends: Array<{
    month: string;
    authorizations: number;
    approvals: number;
    denials: number;
    revenue: number;
  }>;
  
  // Task metrics
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageCompletionTime: number;
}

export function EnhancedAnalyticsDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, user]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const now = new Date();
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch authorization requests
      const { data: authRequests, error: authError } = await supabase
        .from('authorization_requests')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (authError) throw authError;

      // Fetch tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('authorization_requests' as any) // Using auth requests as tasks don't exist
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (tasksError) throw tasksError;

      // Fetch claims for revenue data (using billing_statements as claims don't exist)
      const { data: claims, error: claimsError } = await supabase
        .from('billing_statements' as any)
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (claimsError) throw claimsError;

      // Process data
      const authData = authRequests || [];
      const tasksData = tasks || [];
      const claimsData = claims || [];

      // Calculate authorization metrics
      const totalAuthorizations = authData.length;
      const pendingAuthorizations = authData.filter((a: any) => 
        a.status === 'pending' || a.status === 'submitted'
      ).length;
      const approvedAuthorizations = authData.filter((a: any) => a.status === 'approved').length;
      const deniedAuthorizations = authData.filter((a: any) => a.status === 'denied').length;
      const approvalRate = totalAuthorizations > 0 
        ? Math.round((approvedAuthorizations / (approvedAuthorizations + deniedAuthorizations)) * 100) 
        : 0;

      // Calculate revenue metrics
      const totalRevenue = claimsData.reduce((sum: number, claim: any) => sum + (parseFloat(claim.amount_due) || 0), 0);
      const collectedRevenue = claimsData
        .filter((c: any) => c.status === 'paid')
        .reduce((sum: number, claim: any) => sum + (parseFloat(claim.amount_due) || 0), 0);
      const outstandingRevenue = totalRevenue - collectedRevenue;
      const collectionRate = totalRevenue > 0 
        ? Math.round((collectedRevenue / totalRevenue) * 100) 
        : 0;

      // Calculate payer performance
      const payerMap = new Map<string, { total: number; approved: number; denied: number }>();
      
      authData.forEach((auth: any) => {
        const payerName = auth.payer_name || 'Unknown';
        if (!payerMap.has(payerName)) {
          payerMap.set(payerName, { total: 0, approved: 0, denied: 0 });
        }
        const stats = payerMap.get(payerName)!;
        stats.total++;
        if (auth.status === 'approved') stats.approved++;
        if (auth.status === 'denied') stats.denied++;
      });

      const payerStats = Array.from(payerMap.entries()).map(([payerName, stats]) => ({
        payerName,
        totalRequests: stats.total,
        approved: stats.approved,
        denied: stats.denied,
        approvalRate: stats.total > 0 
          ? Math.round((stats.approved / (stats.approved + stats.denied)) * 100) 
          : 0,
        averageDays: 5, // Mock data - would calculate from actual dates
      })).sort((a, b) => b.totalRequests - a.totalRequests);

      // Calculate monthly trends
      const monthlyMap = new Map<string, { authorizations: number; approvals: number; denials: number; revenue: number }>();
      
      authData.forEach((auth: any) => {
        const date = new Date(auth.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { authorizations: 0, approvals: 0, denials: 0, revenue: 0 });
        }
        const month = monthlyMap.get(monthKey)!;
        month.authorizations++;
        if (auth.status === 'approved') month.approvals++;
        if (auth.status === 'denied') month.denials++;
      });

      claimsData.forEach((claim: any) => {
        const date = new Date(claim.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyMap.has(monthKey)) {
          monthlyMap.get(monthKey)!.revenue += parseFloat(claim.amount_due) || 0;
        }
      });

      const monthlyTrends = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          ...data,
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6); // Last 6 months

      // Calculate task metrics
      const totalTasks = tasksData.length;
      const completedTasks = tasksData.filter(t => t.status === 'completed').length;
      const overdueTasks = tasksData.filter(t => {
        if (!t.due_date || t.status === 'completed' || t.status === 'cancelled') return false;
        return new Date(t.due_date) < new Date();
      }).length;

      setAnalyticsData({
        totalAuthorizations,
        pendingAuthorizations,
        approvedAuthorizations,
        deniedAuthorizations,
        approvalRate,
        averageProcessingDays: 5, // Mock - would calculate from actual data
        totalRevenue,
        collectedRevenue,
        outstandingRevenue,
        collectionRate,
        payerStats,
        monthlyTrends,
        totalTasks,
        completedTasks,
        overdueTasks,
        averageCompletionTime: 2.5, // Mock - would calculate from actual data
      });
    } catch (error: any) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  // Calculate trend indicators
  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0,
    };
  };

  // Mock previous period data for trends
  const previousApprovalRate = analyticsData.approvalRate - 2;
  const previousCollectionRate = analyticsData.collectionRate - 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Enhanced Analytics Dashboard
          </h2>
          <p className="text-muted-foreground mt-2">
            Comprehensive insights into authorization performance and revenue cycle
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authorizations">Authorizations</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Cycle</TabsTrigger>
          <TabsTrigger value="payers">Payer Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Authorizations</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalAuthorizations}</div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData.pendingAuthorizations} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.approvalRate}%</div>
                <div className="flex items-center text-xs mt-1">
                  {previousApprovalRate < analyticsData.approvalRate ? (
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span className={previousApprovalRate < analyticsData.approvalRate ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(analyticsData.approvalRate - previousApprovalRate)}% from last period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(analyticsData.totalRevenue / 1000).toFixed(1)}K
                </div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData.collectionRate}% collected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.completedTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData.overdueTasks} overdue
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trend Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Authorization Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <SimpleLineChart data={analyticsData.monthlyTrends} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <SimpleRevenueChart data={analyticsData.monthlyTrends} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Authorizations Tab */}
        <TabsContent value="authorizations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Approved</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(analyticsData.approvedAuthorizations / analyticsData.totalAuthorizations) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{analyticsData.approvedAuthorizations}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${(analyticsData.pendingAuthorizations / analyticsData.totalAuthorizations) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{analyticsData.pendingAuthorizations}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Denied</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${(analyticsData.deniedAuthorizations / analyticsData.totalAuthorizations) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{analyticsData.deniedAuthorizations}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Approval Rate</span>
                    <span className="text-sm font-medium">{analyticsData.approvalRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${analyticsData.approvalRate}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Avg Processing Days</span>
                    <span className="text-sm font-medium">{analyticsData.averageProcessingDays} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Task Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Total Tasks</span>
                    <span className="text-sm font-medium">{analyticsData.totalTasks}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="text-sm font-medium">{analyticsData.completedTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(analyticsData.completedTasks / analyticsData.totalTasks) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Overdue</span>
                    <span className="text-sm font-medium text-red-600">{analyticsData.overdueTasks}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Cycle Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${analyticsData.totalRevenue.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-2">All time period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Collected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ${analyticsData.collectedRevenue.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {analyticsData.collectionRate}% collection rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  ${analyticsData.outstandingRevenue.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Pending collection</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Collection Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Collection Rate</span>
                    <span className="text-sm font-medium">{analyticsData.collectionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-green-500 h-4 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${analyticsData.collectionRate}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        ${(analyticsData.collectedRevenue / 1000).toFixed(1)}K
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Collected:</span>
                    <span className="ml-2 font-medium">${analyticsData.collectedRevenue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Outstanding:</span>
                    <span className="ml-2 font-medium">${analyticsData.outstandingRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payer Analysis Tab */}
        <TabsContent value="payers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Payer Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.payerStats.map((payer, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{payer.payerName}</h4>
                      <Badge className={payer.approvalRate >= 80 ? 'bg-green-100 text-green-800' : payer.approvalRate >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                        {payer.approvalRate}% approval
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <span className="ml-2 font-medium">{payer.totalRequests}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Approved:</span>
                        <span className="ml-2 font-medium text-green-600">{payer.approved}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Denied:</span>
                        <span className="ml-2 font-medium text-red-600">{payer.denied}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Days:</span>
                        <span className="ml-2 font-medium">{payer.averageDays}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${payer.approvalRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
                {analyticsData.payerStats.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No payer data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Simple chart components (CSS-based visualization)
function SimpleLineChart({ data }: { data: any[] }) {
  if (data.length === 0) {
    return <p className="text-muted-foreground">No data available</p>;
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.authorizations, d.approvals, d.denials)));
  const height = 200;
  const width = 100;

  return (
    <div className="w-full h-full">
      <div className="relative" style={{ height: `${height}px` }}>
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y * 2}
              x2={width}
              y2={y * 2}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Authorization line */}
          <polyline
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * width;
              const y = height - (d.authorizations / maxValue) * height;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          
          {/* Approvals line */}
          <polyline
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * width;
              const y = height - (d.approvals / maxValue) * height;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground">
          {data.map((d, i) => (
            <span key={i}>{d.month}</span>
          ))}
        </div>
        <div className="absolute top-2 left-2 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span>Total</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-green-500"></div>
            <span>Approved</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimpleRevenueChart({ data }: { data: any[] }) {
  if (data.length === 0) {
    return <p className="text-muted-foreground">No data available</p>;
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const height = 200;
  const width = 100;

  return (
    <div className="w-full h-full">
      <div className="relative" style={{ height: `${height}px` }}>
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y * 2}
              x2={width}
              y2={y * 2}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Revenue bars */}
          {data.map((d, i) => {
            const barWidth = width / data.length - 2;
            const barHeight = (d.revenue / maxRevenue) * height;
            const x = (i * width) / data.length + 1;
            const y = height - barHeight;
            
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#10b981"
                opacity="0.8"
              />
            );
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground">
          {data.map((d, i) => (
            <span key={i}>{d.month}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

