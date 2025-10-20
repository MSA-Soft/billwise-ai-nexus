import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Shield,
  Search,
  Plus,
  Download,
  LogOut
} from "lucide-react";
import BillingModule from "../components/BillingModule";
import DenialManagement from "../components/DenialManagement";
import AuthorizationTracking from "../components/AuthorizationTracking";
import PatientBalanceBilling from "../components/PatientBalanceBilling";
import ReportsAnalytics from "../components/ReportsAnalytics";

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  // Mock data for dashboard metrics
  const dashboardMetrics = {
    totalClaims: 2847,
    pendingClaims: 156,
    deniedClaims: 23,
    paidClaims: 2668,
    totalRevenue: 1247850,
    pendingAuth: 45,
    collectionsAmount: 89340
  };

  const recentClaims = [
    { id: "CLM-2024-001", patient: "John Smith", amount: 450.00, status: "Paid", date: "2024-06-28" },
    { id: "CLM-2024-002", patient: "Sarah Johnson", amount: 275.50, status: "Pending", date: "2024-06-29" },
    { id: "CLM-2024-003", patient: "Mike Davis", amount: 125.75, status: "Denied", date: "2024-06-30" },
    { id: "CLM-2024-004", patient: "Emily Wilson", amount: 320.00, status: "Processing", date: "2024-06-30" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Denied": return "bg-red-100 text-red-800";
      case "Processing": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">MedBill AI Pro</h1>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Healthcare Billing Suite
                </Badge>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Claim
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Billing</span>
            </TabsTrigger>
            <TabsTrigger value="denials" className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>Denials</span>
            </TabsTrigger>
            <TabsTrigger value="authorization" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Authorization</span>
            </TabsTrigger>
            <TabsTrigger value="patient-billing" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Patient Billing</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardMetrics.totalClaims.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${dashboardMetrics.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardMetrics.pendingClaims}</div>
                  <p className="text-xs text-muted-foreground">-5% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Collections</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${dashboardMetrics.collectionsAmount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Claims Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Paid Claims</span>
                      </div>
                      <span className="font-semibold">{dashboardMetrics.paidClaims}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span>Pending Claims</span>
                      </div>
                      <span className="font-semibold">{dashboardMetrics.pendingClaims}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span>Denied Claims</span>
                      </div>
                      <span className="font-semibold">{dashboardMetrics.deniedClaims}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span>Pending Authorizations</span>
                      </div>
                      <span className="font-semibold">{dashboardMetrics.pendingAuth}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Claims Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentClaims.map((claim) => (
                      <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{claim.id}</div>
                          <div className="text-sm text-gray-600">{claim.patient}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${claim.amount}</div>
                          <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex-col space-y-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-6 w-6" />
                    <span>Create New Claim</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Search className="h-6 w-6" />
                    <span>Search Claims</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <TrendingUp className="h-6 w-6" />
                    <span>Generate Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Tab Contents */}
          <TabsContent value="billing">
            <BillingModule />
          </TabsContent>

          <TabsContent value="denials">
            <DenialManagement />
          </TabsContent>

          <TabsContent value="authorization">
            <AuthorizationTracking />
          </TabsContent>

          <TabsContent value="patient-billing">
            <PatientBalanceBilling />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </ProtectedRoute>
  );
};

export default Index;
