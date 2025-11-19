import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  Brain,
  Calendar,
  BarChart3,
  Eye,
  Edit,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

interface ClaimData {
  id: string;
  claimNumber: string;
  patient: string;
  provider: string;
  dateOfService: string;
  amount: number;
  status: string;
  formType: string;
  insuranceProvider: string;
  submissionDate: string;
  cptCodes: string[];
  icdCodes: string[];
}

interface DenialManagementProps {
  claims: ClaimData[];
}

export function DenialManagement({ claims }: DenialManagementProps) {
  const [selectedClaim, setSelectedClaim] = useState<ClaimData | null>(null);

  const deniedClaims = claims.filter(claim => claim.status === 'denied');
  const resubmittedClaims = claims.filter(claim => claim.status === 'resubmitted');

  const denialStats = {
    totalDenials: deniedClaims.length,
    denialRate: claims.length > 0 ? ((deniedClaims.length / claims.length) * 100).toFixed(1) : '0',
    avgAppealTime: '14 days',
    successRate: '78%'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'denied': return 'bg-red-100 text-red-800';
      case 'resubmitted': return 'bg-purple-100 text-purple-800';
      case 'appealed': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const mockDenialReasons = [
    { code: 'CO-16', description: 'Claim/service lacks information which is needed for adjudication' },
    { code: 'CO-18', description: 'Duplicate claim/service' },
    { code: 'CO-22', description: 'This care may be covered by another payer per coordination of benefits' },
    { code: 'CO-50', description: 'These are non-covered services because this is not deemed a medical necessity' },
    { code: 'CO-97', description: 'The benefit for this service is included in the payment/allowance for another service/procedure' }
  ];

  return (
    <div className="space-y-6">
      {/* Denial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Denials</p>
                <p className="text-2xl font-bold text-red-600">{denialStats.totalDenials}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Denial Rate</p>
                <p className="text-2xl font-bold text-orange-600">{denialStats.denialRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Appeal Time</p>
                <p className="text-2xl font-bold text-blue-600">{denialStats.avgAppealTime}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{denialStats.successRate}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="denials" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="denials">Active Denials</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="appeals">Appeals</TabsTrigger>
        </TabsList>

        <TabsContent value="denials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Denied Claims ({deniedClaims.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deniedClaims.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Denied Claims</h3>
                  <p className="text-gray-600">All claims are processing successfully!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deniedClaims.map((claim) => (
                    <div key={claim.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <span className="font-medium text-blue-600">{claim.claimNumber}</span>
                            <Badge className={getStatusColor(claim.status)}>
                              {claim.status}
                            </Badge>
                            <span className="text-sm text-gray-600">{claim.patient}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Provider:</span> {claim.provider}
                            </div>
                            <div>
                              <span className="font-medium">Date:</span> {new Date(claim.dateOfService).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Amount:</span> ${claim.amount.toFixed(2)}
                            </div>
                            <div>
                              <span className="font-medium">Insurance:</span> {claim.insuranceProvider}
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="text-sm font-medium text-gray-700">Denial Reasons:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {mockDenialReasons.slice(0, 2).map((reason, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {reason.code}: {reason.description}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Appeal
                          </Button>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Resubmit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Denial Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Top Denial Reasons */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Top Denial Reasons</h3>
                  <div className="space-y-3">
                    {mockDenialReasons.map((reason, index) => (
                      <div key={reason.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{reason.code}</span>
                            <span className="text-sm text-gray-600">{reason.description}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">{Math.floor(Math.random() * 20) + 5} claims</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${Math.floor(Math.random() * 80) + 20}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Denial Trends */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Denial Trends</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">This Week</p>
                          <p className="text-2xl font-bold text-red-600">-12%</p>
                          <p className="text-xs text-gray-500">vs last week</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">This Month</p>
                          <p className="text-2xl font-bold text-orange-600">-8%</p>
                          <p className="text-xs text-gray-500">vs last month</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">This Quarter</p>
                          <p className="text-2xl font-bold text-green-600">-15%</p>
                          <p className="text-xs text-gray-500">vs last quarter</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* AI Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Improve Documentation</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Add more detailed clinical notes to reduce medical necessity denials by 23%.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Brain className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-900">Prior Authorization</h4>
                          <p className="text-sm text-green-700 mt-1">
                            Implement automated prior authorization checking to prevent 15% of denials.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Brain className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-900">Coding Accuracy</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Review and update coding practices to reduce coding-related denials by 18%.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Risk Assessment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Overall Risk Score</p>
                          <p className="text-3xl font-bold text-green-600">23%</p>
                          <p className="text-xs text-gray-500">Low Risk</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Predicted Denial Rate</p>
                          <p className="text-3xl font-bold text-blue-600">8.5%</p>
                          <p className="text-xs text-gray-500">Next Month</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appeals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Appeals Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Appeals Management</h3>
                <p className="text-gray-600">Track and manage claim appeals with automated workflows.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

