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
import { Save, Send, Plus, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Modern ADA Dental Claim Form - User-Friendly Digital Interface
// Captures all required data with intuitive, modern design

const ADADentalForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    // Header Information
    transactionType: [] as string[],
    predeterminationNumber: "",
    
    // Insurance Company Information
    insuranceCompany: "",
    insuranceAddress: "",
    insuranceCity: "",
    insuranceState: "",
    insuranceZip: "",
    
    // Other Coverage
    hasOtherCoverage: false,
    otherPolicyholderName: "",
    otherPolicyholderDob: "",
    otherPolicyholderGender: "",
    otherPolicyholderId: "",
    otherGroupNumber: "",
    otherInsuranceCompany: "",
    
    // Primary Policyholder Information
    policyholderLastName: "",
    policyholderFirstName: "",
    policyholderMiddleInitial: "",
    policyholderSuffix: "",
    policyholderAddress: "",
    policyholderCity: "",
    policyholderState: "",
    policyholderZip: "",
    policyholderDob: "",
    policyholderGender: "",
    policyholderId: "",
    groupNumber: "",
    employerName: "",
    
    // Patient Information
    patientRelationship: "",
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
    patientId: "",
    
    // Treatment Information
    procedures: [] as any[],
    diagnoses: [] as string[],
    missingTeeth: [] as number[],
    orthodontic: {
      isOrthodontic: false,
      applianceDate: "",
      monthsRemaining: 0,
      isReplacement: false,
      priorDate: ""
    },
    
    // Provider Information
    billingProvider: {
      name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      npi: "",
      license: "",
      ssn: "",
      phone: ""
    },
    treatingProvider: {
      name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      npi: "",
      license: "",
      specialty: "",
      phone: ""
    },
    
    // Financial Information
    totalFees: 0,
    otherFees: 0,
    remarks: ""
  });

  const [currentProcedure, setCurrentProcedure] = useState({
    date: "",
    area: "",
    toothSystem: "",
    toothNumber: "",
    surface: "",
    procedureCode: "",
    diagnosisPointer: "",
    quantity: 1,
    description: "",
    fee: 0
  });
  
  const handleSubmit = () => {
    toast({
      title: "Claim Submitted",
      description: "ADA dental claim has been submitted successfully."
    });
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Your claim has been saved as a draft."
    });
  };

  const addProcedure = () => {
    if (currentProcedure.procedureCode && currentProcedure.fee > 0) {
      setFormData(prev => ({
        ...prev,
        procedures: [...prev.procedures, currentProcedure]
      }));
      setCurrentProcedure({
        date: "",
        area: "",
        toothSystem: "",
        toothNumber: "",
        surface: "",
        procedureCode: "",
        diagnosisPointer: "",
        quantity: 1,
        description: "",
        fee: 0
      });
    }
  };

  const removeProcedure = (index: number) => {
    setFormData(prev => ({
      ...prev,
      procedures: prev.procedures.filter((_, i) => i !== index)
    }));
  };

  const toggleMissingTooth = (toothNumber: number) => {
    setFormData(prev => ({
      ...prev,
      missingTeeth: prev.missingTeeth.includes(toothNumber)
        ? prev.missingTeeth.filter(t => t !== toothNumber)
        : [...prev.missingTeeth, toothNumber]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            ADA Dental Claim Form
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Complete dental claim information for insurance submission
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* HEADER INFORMATION */}
          <div className="space-y-6">
              <div>
              <h3 className="text-lg font-semibold mb-4">Header Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Type of Transaction</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="statement" 
                          checked={formData.transactionType.includes('statement')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                transactionType: [...prev.transactionType, 'statement']
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                transactionType: prev.transactionType.filter(t => t !== 'statement')
                              }));
                            }
                          }}
                        />
                        <Label htmlFor="statement" className="text-sm">Statement of Actual Services</Label>
                  </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="predetermination" 
                          checked={formData.transactionType.includes('predetermination')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                transactionType: [...prev.transactionType, 'predetermination']
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                transactionType: prev.transactionType.filter(t => t !== 'predetermination')
                              }));
                            }
                          }}
                        />
                        <Label htmlFor="predetermination" className="text-sm">Request for Predetermination/Preauthorization</Label>
                  </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="epsdt" 
                          checked={formData.transactionType.includes('epsdt')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                transactionType: [...prev.transactionType, 'epsdt']
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                transactionType: prev.transactionType.filter(t => t !== 'epsdt')
                              }));
                            }
                          }}
                        />
                        <Label htmlFor="epsdt" className="text-sm">EPSDT/Title XIX</Label>
                  </div>
                </div>
              </div>
              </div>
                  <div>
                  <Label className="text-sm font-medium">Predetermination/Preauthorization Number</Label>
                  <Input 
                    className="mt-2" 
                    placeholder="Enter number if applicable"
                    value={formData.predeterminationNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, predeterminationNumber: e.target.value }))}
                  />
                    </div>
                  </div>
                </div>
              </div>

          <Separator />

          {/* INSURANCE COMPANY INFORMATION */}
          <div className="space-y-6">
                  <div>
              <h3 className="text-lg font-semibold mb-4">Insurance Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Insurance Company Name</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Enter insurance company name"
                      value={formData.insuranceCompany}
                      onChange={(e) => setFormData(prev => ({ ...prev, insuranceCompany: e.target.value }))}
                    />
                      </div>
                  <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Street address"
                      value={formData.insuranceAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, insuranceAddress: e.target.value }))}
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
                        value={formData.insuranceCity}
                        onChange={(e) => setFormData(prev => ({ ...prev, insuranceCity: e.target.value }))}
                      />
                  </div>
                    <div>
                      <Label className="text-sm font-medium">State</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="State"
                        value={formData.insuranceState}
                        onChange={(e) => setFormData(prev => ({ ...prev, insuranceState: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">ZIP</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="ZIP"
                        value={formData.insuranceZip}
                        onChange={(e) => setFormData(prev => ({ ...prev, insuranceZip: e.target.value }))}
                      />
                        </div>
                        </div>
                        </div>
                      </div>
                    </div>
                  </div>

          <Separator />

          {/* OTHER COVERAGE */}
          <div className="space-y-6">
                  <div>
              <h3 className="text-lg font-semibold mb-4">Other Coverage</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasOtherCoverage" 
                    checked={formData.hasOtherCoverage}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasOtherCoverage: !!checked }))}
                  />
                  <Label htmlFor="hasOtherCoverage" className="text-sm">Patient has other dental or medical coverage</Label>
                  </div>
                
                {formData.hasOtherCoverage && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-4">
                    <div>
                        <Label className="text-sm font-medium">Other Policyholder Name</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="Last, First, Middle Initial"
                          value={formData.otherPolicyholderName}
                          onChange={(e) => setFormData(prev => ({ ...prev, otherPolicyholderName: e.target.value }))}
                        />
                    </div>
                      <div className="grid grid-cols-2 gap-2">
                    <div>
                          <Label className="text-sm font-medium">Date of Birth</Label>
                          <Input 
                            type="date"
                            className="mt-2" 
                            value={formData.otherPolicyholderDob}
                            onChange={(e) => setFormData(prev => ({ ...prev, otherPolicyholderDob: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Gender</Label>
                          <Select value={formData.otherPolicyholderGender} onValueChange={(value) => setFormData(prev => ({ ...prev, otherPolicyholderGender: value }))}>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="M">Male</SelectItem>
                              <SelectItem value="F">Female</SelectItem>
                              <SelectItem value="U">Unknown</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        </div>
                        </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Policyholder ID</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="SSN or ID number"
                          value={formData.otherPolicyholderId}
                          onChange={(e) => setFormData(prev => ({ ...prev, otherPolicyholderId: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Group Number</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="Group number"
                          value={formData.otherGroupNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, otherGroupNumber: e.target.value }))}
                        />
                    </div>
                  </div>
                  </div>
                )}
                </div>
              </div>
            </div>

          <Separator />

          {/* PRIMARY POLICYHOLDER INFORMATION */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Primary Policyholder Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                  <div>
                      <Label className="text-sm font-medium">Policyholder Last Name</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Last Name"
                        value={formData.policyholderLastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, policyholderLastName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Policyholder First Name</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="First Name"
                        value={formData.policyholderFirstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, policyholderFirstName: e.target.value }))}
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
                        value={formData.policyholderMiddleInitial}
                        onChange={(e) => setFormData(prev => ({ ...prev, policyholderMiddleInitial: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Suffix</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Jr., Sr., III, etc."
                        value={formData.policyholderSuffix}
                        onChange={(e) => setFormData(prev => ({ ...prev, policyholderSuffix: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Street address"
                      value={formData.policyholderAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, policyholderAddress: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                  <div>
                      <Label className="text-sm font-medium">City</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="City"
                        value={formData.policyholderCity}
                        onChange={(e) => setFormData(prev => ({ ...prev, policyholderCity: e.target.value }))}
                      />
                  </div>
                  <div>
                      <Label className="text-sm font-medium">State</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="State"
                        value={formData.policyholderState}
                        onChange={(e) => setFormData(prev => ({ ...prev, policyholderState: e.target.value }))}
                      />
                  </div>
                  <div>
                      <Label className="text-sm font-medium">ZIP</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="ZIP"
                        value={formData.policyholderZip}
                        onChange={(e) => setFormData(prev => ({ ...prev, policyholderZip: e.target.value }))}
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
                        value={formData.policyholderDob}
                        onChange={(e) => setFormData(prev => ({ ...prev, policyholderDob: e.target.value }))}
                      />
                  </div>
                  <div>
                      <Label className="text-sm font-medium">Gender</Label>
                      <Select value={formData.policyholderGender} onValueChange={(value) => setFormData(prev => ({ ...prev, policyholderGender: value }))}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Male</SelectItem>
                          <SelectItem value="F">Female</SelectItem>
                          <SelectItem value="U">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                    <div>
                    <Label className="text-sm font-medium">Policyholder ID</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="SSN or ID number"
                      value={formData.policyholderId}
                      onChange={(e) => setFormData(prev => ({ ...prev, policyholderId: e.target.value }))}
                    />
                    </div>
                    <div>
                    <Label className="text-sm font-medium">Group Number</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Group number"
                      value={formData.groupNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, groupNumber: e.target.value }))}
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
                  <div>
                    <Label className="text-sm font-medium">Relationship to Policyholder</Label>
                    <Select value={formData.patientRelationship} onValueChange={(value) => setFormData(prev => ({ ...prev, patientRelationship: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Self</SelectItem>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="child">Dependent Child</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                      </div>
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
                          <SelectItem value="U">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                </div>
              </div>
                <div>
                    <Label className="text-sm font-medium">Patient ID/Account Number</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Assigned by dentist"
                      value={formData.patientId}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                    />
                </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* PROCEDURES SECTION */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Procedures Performed</h3>
              
              {/* Add New Procedure */}
              <Card className="p-4 mb-4">
                <h4 className="font-medium mb-4">Add New Procedure</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Procedure Date</Label>
                    <Input 
                      type="date"
                      className="mt-2" 
                      value={currentProcedure.date}
                      onChange={(e) => setCurrentProcedure(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Procedure Code</Label>
                    <div className="flex gap-2 mt-2">
                      <Input 
                        placeholder="D####"
                        value={currentProcedure.procedureCode}
                        onChange={(e) => setCurrentProcedure(prev => ({ ...prev, procedureCode: e.target.value }))}
                      />
                      <Button size="sm" variant="outline">
                        <Search className="h-4 w-4" />
                      </Button>
                  </div>
                </div>
                  <div>
                    <Label className="text-sm font-medium">Tooth Number</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Tooth number/letter"
                      value={currentProcedure.toothNumber}
                      onChange={(e) => setCurrentProcedure(prev => ({ ...prev, toothNumber: e.target.value }))}
                    />
              </div>
                  <div>
                    <Label className="text-sm font-medium">Tooth Surface</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Surface codes"
                      value={currentProcedure.surface}
                      onChange={(e) => setCurrentProcedure(prev => ({ ...prev, surface: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Quantity</Label>
                    <Input 
                      type="number"
                      className="mt-2" 
                      placeholder="1"
                      value={currentProcedure.quantity}
                      onChange={(e) => setCurrentProcedure(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fee</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      className="mt-2" 
                      placeholder="0.00"
                      value={currentProcedure.fee}
                      onChange={(e) => setCurrentProcedure(prev => ({ ...prev, fee: parseFloat(e.target.value) || 0 }))}
                    />
                </div>
              </div>
                <div className="mt-4">
                  <Label className="text-sm font-medium">Description</Label>
                  <Input 
                    className="mt-2" 
                    placeholder="Procedure description"
                    value={currentProcedure.description}
                    onChange={(e) => setCurrentProcedure(prev => ({ ...prev, description: e.target.value }))}
                  />
            </div>
                <Button onClick={addProcedure} className="mt-4" disabled={!currentProcedure.procedureCode || currentProcedure.fee <= 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Procedure
                </Button>
              </Card>

              {/* Procedures List */}
              {formData.procedures.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Added Procedures</h4>
                  {formData.procedures.map((procedure, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                <div>
                            <Label className="text-xs text-muted-foreground">Date</Label>
                            <p className="text-sm">{procedure.date}</p>
                    </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Code</Label>
                            <p className="text-sm font-mono">{procedure.procedureCode}</p>
                    </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Tooth</Label>
                            <p className="text-sm">{procedure.toothNumber}</p>
                    </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Fee</Label>
                            <p className="text-sm font-medium">${procedure.fee.toFixed(2)}</p>
                    </div>
                  </div>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => removeProcedure(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                </div>
                      {procedure.description && (
                        <div className="mt-2">
                          <Label className="text-xs text-muted-foreground">Description</Label>
                          <p className="text-sm">{procedure.description}</p>
                    </div>
                      )}
                    </Card>
                  ))}
                    </div>
              )}
                    </div>
                  </div>

          <Separator />

          {/* DIAGNOSIS CODES */}
          <div className="space-y-6">
                <div>
              <h3 className="text-lg font-semibold mb-4">Diagnosis Codes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['A', 'B', 'C', 'D'].map((letter, index) => (
                  <div key={letter}>
                    <Label className="text-sm font-medium">Diagnosis {letter}</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="ICD-10 code"
                      value={formData.diagnoses[index] || ''}
                      onChange={(e) => {
                        const newDiagnoses = [...formData.diagnoses];
                        newDiagnoses[index] = e.target.value;
                        setFormData(prev => ({ ...prev, diagnoses: newDiagnoses }));
                      }}
                    />
                    </div>
                ))}
                    </div>
                  </div>
                </div>

          <Separator />

          {/* MISSING TEETH */}
          <div className="space-y-6">
                  <div>
              <h3 className="text-lg font-semibold mb-4">Missing Teeth Information</h3>
              <div className="grid grid-cols-2 gap-8">
                {/* Upper Teeth */}
                  <div>
                  <h4 className="font-medium mb-4">Upper Teeth</h4>
                  <div className="grid grid-cols-8 gap-1">
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map((tooth) => (
                      <div key={tooth} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">{tooth}</div>
                        <Checkbox 
                          checked={formData.missingTeeth.includes(tooth)}
                          onCheckedChange={() => toggleMissingTooth(tooth)}
                        />
                  </div>
                    ))}
                </div>
                </div>
                
                {/* Lower Teeth */}
                <div>
                  <h4 className="font-medium mb-4">Lower Teeth</h4>
                  <div className="grid grid-cols-8 gap-1">
                    {[32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17].map((tooth) => (
                      <div key={tooth} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">{tooth}</div>
                        <Checkbox 
                          checked={formData.missingTeeth.includes(tooth)}
                          onCheckedChange={() => toggleMissingTooth(tooth)}
                        />
                    </div>
                    ))}
                    </div>
                  </div>
                </div>
            </div>
          </div>

          <Separator />

          {/* ORTHODONTIC TREATMENT */}
          <div className="space-y-6">
                <div>
              <h3 className="text-lg font-semibold mb-4">Orthodontic Treatment</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isOrthodontic" 
                    checked={formData.orthodontic.isOrthodontic}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      orthodontic: { ...prev.orthodontic, isOrthodontic: !!checked }
                    }))}
                  />
                  <Label htmlFor="isOrthodontic" className="text-sm">Is treatment for orthodontics?</Label>
                </div>
                
                {formData.orthodontic.isOrthodontic && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                      <Label className="text-sm font-medium">Date Appliance Placed</Label>
                      <Input 
                        type="date"
                        className="mt-2" 
                        value={formData.orthodontic.applianceDate}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          orthodontic: { ...prev.orthodontic, applianceDate: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Months of Treatment Remaining</Label>
                      <Input 
                        type="number"
                        className="mt-2" 
                        placeholder="0"
                        value={formData.orthodontic.monthsRemaining}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          orthodontic: { ...prev.orthodontic, monthsRemaining: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isReplacement" 
                        checked={formData.orthodontic.isReplacement}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          orthodontic: { ...prev.orthodontic, isReplacement: !!checked }
                        }))}
                      />
                      <Label htmlFor="isReplacement" className="text-sm">Replacement of prosthesis?</Label>
                    </div>
                    {formData.orthodontic.isReplacement && (
                <div>
                        <Label className="text-sm font-medium">Date Prior Placement</Label>
                        <Input 
                          type="date"
                          className="mt-2" 
                          value={formData.orthodontic.priorDate}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            orthodontic: { ...prev.orthodontic, priorDate: e.target.value }
                          }))}
                        />
                </div>
                    )}
                  </div>
                )}
                </div>
              </div>
            </div>

          <Separator />

          {/* PROVIDER INFORMATION */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Provider Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Billing Provider */}
                <div className="space-y-4">
                  <h4 className="font-medium">Billing Provider</h4>
                  <div className="space-y-4">
                  <div>
                      <Label className="text-sm font-medium">Provider Name</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Provider name"
                        value={formData.billingProvider.name}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          billingProvider: { ...prev.billingProvider, name: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Address</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Street address"
                        value={formData.billingProvider.address}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          billingProvider: { ...prev.billingProvider, address: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                    <div>
                        <Label className="text-sm font-medium">City</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="City"
                          value={formData.billingProvider.city}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            billingProvider: { ...prev.billingProvider, city: e.target.value }
                          }))}
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium">State</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="State"
                          value={formData.billingProvider.state}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            billingProvider: { ...prev.billingProvider, state: e.target.value }
                          }))}
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium">ZIP</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="ZIP"
                          value={formData.billingProvider.zip}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            billingProvider: { ...prev.billingProvider, zip: e.target.value }
                          }))}
                        />
                    </div>
                  </div>
                    <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label className="text-sm font-medium">NPI</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="NPI number"
                          value={formData.billingProvider.npi}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            billingProvider: { ...prev.billingProvider, npi: e.target.value }
                          }))}
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium">License Number</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="License number"
                          value={formData.billingProvider.license}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            billingProvider: { ...prev.billingProvider, license: e.target.value }
                          }))}
                        />
                    </div>
                  </div>
                </div>
              </div>

                {/* Treating Provider */}
                <div className="space-y-4">
                  <h4 className="font-medium">Treating Provider</h4>
                  <div className="space-y-4">
                      <div>
                      <Label className="text-sm font-medium">Provider Name</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Provider name"
                        value={formData.treatingProvider.name}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          treatingProvider: { ...prev.treatingProvider, name: e.target.value }
                        }))}
                      />
                      </div>
                      <div>
                      <Label className="text-sm font-medium">Address</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Street address"
                        value={formData.treatingProvider.address}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          treatingProvider: { ...prev.treatingProvider, address: e.target.value }
                        }))}
                      />
                      </div>
                    <div className="grid grid-cols-3 gap-2">
                    <div>
                        <Label className="text-sm font-medium">City</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="City"
                          value={formData.treatingProvider.city}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            treatingProvider: { ...prev.treatingProvider, city: e.target.value }
                          }))}
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium">State</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="State"
                          value={formData.treatingProvider.state}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            treatingProvider: { ...prev.treatingProvider, state: e.target.value }
                          }))}
                        />
                  </div>
                  <div>
                        <Label className="text-sm font-medium">ZIP</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="ZIP"
                          value={formData.treatingProvider.zip}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            treatingProvider: { ...prev.treatingProvider, zip: e.target.value }
                          }))}
                        />
                    </div>
                  </div>
                    <div className="grid grid-cols-2 gap-2">
                  <div>
                        <Label className="text-sm font-medium">NPI</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="NPI number"
                          value={formData.treatingProvider.npi}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            treatingProvider: { ...prev.treatingProvider, npi: e.target.value }
                          }))}
                        />
                  </div>
                    <div>
                        <Label className="text-sm font-medium">License Number</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="License number"
                          value={formData.treatingProvider.license}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            treatingProvider: { ...prev.treatingProvider, license: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Provider Specialty Code</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="122300000X"
                        value={formData.treatingProvider.specialty}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          treatingProvider: { ...prev.treatingProvider, specialty: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* FINANCIAL INFORMATION */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium">Other Fees</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    className="mt-2" 
                    placeholder="0.00"
                    value={formData.otherFees}
                    onChange={(e) => setFormData(prev => ({ ...prev, otherFees: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Fee</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    className="mt-2 font-bold" 
                    placeholder="0.00"
                    value={formData.totalFees}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalFees: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-sm font-medium">Remarks</Label>
                <Textarea 
                  className="mt-2" 
                  placeholder="Additional information or remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                />
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

export default ADADentalForm;