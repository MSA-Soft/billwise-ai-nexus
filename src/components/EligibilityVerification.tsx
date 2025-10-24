import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  CreditCard, 
  Search, 
  Download, 
  Upload, 
  FileText, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building,
  Plus,
  Trash2,
  Eye,
  Copy,
  RefreshCw,
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getEDIService, EligibilityRequest, EligibilityResponse } from "@/services/ediService";

const EligibilityVerification = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResponse | null>(null);
  const [verificationHistory, setVerificationHistory] = useState<any[]>([]);

  // Enhanced form state
  const [formData, setFormData] = useState({
    // Patient Information
    patientId: "",
    patientLastName: "",
    patientFirstName: "",
    patientMiddleInitial: "",
    patientSuffix: "",
    patientDob: "",
    patientGender: "",
    patientSsn: "",
    patientPhone: "",
    patientEmail: "",
    patientAddress: "",
    patientCity: "",
    patientState: "",
    patientZip: "",
    
    // Subscriber Information
    subscriberId: "",
    subscriberLastName: "",
    subscriberFirstName: "",
    subscriberMiddleInitial: "",
    subscriberSuffix: "",
    subscriberDob: "",
    subscriberGender: "",
    subscriberSsn: "",
    subscriberPhone: "",
    subscriberEmail: "",
    subscriberAddress: "",
    subscriberCity: "",
    subscriberState: "",
    subscriberZip: "",
    subscriberRelationship: "",
    
    // Insurance Information
    payerId: "",
    groupNumber: "",
    policyNumber: "",
    effectiveDate: "",
    terminationDate: "",
    
    // Service Information
    serviceDate: "",
    serviceCodes: [] as string[],
    diagnosisCodes: [] as string[],
    priorAuthRequired: false,
    priorAuthNumber: "",
    
    // Additional Information
    providerNpi: "",
    facilityId: "",
    notes: "",
  });

  const [currentServiceCode, setCurrentServiceCode] = useState("");
  const [currentDiagnosisCode, setCurrentDiagnosisCode] = useState("");
  const [batchVerification, setBatchVerification] = useState(false);
  const [batchData, setBatchData] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const payers = [
    { id: "MEDICARE", name: "Medicare", type: "Government" },
    { id: "MEDICAID", name: "Medicaid", type: "Government" },
    { id: "BCBS", name: "Blue Cross Blue Shield", type: "Commercial" },
    { id: "AETNA", name: "Aetna", type: "Commercial" },
    { id: "CIGNA", name: "Cigna", type: "Commercial" },
    { id: "HUMANA", name: "Humana", type: "Commercial" },
    { id: "UHC", name: "UnitedHealthcare", type: "Commercial" },
    { id: "ANTHEM", name: "Anthem", type: "Commercial" },
    { id: "KAISER", name: "Kaiser Permanente", type: "Commercial" },
    { id: "MOLINA", name: "Molina Healthcare", type: "Commercial" },
  ];

  const genders = [
    { value: "M", label: "Male" },
    { value: "F", label: "Female" },
    { value: "O", label: "Other" },
    { value: "U", label: "Unknown" },
  ];

  const relationships = [
    { value: "self", label: "Self" },
    { value: "spouse", label: "Spouse" },
    { value: "child", label: "Child" },
    { value: "parent", label: "Parent" },
    { value: "sibling", label: "Sibling" },
    { value: "other", label: "Other" },
  ];

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
  ];

  // Enhanced validation
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.patientId) errors.push("Patient ID is required");
    if (!formData.patientLastName) errors.push("Patient last name is required");
    if (!formData.patientFirstName) errors.push("Patient first name is required");
    if (!formData.patientDob) errors.push("Patient date of birth is required");
    if (!formData.subscriberId) errors.push("Subscriber ID is required");
    if (!formData.payerId) errors.push("Insurance payer is required");
    if (!formData.serviceDate) errors.push("Service date is required");
    if (formData.serviceCodes.length === 0) errors.push("At least one service code is required");
    
    return errors;
  };

  const handleVerifyEligibility = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const request: EligibilityRequest = {
        patientId: formData.patientId,
        subscriberId: formData.subscriberId,
        payerId: formData.payerId,
        serviceDate: formData.serviceDate,
        serviceCodes: formData.serviceCodes,
        diagnosisCodes: formData.diagnosisCodes,
      };

      const ediService = getEDIService();
      const result = await ediService.checkEligibility(request);
      setEligibilityResult(result);

      // Add to history
      setVerificationHistory(prev => [{
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        patientId: formData.patientId,
        payerId: formData.payerId,
        isEligible: result.isEligible,
        coverage: result.coverage,
      }, ...prev]);

      toast({
        title: "Eligibility Verified",
        description: result.isEligible ? "Patient is eligible for coverage" : "Patient is not eligible for coverage",
      });

    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Unable to verify eligibility. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addServiceCode = () => {
    if (currentServiceCode.trim()) {
      setFormData(prev => ({
        ...prev,
        serviceCodes: [...prev.serviceCodes, currentServiceCode.trim()],
      }));
      setCurrentServiceCode("");
    }
  };

  const addDiagnosisCode = () => {
    if (currentDiagnosisCode.trim()) {
      setFormData(prev => ({
        ...prev,
        diagnosisCodes: [...prev.diagnosisCodes, currentDiagnosisCode.trim()],
      }));
      setCurrentDiagnosisCode("");
    }
  };

  const removeServiceCode = (index: number) => {
    setFormData(prev => ({
      ...prev,
      serviceCodes: prev.serviceCodes.filter((_, i) => i !== index),
    }));
  };

  const removeDiagnosisCode = (index: number) => {
    setFormData(prev => ({
      ...prev,
      diagnosisCodes: prev.diagnosisCodes.filter((_, i) => i !== index),
    }));
  };

  // Batch verification functions
  const handleBatchVerification = async () => {
    if (!batchData.trim()) {
      toast({
        title: "No Data",
        description: "Please enter batch data for verification.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const lines = batchData.trim().split('\n');
      const results = [];
      
      for (const line of lines) {
        const [patientId, subscriberId, payerId, serviceDate] = line.split(',');
        if (patientId && subscriberId && payerId && serviceDate) {
          const request: EligibilityRequest = {
            patientId: patientId.trim(),
            subscriberId: subscriberId.trim(),
            payerId: payerId.trim(),
            serviceDate: serviceDate.trim(),
            serviceCodes: formData.serviceCodes,
            diagnosisCodes: formData.diagnosisCodes,
          };

          const ediService = getEDIService();
          const result = await ediService.checkEligibility(request);
          results.push({ request, result });
        }
      }

      setVerificationHistory(prev => [...results.map(({ request, result }) => ({
        id: Date.now().toString() + Math.random(),
        timestamp: new Date().toISOString(),
        patientId: request.patientId,
        payerId: request.payerId,
        isEligible: result.isEligible,
        coverage: result.coverage,
      })), ...prev]);

      toast({
        title: "Batch Verification Complete",
        description: `Processed ${results.length} verifications successfully.`,
      });

    } catch (error: any) {
      toast({
        title: "Batch Verification Failed",
        description: error.message || "Unable to process batch verification.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportHistory = () => {
    const csvContent = [
      "Patient ID,Subscriber ID,Payer,Date,Status,Copay,Deductible,Coinsurance",
      ...verificationHistory.map(entry => 
        `${entry.patientId},${entry.payerId},${new Date(entry.timestamp).toLocaleDateString()},${entry.isEligible ? 'Eligible' : 'Not Eligible'},${entry.coverage.copay},${entry.coverage.deductible},${entry.coverage.coinsurance}`
      ).join('\n')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eligibility-verification-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearForm = () => {
    setFormData({
      patientId: "",
      patientLastName: "",
      patientFirstName: "",
      patientMiddleInitial: "",
      patientSuffix: "",
      patientDob: "",
      patientGender: "",
      patientSsn: "",
      patientPhone: "",
      patientEmail: "",
      patientAddress: "",
      patientCity: "",
      patientState: "",
      patientZip: "",
      subscriberId: "",
      subscriberLastName: "",
      subscriberFirstName: "",
      subscriberMiddleInitial: "",
      subscriberSuffix: "",
      subscriberDob: "",
      subscriberGender: "",
      subscriberSsn: "",
      subscriberPhone: "",
      subscriberEmail: "",
      subscriberAddress: "",
      subscriberCity: "",
      subscriberState: "",
      subscriberZip: "",
      subscriberRelationship: "",
      payerId: "",
      groupNumber: "",
      policyNumber: "",
      effectiveDate: "",
      terminationDate: "",
      serviceDate: "",
      serviceCodes: [],
      diagnosisCodes: [],
      priorAuthRequired: false,
      priorAuthNumber: "",
      providerNpi: "",
      facilityId: "",
      notes: "",
    });
    setEligibilityResult(null);
  };

  const filteredHistory = verificationHistory.filter(entry => {
    const matchesSearch = entry.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        entry.payerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || 
                        (filterStatus === "eligible" && entry.isEligible) ||
                        (filterStatus === "ineligible" && !entry.isEligible);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Real-time Eligibility Verification
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive patient insurance coverage verification with EDI 270/271 integration
          </p>
        </div>
        <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="h-4 w-4 mr-2" />
          EDI 270/271 Enabled
        </Badge>
          <Button variant="outline" onClick={exportHistory} disabled={verificationHistory.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Verifications</p>
                <p className="text-2xl font-bold">{verificationHistory.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eligible</p>
                <p className="text-2xl font-bold text-green-600">
                  {verificationHistory.filter(h => h.isEligible).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Not Eligible</p>
                <p className="text-2xl font-bold text-red-600">
                  {verificationHistory.filter(h => !h.isEligible).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {verificationHistory.length > 0 
                    ? Math.round((verificationHistory.filter(h => h.isEligible).length / verificationHistory.length) * 100)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="verify" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="verify">Single Verification</TabsTrigger>
          <TabsTrigger value="batch">Batch Verification</TabsTrigger>
          <TabsTrigger value="history">Verification History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="verify" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Enhanced Patient Information Form */}
            <div className="xl:col-span-2 space-y-6">
              {/* Patient Information */}
            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Patient Information
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <Label htmlFor="patientId">Patient ID *</Label>
                    <Input
                      id="patientId"
                      value={formData.patientId}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                      placeholder="Enter patient ID"
                    />
                  </div>
                  <div>
                      <Label htmlFor="patientDob">Date of Birth *</Label>
                      <Input
                        id="patientDob"
                        type="date"
                        value={formData.patientDob}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientDob: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="patientLastName">Last Name *</Label>
                      <Input
                        id="patientLastName"
                        value={formData.patientLastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientLastName: e.target.value }))}
                        placeholder="Last name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientFirstName">First Name *</Label>
                      <Input
                        id="patientFirstName"
                        value={formData.patientFirstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientFirstName: e.target.value }))}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientMiddleInitial">Middle Initial</Label>
                      <Input
                        id="patientMiddleInitial"
                        value={formData.patientMiddleInitial}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientMiddleInitial: e.target.value }))}
                        placeholder="M.I."
                        maxLength={1}
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientSuffix">Suffix</Label>
                      <Input
                        id="patientSuffix"
                        value={formData.patientSuffix}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientSuffix: e.target.value }))}
                        placeholder="Jr., Sr., etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="patientGender">Gender</Label>
                      <Select value={formData.patientGender} onValueChange={(value) => setFormData(prev => ({ ...prev, patientGender: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {genders.map((gender) => (
                            <SelectItem key={gender.value} value={gender.value}>
                              {gender.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="patientSsn">SSN</Label>
                      <Input
                        id="patientSsn"
                        value={formData.patientSsn}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientSsn: e.target.value }))}
                        placeholder="XXX-XX-XXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientPhone">Phone</Label>
                      <Input
                        id="patientPhone"
                        value={formData.patientPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientPhone: e.target.value }))}
                        placeholder="(XXX) XXX-XXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="patientEmail">Email</Label>
                    <Input
                      id="patientEmail"
                      type="email"
                      value={formData.patientEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientEmail: e.target.value }))}
                      placeholder="patient@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patientAddress">Address</Label>
                      <Input
                        id="patientAddress"
                        value={formData.patientAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientAddress: e.target.value }))}
                        placeholder="Street address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientCity">City</Label>
                      <Input
                        id="patientCity"
                        value={formData.patientCity}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientCity: e.target.value }))}
                        placeholder="City"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patientState">State</Label>
                      <Select value={formData.patientState} onValueChange={(value) => setFormData(prev => ({ ...prev, patientState: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="patientZip">ZIP Code</Label>
                      <Input
                        id="patientZip"
                        value={formData.patientZip}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientZip: e.target.value }))}
                        placeholder="12345"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscriber Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Subscriber Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subscriberId">Subscriber ID *</Label>
                    <Input
                      id="subscriberId"
                      value={formData.subscriberId}
                      onChange={(e) => setFormData(prev => ({ ...prev, subscriberId: e.target.value }))}
                      placeholder="Enter subscriber ID"
                    />
                  </div>
                    <div>
                      <Label htmlFor="subscriberRelationship">Relationship to Patient</Label>
                      <Select value={formData.subscriberRelationship} onValueChange={(value) => setFormData(prev => ({ ...prev, subscriberRelationship: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          {relationships.map((rel) => (
                            <SelectItem key={rel.value} value={rel.value}>
                              {rel.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="subscriberLastName">Last Name</Label>
                      <Input
                        id="subscriberLastName"
                        value={formData.subscriberLastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, subscriberLastName: e.target.value }))}
                        placeholder="Last name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subscriberFirstName">First Name</Label>
                      <Input
                        id="subscriberFirstName"
                        value={formData.subscriberFirstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, subscriberFirstName: e.target.value }))}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subscriberMiddleInitial">Middle Initial</Label>
                      <Input
                        id="subscriberMiddleInitial"
                        value={formData.subscriberMiddleInitial}
                        onChange={(e) => setFormData(prev => ({ ...prev, subscriberMiddleInitial: e.target.value }))}
                        placeholder="M.I."
                        maxLength={1}
                      />
                    </div>
                    <div>
                      <Label htmlFor="subscriberSuffix">Suffix</Label>
                      <Input
                        id="subscriberSuffix"
                        value={formData.subscriberSuffix}
                        onChange={(e) => setFormData(prev => ({ ...prev, subscriberSuffix: e.target.value }))}
                        placeholder="Jr., Sr., etc."
                    />
                  </div>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subscriberDob">Date of Birth</Label>
                      <Input
                        id="subscriberDob"
                        type="date"
                        value={formData.subscriberDob}
                        onChange={(e) => setFormData(prev => ({ ...prev, subscriberDob: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="subscriberGender">Gender</Label>
                      <Select value={formData.subscriberGender} onValueChange={(value) => setFormData(prev => ({ ...prev, subscriberGender: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {genders.map((gender) => (
                            <SelectItem key={gender.value} value={gender.value}>
                              {gender.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insurance Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Insurance Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <Label htmlFor="payerId">Insurance Payer *</Label>
                    <Select value={formData.payerId} onValueChange={(value) => setFormData(prev => ({ ...prev, payerId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payer" />
                      </SelectTrigger>
                      <SelectContent>
                        {payers.map((payer) => (
                          <SelectItem key={payer.id} value={payer.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{payer.name}</span>
                                <Badge variant="outline" className="ml-2">{payer.type}</Badge>
                              </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                      <Label htmlFor="serviceDate">Service Date *</Label>
                    <Input
                      id="serviceDate"
                      type="date"
                      value={formData.serviceDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, serviceDate: e.target.value }))}
                    />
                  </div>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="groupNumber">Group Number</Label>
                      <Input
                        id="groupNumber"
                        value={formData.groupNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, groupNumber: e.target.value }))}
                        placeholder="Group number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="policyNumber">Policy Number</Label>
                      <Input
                        id="policyNumber"
                        value={formData.policyNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, policyNumber: e.target.value }))}
                        placeholder="Policy number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="effectiveDate">Effective Date</Label>
                      <Input
                        id="effectiveDate"
                        type="date"
                        value={formData.effectiveDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="terminationDate">Termination Date</Label>
                      <Input
                        id="terminationDate"
                        type="date"
                        value={formData.terminationDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, terminationDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Codes and Diagnosis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Service & Diagnosis Codes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                {/* Service Codes */}
                <div>
                    <Label>Service Codes (CPT/HCPCS) *</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={currentServiceCode}
                      onChange={(e) => setCurrentServiceCode(e.target.value)}
                        placeholder="Enter service code (e.g., 99213)"
                        onKeyPress={(e) => e.key === 'Enter' && addServiceCode()}
                    />
                      <Button onClick={addServiceCode} size="sm" type="button">
                        <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.serviceCodes.map((code, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-red-100" onClick={() => removeServiceCode(index)}>
                          {code}
                          <XCircle className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Diagnosis Codes */}
                <div>
                  <Label>Diagnosis Codes (ICD-10)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={currentDiagnosisCode}
                      onChange={(e) => setCurrentDiagnosisCode(e.target.value)}
                        placeholder="Enter diagnosis code (e.g., Z00.00)"
                        onKeyPress={(e) => e.key === 'Enter' && addDiagnosisCode()}
                    />
                      <Button onClick={addDiagnosisCode} size="sm" type="button">
                        <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.diagnosisCodes.map((code, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-red-100" onClick={() => removeDiagnosisCode(index)}>
                          {code}
                          <XCircle className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                  {/* Prior Authorization */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="priorAuthRequired"
                      checked={formData.priorAuthRequired}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, priorAuthRequired: checked as boolean }))}
                    />
                    <Label htmlFor="priorAuthRequired">Prior Authorization Required</Label>
                  </div>

                  {formData.priorAuthRequired && (
                    <div>
                      <Label htmlFor="priorAuthNumber">Prior Authorization Number</Label>
                      <Input
                        id="priorAuthNumber"
                        value={formData.priorAuthNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, priorAuthNumber: e.target.value }))}
                        placeholder="Enter PA number"
                      />
                    </div>
                  )}

                  {/* Additional Information */}
                  <div>
                    <Label htmlFor="providerNpi">Provider NPI</Label>
                    <Input
                      id="providerNpi"
                      value={formData.providerNpi}
                      onChange={(e) => setFormData(prev => ({ ...prev, providerNpi: e.target.value }))}
                      placeholder="10-digit NPI"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes or comments"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={handleVerifyEligibility} disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Verifying Eligibility...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Verify Eligibility
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={clearForm}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Form
                </Button>
              </div>
            </div>

            {/* Enhanced Results Panel */}
            <div className="xl:col-span-1">
              <Card className="sticky top-6">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Eligibility Results
                  </CardTitle>
              </CardHeader>
              <CardContent>
                {eligibilityResult ? (
                  <div className="space-y-4">
                      <Alert className={eligibilityResult.isEligible ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <div className="flex items-center gap-2">
                      {eligibilityResult.isEligible ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                          <AlertDescription className={`font-semibold ${eligibilityResult.isEligible ? 'text-green-800' : 'text-red-800'}`}>
                        {eligibilityResult.isEligible ? 'Eligible for Coverage' : 'Not Eligible for Coverage'}
                          </AlertDescription>
                    </div>
                      </Alert>

                    {eligibilityResult.isEligible && (
                        <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Coverage Details
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                <span className="text-sm font-medium">Copay</span>
                                <span className="font-semibold text-blue-600">${eligibilityResult.coverage.copay}</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                <span className="text-sm font-medium">Deductible</span>
                                <span className="font-semibold text-blue-600">${eligibilityResult.coverage.deductible}</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                <span className="text-sm font-medium">Coinsurance</span>
                                <span className="font-semibold text-blue-600">{eligibilityResult.coverage.coinsurance}%</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                <span className="text-sm font-medium">Out-of-Pocket Max</span>
                                <span className="font-semibold text-blue-600">${eligibilityResult.coverage.outOfPocketMax}</span>
                              </div>
                          </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Benefits
                            </h4>
                            <div className="space-y-2">
                            {eligibilityResult.benefits.map((benefit, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <span className="text-sm font-medium">{benefit.serviceType}</span>
                                  <Badge variant="outline">{benefit.coverageLevel}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                          <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">Coverage Period</span>
                            </div>
                            <div>
                          Effective: {new Date(eligibilityResult.effectiveDate).toLocaleDateString()}
                          {eligibilityResult.terminationDate && (
                                <div>Termination: {new Date(eligibilityResult.terminationDate).toLocaleDateString()}</div>
                          )}
                            </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Enter patient information and click "Verify Eligibility" to check coverage</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          </div>
        </TabsContent>

        {/* Batch Verification Tab */}
        <TabsContent value="batch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Batch Eligibility Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Upload a CSV file or paste data in the format: Patient ID, Subscriber ID, Payer ID, Service Date (one per line)
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="batchData">Batch Data</Label>
                <Textarea
                  id="batchData"
                  value={batchData}
                  onChange={(e) => setBatchData(e.target.value)}
                  placeholder="PAT001,SUB001,MEDICARE,2024-01-15&#10;PAT002,SUB002,BCBS,2024-01-16&#10;PAT003,SUB003,AETNA,2024-01-17"
                  rows={8}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleBatchVerification} disabled={isLoading || !batchData.trim()}>
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing Batch...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Process Batch
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setBatchData("")}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Verification History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by patient ID or payer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="eligible">Eligible Only</SelectItem>
                    <SelectItem value="ineligible">Not Eligible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredHistory.length > 0 ? (
                <div className="space-y-3">
                  {filteredHistory.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {entry.isEligible ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className="font-medium">Patient {entry.patientId}</span>
                        </div>
                        <Badge variant="outline">{entry.payerId}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        Copay: ${entry.coverage.copay} | Deductible: ${entry.coverage.deductible}
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No verification history found</p>
                  {searchTerm && (
                    <p className="text-sm mt-2">Try adjusting your search criteria</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Eligibility Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Eligibility Rate</span>
                    <span className="text-2xl font-bold text-green-600">
                      {verificationHistory.length > 0 
                        ? Math.round((verificationHistory.filter(h => h.isEligible).length / verificationHistory.length) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${verificationHistory.length > 0 
                          ? (verificationHistory.filter(h => h.isEligible).length / verificationHistory.length) * 100
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Payer Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    verificationHistory.reduce((acc, entry) => {
                      acc[entry.payerId] = (acc[entry.payerId] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([payer, count]) => (
                    <div key={payer} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{payer}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${verificationHistory.length > 0 ? ((count as number) / verificationHistory.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verificationHistory.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {entry.isEligible ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <span className="font-medium">Patient {entry.patientId}</span>
                        <span className="text-sm text-muted-foreground ml-2">• {entry.payerId}</span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EligibilityVerification;
