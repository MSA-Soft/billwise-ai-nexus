import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  Eye, 
  Calendar,
  User,
  FileText,
  CreditCard,
  Building,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface EnhancedClaimFormProps {
  claimId?: string;
  patientId?: string;
  onSave?: (claimData: any) => void;
  onCancel?: () => void;
  isOpen?: boolean;
}

export function EnhancedClaimForm({ 
  claimId, 
  patientId, 
  onSave, 
  onCancel, 
  isOpen = true 
}: EnhancedClaimFormProps) {
  
  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    claim_number: '',
    form_type: 'HCFA',
    cms_form_version: '02/12',
    
    // Patient and Provider
    patient_id: patientId || '',
    provider_id: '',
    appointment_id: '',
    
    // Service Information
    service_date_from: '',
    service_date_to: '',
    place_of_service_code: '',
    facility_id: '',
    
    // Insurance Information
    primary_insurance_id: '',
    secondary_insurance_id: 'none',
    insurance_type: 'EDI',
    
    // Financial Information
    total_charges: 0,
    patient_responsibility: 0,
    insurance_amount: 0,
    copay_amount: 0,
    deductible_amount: 0,
    
    // Authorization
    prior_auth_number: '',
    referral_number: '',
    treatment_auth_code: '',
    
    // Status
    status: 'draft',
    submission_method: 'EDI',
    is_secondary_claim: false,
    
    // Additional
    notes: ''
  });

  const { toast } = useToast();
  const [procedures, setProcedures] = useState<any[]>([]);
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Data from Customer Setup
  const [providers, setProviders] = useState<any[]>([]);
  const [payers, setPayers] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [practices, setPractices] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [cptCodes, setCptCodes] = useState<Array<{ code: string; description: string }>>([]);
  const [icdCodes, setIcdCodes] = useState<Array<{ code: string; description: string }>>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [isLoadingPayers, setIsLoadingPayers] = useState(false);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const isFetchingRef = useRef(false);

  // Fetch providers from Customer Setup
  useEffect(() => {
    fetchProviders();
    fetchPayers();
    fetchFacilities();
    fetchPractices();
    fetchPatients();
  }, []);

  const fetchProviders = async () => {
    if (isFetchingRef.current) return;
    try {
      setIsLoadingProviders(true);
      const { data, error } = await supabase
        .from('providers' as any)
        .select('*')
        .eq('is_active', true)
        .order('last_name', { ascending: true });

      if (error) {
        console.error('Error fetching providers:', error);
        toast({
          title: 'Error loading providers',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      const transformedProviders = (data || []).map((p: any) => ({
        id: p.id,
        name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        firstName: p.first_name || '',
        lastName: p.last_name || '',
        specialty: p.taxonomy_specialty || '',
        npi: p.npi || '',
        credentials: p.credentials || ''
      }));

      setProviders(transformedProviders);
    } catch (error: any) {
      console.error('Error fetching providers:', error);
      toast({
        title: 'Error loading providers',
        description: error.message || 'Failed to load providers',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const fetchPayers = async () => {
    try {
      setIsLoadingPayers(true);
      const { data, error } = await supabase
        .from('insurance_payers' as any)
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching payers:', error);
        toast({
          title: 'Error loading payers',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      const transformedPayers = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name || '',
        planName: p.plan_name || '',
        payerType: p.payer_type || ''
      }));

      setPayers(transformedPayers);
    } catch (error: any) {
      console.error('Error fetching payers:', error);
      toast({
        title: 'Error loading payers',
        description: error.message || 'Failed to load payers',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPayers(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      setIsLoadingFacilities(true);
      const { data, error } = await supabase
        .from('facilities' as any)
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching facilities:', error);
        toast({
          title: 'Error loading facilities',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      const transformedFacilities = (data || []).map((f: any) => ({
        id: f.id,
        name: f.name || f.facility_name || '',
        address: [f.address_line1, f.address_line2].filter(Boolean).join(', ') || '',
        city: f.city || '',
        state: f.state || '',
        zipCode: f.zip_code || f.zip || ''
      }));

      setFacilities(transformedFacilities);
    } catch (error: any) {
      console.error('Error fetching facilities:', error);
      toast({
        title: 'Error loading facilities',
        description: error.message || 'Failed to load facilities',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFacilities(false);
    }
  };

  const fetchPractices = async () => {
    try {
      const { data, error } = await supabase
        .from('practices' as any)
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching practices:', error);
        return;
      }

      const transformedPractices = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name || '',
        npi: p.npi || ''
      }));

      setPractices(transformedPractices);
    } catch (error: any) {
      console.error('Error fetching practices:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      setIsLoadingPatients(true);
      const { data, error } = await supabase
        .from('patients' as any)
        .select('*')
        .order('last_name', { ascending: true });

      if (error) {
        console.error('Error fetching patients:', error);
        return;
      }

      const transformedPatients = (data || []).map((p: any) => ({
        id: p.id,
        name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        dob: p.date_of_birth || '',
        phone: p.phone || ''
      }));

      setPatients(transformedPatients);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  // Place of Service codes (standard CMS codes)
  const placeOfServiceCodes = [
    { code: '11', description: 'Office' },
    { code: '21', description: 'Inpatient Hospital' },
    { code: '22', description: 'Outpatient Hospital' },
    { code: '23', description: 'Emergency Room - Hospital' },
    { code: '24', description: 'Ambulatory Surgical Center' },
    { code: '25', description: 'Birthing Center' },
    { code: '26', description: 'Military Treatment Facility' },
    { code: '31', description: 'Skilled Nursing Facility' },
    { code: '32', description: 'Nursing Facility' },
    { code: '33', description: 'Custodial Care Facility' },
    { code: '34', description: 'Hospice' },
    { code: '41', description: 'Ambulance - Land' },
    { code: '42', description: 'Ambulance - Air or Water' },
    { code: '49', description: 'Independent Clinic' },
    { code: '50', description: 'Federally Qualified Health Center' },
    { code: '71', description: 'State or Local Public Health Clinic' },
    { code: '72', description: 'Rural Health Clinic' },
    { code: '81', description: 'Independent Laboratory' },
    { code: '99', description: 'Other Place of Service' }
  ];

  // Fetch CPT and ICD codes from database
  useEffect(() => {
    const fetchCodes = async () => {
      setIsLoadingCodes(true);
      try {
        // Fetch CPT codes
        const { data: cptData, error: cptError } = await supabase
          .from('cpt_hcpcs_codes' as any)
          .select('code, description, superbill_description')
          .eq('is_active', true)
          .order('code', { ascending: true })
          .limit(500);

        if (cptError) {
          console.error('Error fetching CPT codes:', cptError);
        } else {
          const transformedCpt = (cptData || []).map((c: any) => ({
            code: c.code || '',
            description: c.description || c.superbill_description || ''
          }));
          setCptCodes(transformedCpt);
        }

        // Fetch ICD codes
        const { data: icdData, error: icdError } = await supabase
          .from('diagnosis_codes' as any)
          .select('code, description')
          .eq('is_active', true)
          .order('code', { ascending: true })
          .limit(500);

        if (icdError) {
          console.error('Error fetching ICD codes:', icdError);
        } else {
          const transformedIcd = (icdData || []).map((d: any) => ({
            code: d.code || '',
            description: d.description || ''
          }));
          setIcdCodes(transformedIcd);
        }
      } catch (error: any) {
        console.error('Error fetching codes:', error);
        toast({
          title: 'Error loading codes',
          description: error.message || 'Failed to load codes',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingCodes(false);
      }
    };

    fetchCodes();
  }, []);

  const generateClaimNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CLM-${year}-${month}${day}-${random}`;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddProcedure = () => {
    const newProcedure = {
      id: Date.now().toString(),
      cpt_code: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      modifier: '',
      diagnosis_pointer: ''
    };
    setProcedures(prev => [...prev, newProcedure]);
  };

  const handleRemoveProcedure = (id: string) => {
    setProcedures(prev => prev.filter(p => p.id !== id));
  };

  const handleProcedureChange = (id: string, field: string, value: any) => {
    setProcedures(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updated.total_price = updated.quantity * updated.unit_price;
        }
        return updated;
      }
      return p;
    }));
  };

  const handleAddDiagnosis = () => {
    const newDiagnosis = {
      id: Date.now().toString(),
      icd_code: '',
      description: '',
      is_primary: diagnoses.length === 0
    };
    setDiagnoses(prev => [...prev, newDiagnosis]);
  };

  const handleRemoveDiagnosis = (id: string) => {
    setDiagnoses(prev => prev.filter(d => d.id !== id));
  };

  const handleDiagnosisChange = (id: string, field: string, value: any) => {
    setDiagnoses(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, [field]: value };
      }
      return d;
    }));
  };

  const handleSave = () => {
    const claimData = {
      ...formData,
      procedures,
      diagnoses,
      total_charges: procedures.reduce((sum, p) => sum + p.total_price, 0)
    };
    
    if (onSave) {
      onSave(claimData);
    } else {
      console.log('Claim data:', claimData);
      alert('Claim saved successfully!');
    }
  };

  const handleSubmit = () => {
    if (procedures.length === 0) {
      alert('Please add at least one procedure.');
      return;
    }
    
    if (diagnoses.length === 0) {
      alert('Please add at least one diagnosis.');
      return;
    }

    const claimData = {
      ...formData,
      procedures,
      diagnoses,
      status: 'submitted',
      total_charges: procedures.reduce((sum, p) => sum + p.total_price, 0)
    };
    
    console.log('Claim submitted:', claimData);
    alert('Claim submitted successfully!');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel?.()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <FileText className="h-5 w-5 mr-2" />
            Enhanced Claim Form
          </DialogTitle>
          <DialogDescription>
            Create or edit a comprehensive medical claim with procedures, diagnoses, and insurance information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="claim_number">Claim Number</Label>
                  <Input
                    id="claim_number"
                    value={formData.claim_number || generateClaimNumber()}
                    onChange={(e) => handleInputChange('claim_number', e.target.value)}
                    placeholder="Auto-generated"
                  />
                </div>
                <div>
                  <Label htmlFor="form_type">Form Type</Label>
                  <Select value={formData.form_type} onValueChange={(value) => handleInputChange('form_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HCFA">HCFA</SelectItem>
                      <SelectItem value="CMS1500">CMS-1500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cms_form_version">CMS Form Version</Label>
                  <Select value={formData.cms_form_version} onValueChange={(value) => handleInputChange('cms_form_version', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="02/12">02/12</SelectItem>
                      <SelectItem value="08/05">08/05</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient and Provider Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Patient & Provider Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient_id">Patient</Label>
                  <Select 
                    value={formData.patient_id} 
                    onValueChange={(value) => handleInputChange('patient_id', value)}
                    disabled={isLoadingPatients}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingPatients ? "Loading patients..." : "Select patient"} />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.length === 0 && !isLoadingPatients ? (
                        <SelectItem value="none" disabled>No patients found. Please add patients first.</SelectItem>
                      ) : (
                        patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} {patient.dob ? `- ${patient.dob}` : ''}
                        </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="provider_id">Provider</Label>
                  <Select 
                    value={formData.provider_id} 
                    onValueChange={(value) => handleInputChange('provider_id', value)}
                    disabled={isLoadingProviders}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingProviders ? "Loading providers..." : "Select provider"} />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.length === 0 && !isLoadingProviders ? (
                        <SelectItem value="none" disabled>No providers found. Please add providers in Customer Setup.</SelectItem>
                      ) : (
                        providers.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                            {provider.name} {provider.credentials ? `, ${provider.credentials}` : ''} {provider.specialty ? `- ${provider.specialty}` : ''}
                        </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_date_from">Service Date From</Label>
                  <Input
                    id="service_date_from"
                    type="date"
                    value={formData.service_date_from}
                    onChange={(e) => handleInputChange('service_date_from', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="service_date_to">Service Date To</Label>
                  <Input
                    id="service_date_to"
                    type="date"
                    value={formData.service_date_to}
                    onChange={(e) => handleInputChange('service_date_to', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facility_id">Facility</Label>
                  <Select 
                    value={formData.facility_id || "none"} 
                    onValueChange={(value) => handleInputChange('facility_id', value === "none" ? "" : value)}
                    disabled={isLoadingFacilities}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingFacilities ? "Loading facilities..." : "Select facility"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {facilities.length === 0 && !isLoadingFacilities ? (
                        <SelectItem value="no-facilities" disabled>No facilities found. Please add facilities in Customer Setup.</SelectItem>
                      ) : (
                        facilities.map(facility => (
                          <SelectItem key={facility.id} value={facility.id}>
                            {facility.name} {facility.city ? `- ${facility.city}, ${facility.state}` : ''}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="place_of_service_code">Place of Service</Label>
                  <Select 
                    value={formData.place_of_service_code} 
                    onValueChange={(value) => handleInputChange('place_of_service_code', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select place of service" />
                    </SelectTrigger>
                    <SelectContent>
                      {placeOfServiceCodes.map(pos => (
                        <SelectItem key={pos.code} value={pos.code}>
                          {pos.code} - {pos.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Procedures */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Procedures</CardTitle>
                <Button onClick={handleAddProcedure} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Procedure
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {procedures.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No procedures added yet. Click "Add Procedure" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {procedures.map((procedure, index) => (
                    <div key={procedure.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Procedure {index + 1}</h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveProcedure(procedure.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>CPT Code</Label>
                          <Select value={procedure.cpt_code} onValueChange={(value) => handleProcedureChange(procedure.id, 'cpt_code', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select CPT code" />
                            </SelectTrigger>
                            <SelectContent>
                              {cptCodes.map(cpt => (
                                <SelectItem key={cpt.code} value={cpt.code}>
                                  {cpt.code} - {cpt.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={procedure.quantity}
                            onChange={(e) => handleProcedureChange(procedure.id, 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={procedure.unit_price}
                            onChange={(e) => handleProcedureChange(procedure.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>Total Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={procedure.total_price}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Diagnoses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Diagnoses</CardTitle>
                <Button onClick={handleAddDiagnosis} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Diagnosis
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {diagnoses.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No diagnoses added yet. Click "Add Diagnosis" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {diagnoses.map((diagnosis, index) => (
                    <div key={diagnosis.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Diagnosis {index + 1}</h4>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={diagnosis.is_primary}
                            onCheckedChange={(checked) => handleDiagnosisChange(diagnosis.id, 'is_primary', checked)}
                          />
                          <Label>Primary</Label>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveDiagnosis(diagnosis.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>ICD Code</Label>
                          <Select value={diagnosis.icd_code} onValueChange={(value) => handleDiagnosisChange(diagnosis.id, 'icd_code', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ICD code" />
                            </SelectTrigger>
                            <SelectContent>
                              {icdCodes.map(icd => (
                                <SelectItem key={icd.code} value={icd.code}>
                                  {icd.code} - {icd.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={diagnosis.description}
                            onChange={(e) => handleDiagnosisChange(diagnosis.id, 'description', e.target.value)}
                            placeholder="Diagnosis description"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  <Label htmlFor="primary_insurance_id">Primary Insurance</Label>
                  <Select 
                    value={formData.primary_insurance_id} 
                    onValueChange={(value) => handleInputChange('primary_insurance_id', value)}
                    disabled={isLoadingPayers}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingPayers ? "Loading payers..." : "Select primary insurance"} />
                    </SelectTrigger>
                    <SelectContent>
                      {payers.length === 0 && !isLoadingPayers ? (
                        <SelectItem value="none" disabled>No payers found. Please add payers in Customer Setup.</SelectItem>
                      ) : (
                        payers.map(payer => (
                          <SelectItem key={payer.id} value={payer.id}>
                            {payer.name} {payer.planName ? `- ${payer.planName}` : ''}
                        </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="secondary_insurance_id">Secondary Insurance</Label>
                  <Select 
                    value={formData.secondary_insurance_id} 
                    onValueChange={(value) => handleInputChange('secondary_insurance_id', value)}
                    disabled={isLoadingPayers}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingPayers ? "Loading payers..." : "Select secondary insurance"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {payers.map(payer => (
                        <SelectItem key={payer.id} value={payer.id}>
                          {payer.name} {payer.planName ? `- ${payer.planName}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_secondary_claim"
                  checked={formData.is_secondary_claim}
                  onCheckedChange={(checked) => handleInputChange('is_secondary_claim', checked)}
                />
                <Label htmlFor="is_secondary_claim">This is a secondary claim</Label>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter any additional notes or comments..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onCancel?.()}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
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
