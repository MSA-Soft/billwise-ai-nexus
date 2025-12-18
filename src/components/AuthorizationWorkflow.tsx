import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  User, 
  Building, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  FileDown, 
  Send, 
  Eye, 
  Copy, 
  RefreshCw, 
  Filter, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Target, 
  Zap, 
  Database, 
  BookOpen, 
  Settings, 
  HelpCircle, 
  Info, 
  ChevronRight, 
  ChevronDown, 
  Lightbulb, 
  AlertCircle, 
  CheckSquare, 
  Square,
  Users,
  DollarSign,
  FileCheck,
  Receipt,
  History,
  Star,
  Bookmark,
  Bell,
  MessageSquare,
  Paperclip,
  Camera,
  Video,
  MapPin,
  Globe,
  Lock,
  Unlock,
  Key,
  Scan,
  QrCode,
  Barcode,
  Hash,
  Percent,
  Calculator,
  PieChart,
  LineChart,
  AreaChart,
  TrendingDown,
  Minus,
  X,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  InfoIcon,
  ExternalLinkIcon,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronLeft,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Maximize2,
  Minimize2,
  Move,
  MoveHorizontal,
  MoveVertical,
  Grid,
  Grid3X3,
  List,
  Layout,
  LayoutGrid,
  LayoutList,
  LayoutTemplate,
  LayoutDashboard,
  LayoutPanelLeft,
  LayoutPanelTop
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AuthorizationWorkflow = () => {
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState("new-request");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedPayer, setSelectedPayer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayer, setFilterPayer] = useState("all");
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [payerSearchTerm, setPayerSearchTerm] = useState("");
  const [selectedAuthRequest, setSelectedAuthRequest] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Authorization request form state
  const [authRequest, setAuthRequest] = useState({
    // Patient Information
    patientId: "",
    patientName: "",
    patientDob: "",
    patientGender: "",
    patientPhone: "",
    patientEmail: "",
    patientAddress: "",
    patientCity: "",
    patientState: "",
    patientZip: "",
    
    // Insurance Information
    payerId: "",
    payerName: "",
    memberId: "",
    groupNumber: "",
    policyNumber: "",
    effectiveDate: "",
    terminationDate: "",
    
    // Provider Information
    providerNpi: "",
    providerName: "",
    providerPhone: "",
    providerFax: "",
    providerEmail: "",
    providerAddress: "",
    
    // Service Information
    serviceDate: "",
    serviceType: "",
    cptCodes: [] as string[],
    icdCodes: [] as string[],
    diagnosis: "",
    treatmentPlan: "",
    medicalNecessity: "",
    
    // Authorization Details
    authType: "prior", // prior, concurrent, retroactive
    urgency: "routine", // routine, urgent, stat
    requestedUnits: 1,
    requestedDuration: "",
    clinicalNotes: "",
    supportingDocuments: [] as string[],
    
    // Additional Information
    referringProvider: "",
    facilityId: "",
    facilityName: "",
    notes: "",
    internalNotes: ""
  });

  const [patients, setPatients] = useState<any[]>([]);
  const [payers, setPayers] = useState<any[]>([]);
  const [authRequests, setAuthRequests] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch patients, payers, and authorization requests from database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        // Fetch patients
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients' as any)
          .select('id, patient_id, first_name, last_name, date_of_birth, phone')
          .order('last_name', { ascending: true })
          .limit(100);

        if (!patientsError && patientsData) {
          const transformedPatients = patientsData.map((p: any) => ({
            id: p.id,
            name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
            dob: p.date_of_birth || '',
            phone: p.phone || '',
            insurance: 'Unknown' // Would need to join with patient_insurance
          }));
          setPatients(transformedPatients);
        }

        // Fetch payers
        const { data: payersData, error: payersError } = await supabase
          .from('insurance_payers' as any)
          .select('id, name, payer_type')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (!payersError && payersData) {
          const transformedPayers = payersData.map((p: any) => ({
            id: p.id,
            name: p.name || '',
            type: p.payer_type || 'Commercial',
            authRequired: true, // Default, would need payer-specific config
            avgProcessingTime: "3-5 days" // Default
          }));
          setPayers(transformedPayers);
        }

        // Fetch authorization requests
        const { data: authData, error: authError } = await supabase
          .from('authorization_requests' as any)
          .select(`
            *,
            patients:patient_id (id, first_name, last_name),
            insurance_payers:payer_id (id, name)
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (!authError && authData) {
          const transformedAuth = authData.map((a: any) => {
            const patient = Array.isArray(a.patients) ? a.patients[0] : a.patients;
            const payer = Array.isArray(a.insurance_payers) ? a.insurance_payers[0] : a.insurance_payers;
            return {
              id: a.id,
              patientName: patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() : 'Unknown',
              payerName: payer?.name || 'Unknown',
              serviceType: a.service_type || a.procedure_code || '',
              status: a.status || 'pending',
              submittedDate: a.submitted_date || a.created_at || '',
              expectedResponse: a.expected_response_date || '',
              urgency: a.urgency || 'routine',
              cptCodes: a.cpt_codes || [],
              icdCodes: a.icd_codes || [],
              progress: a.progress || 0
            };
          });
          setAuthRequests(transformedAuth);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Auth requests are now fetched from database in useEffect above

  const workflowSteps = [
    {
      id: "new-request",
      title: "New Request",
      description: "Create new authorization request",
      icon: Plus,
      color: "blue",
      status: "active"
    },
    {
      id: "review",
      title: "Review & Submit",
      description: "Review and submit authorization",
      icon: Eye,
      color: "green",
      status: "pending"
    },
    {
      id: "tracking",
      title: "Tracking",
      description: "Track authorization status",
      icon: Activity,
      color: "purple",
      status: "pending"
    },
    {
      id: "management",
      title: "Management",
      description: "Manage authorization requests",
      icon: Settings,
      color: "orange",
      status: "pending"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "denied":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "under-review":
        return <Eye className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case "denied":
        return <Badge variant="destructive">Denied</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "under-review":
        return <Badge variant="outline" className="border-blue-200 text-blue-800">Under Review</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "stat":
        return "text-red-600 bg-red-50 border-red-200";
      case "urgent":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "routine":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleViewDetails = (request: any) => {
    setSelectedAuthRequest(request);
    setIsModalOpen(true);
  };

  const handleExportDetails = () => {
    if (!selectedAuthRequest) return;

    const exportData = {
      "Authorization ID": selectedAuthRequest.id,
      "Patient Name": selectedAuthRequest.patientName,
      "Payer": selectedAuthRequest.payerName,
      "Service Type": selectedAuthRequest.serviceType,
      "Status": selectedAuthRequest.status,
      "Urgency": selectedAuthRequest.urgency,
      "Submitted Date": selectedAuthRequest.submittedDate,
      "Expected Response": selectedAuthRequest.expectedResponse || "N/A",
      "Approved Date": selectedAuthRequest.approvedDate || "N/A",
      "Denied Date": selectedAuthRequest.deniedDate || "N/A",
      "Progress": `${selectedAuthRequest.progress}%`,
      "CPT Codes": selectedAuthRequest.cptCodes.join(", "),
      "ICD Codes": selectedAuthRequest.icdCodes.join(", "),
      "Denial Reason": selectedAuthRequest.denialReason || "N/A",
      "Export Date": new Date().toLocaleString()
    };

    // Convert to CSV format with header
    const csvHeader = "Field,Value";
    const csvRows = Object.entries(exportData)
      .map(([key, value]) => `"${key}","${value}"`);
    const csvContent = [csvHeader, ...csvRows].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `authorization-${selectedAuthRequest.id}-details.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Authorization ${selectedAuthRequest.id} details exported successfully.`,
    });
  };

  const handleExportAuthRequestCSV = () => {
    const csvContent = [
      'Patient ID,Patient Name,Patient Date of Birth,Insurance Company,Member ID,Group Number,Service Type,Service Date,Authorization Type,Urgency,Diagnosis,Clinical Notes',
      `${authRequest.patientId || ''},${authRequest.patientName || ''},${authRequest.patientDob || ''},${authRequest.payerName || ''},${authRequest.memberId || ''},${authRequest.groupNumber || ''},${authRequest.serviceType || ''},${authRequest.serviceDate || ''},${authRequest.authType || ''},${authRequest.urgency || ''},${authRequest.diagnosis || ''},${authRequest.clinicalNotes || ''}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `authorization-request-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Authorization request data has been exported to CSV.",
    });
  };

  const handleDownloadAuthSampleCSV = () => {
    const csvContent = [
      'Patient ID,Patient Name,Patient Date of Birth,Insurance Company,Member ID,Group Number,Service Type,Service Date,Authorization Type,Urgency,Diagnosis,Clinical Notes',
      'PAT-001,John Doe,1990-01-15,Blue Cross Blue Shield,ABC123456789,GRP001,MRI Brain,2024-12-20,prior,routine,Headache and dizziness,Patient experiencing persistent headaches and dizziness requiring diagnostic imaging',
      'PAT-002,Jane Smith,1985-05-20,Aetna,DEF987654321,GRP002,Physical Therapy,2024-12-21,prior,routine,Lower back pain,Patient requires physical therapy for chronic lower back pain'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'authorization-request-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper function to parse CSV line properly (handles quoted values)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  };

  const handleImportAuthRequestCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          toast({
            title: "Import Failed",
            description: "CSV file must contain at least a header row and one data row.",
            variant: "destructive",
          });
          return;
        }

        // Parse headers and first data row properly
        const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const values = parseCSVLine(lines[1]).map(v => v.trim().replace(/^"|"$/g, ''));

        const getValue = (headerName: string) => {
          const index = headers.indexOf(headerName);
          return index >= 0 && values[index] ? values[index] : '';
        };

        // Get all possible header variations
        const patientId = getValue('patient id') || getValue('patientid') || getValue('patient_id');
        const patientName = getValue('patient name') || getValue('patientname') || getValue('patient_name');
        const patientDob = getValue('patient date of birth') || getValue('patient dob') || getValue('patientdateofbirth') || getValue('dob');
        const payerName = getValue('insurance company') || getValue('insurancecompany') || getValue('payer') || getValue('payer name');
        const memberId = getValue('member id') || getValue('memberid') || getValue('member_id') || getValue('insurance id') || getValue('subscriber id');
        const groupNumber = getValue('group number') || getValue('groupnumber') || getValue('group_number');
        const serviceType = getValue('service type') || getValue('servicetype') || getValue('service_type');
        const serviceDate = getValue('service date') || getValue('servicedate') || getValue('service_date') || getValue('appointment date');
        const authType = getValue('authorization type') || getValue('authorizationtype') || getValue('auth type') || getValue('auth_type');
        const urgency = getValue('urgency') || getValue('priority');
        const diagnosis = getValue('diagnosis') || getValue('primary diagnosis');
        const clinicalNotes = getValue('clinical notes') || getValue('clinicalnotes') || getValue('notes') || getValue('medical necessity');

        // Populate authorization request form from CSV - force update
        setAuthRequest(prev => {
          const updated = {
            ...prev,
            patientId: patientId || prev.patientId,
            patientName: patientName || prev.patientName,
            patientDob: patientDob || prev.patientDob,
            payerName: payerName || prev.payerName,
            memberId: memberId || prev.memberId,
            groupNumber: groupNumber || prev.groupNumber,
            serviceType: serviceType || prev.serviceType,
            serviceDate: serviceDate || prev.serviceDate,
            authType: authType || prev.authType,
            urgency: urgency || prev.urgency,
            diagnosis: diagnosis || prev.diagnosis,
            clinicalNotes: clinicalNotes || prev.clinicalNotes,
          };
          
          // Log for debugging
          console.log('CSV Import - Updating authorization form with:', {
            patientId,
            patientName,
            patientDob,
            payerName,
            memberId,
            serviceDate
          });
          
          return updated;
        });

        toast({
          title: "CSV Imported Successfully",
          description: `Authorization request form populated with data from CSV. ${patientId ? 'Patient ID: ' + patientId : ''} Please review and complete any missing fields.`,
        });
      } catch (error: any) {
        console.error('CSV Import Error:', error);
        toast({
          title: "Import Failed",
          description: error.message || "Error reading CSV file. Please check the format and try again.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleSubmitAuthRequest = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Authorization Submitted",
        description: "Your authorization request has been submitted successfully.",
      });
      
      // Reset form
      setAuthRequest({
        patientId: "",
        patientName: "",
        patientDob: "",
        patientGender: "",
        patientPhone: "",
        patientEmail: "",
        patientAddress: "",
        patientCity: "",
        patientState: "",
        patientZip: "",
        payerId: "",
        payerName: "",
        memberId: "",
        groupNumber: "",
        policyNumber: "",
        effectiveDate: "",
        terminationDate: "",
        providerNpi: "",
        providerName: "",
        providerPhone: "",
        providerFax: "",
        providerEmail: "",
        providerAddress: "",
        serviceDate: "",
        serviceType: "",
        cptCodes: [],
        icdCodes: [],
        diagnosis: "",
        treatmentPlan: "",
        medicalNecessity: "",
        authType: "prior",
        urgency: "routine",
        requestedUnits: 1,
        requestedDuration: "",
        clinicalNotes: "",
        supportingDocuments: [],
        referringProvider: "",
        facilityId: "",
        facilityName: "",
        notes: "",
        internalNotes: ""
      });
      
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Unable to submit authorization request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = authRequests.filter(request => {
    const matchesSearch = request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    const matchesPayer = filterPayer === "all" || request.payerName === filterPayer;
    return matchesSearch && matchesStatus && matchesPayer;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Authorization Workflow
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive prior authorization management system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="h-4 w-4 mr-2" />
            Workflow Active
          </Badge>
        </div>
      </div>

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Authorization Workflow Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              
              return (
                <div key={step.id} className="relative">
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    isActive ? "bg-blue-100 text-blue-800 border-blue-200" : 
                    "bg-gray-50 border-gray-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        isActive ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{step.title}</h3>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeStep} onValueChange={setActiveStep} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="new-request">New Request</TabsTrigger>
          <TabsTrigger value="review">Review & Submit</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        {/* New Request Tab */}
        <TabsContent value="new-request" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                New Authorization Request
              </CardTitle>
            </CardHeader>
            
            {/* CSV Import/Export Actions - Prominent Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-6 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">CSV Operations</h3>
                  <p className="text-sm text-blue-700">Import authorization data from CSV or export current form data</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleExportAuthRequestCSV}
                    className="bg-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleDownloadAuthSampleCSV}
                    className="bg-white"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Sample CSV
                  </Button>
                  <Button
                    variant="default"
                    size="default"
                    asChild
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <label className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Import CSV
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleImportAuthRequestCSV}
                        className="hidden"
                      />
                    </label>
                  </Button>
                </div>
              </div>
            </div>
            
            <CardContent className="space-y-6">
              {/* Simple Patient Selection */}
              <div>
                <h3 className="font-semibold mb-3">1. Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientId">Patient ID *</Label>
                    <Input
                      id="patientId"
                      name="patientId"
                      value={authRequest.patientId}
                      onChange={(e) => setAuthRequest(prev => ({ ...prev, patientId: e.target.value }))}
                      placeholder="Enter patient ID"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientName">Patient Name *</Label>
                    <Input
                      id="patientName"
                      name="patientName"
                      value={authRequest.patientName}
                      onChange={(e) => setAuthRequest(prev => ({ ...prev, patientName: e.target.value }))}
                      placeholder="Enter patient name"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientDob">Date of Birth *</Label>
                    <Input
                      id="patientDob"
                      type="date"
                      value={authRequest.patientDob}
                      onChange={(e) => setAuthRequest(prev => ({ ...prev, patientDob: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientPhone">Phone Number</Label>
                    <Input
                      id="patientPhone"
                      value={authRequest.patientPhone}
                      onChange={(e) => setAuthRequest(prev => ({ ...prev, patientPhone: e.target.value }))}
                      placeholder="(XXX) XXX-XXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Simple Payer Selection */}
              <div>
                <h3 className="font-semibold mb-3">2. Insurance Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payerName">Insurance Company *</Label>
                    <Select value={authRequest.payerName} onValueChange={(value) => setAuthRequest(prev => ({ ...prev, payerName: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select insurance company" />
                      </SelectTrigger>
                      <SelectContent>
                        {payers.map((payer) => (
                          <SelectItem key={payer.id} value={payer.name}>
                            <div className="flex items-center justify-between w-full">
                              <span>{payer.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {payer.type}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="memberId">Member ID *</Label>
                    <Input
                      id="memberId"
                      value={authRequest.memberId}
                      onChange={(e) => setAuthRequest(prev => ({ ...prev, memberId: e.target.value }))}
                      placeholder="Enter member ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="groupNumber">Group Number</Label>
                    <Input
                      id="groupNumber"
                      value={authRequest.groupNumber}
                      onChange={(e) => setAuthRequest(prev => ({ ...prev, groupNumber: e.target.value }))}
                      placeholder="Enter group number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Input
                      id="policyNumber"
                      value={authRequest.policyNumber}
                      onChange={(e) => setAuthRequest(prev => ({ ...prev, policyNumber: e.target.value }))}
                      placeholder="Enter policy number"
                    />
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">3. Service Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="serviceType">Service Type</Label>
                      <Input
                        id="serviceType"
                        value={authRequest.serviceType}
                        onChange={(e) => setAuthRequest(prev => ({ ...prev, serviceType: e.target.value }))}
                        placeholder="e.g., MRI Brain, Physical Therapy"
                      />
                    </div>
                    <div>
                      <Label htmlFor="serviceDate">Service Date</Label>
                      <Input
                        id="serviceDate"
                        type="date"
                        value={authRequest.serviceDate}
                        onChange={(e) => setAuthRequest(prev => ({ ...prev, serviceDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="authType">Authorization Type</Label>
                      <Select value={authRequest.authType} onValueChange={(value) => setAuthRequest(prev => ({ ...prev, authType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prior">Prior Authorization</SelectItem>
                          <SelectItem value="concurrent">Concurrent Authorization</SelectItem>
                          <SelectItem value="retroactive">Retroactive Authorization</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="urgency">Urgency</Label>
                      <Select value={authRequest.urgency} onValueChange={(value) => setAuthRequest(prev => ({ ...prev, urgency: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="routine">Routine</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="stat">STAT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="diagnosis">Primary Diagnosis</Label>
                    <Input
                      id="diagnosis"
                      value={authRequest.diagnosis}
                      onChange={(e) => setAuthRequest(prev => ({ ...prev, diagnosis: e.target.value }))}
                      placeholder="Enter primary diagnosis"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clinicalNotes">Clinical Notes</Label>
                    <Textarea
                      id="clinicalNotes"
                      value={authRequest.clinicalNotes}
                      onChange={(e) => setAuthRequest(prev => ({ ...prev, clinicalNotes: e.target.value }))}
                      placeholder="Enter clinical justification and medical necessity"
                      rows={4}
                    />
                  </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleSubmitAuthRequest} 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Authorization
                      </>
                    )}
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review & Submit Tab */}
        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Review & Submit Authorization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Review and submit authorization requests</p>
                <p className="text-sm mt-2">This feature will be available in the next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Authorization Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-authorizations"
                      name="search-authorizations"
                      placeholder="Search by patient, payer, or service..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPayer} onValueChange={setFilterPayer}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by payer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payers</SelectItem>
                    {payers.map((payer) => (
                      <SelectItem key={payer.id} value={payer.name}>{payer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Authorization Requests List */}
              <div className="space-y-3">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="hover:bg-gray-50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <div>
                              <span className="font-medium">{request.id}</span>
                              <span className="text-sm text-muted-foreground ml-2">• {request.patientName}</span>
                            </div>
                          </div>
                          <Badge variant="outline">{request.payerName}</Badge>
                          {getStatusBadge(request.status)}
                          <Badge className={getUrgencyColor(request.urgency)}>
                            {request.urgency.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">{request.serviceType}</div>
                            <div className="text-sm text-muted-foreground">
                              Submitted: {request.submittedDate}
                            </div>
                          </div>
                          <div className="w-20">
                            <Progress value={request.progress} className="h-2" />
                            <div className="text-xs text-muted-foreground mt-1">
                              {request.progress}% Complete
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {request.denialReason && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                          <AlertCircle className="h-4 w-4 inline mr-2" />
                          <strong>Denial Reason:</strong> {request.denialReason}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Management Tab */}
        <TabsContent value="management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Authorization Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Authorization management tools</p>
                <p className="text-sm mt-2">This feature will be available in the next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Authorization Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authorization Details - {selectedAuthRequest?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAuthRequest && (
            <div className="space-y-6">
              {/* Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(selectedAuthRequest.status)}
                      <div>
                        <p className="font-medium">Status</p>
                        <p className="text-sm text-muted-foreground">
                          {getStatusBadge(selectedAuthRequest.status)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Submitted</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAuthRequest.submittedDate}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Urgency</p>
                        <Badge className={getUrgencyColor(selectedAuthRequest.urgency)}>
                          {selectedAuthRequest.urgency.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Patient Name</Label>
                      <p className="font-medium">{selectedAuthRequest.patientName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Payer</Label>
                      <p className="font-medium">{selectedAuthRequest.payerName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Service Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Service Type</Label>
                      <p className="font-medium">{selectedAuthRequest.serviceType}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">CPT Codes</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedAuthRequest.cptCodes.map((code: string, index: number) => (
                            <Badge key={index} variant="outline">{code}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">ICD Codes</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedAuthRequest.icdCodes.map((code: string, index: number) => (
                            <Badge key={index} variant="outline">{code}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Progress Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">{selectedAuthRequest.progress}%</span>
                      </div>
                      <Progress value={selectedAuthRequest.progress} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Submitted Date</Label>
                        <p className="font-medium">{selectedAuthRequest.submittedDate}</p>
                      </div>
                      {selectedAuthRequest.expectedResponse && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Expected Response</Label>
                          <p className="font-medium">{selectedAuthRequest.expectedResponse}</p>
                        </div>
                      )}
                      {selectedAuthRequest.approvedDate && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Approved Date</Label>
                          <p className="font-medium text-green-600">{selectedAuthRequest.approvedDate}</p>
                        </div>
                      )}
                      {selectedAuthRequest.deniedDate && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Denied Date</Label>
                          <p className="font-medium text-red-600">{selectedAuthRequest.deniedDate}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Denial Information */}
              {selectedAuthRequest.denialReason && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      Denial Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Denial Reason:</strong> {selectedAuthRequest.denialReason}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={handleExportDetails}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthorizationWorkflow;


