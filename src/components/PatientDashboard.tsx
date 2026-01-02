import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Calendar, 
  FileText, 
  Heart, 
  Phone, 
  Mail, 
  MapPin, 
  Edit,
  AlertCircle,
  Clock,
  Shield,
  Stethoscope,
  Activity,
  TrendingUp,
  Users,
  ChevronRight,
  Plus,
  Download,
  Eye,
  MessageSquare,
  Bell,
  Star,
  Award,
  Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface PatientData {
  id: string;
  patient_id?: string; // Patient ID in format PAT-YYYYMMNNNNN
  name: string;
  age: number;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  insurance: string;
  status: 'active' | 'inactive';
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  medicalInfo: {
    allergies: string[];
    medications: string[];
    conditions: string[];
  };
  appointments: Array<{
    date: string;
    time: string;
    type: string;
    status: string;
    provider: string;
  }>;
  documents: Array<{
    name: string;
    type: string;
    date: string;
  }>;
  nextAppointment?: string | null;
  totalVisits?: number;
  outstandingBalance?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  preferredProvider?: string;
}

interface PatientDashboardProps {
  patient: PatientData;
  onEdit: () => void;
  onScheduleAppointment: () => void;
  onViewMedicalHistory: () => void;
  onVitalSigns: () => void;
  onProgressNotes: () => void;
  onTreatmentPlan: () => void;
  onSendMessage: () => void;
  onVerifyCoverage: () => void;
  onDownloadCard: () => void;
  onUploadDocument: () => void;
  onViewDocument: (documentName: string) => void;
  onDownloadDocument: (documentName: string) => void;
  onEditContact?: () => void;
  onEditInsurance?: () => void;
}

