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
  Microphone,
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
  Scatter,
  TrendingDown,
  Minus,
  X,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  AlertCircle2,
  InfoIcon,
  HelpCircle2,
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
  Move3D,
  Grid,
  Grid3X3,
  List,
  Layout,
  LayoutGrid,
  LayoutList,
  LayoutTemplate,
  LayoutDashboard,
  LayoutSidebar,
  LayoutSidebarReverse,
  LayoutSidebarLeft,
  LayoutSidebarRight,
  LayoutPanelLeft,
  LayoutPanelRight,
  LayoutPanelTop,
  LayoutPanelBottom,
  LayoutColumns,
  LayoutRows,
  LayoutSplit,
  LayoutSplitVertical,
  LayoutSplitHorizontal,
  LayoutSplit3,
  LayoutSplit3Vertical,
  LayoutSplit3Horizontal,
  LayoutSplit4,
  LayoutSplit4Vertical,
  LayoutSplit4Horizontal,
  LayoutSplit5,
  LayoutSplit5Vertical,
  LayoutSplit5Horizontal,
  LayoutSplit6,
  LayoutSplit6Vertical,
  LayoutSplit6Horizontal,
  LayoutSplit7,
  LayoutSplit7Vertical,
  LayoutSplit7Horizontal,
  LayoutSplit8,
  LayoutSplit8Vertical,
  LayoutSplit8Horizontal,
  LayoutSplit9,
  LayoutSplit9Vertical,
  LayoutSplit9Horizontal,
  LayoutSplit10,
  LayoutSplit10Vertical,
  LayoutSplit10Horizontal,
  LayoutSplit11,
  LayoutSplit11Vertical,
  LayoutSplit11Horizontal,
  LayoutSplit12,
  LayoutSplit12Vertical,
  LayoutSplit12Horizontal,
  LayoutSplit13,
  LayoutSplit13Vertical,
  LayoutSplit13Horizontal,
  LayoutSplit14,
  LayoutSplit14Vertical,
  LayoutSplit14Horizontal,
  LayoutSplit15,
  LayoutSplit15Vertical,
  LayoutSplit15Horizontal,
  LayoutSplit16,
  LayoutSplit16Vertical,
  LayoutSplit16Horizontal,
  LayoutSplit17,
  LayoutSplit17Vertical,
  LayoutSplit17Horizontal,
  LayoutSplit18,
  LayoutSplit18Vertical,
  LayoutSplit18Horizontal,
  LayoutSplit19,
  LayoutSplit19Vertical,
  LayoutSplit19Horizontal,
  LayoutSplit20,
  LayoutSplit20Vertical,
  LayoutSplit20Horizontal,
  LayoutSplit21,
  LayoutSplit21Vertical,
  LayoutSplit21Horizontal,
  LayoutSplit22,
  LayoutSplit22Vertical,
  LayoutSplit22Horizontal,
  LayoutSplit23,
  LayoutSplit23Vertical,
  LayoutSplit23Horizontal,
  LayoutSplit24,
  LayoutSplit24Vertical,
  LayoutSplit24Horizontal,
  LayoutSplit25,
  LayoutSplit25Vertical,
  LayoutSplit25Horizontal,
  LayoutSplit26,
  LayoutSplit26Vertical,
  LayoutSplit26Horizontal,
  LayoutSplit27,
  LayoutSplit27Vertical,
  LayoutSplit27Horizontal,
  LayoutSplit28,
  LayoutSplit28Vertical,
  LayoutSplit28Horizontal,
  LayoutSplit29,
  LayoutSplit29Vertical,
  LayoutSplit29Horizontal,
  LayoutSplit30,
  LayoutSplit30Vertical,
  LayoutSplit30Horizontal,
  LayoutSplit31,
  LayoutSplit31Vertical,
  LayoutSplit31Horizontal,
  LayoutSplit32,
  LayoutSplit32Vertical,
  LayoutSplit32Horizontal,
  LayoutSplit33,
  LayoutSplit33Vertical,
  LayoutSplit33Horizontal,
  LayoutSplit34,
  LayoutSplit34Vertical,
  LayoutSplit34Horizontal,
  LayoutSplit35,
  LayoutSplit35Vertical,
  LayoutSplit35Horizontal,
  LayoutSplit36,
  LayoutSplit36Vertical,
  LayoutSplit36Horizontal,
  LayoutSplit37,
  LayoutSplit37Vertical,
  LayoutSplit37Horizontal,
  LayoutSplit38,
  LayoutSplit38Vertical,
  LayoutSplit38Horizontal,
  LayoutSplit39,
  LayoutSplit39Vertical,
  LayoutSplit39Horizontal,
  LayoutSplit40,
  LayoutSplit40Vertical,
  LayoutSplit40Horizontal,
  LayoutSplit41,
  LayoutSplit41Vertical,
  LayoutSplit41Horizontal,
  LayoutSplit42,
  LayoutSplit42Vertical,
  LayoutSplit42Horizontal,
  LayoutSplit43,
  LayoutSplit43Vertical,
  LayoutSplit43Horizontal,
  LayoutSplit44,
  LayoutSplit44Vertical,
  LayoutSplit44Horizontal,
  LayoutSplit45,
  LayoutSplit45Vertical,
  LayoutSplit45Horizontal,
  LayoutSplit46,
  LayoutSplit46Vertical,
  LayoutSplit46Horizontal,
  LayoutSplit47,
  LayoutSplit47Vertical,
  LayoutSplit47Horizontal,
  LayoutSplit48,
  LayoutSplit48Vertical,
  LayoutSplit48Horizontal,
  LayoutSplit49,
  LayoutSplit49Vertical,
  LayoutSplit49Horizontal,
  LayoutSplit50,
  LayoutSplit50Vertical,
  LayoutSplit50Horizontal,
  LayoutSplit51,
  LayoutSplit51Vertical,
  LayoutSplit51Horizontal,
  LayoutSplit52,
  LayoutSplit52Vertical,
  LayoutSplit52Horizontal,
  LayoutSplit53,
  LayoutSplit53Vertical,
  LayoutSplit53Horizontal,
  LayoutSplit54,
  LayoutSplit54Vertical,
  LayoutSplit54Horizontal,
  LayoutSplit55,
  LayoutSplit55Vertical,
  LayoutSplit55Horizontal,
  LayoutSplit56,
  LayoutSplit56Vertical,
  LayoutSplit56Horizontal,
  LayoutSplit57,
  LayoutSplit57Vertical,
  LayoutSplit57Horizontal,
  LayoutSplit58,
  LayoutSplit58Vertical,
  LayoutSplit58Horizontal,
  LayoutSplit59,
  LayoutSplit59Vertical,
  LayoutSplit59Horizontal,
  LayoutSplit60,
  LayoutSplit60Vertical,
  LayoutSplit60Horizontal,
  LayoutSplit61,
  LayoutSplit61Vertical,
  LayoutSplit61Horizontal,
  LayoutSplit62,
  LayoutSplit62Vertical,
  LayoutSplit62Horizontal,
  LayoutSplit63,
  LayoutSplit63Vertical,
  LayoutSplit63Horizontal,
  LayoutSplit64,
  LayoutSplit64Vertical,
  LayoutSplit64Horizontal,
  LayoutSplit65,
  LayoutSplit65Vertical,
  LayoutSplit65Horizontal,
  LayoutSplit66,
  LayoutSplit66Vertical,
  LayoutSplit66Horizontal,
  LayoutSplit67,
  LayoutSplit67Vertical,
  LayoutSplit67Horizontal,
  LayoutSplit68,
  LayoutSplit68Vertical,
  LayoutSplit68Horizontal,
  LayoutSplit69,
  LayoutSplit69Vertical,
  LayoutSplit69Horizontal,
  LayoutSplit70,
  LayoutSplit70Vertical,
  LayoutSplit70Horizontal,
  LayoutSplit71,
  LayoutSplit71Vertical,
  LayoutSplit71Horizontal,
  LayoutSplit72,
  LayoutSplit72Vertical,
  LayoutSplit72Horizontal,
  LayoutSplit73,
  LayoutSplit73Vertical,
  LayoutSplit73Horizontal,
  LayoutSplit74,
  LayoutSplit74Vertical,
  LayoutSplit74Horizontal,
  LayoutSplit75,
  LayoutSplit75Vertical,
  LayoutSplit75Horizontal,
  LayoutSplit76,
  LayoutSplit76Vertical,
  LayoutSplit76Horizontal,
  LayoutSplit77,
  LayoutSplit77Vertical,
  LayoutSplit77Horizontal,
  LayoutSplit78,
  LayoutSplit78Vertical,
  LayoutSplit78Horizontal,
  LayoutSplit79,
  LayoutSplit79Vertical,
  LayoutSplit79Horizontal,
  LayoutSplit80,
  LayoutSplit80Vertical,
  LayoutSplit80Horizontal,
  LayoutSplit81,
  LayoutSplit81Vertical,
  LayoutSplit81Horizontal,
  LayoutSplit82,
  LayoutSplit82Vertical,
  LayoutSplit82Horizontal,
  LayoutSplit83,
  LayoutSplit83Vertical,
  LayoutSplit83Horizontal,
  LayoutSplit84,
  LayoutSplit84Vertical,
  LayoutSplit84Horizontal,
  LayoutSplit85,
  LayoutSplit85Vertical,
  LayoutSplit85Horizontal,
  LayoutSplit86,
  LayoutSplit86Vertical,
  LayoutSplit86Horizontal,
  LayoutSplit87,
  LayoutSplit87Vertical,
  LayoutSplit87Horizontal,
  LayoutSplit88,
  LayoutSplit88Vertical,
  LayoutSplit88Horizontal,
  LayoutSplit89,
  LayoutSplit89Vertical,
  LayoutSplit89Horizontal,
  LayoutSplit90,
  LayoutSplit90Vertical,
  LayoutSplit90Horizontal,
  LayoutSplit91,
  LayoutSplit91Vertical,
  LayoutSplit91Horizontal,
  LayoutSplit92,
  LayoutSplit92Vertical,
  LayoutSplit92Horizontal,
  LayoutSplit93,
  LayoutSplit93Vertical,
  LayoutSplit93Horizontal,
  LayoutSplit94,
  LayoutSplit94Vertical,
  LayoutSplit94Horizontal,
  LayoutSplit95,
  LayoutSplit95Vertical,
  LayoutSplit95Horizontal,
  LayoutSplit96,
  LayoutSplit96Vertical,
  LayoutSplit96Horizontal,
  LayoutSplit97,
  LayoutSplit97Vertical,
  LayoutSplit97Horizontal,
  LayoutSplit98,
  LayoutSplit98Vertical,
  LayoutSplit98Horizontal,
  LayoutSplit99,
  LayoutSplit99Vertical,
  LayoutSplit99Horizontal,
  LayoutSplit100,
  LayoutSplit100Vertical,
  LayoutSplit100Horizontal
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

  // Mock data - Enhanced for scalability demonstration
  const patients = [
    { id: "PAT001", name: "Amina Khan", dob: "1985-05-10", insurance: "Blue Cross Blue Shield", phone: "(555) 123-4567" },
    { id: "PAT002", name: "Hassan Ahmed", dob: "1978-07-22", insurance: "Aetna", phone: "(555) 234-5678" },
    { id: "PAT003", name: "Zainab Ali", dob: "1992-11-08", insurance: "Cigna", phone: "(555) 345-6789" },
    { id: "PAT004", name: "Mohammed Hassan", dob: "1980-03-15", insurance: "UnitedHealthcare", phone: "(555) 456-7890" },
    { id: "PAT005", name: "Fatima Ahmed", dob: "1995-08-20", insurance: "Humana", phone: "(555) 567-8901" },
    { id: "PAT006", name: "Omar Khan", dob: "1975-12-03", insurance: "Medicare", phone: "(555) 678-9012" },
    { id: "PAT007", name: "Aisha Ali", dob: "1988-06-18", insurance: "Medicaid", phone: "(555) 789-0123" },
    { id: "PAT008", name: "Yusuf Hassan", dob: "1990-09-25", insurance: "Anthem", phone: "(555) 890-1234" },
    { id: "PAT009", name: "Maryam Khan", dob: "1983-04-12", insurance: "Kaiser Permanente", phone: "(555) 901-2345" },
    { id: "PAT010", name: "Ahmed Ali", dob: "1972-11-30", insurance: "Molina Healthcare", phone: "(555) 012-3456" }
  ];

  const payers = [
    { id: "BCBS", name: "Blue Cross Blue Shield", type: "Commercial", authRequired: true, avgProcessingTime: "3-5 days" },
    { id: "AETNA", name: "Aetna", type: "Commercial", authRequired: true, avgProcessingTime: "2-4 days" },
    { id: "CIGNA", name: "Cigna", type: "Commercial", authRequired: true, avgProcessingTime: "1-3 days" },
    { id: "UHC", name: "UnitedHealthcare", type: "Commercial", authRequired: true, avgProcessingTime: "2-4 days" },
    { id: "HUMANA", name: "Humana", type: "Commercial", authRequired: true, avgProcessingTime: "3-5 days" },
    { id: "ANTHEM", name: "Anthem", type: "Commercial", authRequired: true, avgProcessingTime: "2-4 days" },
    { id: "KAISER", name: "Kaiser Permanente", type: "Commercial", authRequired: true, avgProcessingTime: "1-2 days" },
    { id: "MOLINA", name: "Molina Healthcare", type: "Commercial", authRequired: true, avgProcessingTime: "4-6 days" },
    { id: "MEDICARE", name: "Medicare", type: "Government", authRequired: false, avgProcessingTime: "N/A" },
    { id: "MEDICAID", name: "Medicaid", type: "Government", authRequired: true, avgProcessingTime: "5-7 days" },
    { id: "TRICARE", name: "TRICARE", type: "Government", authRequired: true, avgProcessingTime: "3-5 days" },
    { id: "VA", name: "Veterans Affairs", type: "Government", authRequired: true, avgProcessingTime: "7-10 days" }
  ];

  const authRequests = [
    {
      id: "AUTH001",
      patientName: "Amina Khan",
      payerName: "Blue Cross Blue Shield",
      serviceType: "MRI Brain",
      status: "pending",
      submittedDate: "2024-01-15",
      expectedResponse: "2024-01-18",
      urgency: "routine",
      cptCodes: ["70551"],
      icdCodes: ["G93.1"],
      progress: 60
    },
    {
      id: "AUTH002",
      patientName: "Hassan Ahmed",
      payerName: "Aetna",
      serviceType: "Physical Therapy",
      status: "approved",
      submittedDate: "2024-01-10",
      approvedDate: "2024-01-12",
      urgency: "routine",
      cptCodes: ["97110", "97112"],
      icdCodes: ["M25.561"],
      progress: 100
    },
    {
      id: "AUTH003",
      patientName: "Zainab Ali",
      payerName: "Cigna",
      serviceType: "Surgery - Appendectomy",
      status: "denied",
      submittedDate: "2024-01-08",
      deniedDate: "2024-01-11",
      urgency: "urgent",
      cptCodes: ["44970"],
      icdCodes: ["K35.9"],
      progress: 100,
      denialReason: "Insufficient clinical documentation"
    }
  ];

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


