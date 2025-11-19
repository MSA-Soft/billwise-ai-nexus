import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { authorizationAuditService } from "@/services/authorizationAuditService";

interface AuthorizationRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  authorizationId?: string; // Optional: if provided, we're editing an existing authorization
  patientId?: string; // Optional: if provided, pre-populate patient data
  patientData?: {
    name?: string;
    dob?: string;
    memberId?: string;
    payerId?: string;
    payerName?: string;
    cptCodes?: string[];
    icdCodes?: string[];
    providerId?: string;
    providerNpi?: string;
  }; // Optional: pre-filled patient data from eligibility verification
}

const AuthorizationRequestDialog = ({ open, onOpenChange, onSuccess, authorizationId, patientId, patientData }: AuthorizationRequestDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [payers, setPayers] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [patients, setPatients] = useState<Array<{ id: string; patient_id: string; patient_name: string; dob?: string; member_id?: string }>>([]);
  const [isLoadingPayers, setIsLoadingPayers] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<Array<{ id: string; patient_id: string; patient_name: string; dob?: string; member_id?: string }>>([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    patient_name: "",
    patient_dob: "",
    patient_member_id: "",
    provider_id: "",
    provider_npi: "",
    requesting_physician: "",
    payer_id: "",
    payer_name: "",
    procedure_code: "",
    procedure_description: "",
    diagnosis_codes: "",
    clinical_indication: "",
    urgency: "routine",
    requested_start_date: "",
    requested_end_date: "",
    units_requested: 1,
    // New fields for expiration and visit management (X12 278 compliant)
    authorization_expiration_date: "", // When the authorization expires (required for approved auths)
    visits_authorized: 0, // Number of visits authorized (separate from units_requested)
    service_end_date: "" // Service end date (can be different from expiration date)
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPayers();
      fetchProviders();
      fetchPatients();
      if (authorizationId) {
        setIsEditMode(true);
        loadAuthorizationData(authorizationId);
      } else {
        setIsEditMode(false);
        setSelectedPatientId(null); // Reset selection
        // Pre-populate from patientData if provided
        if (patientData) {
          setFormData(prev => ({
            ...prev,
            patient_name: patientData.name || prev.patient_name,
            patient_dob: patientData.dob || prev.patient_dob,
            patient_member_id: patientData.memberId || prev.patient_member_id,
            payer_id: patientData.payerId || prev.payer_id,
            payer_name: patientData.payerName || prev.payer_name,
            provider_id: patientData.providerId || prev.provider_id,
            provider_npi: patientData.providerNpi || prev.provider_npi,
            procedure_code: patientData.cptCodes?.[0] || prev.procedure_code,
            diagnosis_codes: patientData.icdCodes?.join(', ') || prev.diagnosis_codes,
            requested_end_date: prev.requested_end_date, // Preserve existing value
          }));
          if (patientData.name) {
            setPatientSearchTerm(patientData.name);
            setSelectedPatientId(patientId || 'pre-filled');
          }
        } else if (patientId) {
          // Load patient data from database
          setSelectedPatientId(patientId);
          loadPatientData(patientId);
        } else {
          resetForm();
        }
      }
    }
  }, [open, authorizationId, patientId, patientData]);

  const loadAuthorizationData = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('authorization_requests' as any)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const authData = data as any;
        setFormData({
          patient_name: authData.patient_name || "",
          patient_dob: authData.patient_dob || "",
          patient_member_id: authData.patient_member_id || "",
          provider_id: authData.provider_id || "",
          provider_npi: authData.provider_npi_custom || "",
          requesting_physician: authData.provider_name_custom || "",
          payer_id: authData.payer_id || "",
          payer_name: authData.payer_name_custom || "",
          procedure_code: authData.procedure_codes?.[0] || "",
          procedure_description: authData.service_type || "",
          diagnosis_codes: (authData.diagnosis_codes || []).join(', '),
          clinical_indication: authData.clinical_indication || "",
          urgency: authData.urgency_level || "routine",
          requested_start_date: authData.service_start_date || "",
          requested_end_date: authData.service_end_date || "",
          service_end_date: authData.service_end_date || "",
          units_requested: authData.units_requested || 1,
          authorization_expiration_date: authData.authorization_expiration_date || "",
          visits_authorized: authData.visits_authorized || authData.units_requested || 0,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load authorization data",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      patient_name: "",
      patient_dob: "",
      patient_member_id: "",
      provider_id: "",
      provider_npi: "",
      requesting_physician: "",
      payer_id: "",
      payer_name: "",
      procedure_code: "",
      procedure_description: "",
      diagnosis_codes: "",
      clinical_indication: "",
      urgency: "routine",
      requested_start_date: "",
      requested_end_date: "",
      service_end_date: "",
      units_requested: 1,
      authorization_expiration_date: "",
      visits_authorized: 0,
    });
  };

  const fetchPayers = async () => {
    try {
      setIsLoadingPayers(true);
      const { data, error } = await supabase
      .from('insurance_payers' as any)
      .select('*')
      .eq('is_active', true)
      .order('name');
    
      if (error) {
        console.error('Error fetching payers:', error);
        toast({
          title: 'Error loading payers',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
    if (data) {
      setPayers(data);
      }
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

  const fetchProviders = async () => {
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

      setProviders(data || []);
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

  const fetchPatients = async () => {
    try {
      setIsLoadingPatients(true);
      console.log('📥 Fetching all patients for dropdown...');
      
      const { data, error } = await supabase
        .from('patients' as any)
        .select('id, patient_id, first_name, last_name, date_of_birth, phone, email, address_line1, city, state, zip_code')
        .order('last_name', { ascending: true })
        .limit(500);

      if (error) {
        console.error('❌ Error fetching patients:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        toast({
          title: 'Error loading patients',
          description: error.message || 'Failed to load patients list',
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ Fetched', data?.length || 0, 'patients from database');

      const formattedPatients = ((data || []) as any[])
        .filter(p => p.patient_id || p.first_name || p.last_name)
        .map(p => ({
          id: p.id,
          patient_id: p.patient_id || `TEMP-${p.id}`,
          patient_name: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || `Patient ${p.patient_id || p.id}`,
          dob: p.date_of_birth || '',
          member_id: '',
          phone: p.phone || '',
          email: p.email || '',
          address: p.address_line1 || '',
          city: p.city || '',
          state: p.state || '',
          zip: p.zip_code || '',
        }));

      console.log('📋 Formatted', formattedPatients.length, 'patients');
      if (formattedPatients.length > 0) {
        console.log('📋 Sample patient:', formattedPatients[0]);
      }

      setPatients(formattedPatients);
    } catch (error: any) {
      console.error('❌ Error fetching patients:', error);
      console.error('❌ Error stack:', error.stack);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const loadPatientData = async (id: string) => {
    try {
      // Get comprehensive patient data
      const { data: basicData, error: basicError } = await supabase
        .from('patients' as any)
        .select('id, patient_id, first_name, last_name, date_of_birth, phone, email, address_line1, city, state, zip_code, gender')
        .eq('id', id)
        .single();

      if (basicError) throw basicError;

      if (basicData) {
        const patientData = basicData as any;
        const fullName = `${patientData.first_name ?? ''} ${patientData.last_name ?? ''}`.trim();
        
        // Update form with all available patient data
        setFormData(prev => ({
          ...prev,
          patient_name: fullName,
          patient_dob: patientData.date_of_birth || prev.patient_dob,
          requested_end_date: prev.requested_end_date, // Preserve existing value
        }));
        
        // Update search term to show selected patient
        setPatientSearchTerm(fullName);
        console.log('✅ Patient basic data loaded:', { name: fullName, dob: patientData.date_of_birth });
      }

      // Try to load insurance data separately (optional, don't fail if it doesn't work)
      try {
        // Try multiple ways to get insurance data
        let insuranceData: any = null;
        
        // Method 1: Try patient_insurance table
        const { data: piData, error: piError } = await supabase
          .from('patient_insurance' as any)
          .select('member_id, group_number, policy_number, insurance_id, payer_id')
          .eq('patient_id', id)
          .limit(1)
          .maybeSingle();

        if (!piError && piData) {
          insuranceData = piData;
        } else {
          // Method 2: Try to get from patients table if it has insurance fields
          // Some schemas store insurance_id directly in patients table
          if (basicData && (basicData as any).primary_insurance_id) {
            insuranceData = {
              insurance_id: (basicData as any).primary_insurance_id,
              member_id: (basicData as any).insurance_member_id || null,
            };
          }
        }

        if (insuranceData) {
          const insurance = insuranceData as any;
          console.log('✅ Insurance data found:', insurance);
          
          setFormData(prev => ({
            ...prev,
            patient_member_id: insurance.member_id || prev.patient_member_id,
          }));

          // Try to get payer info
          const payerId = insurance.insurance_id || insurance.payer_id;
          if (payerId) {
            const { data: payerData, error: payerError } = await supabase
              .from('insurance_payers' as any)
              .select('id, name')
              .eq('id', payerId)
              .maybeSingle();

            if (!payerError && payerData) {
              const payer = payerData as any;
              console.log('✅ Payer data found:', payer);
              setFormData(prev => ({
                ...prev,
                payer_id: payer.id || prev.payer_id,
                payer_name: payer.name || prev.payer_name,
              }));
            }
          }
        } else {
          console.log('ℹ️ No insurance data found for this patient');
        }
      } catch (insuranceErr: any) {
        // Insurance data is optional, just log and continue
        console.log('ℹ️ Insurance data not available (this is okay):', insuranceErr.message);
      }
    } catch (error: any) {
      console.error('Error loading patient data:', error);
      throw error; // Re-throw so handlePatientSelect can handle it
    }
  };

  const handlePatientSelect = async (patient: { id: string; patient_id: string; patient_name: string; dob?: string; member_id?: string }) => {
    console.log('✅ Patient selected:', patient);
    
    // Mark patient as selected and hide dropdown
    setSelectedPatientId(patient.id);
    setPatientSearchTerm(patient.patient_name);
    setFilteredPatients([]); // Clear dropdown
    
    // Immediately populate form with available data from search results
    console.log('📝 Populating form with:', {
      patient_name: patient.patient_name,
      patient_dob: patient.dob,
      patient_member_id: patient.member_id
    });
    
    setFormData(prev => {
      const updated = {
        ...prev,
        patient_name: patient.patient_name,
        patient_dob: patient.dob || prev.patient_dob,
        patient_member_id: patient.member_id || prev.patient_member_id,
        requested_end_date: prev.requested_end_date, // Preserve existing value
      };
      console.log('📝 Form data updated:', updated);
      return updated;
    });
    
    // Load full patient data to populate more fields
    try {
      console.log('🔄 Loading full patient data for ID:', patient.id);
      await loadPatientData(patient.id);
      console.log('✅ Full patient data loaded and form populated');
    } catch (error: any) {
      console.warn('⚠️ Could not load additional patient data, using search result data:', error);
      // Form is already populated with basic data, so we continue
    }
  };

  const handlePatientSearchChange = async (value: string) => {
    setPatientSearchTerm(value);
    
    // If user starts typing again, clear selection to allow new search
    if (selectedPatientId && value !== formData.patient_name) {
      setSelectedPatientId(null);
    }
    
    if (!value || value.trim().length < 1) {
      setFilteredPatients([]);
      setSelectedPatientId(null);
      return;
    }

    setIsSearchingPatients(true);
    try {
      const searchTerm = value.trim();
      const searchTermLower = searchTerm.toLowerCase();
      
      // Normalize patient ID for search (handle variations like PAT-001, P001, etc.)
      const normalizedId = searchTerm.toUpperCase().replace(/^PAT-?/, '');
      
      // Build multiple search patterns for better matching (similar to EligibilityVerification)
      const searchPatterns = [
        `first_name.ilike.%${searchTerm}%`,
        `last_name.ilike.%${searchTerm}%`,
        `patient_id.ilike.%${searchTerm}%`,
        `patient_id.ilike.%${normalizedId}%`,
        `patient_id.ilike.%PAT-${normalizedId}%`,
        `patient_id.ilike.%P-${normalizedId}%`,
        `patient_id.eq.${searchTerm}`,
        `patient_id.eq.${normalizedId}`,
      ];
      
      console.log('🔍 Searching patients with term:', searchTerm);
      console.log('🔍 Search patterns:', searchPatterns);
      
      // Search in database using ilike for case-insensitive search
      const { data: patientsData, error } = await supabase
        .from('patients' as any)
        .select('id, patient_id, first_name, last_name, date_of_birth, phone, email')
        .or(searchPatterns.join(','))
        .limit(20);

      if (error) {
        console.error('❌ Patient search error:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        
        // Try a simpler search as fallback
        try {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('patients' as any)
            .select('id, patient_id, first_name, last_name, date_of_birth, phone, email')
            .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,patient_id.ilike.%${searchTerm}%`)
            .limit(20);
            
          if (!fallbackError && fallbackData) {
            const formattedResults = ((fallbackData || []) as any[]).map(p => ({
              id: p.id,
              patient_id: p.patient_id || `TEMP-${p.id}`,
              patient_name: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || `Patient ${p.patient_id || p.id}`,
              dob: p.date_of_birth || '',
              member_id: '',
              phone: p.phone || '',
              email: p.email || '',
            }));
            setFilteredPatients(formattedResults);
            setIsSearchingPatients(false);
            return;
          }
        } catch (fallbackErr) {
          console.error('❌ Fallback search also failed:', fallbackErr);
        }
        
        // Final fallback to client-side search
        const clientMatches = patients.filter(p => 
          p.patient_name.toLowerCase().includes(searchTermLower) ||
          p.patient_id.toLowerCase().includes(searchTermLower)
        );
        setFilteredPatients(clientMatches);
        setIsSearchingPatients(false);
        return;
      }

      console.log('✅ Search successful, found', patientsData?.length || 0, 'patients');

      // Format the results
      const formattedResults = ((patientsData || []) as any[]).map(p => ({
        id: p.id,
        patient_id: p.patient_id || `TEMP-${p.id}`,
        patient_name: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || `Patient ${p.patient_id || p.id}`,
        dob: p.date_of_birth || '',
        member_id: '',
        phone: p.phone || '',
        email: p.email || '',
      }));

      console.log('📋 Formatted results:', formattedResults);

      setFilteredPatients(formattedResults);

      // Auto-fill if there's an exact match
      const exactMatch = formattedResults.find(p => 
        p.patient_name.toLowerCase() === searchTermLower ||
        p.patient_id.toLowerCase() === searchTermLower ||
        p.patient_id.toUpperCase() === searchTerm.toUpperCase()
      );
      
      if (exactMatch) {
        console.log('✅ Exact match found, auto-filling:', exactMatch);
        handlePatientSelect(exactMatch);
      } else if (formattedResults.length === 1 && searchTerm.length > 2) {
        // Auto-fill if there's only one match
        console.log('✅ Single match found, auto-filling:', formattedResults[0]);
        handlePatientSelect(formattedResults[0]);
      }
    } catch (error: any) {
      console.error('❌ Error searching patients:', error);
      console.error('❌ Error stack:', error.stack);
      // Fallback to client-side search
      const clientMatches = patients.filter(p => 
        p.patient_name.toLowerCase().includes(value.toLowerCase()) ||
        p.patient_id.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPatients(clientMatches);
    } finally {
      setIsSearchingPatients(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create an authorization');
      }

      const selectedPayer = payers.find(p => p.id === formData.payer_id);
      
      // Prepare data object with all fields including expiration and visits
      const authData: any = {
        user_id: user.id,
        patient_name: formData.patient_name,
        patient_dob: formData.patient_dob || null,
        patient_member_id: formData.patient_member_id,
        payer_id: formData.payer_id || null,
        payer_name_custom: selectedPayer ? selectedPayer.name : (formData.payer_name || null),
        provider_name_custom: formData.requesting_physician,
        provider_npi_custom: formData.provider_npi,
        service_type: formData.procedure_description,
        units_requested: formData.units_requested,
        service_start_date: formData.requested_start_date || null,
        service_end_date: formData.service_end_date || null,
        urgency_level: formData.urgency,
        diagnosis_codes: formData.diagnosis_codes.split(',').map(c => c.trim()).filter(c => c),
        procedure_codes: formData.procedure_code ? [formData.procedure_code] : [],
        clinical_indication: formData.clinical_indication,
        // X12 278 Compliant: Authorization expiration and visit management
        authorization_expiration_date: formData.authorization_expiration_date || null,
        visits_authorized: formData.visits_authorized || formData.units_requested || 0,
      };

      if (isEditMode && authorizationId) {
        // Get old values for audit log
        const { data: oldAuth } = await supabase
          .from('authorization_requests' as any)
          .select('*')
          .eq('id', authorizationId)
          .single();

        // Update existing authorization
        const { data: updatedAuth, error } = await supabase
          .from('authorization_requests' as any)
          .update({
            ...authData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', authorizationId)
          .select()
          .single();

        if (error) throw error;

        // Log update action
        if (oldAuth && updatedAuth) {
          await authorizationAuditService.logUpdate(
            authorizationId,
            oldAuth,
            updatedAuth,
            'Authorization updated via form'
          );
        }

        toast({
          title: "Authorization Updated",
          description: "Authorization request has been updated successfully."
        });
      } else {
        // Create new authorization
        authData.status = 'draft';
        
        const { data: newAuth, error } = await supabase
          .from('authorization_requests' as any)
          .insert(authData)
          .select()
          .single();

        if (error) throw error;

        // Log creation action
        if (newAuth) {
          const authRecord = newAuth as any;
          await authorizationAuditService.logCreate(
            authRecord.id,
            {
              patient_name: authData.patient_name,
              payer_name: authData.payer_name_custom,
              service_type: authData.service_type,
              procedure_codes: authData.procedure_codes,
            },
            'Authorization created via form'
          );
        }

        toast({
          title: "Authorization Created",
          description: "Prior authorization request has been created successfully."
        });
      }

      onSuccess();
      onOpenChange(false);
      resetForm();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Authorization Request' : 'New Prior Authorization Request'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update the authorization request details below. Changes to expiration date and visits will affect tracking and alerts.'
              : 'Complete the form below to submit a new prior authorization request. Set expiration date and visit limits for proper tracking.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Patient Information</h3>
              <div>
                <Label htmlFor="patient_search">Search and Select Patient *</Label>
                <div className="relative">
                  <Input
                    id="patient_search"
                    placeholder={selectedPatientId ? "Patient selected - click to change" : "Type patient name or ID to auto-fill..."}
                    value={patientSearchTerm}
                    onChange={(e) => handlePatientSearchChange(e.target.value)}
                    onFocus={() => {
                      // If patient is selected and user clicks to search again, clear selection
                      if (selectedPatientId) {
                        setSelectedPatientId(null);
                        setFilteredPatients([]);
                      }
                    }}
                    className={`mb-2 ${selectedPatientId ? "bg-green-50 border-green-300" : ""}`}
                  />
                  {selectedPatientId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedPatientId(null);
                        setPatientSearchTerm("");
                        setFilteredPatients([]);
                        setFormData(prev => ({
                          ...prev,
                          patient_name: "",
                          patient_dob: "",
                          patient_member_id: "",
                        }));
                      }}
                    >
                      Change
                    </Button>
                  )}
                {patientSearchTerm && !selectedPatientId && filteredPatients.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isSearchingPatients ? (
                      <div className="p-2 text-sm text-gray-500">Searching...</div>
                    ) : (
                      filteredPatients.map(patient => (
                        <div
                          key={patient.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🖱️ Patient clicked:', patient);
                            handlePatientSelect(patient);
                          }}
                          onMouseDown={(e) => {
                            // Prevent input from losing focus
                            e.preventDefault();
                          }}
                        >
                          <div className="font-medium">{patient.patient_name}</div>
                          <div className="text-sm text-gray-500">ID: {patient.patient_id}</div>
                          {patient.dob && (
                            <div className="text-xs text-gray-400">DOB: {patient.dob}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
                {patientSearchTerm && !selectedPatientId && !isSearchingPatients && filteredPatients.length === 0 && patientSearchTerm.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                    <div className="p-2 text-sm text-gray-500">No patients found</div>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient_name">Patient Name *</Label>
                <Input
                  id="patient_name"
                  value={formData.patient_name}
                  onChange={(e) => {
                    setFormData({ ...formData, patient_name: e.target.value });
                    setPatientSearchTerm(e.target.value);
                  }}
                  required
                  placeholder="Auto-filled from search above"
                  className={formData.patient_name ? "bg-blue-50" : ""}
                />
              </div>
              <div>
                <Label htmlFor="patient_dob">Date of Birth *</Label>
                <Input
                  id="patient_dob"
                  type="date"
                  value={formData.patient_dob}
                  onChange={(e) => setFormData({ ...formData, patient_dob: e.target.value })}
                  required
                  className={formData.patient_dob ? "bg-blue-50" : ""}
                />
              </div>
              <div>
                <Label htmlFor="patient_member_id">Member ID *</Label>
                <Input
                  id="patient_member_id"
                  value={formData.patient_member_id}
                  onChange={(e) => setFormData({ ...formData, patient_member_id: e.target.value })}
                  required
                  placeholder="Auto-filled from patient selection"
                  className={formData.patient_member_id ? "bg-blue-50" : ""}
                />
              </div>
            </div>
          </div>

          {/* Provider Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Provider Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="provider_id">Select Provider *</Label>
                <Select
                  value={formData.provider_id}
                  onValueChange={(value) => {
                    const provider = providers.find(p => p.id === value);
                    setFormData({ 
                      ...formData, 
                      provider_id: value,
                      requesting_physician: provider ? `${provider.first_name || ''} ${provider.last_name || ''}`.trim() : '',
                      provider_npi: provider?.npi || ''
                    });
                  }}
                  disabled={isLoadingProviders}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingProviders ? "Loading providers..." : "Select provider"} />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.length === 0 && !isLoadingProviders ? (
                      <SelectItem value="none" disabled>No providers found. Please add providers in Customer Setup.</SelectItem>
                    ) : (
                      providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.first_name} {provider.last_name} {provider.credentials ? `, ${provider.credentials}` : ''} {provider.npi ? `(NPI: ${provider.npi})` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="provider_npi">Provider NPI *</Label>
                <Input
                  id="provider_npi"
                  value={formData.provider_npi}
                  onChange={(e) => setFormData({ ...formData, provider_npi: e.target.value })}
                  required
                  placeholder="Auto-filled from provider selection"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="requesting_physician">Requesting Physician Name *</Label>
              <Input
                id="requesting_physician"
                value={formData.requesting_physician}
                onChange={(e) => setFormData({ ...formData, requesting_physician: e.target.value })}
                required
                placeholder="Auto-filled from provider selection"
              />
            </div>
          </div>

          {/* Payer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Insurance Payer</h3>
            <div>
              <Label htmlFor="payer_id">Select Payer *</Label>
              <Select
                value={formData.payer_id}
                onValueChange={(value) => {
                  const payer = payers.find(p => p.id === value);
                  setFormData({ 
                    ...formData, 
                    payer_id: value,
                    payer_name: payer?.name || ''
                  });
                }}
                disabled={isLoadingPayers}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingPayers ? "Loading payers..." : "Select insurance payer"} />
                </SelectTrigger>
                <SelectContent>
                  {payers.length === 0 && !isLoadingPayers ? (
                    <SelectItem value="none" disabled>No payers found. Please add payers in Customer Setup.</SelectItem>
                  ) : (
                    payers.map((payer) => (
                    <SelectItem key={payer.id} value={payer.id}>
                        {payer.name} {payer.plan_name ? `- ${payer.plan_name}` : ''}
                    </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clinical Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Clinical Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="procedure_code">Procedure Code (CPT) *</Label>
                <Input
                  id="procedure_code"
                  placeholder="e.g., 99213"
                  value={formData.procedure_code}
                  onChange={(e) => setFormData({ ...formData, procedure_code: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="diagnosis_codes">Diagnosis Codes (ICD-10) *</Label>
                <Input
                  id="diagnosis_codes"
                  placeholder="e.g., M54.5, M51.2"
                  value={formData.diagnosis_codes}
                  onChange={(e) => setFormData({ ...formData, diagnosis_codes: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="procedure_description">Procedure Description *</Label>
              <Input
                id="procedure_description"
                value={formData.procedure_description}
                onChange={(e) => setFormData({ ...formData, procedure_description: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="clinical_indication">Clinical Indication / Medical Necessity *</Label>
              <Textarea
                id="clinical_indication"
                rows={4}
                value={formData.clinical_indication}
                onChange={(e) => setFormData({ ...formData, clinical_indication: e.target.value })}
                placeholder="Provide detailed clinical justification for the requested procedure..."
                required
              />
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Service Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="urgency">Urgency Level *</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="expedited">Expedited</SelectItem>
                    <SelectItem value="stat">STAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="units_requested">Units Requested *</Label>
                <Input
                  id="units_requested"
                  type="number"
                  min="1"
                  value={formData.units_requested}
                  onChange={(e) => setFormData({ ...formData, units_requested: parseInt(e.target.value) || 1 })}
                  required
                  className="h-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requested_start_date">Service Start Date *</Label>
                <Input
                  id="requested_start_date"
                  type="date"
                  value={formData.requested_start_date}
                  onChange={(e) => setFormData({ ...formData, requested_start_date: e.target.value })}
                  required
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="service_end_date">Service End Date</Label>
                <Input
                  id="service_end_date"
                  type="date"
                  value={formData.service_end_date}
                  onChange={(e) => setFormData({ ...formData, service_end_date: e.target.value })}
                  min={formData.requested_start_date || undefined}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Authorization Expiration & Visit Management (X12 278 Compliant) */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Expiration & Visit Limits</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Set expiration date and visit limits for tracking and compliance</p>
              </div>
              <Badge variant="outline" className="text-xs">X12 278</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="authorization_expiration_date" className="text-sm font-medium">
                    Expiration Date *
                  </Label>
                  {formData.service_end_date && !formData.authorization_expiration_date && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => setFormData({ ...formData, authorization_expiration_date: formData.service_end_date })}
                    >
                      Use End Date
                    </Button>
                  )}
                </div>
                <Input
                  id="authorization_expiration_date"
                  type="date"
                  value={formData.authorization_expiration_date}
                  onChange={(e) => setFormData({ ...formData, authorization_expiration_date: e.target.value })}
                  min={formData.requested_start_date || undefined}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Alerts at 90, 60, 30, 14, and 7 days before expiration
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="visits_authorized" className="text-sm font-medium">
                    Visits Authorized *
                  </Label>
                  {formData.units_requested > 0 && formData.visits_authorized === 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => setFormData({ ...formData, visits_authorized: formData.units_requested })}
                    >
                      Use Units ({formData.units_requested})
                    </Button>
                  )}
                </div>
                <Input
                  id="visits_authorized"
                  type="number"
                  min="1"
                  value={formData.visits_authorized || ''}
                  onChange={(e) => setFormData({ ...formData, visits_authorized: parseInt(e.target.value) || 0 })}
                  placeholder="Enter number of visits"
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum visits allowed. System tracks usage automatically
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditMode ? 'Update Authorization' : 'Create Authorization'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthorizationRequestDialog;