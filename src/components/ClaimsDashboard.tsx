import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  User, 
  Calendar, 
  DollarSign, 
  Edit,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Download,
  RefreshCw,
  Building,
  CreditCard,
  Stethoscope,
  Activity,
  TrendingUp,
  ChevronRight,
  Plus,
  MessageSquare,
  History,
  Shield
} from 'lucide-react';

interface ClaimData {
  id: string;
  patient: string;
  provider: string;
  dateOfService: string;
  submissionDate: string;
  amount: string;
  status: 'approved' | 'pending' | 'denied' | 'processing' | 'resubmitted' | 'draft';
  payer: string;
  cptCodes: string[];
  icdCodes: string[];
  totalCharges: number;
  patientResponsibility: number;
  insuranceAmount: number;
  copayAmount: number;
  deductibleAmount: number;
  priorAuthNumber: string;
  referralNumber: string;
  notes: string;
  formType: string;
  submissionMethod: string;
  isSecondaryClaim: boolean;
  procedures: Array<{
    cptCode: string;
    description: string;
    units: number;
    amount: number;
  }>;
  diagnoses: Array<{
    icdCode: string;
    description: string;
    primary: boolean;
  }>;
}

interface ClaimsDashboardProps {
  claim: ClaimData;
  onEdit: () => void;
  onView: () => void;
  onResubmit: (claim: ClaimData) => void;
  onApprove: (claim: ClaimData) => void;
  onDeny: (claim: ClaimData) => void;
}

