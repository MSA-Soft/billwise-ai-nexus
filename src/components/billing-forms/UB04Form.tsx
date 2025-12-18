import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, Send, Plus, Trash2, Search, Upload, FileDown, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Modern UB-04 Form - User-Friendly Digital Interface
// Captures all required data with intuitive, modern design

const UB04Form = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    // Provider Information
    providerName: "",
    providerAddress: "",
    providerCity: "",
    providerState: "",
    providerZip: "",
    providerPhone: "",
    providerFax: "",
    providerEmail: "",
    
    // Pay-to Information
    payToName: "",
    payToAddress: "",
    payToCity: "",
    payToState: "",
    payToZip: "",
    
    // Patient Control
    patientControlNumber: "",
    medicalRecordNumber: "",
    
    // Type of Bill
    typeOfBill: "",
    federalTaxId: "",
    statementCoversFrom: "",
    statementCoversTo: "",
    
    // Patient Information
    patientLastName: "",
    patientFirstName: "",
    patientMiddleInitial: "",
    patientSuffix: "",
    patientAddress: "",
    patientCity: "",
    patientState: "",
    patientZip: "",
    patientDob: "",
    patientGender: "",
    patientPhone: "",
    
    // Admission Information
    admissionDate: "",
    admissionHour: "",
    admissionType: "",
    admissionSource: "",
    dischargeDate: "",
    dischargeHour: "",
    patientStatus: "",
    
    // Prior Authorization
    priorAuthorization: "",
    
    // Physician Information
    referringPhysician: "",
    referringPhysicianId: "",
    operatingPhysician: "",
    operatingPhysicianId: "",
    otherPhysician: "",
    otherPhysicianId: "",
    attendingPhysician: "",
    attendingPhysicianId: "",
    
    // Revenue Codes
    revenueCodes: [] as any[],
    
    // Payer Information
    primaryPayer: "",
    secondaryPayer: "",
    tertiaryPayer: "",
    primaryPayerId: "",
    secondaryPayerId: "",
    tertiaryPayerId: "",
    primaryRelationship: "",
    secondaryRelationship: "",
    tertiaryRelationship: "",
    primaryInsuredLastName: "",
    primaryInsuredFirstName: "",
    primaryInsuredMiddleInitial: "",
    primaryInsuredSuffix: "",
    secondaryInsuredLastName: "",
    secondaryInsuredFirstName: "",
    secondaryInsuredMiddleInitial: "",
    secondaryInsuredSuffix: "",
    tertiaryInsuredLastName: "",
    tertiaryInsuredFirstName: "",
    tertiaryInsuredMiddleInitial: "",
    tertiaryInsuredSuffix: "",
    primaryInsuredId: "",
    secondaryInsuredId: "",
    tertiaryInsuredId: "",
    primaryGroupName: "",
    secondaryGroupName: "",
    tertiaryGroupName: "",
    primaryGroupNumber: "",
    secondaryGroupNumber: "",
    tertiaryGroupNumber: "",
    
    // Treatment Authorization
    treatmentAuthorizationCodes: "",
    documentControlNumber: "",
    employerName: "",
    
    // Diagnosis Codes
    principalDiagnosis: "",
    otherDiagnosisCodes: [] as string[],
    
    // Procedure Codes
    principalProcedure: "",
    otherProcedureCodes: [] as string[],
    
    // Remarks
    remarks: "",
    
    // Provider Signature
    providerSignatureDate: "",
    providerSignature: ""
  });

  const [currentRevenueCode, setCurrentRevenueCode] = useState({
    code: "",
    description: "",
    hcpcsCode: "",
    serviceDate: "",
    units: 1,
    totalCharges: 0,
    nonCoveredCharges: 0
  });
  
  const handleSubmit = () => {
    toast({
      title: "Claim Submitted",
      description: "UB-04 institutional claim has been submitted successfully."
    });
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Your claim has been saved as a draft."
    });
  };

  const handleExportCSV = () => {
    const csvContent = [
      'Patient Last Name,Patient First Name,Patient Date of Birth,Statement Covers From,Statement Covers To,Provider Name',
      `${formData.patientLastName || ''},${formData.patientFirstName || ''},${formData.patientDob || ''},${formData.statementCoversFrom || ''},${formData.statementCoversTo || ''},${formData.providerName || ''}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ub04-claim-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "UB-04 claim data has been exported to CSV.",
    });
  };

  const handleDownloadSampleCSV = () => {
    const csvContent = [
      'Patient Last Name,Patient First Name,Patient Date of Birth,Statement Covers From,Statement Covers To,Provider Name',
      'Doe,John,1990-01-15,2024-01-01,2024-01-31,Main Medical Center',
      'Smith,Jane,1985-05-20,2024-02-01,2024-02-28,City Hospital'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ub04-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
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

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const values = lines[1].split(',').map(v => v.trim());

        const getValue = (headerName: string) => {
          const index = headers.indexOf(headerName);
          return index >= 0 ? values[index] : '';
        };

        setFormData(prev => ({
          ...prev,
          patientLastName: getValue('patient last name') || prev.patientLastName,
          patientFirstName: getValue('patient first name') || prev.patientFirstName,
          patientDob: getValue('patient dob') || prev.patientDob,
          statementCoversFrom: getValue('statement covers from') || prev.statementCoversFrom,
          statementCoversTo: getValue('statement covers to') || prev.statementCoversTo,
          providerName: getValue('provider name') || prev.providerName,
        }));

        toast({
          title: "CSV Imported",
          description: "Claim data has been loaded from CSV. Please review and complete any missing fields.",
        });
      } catch (error: any) {
        toast({
          title: "Import Failed",
          description: error.message || "Error reading CSV file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const addRevenueCode = () => {
    if (currentRevenueCode.code && currentRevenueCode.totalCharges > 0) {
      setFormData(prev => ({
        ...prev,
        revenueCodes: [...prev.revenueCodes, currentRevenueCode]
      }));
      setCurrentRevenueCode({
        code: "",
        description: "",
        hcpcsCode: "",
        serviceDate: "",
        units: 1,
        totalCharges: 0,
        nonCoveredCharges: 0
      });
    }
  };

  const removeRevenueCode = (index: number) => {
    setFormData(prev => ({
      ...prev,
      revenueCodes: prev.revenueCodes.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            UB-04 Institutional Claim Form
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Complete institutional claim information for insurance submission
          </p>
        </CardHeader>
        
        {/* CSV Import/Export Actions - Prominent Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">CSV Operations</h3>
              <p className="text-sm text-blue-700">Import claim data from CSV or export current form data</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="default"
                onClick={handleExportCSV}
                className="bg-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={handleDownloadSampleCSV}
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
                    onChange={handleImportCSV}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="space-y-8">
          {/* PROVIDER INFORMATION */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Provider Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Provider Name</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Provider name"
                      value={formData.providerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, providerName: e.target.value }))}
                    />
                </div>
                  <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Street address"
                      value={formData.providerAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, providerAddress: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-sm font-medium">City</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="City"
                        value={formData.providerCity}
                        onChange={(e) => setFormData(prev => ({ ...prev, providerCity: e.target.value }))}
                      />
                  </div>
                    <div>
                      <Label className="text-sm font-medium">State</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="State"
                        value={formData.providerState}
                        onChange={(e) => setFormData(prev => ({ ...prev, providerState: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">ZIP</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="ZIP"
                        value={formData.providerZip}
                        onChange={(e) => setFormData(prev => ({ ...prev, providerZip: e.target.value }))}
                      />
            </div>
            </div>
            </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Phone number"
                        value={formData.providerPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, providerPhone: e.target.value }))}
                      />
            </div>
                    <div>
                      <Label className="text-sm font-medium">Fax</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Fax number"
                        value={formData.providerFax}
                        onChange={(e) => setFormData(prev => ({ ...prev, providerFax: e.target.value }))}
                      />
          </div>
                </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Email address"
                      value={formData.providerEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, providerEmail: e.target.value }))}
                    />
              </div>
                </div>
              </div>
              </div>
            </div>
            
          <Separator />

          {/* PAY-TO INFORMATION */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Pay-to Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Pay-to Name</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Pay-to name"
                      value={formData.payToName}
                      onChange={(e) => setFormData(prev => ({ ...prev, payToName: e.target.value }))}
                    />
                </div>
                  <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Street address"
                      value={formData.payToAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, payToAddress: e.target.value }))}
                    />
                </div>
              </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-sm font-medium">City</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="City"
                        value={formData.payToCity}
                        onChange={(e) => setFormData(prev => ({ ...prev, payToCity: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">State</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="State"
                        value={formData.payToState}
                        onChange={(e) => setFormData(prev => ({ ...prev, payToState: e.target.value }))}
                      />
            </div>
                    <div>
                      <Label className="text-sm font-medium">ZIP</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="ZIP"
                        value={formData.payToZip}
                        onChange={(e) => setFormData(prev => ({ ...prev, payToZip: e.target.value }))}
                      />
                </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* PATIENT CONTROL AND BILLING INFO */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Patient Control and Billing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Patient Control Number</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Control number"
                      value={formData.patientControlNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientControlNumber: e.target.value }))}
                    />
                </div>
                  <div>
                    <Label className="text-sm font-medium">Medical Record Number</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Medical record number"
                      value={formData.medicalRecordNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, medicalRecordNumber: e.target.value }))}
                    />
              </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Type of Bill</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Type of bill code"
                      value={formData.typeOfBill}
                      onChange={(e) => setFormData(prev => ({ ...prev, typeOfBill: e.target.value }))}
                    />
                </div>
                  <div>
                    <Label className="text-sm font-medium">Federal Tax ID</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Tax ID number"
                      value={formData.federalTaxId}
                      onChange={(e) => setFormData(prev => ({ ...prev, federalTaxId: e.target.value }))}
                    />
              </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm font-medium">Statement Covers From</Label>
                      <Input 
                        type="date"
                        className="mt-2" 
                        value={formData.statementCoversFrom}
                        onChange={(e) => setFormData(prev => ({ ...prev, statementCoversFrom: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">Statement Covers To</Label>
                      <Input 
                        type="date"
                        className="mt-2" 
                        value={formData.statementCoversTo}
                        onChange={(e) => setFormData(prev => ({ ...prev, statementCoversTo: e.target.value }))}
                      />
                  </div>
                </div>
              </div>
                </div>
            </div>
              </div>

          <Separator />

          {/* PATIENT INFORMATION */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm font-medium">Patient Last Name</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Last Name"
                        value={formData.patientLastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientLastName: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">Patient First Name</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="First Name"
                        value={formData.patientFirstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientFirstName: e.target.value }))}
                      />
                  </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm font-medium">Middle Initial</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="MI"
                        maxLength={1}
                        value={formData.patientMiddleInitial}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientMiddleInitial: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">Suffix</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Jr., Sr., III, etc."
                        value={formData.patientSuffix}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientSuffix: e.target.value }))}
                      />
              </div>
                </div>
                  <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Street address"
                      value={formData.patientAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientAddress: e.target.value }))}
                    />
              </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-sm font-medium">City</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="City"
                        value={formData.patientCity}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientCity: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">State</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="State"
                        value={formData.patientState}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientState: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">ZIP</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="ZIP"
                        value={formData.patientZip}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientZip: e.target.value }))}
                      />
                </div>
              </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm font-medium">Date of Birth</Label>
                      <Input 
                        type="date"
                        className="mt-2" 
                        value={formData.patientDob}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientDob: e.target.value }))}
                      />
              </div>
                    <div>
                      <Label className="text-sm font-medium">Gender</Label>
                      <Select value={formData.patientGender} onValueChange={(value) => setFormData(prev => ({ ...prev, patientGender: value }))}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Male</SelectItem>
                          <SelectItem value="F">Female</SelectItem>
                        </SelectContent>
                      </Select>
                </div>
              </div>
                  <div>
                    <Label className="text-sm font-medium">Phone Number</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Phone number"
                      value={formData.patientPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientPhone: e.target.value }))}
                    />
                </div>
              </div>
                  </div>
            </div>
              </div>

          <Separator />

          {/* ADMISSION INFORMATION */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Admission Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm font-medium">Admission Date</Label>
                      <Input 
                        type="date"
                        className="mt-2" 
                        value={formData.admissionDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, admissionDate: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">Admission Hour</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="HH"
                        value={formData.admissionHour}
                        onChange={(e) => setFormData(prev => ({ ...prev, admissionHour: e.target.value }))}
                      />
                  </div>
              </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm font-medium">Admission Type</Label>
                      <Select value={formData.admissionType} onValueChange={(value) => setFormData(prev => ({ ...prev, admissionType: value }))}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="elective">Elective</SelectItem>
                          <SelectItem value="newborn">Newborn</SelectItem>
                          <SelectItem value="trauma">Trauma</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                </div>
                    <div>
                      <Label className="text-sm font-medium">Admission Source</Label>
                      <Select value={formData.admissionSource} onValueChange={(value) => setFormData(prev => ({ ...prev, admissionSource: value }))}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="physician_referral">Physician Referral</SelectItem>
                          <SelectItem value="clinic_referral">Clinic Referral</SelectItem>
                          <SelectItem value="hmo_referral">HMO Referral</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                          <SelectItem value="emergency_room">Emergency Room</SelectItem>
                          <SelectItem value="court_law_enforcement">Court/Law Enforcement</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                </div>
              </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm font-medium">Discharge Date</Label>
                      <Input 
                        type="date"
                        className="mt-2" 
                        value={formData.dischargeDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dischargeDate: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">Discharge Hour</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="HH"
                        value={formData.dischargeHour}
                        onChange={(e) => setFormData(prev => ({ ...prev, dischargeHour: e.target.value }))}
                      />
              </div>
                </div>
                  <div>
                    <Label className="text-sm font-medium">Patient Status</Label>
                    <Select value={formData.patientStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, patientStatus: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discharged">Discharged</SelectItem>
                        <SelectItem value="still_patient">Still Patient</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="ama">AMA</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Prior Authorization</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Authorization number"
                      value={formData.priorAuthorization}
                      onChange={(e) => setFormData(prev => ({ ...prev, priorAuthorization: e.target.value }))}
                    />
              </div>
            </div>
                </div>
              </div>
                </div>

          <Separator />

          {/* PHYSICIAN INFORMATION */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Physician Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Referring Physician</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Physician name"
                      value={formData.referringPhysician}
                      onChange={(e) => setFormData(prev => ({ ...prev, referringPhysician: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Referring Physician ID</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Physician ID"
                      value={formData.referringPhysicianId}
                      onChange={(e) => setFormData(prev => ({ ...prev, referringPhysicianId: e.target.value }))}
                    />
                </div>
                  <div>
                    <Label className="text-sm font-medium">Operating Physician</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Physician name"
                      value={formData.operatingPhysician}
                      onChange={(e) => setFormData(prev => ({ ...prev, operatingPhysician: e.target.value }))}
                    />
                      </div>
                  <div>
                    <Label className="text-sm font-medium">Operating Physician ID</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Physician ID"
                      value={formData.operatingPhysicianId}
                      onChange={(e) => setFormData(prev => ({ ...prev, operatingPhysicianId: e.target.value }))}
                    />
                      </div>
                      </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Other Physician</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Physician name"
                      value={formData.otherPhysician}
                      onChange={(e) => setFormData(prev => ({ ...prev, otherPhysician: e.target.value }))}
                    />
                      </div>
                  <div>
                    <Label className="text-sm font-medium">Other Physician ID</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Physician ID"
                      value={formData.otherPhysicianId}
                      onChange={(e) => setFormData(prev => ({ ...prev, otherPhysicianId: e.target.value }))}
                    />
                      </div>
                  <div>
                    <Label className="text-sm font-medium">Attending Physician</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Physician name"
                      value={formData.attendingPhysician}
                      onChange={(e) => setFormData(prev => ({ ...prev, attendingPhysician: e.target.value }))}
                    />
                      </div>
                  <div>
                    <Label className="text-sm font-medium">Attending Physician ID</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Physician ID"
                      value={formData.attendingPhysicianId}
                      onChange={(e) => setFormData(prev => ({ ...prev, attendingPhysicianId: e.target.value }))}
                    />
                      </div>
                      </div>
                    </div>
            </div>
                </div>

          <Separator />

          {/* REVENUE CODES */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Revenue Codes</h3>
              
              {/* Add New Revenue Code */}
              <Card className="p-4 mb-4">
                <h4 className="font-medium mb-4">Add New Revenue Code</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Revenue Code</Label>
                    <div className="flex gap-2 mt-2">
                      <Input 
                        placeholder="Code"
                        value={currentRevenueCode.code}
                        onChange={(e) => setCurrentRevenueCode(prev => ({ ...prev, code: e.target.value }))}
                      />
                      <Button size="sm" variant="outline">
                        <Search className="h-4 w-4" />
                      </Button>
                  </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Service description"
                      value={currentRevenueCode.description}
                      onChange={(e) => setCurrentRevenueCode(prev => ({ ...prev, description: e.target.value }))}
                    />
                </div>
                  <div>
                    <Label className="text-sm font-medium">HCPCS Code</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="HCPCS code"
                      value={currentRevenueCode.hcpcsCode}
                      onChange={(e) => setCurrentRevenueCode(prev => ({ ...prev, hcpcsCode: e.target.value }))}
                    />
              </div>
                  <div>
                    <Label className="text-sm font-medium">Service Date</Label>
                    <Input 
                      type="date"
                      className="mt-2" 
                      value={currentRevenueCode.serviceDate}
                      onChange={(e) => setCurrentRevenueCode(prev => ({ ...prev, serviceDate: e.target.value }))}
                    />
            </div>
                  <div>
                    <Label className="text-sm font-medium">Units</Label>
                    <Input 
                      type="number"
                      className="mt-2" 
                      placeholder="1"
                      value={currentRevenueCode.units}
                      onChange={(e) => setCurrentRevenueCode(prev => ({ ...prev, units: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Charges</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      className="mt-2" 
                      placeholder="0.00"
                      value={currentRevenueCode.totalCharges}
                      onChange={(e) => setCurrentRevenueCode(prev => ({ ...prev, totalCharges: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Non-Covered Charges</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      className="mt-2" 
                      placeholder="0.00"
                      value={currentRevenueCode.nonCoveredCharges}
                      onChange={(e) => setCurrentRevenueCode(prev => ({ ...prev, nonCoveredCharges: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <Button onClick={addRevenueCode} className="mt-4" disabled={!currentRevenueCode.code || currentRevenueCode.totalCharges <= 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Revenue Code
                </Button>
              </Card>

              {/* Revenue Codes List */}
              {formData.revenueCodes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Added Revenue Codes</h4>
                  {formData.revenueCodes.map((code, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                          <div>
                            <Label className="text-xs text-muted-foreground">Code</Label>
                            <p className="text-sm font-mono">{code.code}</p>
                </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Description</Label>
                            <p className="text-sm">{code.description}</p>
                  </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">HCPCS</Label>
                            <p className="text-sm font-mono">{code.hcpcsCode}</p>
                  </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Charges</Label>
                            <p className="text-sm font-medium">${code.totalCharges.toFixed(2)}</p>
                </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => removeRevenueCode(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
                </div>
              </div>

          <Separator />

          {/* PAYER INFORMATION */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Payer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Primary Payer</h4>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Payer Name</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Primary payer"
                        value={formData.primaryPayer}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryPayer: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">Health Plan ID</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Primary ID"
                        value={formData.primaryPayerId}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryPayerId: e.target.value }))}
                      />
                  </div>
                    <div>
                      <Label className="text-sm font-medium">Relationship</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Primary relationship"
                        value={formData.primaryRelationship}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryRelationship: e.target.value }))}
                      />
                  </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm font-medium">Primary Insured Last Name</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="Last Name"
                          value={formData.primaryInsuredLastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, primaryInsuredLastName: e.target.value }))}
                        />
                </div>
                      <div>
                        <Label className="text-sm font-medium">Primary Insured First Name</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="First Name"
                          value={formData.primaryInsuredFirstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, primaryInsuredFirstName: e.target.value }))}
                        />
                </div>
              </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm font-medium">Middle Initial</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="MI"
                          maxLength={1}
                          value={formData.primaryInsuredMiddleInitial}
                          onChange={(e) => setFormData(prev => ({ ...prev, primaryInsuredMiddleInitial: e.target.value }))}
                        />
                </div>
                      <div>
                        <Label className="text-sm font-medium">Suffix</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="Jr., Sr., III, etc."
                          value={formData.primaryInsuredSuffix}
                          onChange={(e) => setFormData(prev => ({ ...prev, primaryInsuredSuffix: e.target.value }))}
                        />
                  </div>
                  </div>
                    <div>
                      <Label className="text-sm font-medium">Insured ID</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Primary ID"
                        value={formData.primaryInsuredId}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryInsuredId: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">Group Name</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Primary group"
                        value={formData.primaryGroupName}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryGroupName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Group Number</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Primary group #"
                        value={formData.primaryGroupNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryGroupNumber: e.target.value }))}
                      />
                    </div>
                </div>
              </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Secondary Payer</h4>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Payer Name</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Secondary payer"
                        value={formData.secondaryPayer}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondaryPayer: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">Health Plan ID</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Secondary ID"
                        value={formData.secondaryPayerId}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondaryPayerId: e.target.value }))}
                      />
                  </div>
                    <div>
                      <Label className="text-sm font-medium">Relationship</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Secondary relationship"
                        value={formData.secondaryRelationship}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondaryRelationship: e.target.value }))}
                      />
                  </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm font-medium">Secondary Insured Last Name</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="Last Name"
                          value={formData.secondaryInsuredLastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, secondaryInsuredLastName: e.target.value }))}
                        />
                </div>
                      <div>
                        <Label className="text-sm font-medium">Secondary Insured First Name</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="First Name"
                          value={formData.secondaryInsuredFirstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, secondaryInsuredFirstName: e.target.value }))}
                        />
                </div>
              </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm font-medium">Middle Initial</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="MI"
                          maxLength={1}
                          value={formData.secondaryInsuredMiddleInitial}
                          onChange={(e) => setFormData(prev => ({ ...prev, secondaryInsuredMiddleInitial: e.target.value }))}
                        />
                </div>
                      <div>
                        <Label className="text-sm font-medium">Suffix</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="Jr., Sr., III, etc."
                          value={formData.secondaryInsuredSuffix}
                          onChange={(e) => setFormData(prev => ({ ...prev, secondaryInsuredSuffix: e.target.value }))}
                        />
                  </div>
                  </div>
                    <div>
                      <Label className="text-sm font-medium">Insured ID</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Secondary ID"
                        value={formData.secondaryInsuredId}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondaryInsuredId: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">Group Name</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Secondary group"
                        value={formData.secondaryGroupName}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondaryGroupName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Group Number</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Secondary group #"
                        value={formData.secondaryGroupNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondaryGroupNumber: e.target.value }))}
                      />
                    </div>
                </div>
              </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Tertiary Payer</h4>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Payer Name</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Tertiary payer"
                        value={formData.tertiaryPayer}
                        onChange={(e) => setFormData(prev => ({ ...prev, tertiaryPayer: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">Health Plan ID</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Tertiary ID"
                        value={formData.tertiaryPayerId}
                        onChange={(e) => setFormData(prev => ({ ...prev, tertiaryPayerId: e.target.value }))}
                      />
                  </div>
                    <div>
                      <Label className="text-sm font-medium">Relationship</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Tertiary relationship"
                        value={formData.tertiaryRelationship}
                        onChange={(e) => setFormData(prev => ({ ...prev, tertiaryRelationship: e.target.value }))}
                      />
                  </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm font-medium">Tertiary Insured Last Name</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="Last Name"
                          value={formData.tertiaryInsuredLastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, tertiaryInsuredLastName: e.target.value }))}
                        />
                </div>
                      <div>
                        <Label className="text-sm font-medium">Tertiary Insured First Name</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="First Name"
                          value={formData.tertiaryInsuredFirstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, tertiaryInsuredFirstName: e.target.value }))}
                        />
                </div>
              </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm font-medium">Middle Initial</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="MI"
                          maxLength={1}
                          value={formData.tertiaryInsuredMiddleInitial}
                          onChange={(e) => setFormData(prev => ({ ...prev, tertiaryInsuredMiddleInitial: e.target.value }))}
                        />
                </div>
                      <div>
                        <Label className="text-sm font-medium">Suffix</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="Jr., Sr., III, etc."
                          value={formData.tertiaryInsuredSuffix}
                          onChange={(e) => setFormData(prev => ({ ...prev, tertiaryInsuredSuffix: e.target.value }))}
                        />
                  </div>
                  </div>
                    <div>
                      <Label className="text-sm font-medium">Insured ID</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Tertiary ID"
                        value={formData.tertiaryInsuredId}
                        onChange={(e) => setFormData(prev => ({ ...prev, tertiaryInsuredId: e.target.value }))}
                      />
                  </div>
                    <div>
                      <Label className="text-sm font-medium">Group Name</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Tertiary group"
                        value={formData.tertiaryGroupName}
                        onChange={(e) => setFormData(prev => ({ ...prev, tertiaryGroupName: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">Group Number</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Tertiary group #"
                        value={formData.tertiaryGroupNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, tertiaryGroupNumber: e.target.value }))}
                      />
              </div>
                </div>
                </div>
                </div>
            </div>
              </div>

          <Separator />

          {/* DIAGNOSIS AND PROCEDURE CODES */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Diagnosis and Procedure Codes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Principal Diagnosis</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Principal diagnosis code"
                      value={formData.principalDiagnosis}
                      onChange={(e) => setFormData(prev => ({ ...prev, principalDiagnosis: e.target.value }))}
                    />
                </div>
                  <div>
                    <Label className="text-sm font-medium">Other Diagnosis Codes</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map((num, index) => (
                        <div key={num}>
                          <Label className="text-xs text-muted-foreground">{num}</Label>
                          <Input 
                            className="mt-1" 
                            placeholder="Code"
                            value={formData.otherDiagnosisCodes[index] || ''}
                            onChange={(e) => {
                              const newCodes = [...formData.otherDiagnosisCodes];
                              newCodes[index] = e.target.value;
                              setFormData(prev => ({ ...prev, otherDiagnosisCodes: newCodes }));
                            }}
                          />
                </div>
                      ))}
                </div>
              </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Principal Procedure</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Principal procedure code"
                      value={formData.principalProcedure}
                      onChange={(e) => setFormData(prev => ({ ...prev, principalProcedure: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Other Procedure Codes</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map((num, index) => (
                        <div key={num}>
                          <Label className="text-xs text-muted-foreground">{num}</Label>
                          <Input 
                            className="mt-1" 
                            placeholder="Code"
                            value={formData.otherProcedureCodes[index] || ''}
                            onChange={(e) => {
                              const newCodes = [...formData.otherProcedureCodes];
                              newCodes[index] = e.target.value;
                              setFormData(prev => ({ ...prev, otherProcedureCodes: newCodes }));
                            }}
                          />
                </div>
                  ))}
                </div>
              </div>
                </div>
              </div>
            </div>
              </div>

          <Separator />

          {/* ADDITIONAL INFORMATION */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Treatment Authorization Codes</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Authorization codes"
                      value={formData.treatmentAuthorizationCodes}
                      onChange={(e) => setFormData(prev => ({ ...prev, treatmentAuthorizationCodes: e.target.value }))}
                    />
                </div>
                  <div>
                    <Label className="text-sm font-medium">Document Control Number</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Control number"
                      value={formData.documentControlNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, documentControlNumber: e.target.value }))}
                    />
                    </div>
                  <div>
                    <Label className="text-sm font-medium">Employer Name</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Employer name"
                      value={formData.employerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, employerName: e.target.value }))}
                    />
                </div>
              </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Remarks</Label>
                    <Textarea 
                      className="mt-2" 
                      placeholder="Additional remarks or notes"
                      value={formData.remarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                    />
                </div>
              </div>
                </div>
                  </div>
                </div>

          <Separator />

          {/* PROVIDER SIGNATURE */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Provider Signature</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Provider Signature Date</Label>
                  <Input 
                    type="date"
                    className="mt-2" 
                    value={formData.providerSignatureDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, providerSignatureDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Provider Signature</Label>
                  <Input 
                    className="mt-2" 
                    placeholder="Provider signature"
                    value={formData.providerSignature}
                    onChange={(e) => setFormData(prev => ({ ...prev, providerSignature: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={handleSaveDraft}>
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button onClick={handleSubmit}>
          <Send className="h-4 w-4 mr-2" />
          Submit Claim
        </Button>
      </div>
    </div>
  );
};

export default UB04Form;