export function PatientDashboard({ 
  patient, 
  onEdit, 
  onScheduleAppointment, 
  onViewMedicalHistory,
  onVitalSigns,
  onProgressNotes,
  onTreatmentPlan,
  onSendMessage,
  onVerifyCoverage,
  onDownloadCard,
  onUploadDocument,
  onViewDocument,
  onDownloadDocument,
  onEditContact,
  onEditInsurance
}: PatientDashboardProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Array<{
    id: string;
    name: string;
    type: string;
    date: string;
    fileUrl?: string;
    fileName?: string;
  }>>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  // Fetch documents from database
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!patient?.id) return;
      
      setIsLoadingDocuments(true);
      try {
        const { data, error } = await supabase
          .from('patient_documents' as any)
          .select('*')
          .eq('patient_id', patient.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching documents:', error);
          toast({
            title: 'Error loading documents',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }

        const transformedDocuments = (data || []).map((doc: any) => ({
          id: doc.id,
          name: doc.document_name || doc.file_name || 'Untitled Document',
          type: doc.document_type || 'other',
          date: doc.upload_date || doc.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          fileUrl: doc.file_url,
          fileName: doc.file_name,
        }));

        setDocuments(transformedDocuments);
      } catch (error: any) {
        console.error('Error fetching documents:', error);
        toast({
          title: 'Error loading documents',
          description: error.message || 'Failed to load documents',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    fetchDocuments();
  }, [patient?.id, toast]);

  const upcomingAppointments = patient.appointments
    .filter(apt => new Date(apt.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const recentDocuments = documents
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="space-y-8 p-6">
        {/* Enhanced Patient Header */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-blue-50/50">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                      {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                    <div className={`h-4 w-4 rounded-full ${patient.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
                    <Badge className={`${getStatusColor(patient.status)} border font-semibold`}>
                      {patient.status}
                    </Badge>
                    {patient.riskLevel && (
                      <Badge className={`${getRiskColor(patient.riskLevel)} border font-semibold`}>
                        {patient.riskLevel} risk
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Patient ID</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {patient.patient_id && patient.patient_id.startsWith('PAT-') 
                          ? patient.patient_id 
                          : patient.patient_id || patient.id}
                      </p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Age</p>
                      <p className="text-lg font-semibold text-gray-900">{patient.age} years</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">DOB</p>
                      <p className="text-lg font-semibold text-gray-900">{patient.dateOfBirth}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Visits</p>
                      <p className="text-lg font-semibold text-gray-900">{patient.totalVisits || 0}</p>
                    </div>
                  </div>

                  {patient.outstandingBalance && patient.outstandingBalance > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-800">
                        Outstanding Balance: ${patient.outstandingBalance.toFixed(2)}
                      </span>
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
                  Edit Patient
                </Button>
                <Button 
                  onClick={onScheduleAppointment}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Contact Information */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Contact Information
                </div>
                {onEditContact && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEditContact}
                    className="text-white hover:bg-white/20"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{patient.phone}</p>
                    <p className="text-xs text-gray-600">Primary Phone</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Mail className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{patient.email}</p>
                    <p className="text-xs text-gray-600">Email Address</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <MapPin className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{patient.address}</p>
                    <p className="text-xs text-gray-600">Home Address</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                  Emergency Contact
                </h4>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="font-medium text-gray-900">{patient.emergencyContact.name}</p>
                  <p className="text-sm text-gray-600">{patient.emergencyContact.phone}</p>
                  <p className="text-xs text-orange-600 font-medium">{patient.emergencyContact.relation}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Insurance Information */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Insurance & Billing
                </div>
                {onEditInsurance && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEditInsurance}
                    className="text-white hover:bg-white/20"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4">
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">Primary Insurance</p>
                  <p className="text-lg font-semibold text-gray-900">{patient.insurance}</p>
                  {patient.preferredProvider && (
                    <p className="text-xs text-emerald-600 mt-1">Provider: {patient.preferredProvider}</p>
                  )}
                </div>
                
                {patient.nextAppointment && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800">Next Appointment</p>
                        <p className="text-sm text-blue-600">{patient.nextAppointment}</p>
                      </div>
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700"
                  onClick={onVerifyCoverage}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Coverage
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
                  onClick={onDownloadCard}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Card
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quick Actions */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-lg">
                <Zap className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start bg-white hover:bg-purple-50 border-purple-200 text-purple-700"
                onClick={onViewMedicalHistory}
              >
                <FileText className="h-4 w-4 mr-3" />
                Medical History
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start bg-white hover:bg-red-50 border-red-200 text-red-700"
                onClick={onVitalSigns}
              >
                <Heart className="h-4 w-4 mr-3" />
                Vital Signs
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
                onClick={onProgressNotes}
              >
                <FileText className="h-4 w-4 mr-3" />
                Progress Notes
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start bg-white hover:bg-green-50 border-green-200 text-green-700"
                onClick={onTreatmentPlan}
              >
                <Calendar className="h-4 w-4 mr-3" />
                Treatment Plan
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start bg-white hover:bg-orange-50 border-orange-200 text-orange-700"
                onClick={onSendMessage}
              >
                <MessageSquare className="h-4 w-4 mr-3" />
                Send Message
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
              value="appointments"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger 
              value="medical"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6"
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Medical Info
            </TabsTrigger>
            <TabsTrigger 
              value="documents"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6"
            >
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Upcoming Appointments */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <div className="flex items-start space-x-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{appointment.type}</p>
                              <p className="text-sm text-gray-600">{appointment.date} at {appointment.time}</p>
                              <p className="text-xs text-blue-600">{appointment.provider}</p>
                            </div>
                          </div>
                          <Badge className={`${appointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'} border-0`}>
                            {appointment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Clock className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No upcoming appointments</p>
                      <p className="text-sm text-gray-400">Schedule an appointment to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Medical Alerts */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-lg">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Medical Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {patient.medicalInfo.allergies.length > 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <p className="font-semibold text-red-800">Allergies</p>
                        </div>
                        <p className="text-sm text-red-700">{patient.medicalInfo.allergies.join(', ')}</p>
                      </div>
                    )}
                    
                    {patient.medicalInfo.conditions.length > 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <Stethoscope className="h-4 w-4 text-yellow-600" />
                          <p className="font-semibold text-yellow-800">Conditions</p>
                        </div>
                        <p className="text-sm text-yellow-700">{patient.medicalInfo.conditions.slice(0, 3).join(', ')}</p>
                        {patient.medicalInfo.conditions.length > 3 && (
                          <p className="text-xs text-yellow-600 mt-1">+{patient.medicalInfo.conditions.length - 3} more</p>
                        )}
                      </div>
                    )}
                    
                    {patient.medicalInfo.medications.length > 0 && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <Heart className="h-4 w-4 text-blue-600" />
                          <p className="font-semibold text-blue-800">Current Medications</p>
                        </div>
                        <p className="text-sm text-blue-700">{patient.medicalInfo.medications.slice(0, 2).join(', ')}</p>
                        {patient.medicalInfo.medications.length > 2 && (
                          <p className="text-xs text-blue-600 mt-1">+{patient.medicalInfo.medications.length - 2} more</p>
                        )}
                      </div>
                    )}

                    {patient.medicalInfo.allergies.length === 0 && patient.medicalInfo.conditions.length === 0 && patient.medicalInfo.medications.length === 0 && (
                      <div className="text-center py-8">
                        <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Award className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="text-gray-500 font-medium">No medical alerts</p>
                        <p className="text-sm text-gray-400">Patient has no known allergies, conditions, or medications</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="h-5 w-5 mr-2" />
                  Appointment History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {patient.appointments.map((appointment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{appointment.type}</p>
                          <p className="text-sm text-gray-600">{appointment.date} at {appointment.time}</p>
                          <p className="text-sm text-gray-500">with {appointment.provider}</p>
                        </div>
                      </div>
                      <Badge className={`${appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'} border-0`}>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-lg">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {patient.medicalInfo.allergies.length > 0 ? (
                    <div className="space-y-3">
                      {patient.medicalInfo.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive" className="mr-2 mb-2 bg-red-100 text-red-800 border-red-200">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Award className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-gray-500 font-medium">No known allergies</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-lg">
                    <Heart className="h-5 w-5 mr-2" />
                    Current Medications
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {patient.medicalInfo.medications.length > 0 ? (
                    <div className="space-y-3">
                      {patient.medicalInfo.medications.map((medication, index) => (
                        <div key={index} className="text-sm p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          {medication}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Heart className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No current medications</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-lg">
                    <Stethoscope className="h-5 w-5 mr-2" />
                    Medical Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {patient.medicalInfo.conditions.length > 0 ? (
                    <div className="space-y-3">
                      {patient.medicalInfo.conditions.map((condition, index) => (
                        <div key={index} className="text-sm p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          {condition}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Award className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-gray-500 font-medium">No known conditions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Patient Documents
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={onUploadDocument}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingDocuments ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="ml-2 text-gray-600">Loading documents...</p>
                  </div>
                ) : recentDocuments.length === 0 ? (
                  <div className="text-center p-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No documents found</p>
                    <p className="text-sm text-gray-500 mt-2">Upload a document to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentDocuments.map((document) => (
                      <div key={document.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{document.name}</p>
                            <p className="text-sm text-gray-600">{document.type} • {document.date}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {document.fileUrl && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-blue-600 hover:bg-blue-50"
                                onClick={() => {
                                  if (document.fileUrl) {
                                    window.open(document.fileUrl, '_blank');
                                  } else {
                                    onViewDocument(document.name);
                                  }
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-gray-600 hover:bg-gray-50"
                                onClick={() => {
                                  if (document.fileUrl) {
                                    const anchor = window.document.createElement('a');
                                    anchor.href = document.fileUrl;
                                    anchor.download = document.fileName || document.name;
                                    anchor.click();
                                  } else {
                                    onDownloadDocument(document.name);
                                  }
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