export function ClaimsDashboard({ 
  claim, 
  onEdit, 
  onView, 
  onResubmit, 
  onApprove, 
  onDeny 
}: ClaimsDashboardProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'denied': return 'bg-red-100 text-red-800 border-red-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resubmitted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'denied': return <XCircle className="h-4 w-4" />;
      case 'processing': return <RefreshCw className="h-4 w-4" />;
      case 'resubmitted': return <Send className="h-4 w-4" />;
      case 'draft': return <Edit className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const primaryDiagnosis = claim.diagnoses.find(d => d.primary);
  const secondaryDiagnoses = claim.diagnoses.filter(d => !d.primary);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="space-y-8 p-6">
        {/* Enhanced Claim Header */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-blue-50/50">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                    <Badge className={`${getStatusColor(claim.status)} border font-semibold flex items-center`}>
                      {getStatusIcon(claim.status)}
                      <span className="ml-1 capitalize">{claim.status}</span>
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h1 className="text-3xl font-bold text-gray-900">Claim {claim.id}</h1>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      {claim.formType}
                    </Badge>
                    {claim.isSecondaryClaim && (
                      <Badge variant="outline" className="text-purple-600 border-purple-200">
                        Secondary
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Patient</p>
                      <p className="text-lg font-semibold text-gray-900">{claim.patient}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Provider</p>
                      <p className="text-lg font-semibold text-gray-900">{claim.provider}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Service Date</p>
                      <p className="text-lg font-semibold text-gray-900">{claim.dateOfService}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Amount</p>
                      <p className="text-lg font-semibold text-gray-900">{claim.amount}</p>
                    </div>
                  </div>

                  {claim.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Notes</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">{claim.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button 
                  variant="outline" 
                  onClick={onEdit}
                  className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 text-blue-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Claim
                </Button>
                <Button 
                  onClick={onView}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Financial Information */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-lg">
                <DollarSign className="h-5 w-5 mr-2" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Total Charges</span>
                  </div>
                  <span className="text-lg font-semibold text-green-800">${(claim.totalCharges || 0).toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Insurance Amount</span>
                  </div>
                  <span className="text-lg font-semibold text-blue-800">${(claim.insuranceAmount || 0).toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Patient Responsibility</span>
                  </div>
                  <span className="text-lg font-semibold text-orange-800">${(claim.patientResponsibility || 0).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">Copay</p>
                    <p className="font-semibold">${(claim.copayAmount || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">Deductible</p>
                    <p className="font-semibold">${(claim.deductibleAmount || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Insurance Information */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="h-5 w-5 mr-2" />
                Insurance & Authorization
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">Primary Payer</span>
                    <Building className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-700">{claim.payer}</p>
                  <p className="text-xs text-blue-600 mt-1">Submission: {claim.submissionMethod}</p>
                </div>
                
                {claim.priorAuthNumber && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Prior Authorization</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-sm text-green-700">{claim.priorAuthNumber}</p>
                  </div>
                )}
                
                {claim.referralNumber && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-800">Referral Number</span>
                      <Activity className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-sm text-purple-700">{claim.referralNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quick Actions */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-lg">
                <Activity className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start bg-white hover:bg-green-50 border-green-200 text-green-700"
                onClick={() => onApprove(claim)}
                disabled={claim.status === 'approved'}
              >
                <CheckCircle className="h-4 w-4 mr-3" />
                Approve Claim
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start bg-white hover:bg-red-50 border-red-200 text-red-700"
                onClick={() => onDeny(claim)}
                disabled={claim.status === 'denied'}
              >
                <XCircle className="h-4 w-4 mr-3" />
                Deny Claim
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
                onClick={() => onResubmit(claim)}
                disabled={claim.status === 'resubmitted'}
              >
                <Send className="h-4 w-4 mr-3" />
                Resubmit Claim
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start bg-white hover:bg-purple-50 border-purple-200 text-purple-700"
                onClick={() => console.log('Download claim')}
              >
                <Download className="h-4 w-4 mr-3" />
                Download PDF
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start bg-white hover:bg-orange-50 border-orange-200 text-orange-700"
                onClick={() => console.log('View history')}
              >
                <History className="h-4 w-4 mr-3" />
                View History
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Detailed Information Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white shadow-lg border border-gray-200 p-1 rounded-xl">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6"
            >
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="procedures"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6"
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Procedures
            </TabsTrigger>
            <TabsTrigger 
              value="diagnoses"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6"
            >
              <FileText className="h-4 w-4 mr-2" />
              Diagnoses
            </TabsTrigger>
            <TabsTrigger 
              value="timeline"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6"
            >
              <History className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Claim Summary */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="h-5 w-5 mr-2" />
                    Claim Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-800">Claim ID</span>
                      <span className="text-sm text-blue-700 font-mono">{claim.id}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">Form Type</span>
                      <span className="text-sm text-green-700">{claim.formType}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-purple-800">Submission Method</span>
                      <span className="text-sm text-purple-700">{claim.submissionMethod}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-orange-800">Submission Date</span>
                      <span className="text-sm text-orange-700">{claim.submissionDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-lg">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Status Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-800">Current Status</span>
                      <Badge className={getStatusColor(claim.status)}>
                        {getStatusIcon(claim.status)}
                        <span className="ml-1 capitalize">{claim.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-800">Service Date</span>
                      <span className="text-sm text-blue-700">{claim.dateOfService}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">Days Since Service</span>
                      <span className="text-sm text-green-700">
                        {Math.floor((new Date().getTime() - new Date(claim.dateOfService).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-purple-800">Days Since Submission</span>
                      <span className="text-sm text-purple-700">
                        {Math.floor((new Date().getTime() - new Date(claim.submissionDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="procedures">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-lg">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Procedures & Services
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {claim.procedures.map((procedure, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Stethoscope className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{procedure.cptCode}</p>
                          <p className="text-sm text-gray-600">{procedure.description}</p>
                          <p className="text-sm text-gray-500">Units: {procedure.units}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">${(procedure.amount || 0).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">per unit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diagnoses">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 mr-2" />
                  Diagnosis Codes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {primaryDiagnosis && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-800">Primary Diagnosis</span>
                      </div>
                      <p className="text-sm text-green-700 font-mono">{primaryDiagnosis.icdCode}</p>
                      <p className="text-sm text-green-600">{primaryDiagnosis.description}</p>
                    </div>
                  )}
                  
                  {secondaryDiagnoses.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Secondary Diagnoses</h4>
                      {secondaryDiagnoses.map((diagnosis, index) => (
                        <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                          <p className="text-sm text-blue-700 font-mono">{diagnosis.icdCode}</p>
                          <p className="text-sm text-blue-600">{diagnosis.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-lg">
                  <History className="h-5 w-5 mr-2" />
                  Claim Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Claim Submitted</p>
                      <p className="text-sm text-green-600">{claim.submissionDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">Service Date</p>
                      <p className="text-sm text-blue-600">{claim.dateOfService}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <Activity className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Current Status: {claim.status}</p>
                      <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
