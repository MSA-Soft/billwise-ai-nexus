
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Clock, RefreshCw, CheckCircle, TrendingUp, Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DenialManagement = () => {
  const { toast } = useToast();

  const denialReasons = [
    { code: "CO-1", reason: "Deductible Amount", count: 45, trend: "+12%" },
    { code: "CO-2", reason: "Coinsurance Amount", count: 38, trend: "-5%" },
    { code: "CO-3", reason: "Co-payment Amount", count: 23, trend: "+8%" },
    { code: "CO-11", reason: "Diagnosis Not Covered", count: 67, trend: "+15%" },
    { code: "CO-16", reason: "Prior Authorization Required", count: 34, trend: "-10%" },
    { code: "CO-50", reason: "Non-covered Services", count: 28, trend: "+3%" }
  ];

  const deniedClaims = [
    {
      id: "CLM-2024-001",
      patient: "John Smith",
      amount: 450.00,
      denialCode: "CO-11",
      reason: "Diagnosis Not Covered",
      receivedDate: "2024-06-25",
      daysOpen: 5,
      priority: "High",
      status: "Under Review"
    },
    {
      id: "CLM-2024-002",
      patient: "Sarah Johnson",
      amount: 275.50,
      denialCode: "CO-16",
      reason: "Prior Authorization Required",
      receivedDate: "2024-06-28",
      daysOpen: 2,
      priority: "Medium",
      status: "Pending Appeal"
    },
    {
      id: "CLM-2024-003",
      patient: "Mike Davis",
      amount: 125.75,
      denialCode: "CO-1",
      reason: "Deductible Amount",
      receivedDate: "2024-06-30",
      daysOpen: 0,
      priority: "Low",
      status: "New"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Under Review": return "bg-blue-100 text-blue-800";
      case "Pending Appeal": return "bg-yellow-100 text-yellow-800";
      case "New": return "bg-red-100 text-red-800";
      case "Resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleAutoAppeal = (claimId: string) => {
    toast({
      title: "AI Appeal Generated",
      description: `Automated appeal created for claim ${claimId} using AI analysis.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Denial Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Denials
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <TrendingUp className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active-denials">Active Denials</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="appeals">Appeals Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Denials</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">235</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Days to Resolve</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.5</div>
                <p className="text-xs text-muted-foreground">-2.1 days from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78.2%</div>
                <p className="text-xs text-muted-foreground">+5.3% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recovery Amount</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$186K</div>
                <p className="text-xs text-muted-foreground">+15% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Denial Reasons */}
          <Card>
            <CardHeader>
              <CardTitle>Top Denial Reasons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {denialReasons.map((denial) => (
                  <div key={denial.code} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{denial.code}</Badge>
                      <div>
                        <div className="font-medium">{denial.reason}</div>
                        <div className="text-sm text-gray-600">{denial.count} occurrences</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        denial.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {denial.trend}
                      </span>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active-denials" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Denial Cases</CardTitle>
                <div className="flex space-x-2">
                  <Input placeholder="Search denials..." className="w-64" />
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deniedClaims.map((claim) => (
                  <div key={claim.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <div>
                          <div className="font-semibold">{claim.id}</div>
                          <div className="text-sm text-gray-600">{claim.patient}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(claim.priority)}>{claim.priority}</Badge>
                        <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Amount</div>
                        <div className="font-semibold">${claim.amount.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Denial Code</div>
                        <div className="font-semibold">{claim.denialCode}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Days Open</div>
                        <div className="font-semibold">{claim.daysOpen} days</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Received</div>
                        <div className="font-semibold">{claim.receivedDate}</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-1">Denial Reason</div>
                      <div className="text-sm bg-red-50 text-red-800 p-2 rounded">{claim.reason}</div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Claim
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleAutoAppeal(claim.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        AI Auto-Appeal
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Denial Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart showing denial trends over time would be displayed here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recovery Rate by Payer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Aetna</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>BCBS</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                      </div>
                      <span className="text-sm font-medium">72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cigna</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Medicare</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '91%' }}></div>
                      </div>
                      <span className="text-sm font-medium">91%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appeals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appeals Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI-Powered Appeals</h3>
                <p className="text-gray-600 mb-4">
                  Our AI system automatically generates appeals based on denial patterns and historical success rates.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Configure AI Appeals
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DenialManagement;
