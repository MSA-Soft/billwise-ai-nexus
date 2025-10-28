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

// Modern CMS-1500 Form - User-Friendly Digital Interface
// Captures all required data with intuitive, modern design

const CMS1500Form = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    // Insurance Type
    insuranceType: [] as string[],
    pica: "",
    
    // Patient Information
    patientLastName: "",
    patientFirstName: "",
    patientMiddleInitial: "",
    patientSuffix: "",
    patientDob: "",
    patientGender: "",
    patientAddress: "",
    patientCity: "",
    patientState: "",
    patientZip: "",
    patientPhone: "",
    
    // Insured Information
    insuredLastName: "",
    insuredFirstName: "",
    insuredMiddleInitial: "",
    insuredSuffix: "",
    insuredAddress: "",
    insuredCity: "",
    insuredState: "",
    insuredZip: "",
    insuredPhone: "",
    patientRelationship: "",
    insuredDob: "",
    insuredGender: "",
    insuredId: "",
    groupNumber: "",
    employerName: "",
    insurancePlanName: "",
    hasOtherInsurance: false,
    
    // Other Insured Information
    otherInsuredLastName: "",
    otherInsuredFirstName: "",
    otherInsuredMiddleInitial: "",
    otherInsuredSuffix: "",
    otherInsuredPolicy: "",
    otherInsuredDob: "",
    otherInsuredGender: "",
    otherInsuredEmployer: "",
    otherInsuredPlan: "",
    
    // Patient Condition
    employmentRelated: false,
    autoAccident: false,
    autoAccidentState: "",
    otherAccident: false,
    
    // Service Information
    serviceStartDate: "",
    serviceEndDate: "",
    sameIllnessDate: "",
    unableToWorkFrom: "",
    unableToWorkTo: "",
    hospitalizationFrom: "",
    hospitalizationTo: "",
    
    // Provider Information
    referringProvider: "",
    referringProviderId: "",
    referringProviderNpi: "",
    
    // Service Lines
    serviceLines: [] as any[],
    
    // Diagnosis Codes
    diagnosisCodes: [] as string[],
    
    // Financial Information
    totalCharges: 0,
    amountPaid: 0,
    balanceDue: 0,
    
    // Provider Details
    providerName: "",
    providerAddress: "",
    providerCity: "",
    providerState: "",
    providerZip: "",
    providerNpi: "",
    providerTaxId: "",
    providerPhone: "",
    
    // Service Facility
    facilityName: "",
    facilityAddress: "",
    facilityCity: "",
    facilityState: "",
    facilityZip: "",
    facilityNpi: "",
    
    // Signatures
    patientSignature: "",
    patientSignatureDate: "",
    insuredSignature: "",
    providerSignature: "",
    providerSignatureDate: ""
  });

  const [currentServiceLine, setCurrentServiceLine] = useState({
    serviceDate: "",
    placeOfService: "",
    emg: false,
    procedureCode: "",
    diagnosisPointer: "",
    charges: 0,
    daysOrUnits: 1,
    epsdt: false,
    idQualifier: "",
    renderingProviderId: ""
  });
  
  const handleSubmit = () => {
    toast({
      title: "Claim Submitted",
      description: "CMS-1500 claim has been submitted successfully."
    });
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Your claim has been saved as a draft."
    });
  };

  const addServiceLine = () => {
    if (currentServiceLine.procedureCode && currentServiceLine.charges > 0) {
      setFormData(prev => ({
        ...prev,
        serviceLines: [...prev.serviceLines, currentServiceLine]
      }));
      setCurrentServiceLine({
        serviceDate: "",
        placeOfService: "",
        emg: false,
        procedureCode: "",
        diagnosisPointer: "",
        charges: 0,
        daysOrUnits: 1,
        epsdt: false,
        idQualifier: "",
        renderingProviderId: ""
      });
    }
  };

  const removeServiceLine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      serviceLines: prev.serviceLines.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            CMS-1500 Health Insurance Claim Form
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Complete medical claim information for insurance submission
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* INSURANCE TYPE */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Insurance Type</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  'MEDICARE', 'MEDICAID', 'TRICARE', 'CHAMPUS', 
                  'CHAMPVA', 'GROUP HEALTH PLAN', 'FECA BLK LUNG', 'OTHER'
                ].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox 
                      id={type.toLowerCase().replace(/\s+/g, '_')}
                      checked={formData.insuranceType.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            insuranceType: [...prev.insuranceType, type]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            insuranceType: prev.insuranceType.filter(t => t !== type)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={type.toLowerCase().replace(/\s+/g, '_')} className="text-sm">
                      {type}
                    </Label>
              </div>
                ))}
              </div>
              <div className="mt-4">
                <Label className="text-sm font-medium">PICA (For Program in Item 1)</Label>
                <Input 
                  className="mt-2" 
                  placeholder="Enter PICA code"
                  value={formData.pica}
                  onChange={(e) => setFormData(prev => ({ ...prev, pica: e.target.value }))}
                />
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
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Patient Address</Label>
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
                  <div>
                    <Label className="text-sm font-medium">Phone Number</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Include area code"
                      value={formData.patientPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientPhone: e.target.value }))}
                    />
              </div>
                </div>
                  </div>
                </div>
              </div>

          <Separator />

          {/* INSURED INFORMATION */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Insured Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm font-medium">Insured Last Name</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Last Name"
                        value={formData.insuredLastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, insuredLastName: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">Insured First Name</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="First Name"
                        value={formData.insuredFirstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, insuredFirstName: e.target.value }))}
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
                        value={formData.insuredMiddleInitial}
                        onChange={(e) => setFormData(prev => ({ ...prev, insuredMiddleInitial: e.target.value }))}
                      />
          </div>
                    <div>
                      <Label className="text-sm font-medium">Suffix</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Jr., Sr., III, etc."
                        value={formData.insuredSuffix}
                        onChange={(e) => setFormData(prev => ({ ...prev, insuredSuffix: e.target.value }))}
                      />
                </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Insured Address</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Street address"
                      value={formData.insuredAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, insuredAddress: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-sm font-medium">City</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="City"
                        value={formData.insuredCity}
                        onChange={(e) => setFormData(prev => ({ ...prev, insuredCity: e.target.value }))}
                      />
                  </div>
                    <div>
                      <Label className="text-sm font-medium">State</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="State"
                        value={formData.insuredState}
                        onChange={(e) => setFormData(prev => ({ ...prev, insuredState: e.target.value }))}
                      />
                  </div>
                    <div>
                      <Label className="text-sm font-medium">ZIP</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="ZIP"
                        value={formData.insuredZip}
                        onChange={(e) => setFormData(prev => ({ ...prev, insuredZip: e.target.value }))}
                      />
                </div>
              </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Patient Relationship to Insured</Label>
                    <Select value={formData.patientRelationship} onValueChange={(value) => setFormData(prev => ({ ...prev, patientRelationship: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Self</SelectItem>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm font-medium">Insured Date of Birth</Label>
                      <Input 
                        type="date"
                        className="mt-2" 
                        value={formData.insuredDob}
                        onChange={(e) => setFormData(prev => ({ ...prev, insuredDob: e.target.value }))}
                      />
              </div>
                    <div>
                      <Label className="text-sm font-medium">Insured Gender</Label>
                      <Select value={formData.insuredGender} onValueChange={(value) => setFormData(prev => ({ ...prev, insuredGender: value }))}>
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
                    <Label className="text-sm font-medium">Insured ID Number</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="SSN or ID number"
                      value={formData.insuredId}
                      onChange={(e) => setFormData(prev => ({ ...prev, insuredId: e.target.value }))}
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
                  </div>
                  </div>
            </div>
          </div>

          <Separator />

          {/* OTHER INSURED INFORMATION */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Other Insured Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasOtherInsurance" 
                    checked={formData.hasOtherInsurance}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasOtherInsurance: !!checked }))}
                  />
                  <Label htmlFor="hasOtherInsurance" className="text-sm">Is there another health benefit plan?</Label>
                  </div>
                
                {formData.hasOtherInsurance && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-sm font-medium">Other Insured Last Name</Label>
                          <Input 
                            className="mt-2" 
                            placeholder="Last Name"
                            value={formData.otherInsuredLastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, otherInsuredLastName: e.target.value }))}
                          />
                  </div>
                        <div>
                          <Label className="text-sm font-medium">Other Insured First Name</Label>
                          <Input 
                            className="mt-2" 
                            placeholder="First Name"
                            value={formData.otherInsuredFirstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, otherInsuredFirstName: e.target.value }))}
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
                            value={formData.otherInsuredMiddleInitial}
                            onChange={(e) => setFormData(prev => ({ ...prev, otherInsuredMiddleInitial: e.target.value }))}
                          />
                </div>
                        <div>
                          <Label className="text-sm font-medium">Suffix</Label>
                          <Input 
                            className="mt-2" 
                            placeholder="Jr., Sr., III, etc."
                            value={formData.otherInsuredSuffix}
                            onChange={(e) => setFormData(prev => ({ ...prev, otherInsuredSuffix: e.target.value }))}
                          />
                      </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Other Insured Policy Number</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="Policy or group number"
                          value={formData.otherInsuredPolicy}
                          onChange={(e) => setFormData(prev => ({ ...prev, otherInsuredPolicy: e.target.value }))}
                        />
                    </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-sm font-medium">Date of Birth</Label>
                          <Input 
                            type="date"
                            className="mt-2" 
                            value={formData.otherInsuredDob}
                            onChange={(e) => setFormData(prev => ({ ...prev, otherInsuredDob: e.target.value }))}
                          />
                  </div>
                        <div>
                          <Label className="text-sm font-medium">Gender</Label>
                          <Select value={formData.otherInsuredGender} onValueChange={(value) => setFormData(prev => ({ ...prev, otherInsuredGender: value }))}>
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
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Employer Name</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="Employer or school name"
                          value={formData.otherInsuredEmployer}
                          onChange={(e) => setFormData(prev => ({ ...prev, otherInsuredEmployer: e.target.value }))}
                        />
                  </div>
                      <div>
                        <Label className="text-sm font-medium">Insurance Plan Name</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="Insurance plan name"
                          value={formData.otherInsuredPlan}
                          onChange={(e) => setFormData(prev => ({ ...prev, otherInsuredPlan: e.target.value }))}
                        />
                      </div>
                      </div>
                    </div>
                )}
                  </div>
            </div>
          </div>

          <Separator />

          {/* PATIENT CONDITION */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Patient Condition Related To</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Employment (Current or Previous)</Label>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="employment_yes" 
                          checked={formData.employmentRelated}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, employmentRelated: !!checked }))}
                        />
                        <Label htmlFor="employment_yes" className="text-sm">Yes</Label>
                </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="employment_no" 
                          checked={!formData.employmentRelated}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, employmentRelated: !checked }))}
                        />
                        <Label htmlFor="employment_no" className="text-sm">No</Label>
                  </div>
                        </div>
                        </div>
                      </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Auto Accident</Label>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="auto_yes" 
                          checked={formData.autoAccident}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoAccident: !!checked }))}
                        />
                        <Label htmlFor="auto_yes" className="text-sm">Yes</Label>
                    </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="auto_no" 
                          checked={!formData.autoAccident}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoAccident: !checked }))}
                        />
                        <Label htmlFor="auto_no" className="text-sm">No</Label>
          </div>
                  </div>
                    {formData.autoAccident && (
                      <div className="mt-2">
                        <Label className="text-sm font-medium">State</Label>
                        <Input 
                          className="mt-1" 
                          placeholder="State"
                          value={formData.autoAccidentState}
                          onChange={(e) => setFormData(prev => ({ ...prev, autoAccidentState: e.target.value }))}
                        />
                  </div>
                    )}
                      </div>
                      </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Other Accident</Label>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="other_yes" 
                          checked={formData.otherAccident}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, otherAccident: !!checked }))}
                        />
                        <Label htmlFor="other_yes" className="text-sm">Yes</Label>
                    </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="other_no" 
                          checked={!formData.otherAccident}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, otherAccident: !checked }))}
                        />
                        <Label htmlFor="other_no" className="text-sm">No</Label>
                  </div>
                </div>
              </div>
                </div>
                </div>
              </div>
            </div>

          <Separator />

          {/* SERVICE INFORMATION */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Service Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm font-medium">Service Start Date</Label>
                      <Input 
                        type="date"
                        className="mt-2" 
                        value={formData.serviceStartDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, serviceStartDate: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">Service End Date</Label>
                      <Input 
                        type="date"
                        className="mt-2" 
                        value={formData.serviceEndDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, serviceEndDate: e.target.value }))}
                      />
                </div>
              </div>
                  <div>
                    <Label className="text-sm font-medium">Same or Similar Illness Date</Label>
                    <Input 
                      type="date"
                      className="mt-2" 
                      value={formData.sameIllnessDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, sameIllnessDate: e.target.value }))}
                    />
                </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm font-medium">Unable to Work From</Label>
                      <Input 
                        type="date"
                        className="mt-2" 
                        value={formData.unableToWorkFrom}
                        onChange={(e) => setFormData(prev => ({ ...prev, unableToWorkFrom: e.target.value }))}
                      />
              </div>
                    <div>
                      <Label className="text-sm font-medium">Unable to Work To</Label>
                      <Input 
                        type="date"
                        className="mt-2" 
                        value={formData.unableToWorkTo}
                        onChange={(e) => setFormData(prev => ({ ...prev, unableToWorkTo: e.target.value }))}
                      />
                </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm font-medium">Hospitalization From</Label>
                      <Input 
                        type="date"
                        className="mt-2" 
                        value={formData.hospitalizationFrom}
                        onChange={(e) => setFormData(prev => ({ ...prev, hospitalizationFrom: e.target.value }))}
                      />
                </div>
                    <div>
                      <Label className="text-sm font-medium">Hospitalization To</Label>
                      <Input 
                        type="date"
                        className="mt-2" 
                        value={formData.hospitalizationTo}
                        onChange={(e) => setFormData(prev => ({ ...prev, hospitalizationTo: e.target.value }))}
                      />
                  </div>
                </div>
              </div>
                </div>
            </div>
          </div>

          <Separator />

          {/* REFERRING PROVIDER */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Referring Provider</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Referring Provider Name</Label>
                  <Input 
                    className="mt-2" 
                    placeholder="Provider name"
                    value={formData.referringProvider}
                    onChange={(e) => setFormData(prev => ({ ...prev, referringProvider: e.target.value }))}
                  />
                    </div>
                <div>
                  <Label className="text-sm font-medium">ID Number</Label>
                  <Input 
                    className="mt-2" 
                    placeholder="ID number"
                    value={formData.referringProviderId}
                    onChange={(e) => setFormData(prev => ({ ...prev, referringProviderId: e.target.value }))}
                  />
                    </div>
                <div>
                  <Label className="text-sm font-medium">NPI</Label>
                  <Input 
                    className="mt-2" 
                    placeholder="NPI number"
                    value={formData.referringProviderNpi}
                    onChange={(e) => setFormData(prev => ({ ...prev, referringProviderNpi: e.target.value }))}
                  />
                  </div>
                </div>
              </div>
                </div>

          <Separator />

          {/* SERVICE LINES */}
          <div className="space-y-6">
                  <div>
              <h3 className="text-lg font-semibold mb-4">Service Lines</h3>
              
              {/* Add New Service Line */}
              <Card className="p-4 mb-4">
                <h4 className="font-medium mb-4">Add New Service Line</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Service Date</Label>
                    <Input 
                      type="date"
                      className="mt-2" 
                      value={currentServiceLine.serviceDate}
                      onChange={(e) => setCurrentServiceLine(prev => ({ ...prev, serviceDate: e.target.value }))}
                    />
                  </div>
                    <div>
                    <Label className="text-sm font-medium">Place of Service</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="11"
                      value={currentServiceLine.placeOfService}
                      onChange={(e) => setCurrentServiceLine(prev => ({ ...prev, placeOfService: e.target.value }))}
                    />
                    </div>
                    <div>
                    <Label className="text-sm font-medium">EMG</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox 
                        checked={currentServiceLine.emg}
                        onCheckedChange={(checked) => setCurrentServiceLine(prev => ({ ...prev, emg: !!checked }))}
                      />
                      <Label className="text-sm">Emergency</Label>
                    </div>
                    </div>
                    <div>
                    <Label className="text-sm font-medium">Procedure Code</Label>
                    <div className="flex gap-2 mt-2">
                      <Input 
                        placeholder="CPT/HCPCS"
                        value={currentServiceLine.procedureCode}
                        onChange={(e) => setCurrentServiceLine(prev => ({ ...prev, procedureCode: e.target.value }))}
                      />
                      <Button size="sm" variant="outline">
                        <Search className="h-4 w-4" />
                      </Button>
                  </div>
                </div>
                  <div>
                    <Label className="text-sm font-medium">Diagnosis Pointer</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="A"
                      value={currentServiceLine.diagnosisPointer}
                      onChange={(e) => setCurrentServiceLine(prev => ({ ...prev, diagnosisPointer: e.target.value }))}
                    />
              </div>
                  <div>
                    <Label className="text-sm font-medium">Charges</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      className="mt-2" 
                      placeholder="0.00"
                      value={currentServiceLine.charges}
                      onChange={(e) => setCurrentServiceLine(prev => ({ ...prev, charges: parseFloat(e.target.value) || 0 }))}
                    />
                </div>
                  <div>
                    <Label className="text-sm font-medium">Days/Units</Label>
                    <Input 
                      type="number"
                      className="mt-2" 
                      placeholder="1"
                      value={currentServiceLine.daysOrUnits}
                      onChange={(e) => setCurrentServiceLine(prev => ({ ...prev, daysOrUnits: parseInt(e.target.value) || 1 }))}
                    />
                </div>
                  <div>
                    <Label className="text-sm font-medium">EPSDT</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox 
                        checked={currentServiceLine.epsdt}
                        onCheckedChange={(checked) => setCurrentServiceLine(prev => ({ ...prev, epsdt: !!checked }))}
                      />
                      <Label className="text-sm">EPSDT</Label>
              </div>
                </div>
                  <div>
                    <Label className="text-sm font-medium">ID Qualifier</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="N"
                      value={currentServiceLine.idQualifier}
                      onChange={(e) => setCurrentServiceLine(prev => ({ ...prev, idQualifier: e.target.value }))}
                    />
              </div>
                </div>
                <Button onClick={addServiceLine} className="mt-4" disabled={!currentServiceLine.procedureCode || currentServiceLine.charges <= 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service Line
                </Button>
              </Card>

              {/* Service Lines List */}
              {formData.serviceLines.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Added Service Lines</h4>
                  {formData.serviceLines.map((line, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                          <div>
                            <Label className="text-xs text-muted-foreground">Date</Label>
                            <p className="text-sm">{line.serviceDate}</p>
                  </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Procedure</Label>
                            <p className="text-sm font-mono">{line.procedureCode}</p>
                  </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Charges</Label>
                            <p className="text-sm font-medium">${line.charges.toFixed(2)}</p>
                  </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Units</Label>
                            <p className="text-sm">{line.daysOrUnits}</p>
                  </div>
                  </div>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => removeServiceLine(index)}
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

          {/* DIAGNOSIS CODES */}
          <div className="space-y-6">
                    <div>
              <h3 className="text-lg font-semibold mb-4">Diagnosis Codes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['1', '2', '3', '4'].map((number, index) => (
                  <div key={number}>
                    <Label className="text-sm font-medium">Diagnosis {number}</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="ICD-10 code"
                      value={formData.diagnosisCodes[index] || ''}
                      onChange={(e) => {
                        const newCodes = [...formData.diagnosisCodes];
                        newCodes[index] = e.target.value;
                        setFormData(prev => ({ ...prev, diagnosisCodes: newCodes }));
                      }}
                    />
                    </div>
                ))}
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
                  <Label className="text-sm font-medium">Total Charges</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    className="mt-2" 
                    placeholder="0.00"
                    value={formData.totalCharges}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalCharges: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount Paid</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    className="mt-2" 
                    placeholder="0.00"
                    value={formData.amountPaid}
                    onChange={(e) => setFormData(prev => ({ ...prev, amountPaid: parseFloat(e.target.value) || 0 }))}
                  />
                    </div>
                <div>
                  <Label className="text-sm font-medium">Balance Due</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    className="mt-2" 
                    placeholder="0.00"
                    value={formData.balanceDue}
                    onChange={(e) => setFormData(prev => ({ ...prev, balanceDue: parseFloat(e.target.value) || 0 }))}
                  />
                    </div>
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
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm font-medium">NPI</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="NPI number"
                          value={formData.providerNpi}
                          onChange={(e) => setFormData(prev => ({ ...prev, providerNpi: e.target.value }))}
                        />
          </div>
                      <div>
                        <Label className="text-sm font-medium">Tax ID</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="Tax ID number"
                          value={formData.providerTaxId}
                          onChange={(e) => setFormData(prev => ({ ...prev, providerTaxId: e.target.value }))}
                        />
                </div>
              </div>
                </div>
              </div>

                {/* Service Facility */}
                <div className="space-y-4">
                  <h4 className="font-medium">Service Facility</h4>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Facility Name</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Facility name"
                        value={formData.facilityName}
                        onChange={(e) => setFormData(prev => ({ ...prev, facilityName: e.target.value }))}
                      />
            </div>
                    <div>
                      <Label className="text-sm font-medium">Address</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Street address"
                        value={formData.facilityAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, facilityAddress: e.target.value }))}
                      />
            </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-sm font-medium">City</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="City"
                          value={formData.facilityCity}
                          onChange={(e) => setFormData(prev => ({ ...prev, facilityCity: e.target.value }))}
                        />
                </div>
                      <div>
                        <Label className="text-sm font-medium">State</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="State"
                          value={formData.facilityState}
                          onChange={(e) => setFormData(prev => ({ ...prev, facilityState: e.target.value }))}
                        />
                </div>
                      <div>
                        <Label className="text-sm font-medium">ZIP</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="ZIP"
                          value={formData.facilityZip}
                          onChange={(e) => setFormData(prev => ({ ...prev, facilityZip: e.target.value }))}
                        />
              </div>
                </div>
                    <div>
                      <Label className="text-sm font-medium">Facility NPI</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="Facility NPI"
                        value={formData.facilityNpi}
                        onChange={(e) => setFormData(prev => ({ ...prev, facilityNpi: e.target.value }))}
                      />
                  </div>
                  </div>
                </div>
            </div>
            </div>
          </div>

          <Separator />

          {/* SIGNATURES */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Signatures</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Patient Signature</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Patient signature"
                      value={formData.patientSignature}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientSignature: e.target.value }))}
                    />
                </div>
                  <div>
                    <Label className="text-sm font-medium">Patient Signature Date</Label>
                    <Input 
                      type="date"
                      className="mt-2" 
                      value={formData.patientSignatureDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientSignatureDate: e.target.value }))}
                    />
                  </div>
                  </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Insured Signature</Label>
                    <Input 
                      className="mt-2" 
                      placeholder="Insured signature"
                      value={formData.insuredSignature}
                      onChange={(e) => setFormData(prev => ({ ...prev, insuredSignature: e.target.value }))}
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
                  <div>
                    <Label className="text-sm font-medium">Provider Signature Date</Label>
                    <Input 
                      type="date"
                      className="mt-2" 
                      value={formData.providerSignatureDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, providerSignatureDate: e.target.value }))}
                    />
            </div>
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

export default CMS1500Form;