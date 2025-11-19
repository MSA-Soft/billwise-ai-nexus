import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  FileText, 
  Save, 
  Send, 
  Calendar,
  User,
  Building,
  DollarSign,
  Plus,
  Trash2
} from 'lucide-react';

interface CMS1500FormProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CMS1500Form({ isOpen = true, onClose }: CMS1500FormProps) {
  const [formData, setFormData] = useState({
    // Payer Information
    payerName: '',
    payerAddress: '',
    payerAddress2: '',
    payerCityStateZip: '',
    
    // Patient Information
    patientLastName: '',
    patientFirstName: '',
    patientMI: '',
    patientBirthDate: '',
    patientSex: '',
    patientAddress: '',
    patientCity: '',
    patientState: '',
    patientZip: '',
    patientPhone: '',
    
    // Insurance Information
    insuranceType: '',
    insuranceId: '',
    insuredLastName: '',
    insuredFirstName: '',
    insuredMI: '',
    insuredAddress: '',
    insuredCity: '',
    insuredState: '',
    insuredZip: '',
    insuredPhone: '',
    patientRelationship: '',
    
    // Other Insurance
    otherInsuredLastName: '',
    otherInsuredFirstName: '',
    otherInsuredMI: '',
    otherInsuredPolicyNumber: '',
    otherInsuredPlanName: '',
    
    // Accident Information
    employmentRelated: '',
    autoAccident: '',
    autoAccidentState: '',
    otherAccident: '',
    
    // Provider Information
    referringProvider: '',
    referringProviderNPI: '',
    
    // Service Information
    serviceDateFrom: '',
    serviceDateTo: '',
    placeOfService: '',
    outsideLab: '',
    outsideLabCharges: '',
    
    // Diagnosis Codes
    diagnosisCodes: Array(12).fill(''),
    
    // Authorization
    priorAuthNumber: '',
    resubmissionCode: '',
    originalRefNumber: '',
    
    // Service Lines
    serviceLines: [{
      id: '1',
      serviceDate: '',
      placeOfService: '',
      procedureCode: '',
      modifier: '',
      diagnosisPointer: '',
      charges: '',
      days: '',
      epsdtFamilyPlan: '',
      idQual: '',
      renderingProviderNPI: ''
    }],
    
    // Financial Information
    totalCharges: '',
    amountPaid: '',
    balanceDue: '',
    
    // Signatures
    patientSignature: '',
    patientSignatureDate: '',
    insuredSignature: '',
    
    // Additional Information
    additionalClaimInfo: '',
    unableToWorkFrom: '',
    unableToWorkTo: '',
    hospitalizationFrom: '',
    hospitalizationTo: '',
    currentIllnessDate: '',
    currentIllnessQual: '',
    otherDate: '',
    otherDateQual: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceLineChange = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      serviceLines: prev.serviceLines.map(line => 
        line.id === id ? { ...line, [field]: value } : line
      )
    }));
  };

  const handleAddServiceLine = () => {
    const newServiceLine = {
      id: Date.now().toString(),
      serviceDate: '',
      placeOfService: '',
      procedureCode: '',
      modifier: '',
      diagnosisPointer: '',
      charges: '',
      days: '',
      epsdtFamilyPlan: '',
      idQual: '',
      renderingProviderNPI: ''
    };
    setFormData(prev => ({
      ...prev,
      serviceLines: [...prev.serviceLines, newServiceLine]
    }));
  };

  const handleRemoveServiceLine = (id: string) => {
    setFormData(prev => ({
      ...prev,
      serviceLines: prev.serviceLines.filter(line => line.id !== id)
    }));
  };

  const handleSave = () => {
    console.log('CMS-1500 Form saved:', formData);
    alert('CMS-1500 form saved successfully!');
  };

  const handleSubmit = () => {
    console.log('CMS-1500 Form submitted:', formData);
    alert('CMS-1500 form submitted successfully!');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <FileText className="h-5 w-5 mr-2" />
            CMS-1500 Claim Form
          </DialogTitle>
          <DialogDescription>
            Complete the standard CMS-1500 claim form for professional services billing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Payer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payerName">Payer Name</Label>
                  <Input
                    id="payerName"
                    value={formData.payerName}
                    onChange={(e) => handleInputChange('payerName', e.target.value)}
                    placeholder="Insurance company name"
                  />
                </div>
                <div>
                  <Label htmlFor="payerAddress">Payer Address</Label>
                  <Input
                    id="payerAddress"
                    value={formData.payerAddress}
                    onChange={(e) => handleInputChange('payerAddress', e.target.value)}
                    placeholder="Street address"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payerAddress2">Payer Address 2</Label>
                  <Input
                    id="payerAddress2"
                    value={formData.payerAddress2}
                    onChange={(e) => handleInputChange('payerAddress2', e.target.value)}
                    placeholder="Suite, floor, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="payerCityStateZip">City, State, ZIP</Label>
                  <Input
                    id="payerCityStateZip"
                    value={formData.payerCityStateZip}
                    onChange={(e) => handleInputChange('payerCityStateZip', e.target.value)}
                    placeholder="City, State ZIP"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="patientLastName">Last Name</Label>
                  <Input
                    id="patientLastName"
                    value={formData.patientLastName}
                    onChange={(e) => handleInputChange('patientLastName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="patientFirstName">First Name</Label>
                  <Input
                    id="patientFirstName"
                    value={formData.patientFirstName}
                    onChange={(e) => handleInputChange('patientFirstName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="patientMI">Middle Initial</Label>
                  <Input
                    id="patientMI"
                    value={formData.patientMI}
                    onChange={(e) => handleInputChange('patientMI', e.target.value)}
                    maxLength={1}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="patientBirthDate">Birth Date</Label>
                  <Input
                    id="patientBirthDate"
                    type="date"
                    value={formData.patientBirthDate}
                    onChange={(e) => handleInputChange('patientBirthDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="patientSex">Sex</Label>
                  <Select value={formData.patientSex} onValueChange={(value) => handleInputChange('patientSex', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="patientPhone">Phone</Label>
                  <Input
                    id="patientPhone"
                    value={formData.patientPhone}
                    onChange={(e) => handleInputChange('patientPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="patientAddress">Address</Label>
                  <Input
                    id="patientAddress"
                    value={formData.patientAddress}
                    onChange={(e) => handleInputChange('patientAddress', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="patientCity">City</Label>
                  <Input
                    id="patientCity"
                    value={formData.patientCity}
                    onChange={(e) => handleInputChange('patientCity', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="patientState">State</Label>
                    <Input
                      id="patientState"
                      value={formData.patientState}
                      onChange={(e) => handleInputChange('patientState', e.target.value)}
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientZip">ZIP</Label>
                    <Input
                      id="patientZip"
                      value={formData.patientZip}
                      onChange={(e) => handleInputChange('patientZip', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Insurance Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insuranceType">Insurance Type</Label>
                  <Select value={formData.insuranceType} onValueChange={(value) => handleInputChange('insuranceType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select insurance type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="tertiary">Tertiary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="insuranceId">Insurance ID</Label>
                  <Input
                    id="insuranceId"
                    value={formData.insuranceId}
                    onChange={(e) => handleInputChange('insuranceId', e.target.value)}
                    placeholder="Policy number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="insuredLastName">Insured Last Name</Label>
                  <Input
                    id="insuredLastName"
                    value={formData.insuredLastName}
                    onChange={(e) => handleInputChange('insuredLastName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="insuredFirstName">Insured First Name</Label>
                  <Input
                    id="insuredFirstName"
                    value={formData.insuredFirstName}
                    onChange={(e) => handleInputChange('insuredFirstName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="insuredMI">Insured MI</Label>
                  <Input
                    id="insuredMI"
                    value={formData.insuredMI}
                    onChange={(e) => handleInputChange('insuredMI', e.target.value)}
                    maxLength={1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="insuredAddress">Insured Address</Label>
                  <Input
                    id="insuredAddress"
                    value={formData.insuredAddress}
                    onChange={(e) => handleInputChange('insuredAddress', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="insuredCity">Insured City</Label>
                  <Input
                    id="insuredCity"
                    value={formData.insuredCity}
                    onChange={(e) => handleInputChange('insuredCity', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="insuredState">Insured State</Label>
                    <Input
                      id="insuredState"
                      value={formData.insuredState}
                      onChange={(e) => handleInputChange('insuredState', e.target.value)}
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="insuredZip">Insured ZIP</Label>
                    <Input
                      id="insuredZip"
                      value={formData.insuredZip}
                      onChange={(e) => handleInputChange('insuredZip', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Lines */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Service Lines</CardTitle>
                <Button onClick={handleAddServiceLine} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service Line
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.serviceLines.map((line, index) => (
                  <div key={line.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Service Line {index + 1}</h4>
                      {formData.serviceLines.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveServiceLine(line.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Service Date</Label>
                        <Input
                          type="date"
                          value={line.serviceDate}
                          onChange={(e) => handleServiceLineChange(line.id, 'serviceDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Place of Service</Label>
                        <Input
                          value={line.placeOfService}
                          onChange={(e) => handleServiceLineChange(line.id, 'placeOfService', e.target.value)}
                          placeholder="Code"
                        />
                      </div>
                      <div>
                        <Label>Procedure Code</Label>
                        <Input
                          value={line.procedureCode}
                          onChange={(e) => handleServiceLineChange(line.id, 'procedureCode', e.target.value)}
                          placeholder="CPT code"
                        />
                      </div>
                      <div>
                        <Label>Charges</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={line.charges}
                          onChange={(e) => handleServiceLineChange(line.id, 'charges', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="totalCharges">Total Charges</Label>
                  <Input
                    id="totalCharges"
                    type="number"
                    step="0.01"
                    value={formData.totalCharges}
                    onChange={(e) => handleInputChange('totalCharges', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="amountPaid">Amount Paid</Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    step="0.01"
                    value={formData.amountPaid}
                    onChange={(e) => handleInputChange('amountPaid', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="balanceDue">Balance Due</Label>
                  <Input
                    id="balanceDue"
                    type="number"
                    step="0.01"
                    value={formData.balanceDue}
                    onChange={(e) => handleInputChange('balanceDue', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onClose?.()}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Form
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-2" />
              Submit Claim
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
