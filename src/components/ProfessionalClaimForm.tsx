import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Save, 
  X, 
  Printer, 
  CheckCircle, 
  MoreVertical,
  Search,
  User,
  Building,
  CreditCard,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  AlertTriangle,
  Calculator,
  FileText,
  Activity,
  Bell,
  CheckSquare,
  Folder,
  DollarSign,
  Plus,
  ExternalLink,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ProfessionalClaimFormProps {
  isOpen: boolean;
  patientId?: string;
  claimType: 'professional' | 'institutional';
  onClose: () => void;
}

export function ProfessionalClaimForm({ isOpen, patientId, claimType, onClose }: ProfessionalClaimFormProps) {
  const { toast } = useToast();
  const { currentCompany } = useAuth();
  const [activeTab, setActiveTab] = useState('claim');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data lists from database
  const [patients, setPatients] = useState<Array<{ id: string; name: string; patientId?: string }>>([]);
  const [providers, setProviders] = useState<Array<{ id: string; name: string; npi?: string }>>([]);
  const [facilities, setFacilities] = useState<Array<{ id: string; name: string }>>([]);
  const [payers, setPayers] = useState<Array<{ id: string; name: string }>>([]);
  
  // Search states
  const [patientSearch, setPatientSearch] = useState('');
  const [providerSearch, setProviderSearch] = useState('');
  const [facilitySearch, setFacilitySearch] = useState('');
  const [payerSearch, setPayerSearch] = useState('');
  
  // Selected IDs (for database relationships)
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedRenderingProviderId, setSelectedRenderingProviderId] = useState<string>('');
  const [selectedBillingProviderId, setSelectedBillingProviderId] = useState<string>('');
  const [selectedSupervisingProviderId, setSelectedSupervisingProviderId] = useState<string>('');
  const [selectedOrderingProviderId, setSelectedOrderingProviderId] = useState<string>('');
  const [selectedReferringProviderId, setSelectedReferringProviderId] = useState<string>('');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [selectedPrimaryInsuranceId, setSelectedPrimaryInsuranceId] = useState<string>('');
  const [selectedSecondaryInsuranceId, setSelectedSecondaryInsuranceId] = useState<string>('');
  const [selectedTertiaryInsuranceId, setSelectedTertiaryInsuranceId] = useState<string>('');
  
  const isFetchingRef = useRef(false);
  
  const [formData, setFormData] = useState({
    claimNumber: 'New',
    referenceNumber: '',
    frequency: '1 - Original Claim',
    patient: '',
    renderingProvider: '',
    billingProvider: '',
    supervisingProvider: '',
    orderingProvider: '',
    referringProvider: '',
    facility: '',
    officeLocation: '',
    primaryInsurance: '',
    secondaryInsurance: '',
    tertiaryInsurance: '',
    dateOfService: '',
  });
  const [paymentData, setPaymentData] = useState({
    currentBalance: '0.00',
    newBalance: '0.00',
    copayDue: '0.00',
    paymentApplication: 'post-new-payment',
    paymentAmount: '',
    sendReceipt: false,
    receivedDate: '',
    depositDate: '',
    checkNumber: '',
    paymentType: 'copay',
    paymentSource: 'check',
    otherSource: '',
    memo: 'PATIENT COPAY - CHECK',
  });

  // ICD Codes state
  const [icdCodes, setIcdCodes] = useState({
    icdA: '',
    icdB: '',
    icdC: '',
    icdD: '',
    icdE: '',
    icdF: '',
    icdG: '',
    icdH: '',
    icdI: '',
    icdJ: '',
    icdK: '',
    icdL: '',
  });

  // Charge Options state
  const [chargeOptions, setChargeOptions] = useState({
    updatePatientDefaults: false,
    createChargePanel: false,
    setAllChargesTo: 'NO CHANGE',
  });

  // Charges state
  const [charges, setCharges] = useState<Array<{
    id: string;
    from: string;
    to: string;
    procedure: string;
    pos: string;
    tos: string;
    mod1: string;
    mod2: string;
    mod3: string;
    mod4: string;
    dxPointers: string;
    unitPrice: string;
    units: string;
    amount: string;
    status: string;
    other: string;
    delete: boolean;
  }>>([
    {
      id: '1',
      from: '',
      to: '',
      procedure: '',
      pos: '',
      tos: '',
      mod1: '',
      mod2: '',
      mod3: '',
      mod4: '',
      dxPointers: '',
      unitPrice: '0.00',
      units: '1.00',
      amount: '0.00',
      status: 'BALANCE DUE PATIENT',
      other: 'Other',
      delete: false,
    }
  ]);

  // Additional Info state
  const [additionalInfo, setAdditionalInfo] = useState({
    showAdditionalInfo: 'none', // 'none', 'ansi', 'cms1500'
    patientCondition: {
      employment: 'no',
      autoAccident: 'no',
      otherAccident: 'no',
    },
    dates: {
      accidentIllnessDate: '',
      lastMenstrualPeriod: '',
      initialTreatmentDate: '',
      dateLastSeen: '',
      unableToWorkFrom: '',
      unableToWorkTo: '',
    },
    isHomebound: 'no',
    claimInformation: {
      claimCodes: '',
      otherClaimId: '',
      additionalClaimInformation: '',
      claimNote: '',
      resubmitReasonCode: '',
      delayReasonCode: 'None',
      hospitalizedFromDate: '',
      hospitalizedToDate: '',
      labCharges: '0.00',
      specialProgramCode: '',
    },
    assignmentOfBenefits: {
      patientSignatureOnFile: 'Yes',
      insuredSignatureOnFile: 'Yes',
      providerAcceptAssignment: 'Default',
    },
    otherReferenceInfo: {
      documentationMethod: 'No Documentation',
      documentationType: '',
      patientHeight: '0',
      patientWeight: '0',
      serviceAuthorizationException: '',
      demonstrationProject: '',
      mammographyCertification: '',
      investigationalDeviceExemption: '',
      ambulatoryPatientGroup: '',
    },
    ambulanceInfo: {
      ambulanceClaim: 'no',
      transportReason: '',
      transportMiles: '0.00',
      patientWeight: '0',
      roundTripReason: '',
      stretcherReason: '',
      pickupAddress: {
        address: '',
        city: '',
        state: '',
        zipCode: '',
        internationalAddress: false,
      },
      dropoffAddress: {
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
      },
      certificationFields: {
        admittedToHospital: false,
        movedByStretcher: false,
        unconsciousOrShock: false,
        emergencyTransport: false,
        physicallyRestrained: false,
        visibleHemorrhaging: false,
        medicallyNecessary: false,
        confinedToBedOrChair: false,
      },
    },
  });

  // Fetch data from database on mount
  useEffect(() => {
    if (isOpen) {
      fetchPatients();
      fetchProviders();
      fetchFacilities();
      fetchPayers();
      
      // If patientId is provided, load patient data
      if (patientId) {
        loadPatientData(patientId);
      }
    }
  }, [isOpen, patientId]);

  // Fetch patients
  const fetchPatients = async () => {
    if (isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      const { data, error } = await supabase
        .from('patients' as any)
        .select('id, patient_id, first_name, last_name')
        .order('last_name', { ascending: true })
        .limit(500);

      if (error) {
        console.error('Error fetching patients:', error);
        toast({
          title: 'Error loading patients',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      const transformedPatients = (data || []).map((p: any) => ({
        id: p.id,
        name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || `Patient ${p.patient_id || p.id}`,
        patientId: p.patient_id,
      }));

      setPatients(transformedPatients);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      toast({
        title: 'Error loading patients',
        description: error.message || 'Failed to load patients',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Fetch providers
  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers' as any)
        .select('id, first_name, last_name, npi')
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
        npi: p.npi || '',
      }));

      setProviders(transformedProviders);
    } catch (error: any) {
      console.error('Error fetching providers:', error);
      toast({
        title: 'Error loading providers',
        description: error.message || 'Failed to load providers',
        variant: 'destructive',
      });
    }
  };

  // Fetch facilities
  const fetchFacilities = async () => {
    try {
      const { data, error } = await supabase
        .from('facilities' as any)
        .select('id, name, facility_name')
        .or('status.eq.active,is_active.eq.true')
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
      }));

      setFacilities(transformedFacilities);
    } catch (error: any) {
      console.error('Error fetching facilities:', error);
      toast({
        title: 'Error loading facilities',
        description: error.message || 'Failed to load facilities',
        variant: 'destructive',
      });
    }
  };

  // Fetch payers
  const fetchPayers = async () => {
    try {
      const { data, error } = await supabase
        .from('insurance_payers' as any)
        .select('id, name')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching payers:', error);
        toast({
          title: 'Error loading insurance payers',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      const transformedPayers = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name || '',
      }));

      setPayers(transformedPayers);
    } catch (error: any) {
      console.error('Error fetching payers:', error);
      toast({
        title: 'Error loading insurance payers',
        description: error.message || 'Failed to load insurance payers',
        variant: 'destructive',
      });
    }
  };

  // Load patient data when patientId is provided
  const loadPatientData = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('patients' as any)
        .select('id, patient_id, first_name, last_name')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error loading patient:', error);
        return;
      }

      const patientData = data as any;
      const patientName = `${patientData.first_name || ''} ${patientData.last_name || ''}`.trim();
      setFormData(prev => ({ ...prev, patient: patientName }));
      setSelectedPatientId(patientData.id);

      // Try to load insurance from patient_insurance table if available
      // The table uses: insurance_company_id (UUID), is_primary (boolean), multiple records
      try {
        console.log('🔍 Loading patient insurance for patient_id:', id);
        let query = supabase
          .from('patient_insurance' as any)
          .select('insurance_company_id, is_primary, member_id, group_number')
          .eq('patient_id', id);
        
        // Add company_id filter if available (for multi-tenant RLS)
        if (currentCompany?.id) {
          query = query.eq('company_id', currentCompany.id);
          console.log('🔍 Filtering by company_id:', currentCompany.id);
        }
        
        const { data: patientInsuranceRecords, error: insuranceError } = await query
          .order('is_primary', { ascending: false }); // Primary first

        if (insuranceError) {
          console.warn('⚠️ Could not load patient insurance (this is optional):', insuranceError.message);
          console.warn('⚠️ Error details:', insuranceError);
        } else {
          console.log('✅ Patient insurance records found:', patientInsuranceRecords?.length || 0);
          if (patientInsuranceRecords && patientInsuranceRecords.length > 0) {
            console.log('📋 Insurance records:', patientInsuranceRecords);
            // Find primary insurance (is_primary = true)
            const primaryInsurance = patientInsuranceRecords.find((record: any) => record.is_primary === true);
            if (primaryInsurance && (primaryInsurance as any).insurance_company_id) {
              console.log('🔍 Loading primary insurance payer:', (primaryInsurance as any).insurance_company_id);
              // Get insurance payer details
              const { data: primaryPayer, error: primaryPayerError } = await supabase
                .from('insurance_payers' as any)
                .select('id, name')
                .eq('id', (primaryInsurance as any).insurance_company_id)
                .single();
              
              if (primaryPayerError) {
                console.warn('⚠️ Could not load primary insurance payer:', primaryPayerError.message);
              } else if (primaryPayer) {
                const payer = primaryPayer as any;
                console.log('✅ Primary insurance loaded:', payer.name);
                setFormData(prev => ({ ...prev, primaryInsurance: payer.name }));
                setSelectedPrimaryInsuranceId(payer.id);
              }
            } else {
              console.log('ℹ️ No primary insurance found for patient');
            }

            // Find secondary insurance (is_primary = false)
            const secondaryInsurance = patientInsuranceRecords.find((record: any) => record.is_primary === false);
            if (secondaryInsurance && (secondaryInsurance as any).insurance_company_id) {
              console.log('🔍 Loading secondary insurance payer:', (secondaryInsurance as any).insurance_company_id);
              // Get insurance payer details
              const { data: secondaryPayer, error: secondaryPayerError } = await supabase
                .from('insurance_payers' as any)
                .select('id, name')
                .eq('id', (secondaryInsurance as any).insurance_company_id)
                .single();
              
              if (secondaryPayerError) {
                console.warn('⚠️ Could not load secondary insurance payer:', secondaryPayerError.message);
              } else if (secondaryPayer) {
                const payer = secondaryPayer as any;
                console.log('✅ Secondary insurance loaded:', payer.name);
                setFormData(prev => ({ ...prev, secondaryInsurance: payer.name }));
                setSelectedSecondaryInsuranceId(payer.id);
              }
            } else {
              console.log('ℹ️ No secondary insurance found for patient');
            }
          } else {
            console.log('ℹ️ No insurance records found for patient');
          }
        }
      } catch (insuranceError) {
        // Patient insurance table might not exist or have different structure
        // Silently fail - insurance can be selected manually
        console.warn('⚠️ Exception loading patient insurance (this is optional):', insuranceError);
      }

      // Step 2: Load eligibility verification data to auto-fill claim form
      // Industry Standard Workflow: When eligibility is verified, auto-populate claim form
      // This is a standard practice in medical billing to save time and ensure accuracy
      await loadEligibilityData(id, formData.dateOfService);
    } catch (error: any) {
      console.error('Error loading patient data:', error);
    }
  };

  // Separate function to load eligibility data (can be called when patient or service date changes)
  const loadEligibilityData = async (patientId: string, serviceDate?: string) => {
    try {
      console.log('🔍 Checking for eligibility verification for patient_id:', patientId, serviceDate ? `service_date: ${serviceDate}` : '');
      
      // Build query for eligibility verification
      // Industry Standard: Match by patient_id and optionally by service date
      // Only use verified eligible records (is_eligible = true)
      let eligibilityQuery = supabase
        .from('eligibility_verifications' as any)
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_eligible', true);

      // If service date is provided, try to match by date for better accuracy
      if (serviceDate) {
        eligibilityQuery = eligibilityQuery.or(`date_of_service.eq.${serviceDate},appointment_date.eq.${serviceDate}`);
      }

      // Add company_id filter for multi-tenant RLS
      if (currentCompany?.id) {
        eligibilityQuery = eligibilityQuery.eq('company_id', currentCompany.id);
      }

      // Get most recent matching verification
      const { data: eligibilityData, error: eligibilityError } = await eligibilityQuery
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (eligibilityError && eligibilityError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (not an error, just no data)
        console.warn('⚠️ Error checking eligibility verification:', eligibilityError.message);
        return;
      }

      if (!eligibilityData) {
        console.log('ℹ️ No eligibility verification found for this patient (this is optional)');
        return;
      }

      const elig = eligibilityData as any;
      console.log('✅ Eligibility verification found! Auto-filling claim form from verification dated:', elig.created_at);
      
      // Show notification to user
      toast({
        title: "Eligibility Data Found",
        description: `Auto-filling claim form from eligibility verification dated ${new Date(elig.created_at).toLocaleDateString()}. You can edit any fields as needed.`,
        duration: 5000,
      });

      // Auto-populate claim form fields from eligibility verification
      // Note: Only populate if field is empty to avoid overwriting user input
      // Patient Information (already loaded, but we can verify)
      if (elig.patient_name && !formData.patient) {
        setFormData(prev => ({ ...prev, patient: elig.patient_name }));
      }

      // Insurance Information - Primary
      if (elig.primary_insurance_id) {
        // Get insurance payer name
        const { data: payer } = await supabase
          .from('insurance_payers' as any)
          .select('id, name')
          .eq('id', elig.primary_insurance_id)
          .single();
        
        if (payer) {
          setFormData(prev => ({ ...prev, primaryInsurance: (payer as any).name }));
          setSelectedPrimaryInsuranceId((payer as any).id);
        }
      } else if (elig.primary_insurance_name) {
        setFormData(prev => ({ ...prev, primaryInsurance: elig.primary_insurance_name }));
      }

      // Insurance Information - Secondary
      if (elig.secondary_insurance_name) {
        setFormData(prev => ({ ...prev, secondaryInsurance: elig.secondary_insurance_name }));
      }

      // Service Date
      if (elig.date_of_service || elig.appointment_date) {
        const serviceDate = elig.date_of_service || elig.appointment_date;
        setFormData(prev => ({ ...prev, dateOfService: serviceDate }));
      }

      // Provider Information
      if (elig.provider_id) {
        const { data: provider } = await supabase
          .from('providers' as any)
          .select('id, first_name, last_name')
          .eq('id', elig.provider_id)
          .single();
        
        if (provider) {
          const providerName = `${(provider as any).first_name || ''} ${(provider as any).last_name || ''}`.trim();
          setFormData(prev => ({ ...prev, renderingProvider: providerName }));
          setSelectedRenderingProviderId((provider as any).id);
        }
      } else if (elig.provider_name) {
        setFormData(prev => ({ ...prev, renderingProvider: elig.provider_name }));
      }

      // Facility Information
      if (elig.facility_id) {
        const { data: facility } = await supabase
          .from('facilities' as any)
          .select('id, name')
          .eq('id', elig.facility_id)
          .single();
        
        if (facility) {
          setFormData(prev => ({ ...prev, facility: (facility as any).name }));
          setSelectedFacilityId((facility as any).id);
        }
      }

      // CPT Codes (Procedures) - if available in eligibility
      if (elig.cpt_codes && Array.isArray(elig.cpt_codes) && elig.cpt_codes.length > 0) {
        const cptCodes = elig.cpt_codes as any[];
        const mappedCharges = cptCodes.map((cpt, index) => ({
          id: String(index + 1),
          from: elig.date_of_service || elig.appointment_date || formData.dateOfService || '',
          to: elig.date_of_service || elig.appointment_date || formData.dateOfService || '',
          procedure: cpt.code || '',
          pos: cpt.pos || '',
          tos: cpt.tos || '',
          mod1: cpt.modifier1 || '',
          mod2: cpt.modifier2 || '',
          mod3: cpt.modifier3 || '',
          mod4: '',
          dxPointers: '1', // Default to first diagnosis
          unitPrice: cpt.charge ? parseFloat(cpt.charge).toFixed(2) : '0.00',
          units: cpt.units || '1.00',
          amount: cpt.charge ? parseFloat(cpt.charge).toFixed(2) : '0.00',
          status: 'BALANCE DUE PATIENT',
          other: 'Other',
          delete: false,
        }));
        
        if (mappedCharges.length > 0) {
          setCharges(mappedCharges);
          console.log('✅ Auto-filled', mappedCharges.length, 'CPT codes from eligibility verification');
        }
      }

      // ICD Codes (Diagnoses) - if available in eligibility
      if (elig.icd_codes && Array.isArray(elig.icd_codes) && elig.icd_codes.length > 0) {
        const icdCodes = elig.icd_codes as any[];
        // Map to ICD code fields (icdA, icdB, etc.)
        const icdMapping: Record<string, string> = {
          'icdA': '',
          'icdB': '',
          'icdC': '',
          'icdD': '',
          'icdE': '',
          'icdF': '',
          'icdG': '',
          'icdH': '',
          'icdI': '',
          'icdJ': '',
          'icdK': '',
          'icdL': '',
        };
        
        const icdFields = Object.keys(icdMapping);
        icdCodes.forEach((icd, index) => {
          if (index < icdFields.length && icd.code) {
            icdMapping[icdFields[index]] = icd.code;
          }
        });
        
        setIcdCodes(prev => ({ ...prev, ...icdMapping }));
        console.log('✅ Auto-filled', icdCodes.length, 'ICD codes from eligibility verification');
      }

      // Prior Authorization
      if (elig.prior_auth_number) {
        setAdditionalInfo(prev => ({
          ...prev,
          claimInformation: {
            ...prev.claimInformation,
            otherClaimId: elig.prior_auth_number,
          }
        }));
      }

      console.log('✅ Claim form auto-filled from eligibility verification');
    } catch (eligibilityError) {
      // Eligibility lookup failed - this is optional, not critical
      console.log('ℹ️ Could not load eligibility verification (this is optional):', eligibilityError);
    }
  };

  // Reload eligibility data when service date changes (if patient is already selected)
  useEffect(() => {
    if (selectedPatientId && formData.dateOfService) {
      // Debounce to avoid too many queries
      const timer = setTimeout(() => {
        console.log('🔄 Service date changed, checking for matching eligibility verification...');
        loadEligibilityData(selectedPatientId, formData.dateOfService);
      }, 500); // Wait 500ms after user stops typing

      return () => clearTimeout(timer);
    }
  }, [formData.dateOfService, selectedPatientId]);

  // Handle patient selection
  const handlePatientSelect = (patientId: string, patientName: string) => {
    setFormData(prev => ({ ...prev, patient: patientName }));
    setSelectedPatientId(patientId);
    loadPatientData(patientId);
  };

  // Handle provider selection
  const handleProviderSelect = (providerId: string, providerName: string, type: 'rendering' | 'billing' | 'supervising' | 'ordering' | 'referring') => {
    setFormData(prev => ({ ...prev, [type === 'rendering' ? 'renderingProvider' : type === 'billing' ? 'billingProvider' : type === 'supervising' ? 'supervisingProvider' : type === 'ordering' ? 'orderingProvider' : 'referringProvider']: providerName }));
    
    if (type === 'rendering') setSelectedRenderingProviderId(providerId);
    else if (type === 'billing') setSelectedBillingProviderId(providerId);
    else if (type === 'supervising') setSelectedSupervisingProviderId(providerId);
    else if (type === 'ordering') setSelectedOrderingProviderId(providerId);
    else if (type === 'referring') setSelectedReferringProviderId(providerId);
  };

  // Handle facility selection
  const handleFacilitySelect = (facilityId: string, facilityName: string) => {
    setFormData(prev => ({ ...prev, facility: facilityName }));
    setSelectedFacilityId(facilityId);
  };

  // Handle payer selection
  const handlePayerSelect = (payerId: string, payerName: string, type: 'primary' | 'secondary' | 'tertiary') => {
    setFormData(prev => ({ ...prev, [type === 'primary' ? 'primaryInsurance' : type === 'secondary' ? 'secondaryInsurance' : 'tertiaryInsurance']: payerName }));
    
    if (type === 'primary') setSelectedPrimaryInsuranceId(payerId);
    else if (type === 'secondary') setSelectedSecondaryInsuranceId(payerId);
    else if (type === 'tertiary') setSelectedTertiaryInsuranceId(payerId);
  };

  // Save claim to database
  const handleSave = async () => {
    if (!selectedPatientId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a patient',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedRenderingProviderId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a rendering provider',
        variant: 'destructive',
      });
      return;
    }

    if (charges.filter(c => !c.delete).length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one charge',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to save claims',
          variant: 'destructive',
        });
        return;
      }

      // Calculate total charges
      const totalCharges = charges
        .filter(c => !c.delete)
        .reduce((sum, charge) => sum + parseFloat(charge.amount || '0'), 0);

      // Generate claim number if needed
      let claimNumber = formData.claimNumber;
      if (claimNumber === 'New' || !claimNumber) {
        const timestamp = Date.now();
        claimNumber = `CLM-${timestamp.toString().slice(-8)}`;
      }

      // Prepare all additional data as JSONB
      const additionalData = {
        // Form data
        formData: {
          referenceNumber: formData.referenceNumber,
          frequency: formData.frequency,
          officeLocation: formData.officeLocation,
          dateOfService: formData.dateOfService,
          billingProviderId: selectedBillingProviderId || null,
          supervisingProviderId: selectedSupervisingProviderId || null,
          orderingProviderId: selectedOrderingProviderId || null,
          referringProviderId: selectedReferringProviderId || null,
          tertiaryInsuranceId: selectedTertiaryInsuranceId || null,
        },
        // Additional Info
        additionalInfo: {
          showAdditionalInfo: additionalInfo.showAdditionalInfo,
          patientCondition: additionalInfo.patientCondition,
          dates: additionalInfo.dates,
          isHomebound: additionalInfo.isHomebound,
          claimInformation: additionalInfo.claimInformation,
          assignmentOfBenefits: additionalInfo.assignmentOfBenefits,
          otherReferenceInfo: additionalInfo.otherReferenceInfo,
          ambulanceInfo: additionalInfo.ambulanceInfo,
        },
        // Charge Options (from right sidebar)
        chargeOptions: chargeOptions,
        // Payment Data (from right sidebar)
        paymentData: paymentData,
      };

      // Determine table names based on claim type
      const claimTable = claimType === 'professional' ? 'professional_claims' : 'institutional_claims';
      const proceduresTable = claimType === 'professional' ? 'professional_claim_procedures' : 'institutional_claim_procedures';
      const diagnosesTable = claimType === 'professional' ? 'professional_claim_diagnoses' : 'institutional_claim_diagnoses';
      const additionalDataTable = claimType === 'professional' ? 'professional_claim_additional_data' : 'institutional_claim_additional_data';

      // Insert main claim record
      const claimInsertData: any = {
        user_id: session.user.id,
        company_id: currentCompany?.id || null,
        claim_number: claimNumber,
        form_type: claimType === 'professional' ? 'HCFA' : 'UB04',
        cms_form_version: '02-12',
        reference_number: formData.referenceNumber || null,
        frequency: formData.frequency || '1 - Original Claim',
        office_location: formData.officeLocation || null,
        date_of_service: formData.dateOfService || null,
        patient_id: selectedPatientId,
        provider_id: selectedRenderingProviderId,
        facility_id: selectedFacilityId || null,
        primary_insurance_id: selectedPrimaryInsuranceId || null,
        secondary_insurance_id: selectedSecondaryInsuranceId || null,
        tertiary_insurance_id: selectedTertiaryInsuranceId || null,
        service_date_from: charges[0]?.from || new Date().toISOString().split('T')[0],
        service_date_to: charges[charges.length - 1]?.to || new Date().toISOString().split('T')[0],
        total_charges: totalCharges,
        status: 'draft',
        notes: additionalInfo.claimInformation.claimNote || null,
      };

      // Add provider fields for professional claims only
      if (claimType === 'professional') {
        claimInsertData.billing_provider_id = selectedBillingProviderId || null;
        claimInsertData.supervising_provider_id = selectedSupervisingProviderId || null;
        claimInsertData.ordering_provider_id = selectedOrderingProviderId || null;
        claimInsertData.referring_provider_id = selectedReferringProviderId || null;
      }

      let finalClaim: any = null;
      let claimRetry: any = null;

      // Try to insert with additional_data first
      const { data: claim, error: claimError } = await supabase
        .from(claimTable as any)
        .insert({
          ...claimInsertData,
          additional_data: additionalData,
        })
        .select()
        .single();

      if (claimError) {
        // If additional_data column doesn't exist, retry without it
        if (claimError.message?.includes('additional_data') || claimError.message?.includes('column')) {
          const { data: retryData, error: claimRetryError } = await supabase
            .from(claimTable as any)
            .insert(claimInsertData)
            .select()
            .single();

          if (claimRetryError || !retryData) {
            throw claimRetryError || new Error('Failed to create claim record');
          }

          claimRetry = retryData;
          const retryClaimData = retryData as any;

          // Store additional data in a separate table
          try {
            await supabase
              .from(additionalDataTable as any)
              .insert({
                claim_id: retryClaimData?.id,
                form_data: additionalData.formData,
                additional_info: additionalData.additionalInfo,
                charge_options: additionalData.chargeOptions,
                payment_data: additionalData.paymentData,
              });
          } catch (additionalDataError) {
            // If table doesn't exist, update notes with JSON
            if (retryClaimData?.id) {
              await supabase
                .from(claimTable as any)
                .update({
                  notes: JSON.stringify({
                    claimNote: additionalInfo.claimInformation.claimNote,
                    additionalData: additionalData
                  })
                })
                .eq('id', retryClaimData.id);
            }
          }
        } else {
          throw claimError;
        }
      } else {
        // If claim was inserted successfully with additional_data, try to also save to additional_data table
        try {
          await supabase
            .from(additionalDataTable as any)
            .insert({
              claim_id: (claim as any)?.id,
              form_data: additionalData.formData,
              additional_info: additionalData.additionalInfo,
              charge_options: additionalData.chargeOptions,
              payment_data: additionalData.paymentData,
            });
        } catch (additionalDataError) {
          // Ignore if it already exists or table doesn't exist
          console.log('Additional data table insert skipped:', additionalDataError);
        }
      }

      finalClaim = claim || claimRetry;

      if (!finalClaim) {
        throw new Error('Failed to create claim record');
      }

      // Insert ICD codes (diagnoses)
      const diagnoses = Object.values(icdCodes)
        .filter(code => code && code.trim() !== '')
        .map((code, index) => ({
          claim_id: (finalClaim as any).id,
          icd_code: code,
          is_primary: index === 0,
          ...(claimType === 'institutional' ? { diagnosis_type: index === 0 ? 'principal' : 'other' } : {}),
        }));

      if (diagnoses.length > 0) {
        const { error: diagnosesError } = await supabase
          .from(diagnosesTable as any)
          .insert(diagnoses);

        if (diagnosesError) {
          console.error('Error inserting diagnoses:', diagnosesError);
        }
      }

      // Insert procedures (charges) with all details
      const procedures = charges
        .filter(c => !c.delete && c.procedure)
        .map(charge => {
          const baseProcedure: any = {
            claim_id: (finalClaim as any).id,
            quantity: parseFloat(charge.units || '1'),
            unit_price: parseFloat(charge.unitPrice || '0'),
            total_price: parseFloat(charge.amount || '0'),
            service_date_from: charge.from || null,
            service_date_to: charge.to || null,
            place_of_service_code: charge.pos || null,
            diagnosis_pointers: charge.dxPointers || null,
            status: charge.status || null,
            other: charge.other || null,
          };

          // Professional claims use CPT codes and modifiers
          if (claimType === 'professional') {
            baseProcedure.cpt_code = charge.procedure;
            baseProcedure.modifier_1 = charge.mod1 || null;
            baseProcedure.modifier_2 = charge.mod2 || null;
            baseProcedure.modifier_3 = charge.mod3 || null;
            baseProcedure.modifier_4 = charge.mod4 || null;
            baseProcedure.type_of_service = charge.tos || null;
          } else {
            // Institutional claims use revenue codes and HCPCS codes
            baseProcedure.revenue_code = charge.procedure; // Assuming procedure field contains revenue code
            baseProcedure.hcpcs_code = charge.procedure; // Or separate field if available
          }

          return baseProcedure;
        });

      if (procedures.length > 0) {
        const { error: proceduresError } = await supabase
          .from(proceduresTable as any)
          .insert(procedures);

        if (proceduresError) {
          console.error('Error inserting procedures:', proceduresError);
          // If some columns don't exist, try with minimal data
          const minimalProcedures = charges
            .filter(c => !c.delete && c.procedure)
            .map(charge => {
              const minimal: any = {
                claim_id: (finalClaim as any).id,
                quantity: parseFloat(charge.units || '1'),
                unit_price: parseFloat(charge.unitPrice || '0'),
                total_price: parseFloat(charge.amount || '0'),
              };
              
              if (claimType === 'professional') {
                minimal.cpt_code = charge.procedure;
              } else {
                minimal.revenue_code = charge.procedure;
              }
              
              return minimal;
            });
          
          const { error: minimalError } = await supabase
            .from(proceduresTable as any)
            .insert(minimalProcedures);
          
          if (minimalError) {
            console.error('Error inserting minimal procedures:', minimalError);
          }
        }
      }

      toast({
        title: 'Success',
        description: 'Claim saved successfully',
      });

      onClose();
    } catch (error: any) {
      console.error('Error saving claim:', error);
      toast({
        title: 'Error saving claim',
        description: error.message || 'Failed to save claim',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter functions
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    (p.patientId && p.patientId.toLowerCase().includes(patientSearch.toLowerCase()))
  );

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(providerSearch.toLowerCase()) ||
    (p.npi && p.npi.includes(providerSearch))
  );

  const filteredFacilities = facilities.filter(f => 
    f.name.toLowerCase().includes(facilitySearch.toLowerCase())
  );

  const filteredPayers = payers.filter(p => 
    p.name.toLowerCase().includes(payerSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="w-full h-full bg-white text-gray-900 flex flex-col">
        {/* Top Control Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                <Printer className="h-4 w-4 mr-2" />
                Print
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Print Claim</DropdownMenuItem>
              <DropdownMenuItem>Print Preview</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                <CheckCircle className="h-4 w-4 mr-2" />
                Review
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Validate Claim</DropdownMenuItem>
              <DropdownMenuItem>Pre-Submission Review</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                <MoreVertical className="h-4 w-4 mr-2" />
                More
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Duplicate Claim</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Form */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white border border-gray-200 rounded-md mb-4 text-gray-600">
                <TabsTrigger value="claim" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  Claim
                </TabsTrigger>
                <TabsTrigger value="charges" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  Charges
                </TabsTrigger>
                <TabsTrigger value="additional" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  Additional Info
                </TabsTrigger>
                <TabsTrigger value="ambulance" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  Ambulance Info
                </TabsTrigger>
              </TabsList>

              <TabsContent value="claim" className="space-y-3">
                {/* Claim # Section */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1">
                    <Label className="text-gray-700 text-xs mb-1">Claim #</Label>
                    <Input 
                      value={formData.claimNumber}
                      onChange={(e) => setFormData({...formData, claimNumber: e.target.value})}
                      className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                      disabled
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-gray-700 text-xs mb-1">Reference #</Label>
                    <Input 
                      value={formData.referenceNumber}
                      onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
                      className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-gray-700 text-xs mb-1">Frequency</Label>
                    <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 - Original Claim">1 - Original Claim</SelectItem>
                        <SelectItem value="2 - Corrected Claim">2 - Replacement Of Prior Claim</SelectItem>
                        <SelectItem value="3 - Void Claim">3 - Void/Cancel Prior Claim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Claim is incomplete</span>
                </div>

                {/* Patient */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-gray-700 text-xs mb-1">Patient</Label>
                    <Select
                      value={selectedPatientId}
                      onValueChange={(value) => {
                        const patient = patients.find(p => p.id === value);
                        if (patient) handlePatientSelect(value, patient.name);
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 border-l-4 border-l-blue-500 pl-10 h-8 text-xs px-2">
                        <User className="h-4 w-4 absolute left-2 text-gray-500" />
                        <SelectValue placeholder="Search patient..." />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search patients..."
                            value={patientSearch}
                            onChange={(e) => setPatientSearch(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        {filteredPatients.length > 0 ? (
                          filteredPatients.slice(0, 50).map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name} {patient.patientId ? `(${patient.patientId})` : ''}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-xs text-gray-500">No patients found</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 text-xs mb-1">Rendering Provider</Label>
                    <Select
                      value={selectedRenderingProviderId}
                      onValueChange={(value) => {
                        const provider = providers.find(p => p.id === value);
                        if (provider) handleProviderSelect(value, provider.name, 'rendering');
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 border-l-4 border-l-blue-500 pl-10 h-8 text-xs px-2">
                        <User className="h-4 w-4 absolute left-2 text-gray-500" />
                        <SelectValue placeholder="Search provider..." />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search providers..."
                            value={providerSearch}
                            onChange={(e) => setProviderSearch(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        {filteredProviders.length > 0 ? (
                          filteredProviders.slice(0, 50).map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name} {provider.npi ? `(${provider.npi})` : ''}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-xs text-gray-500">No providers found</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 text-xs mb-1">Billing Provider</Label>
                    <Select
                      value={selectedBillingProviderId}
                      onValueChange={(value) => {
                        const provider = providers.find(p => p.id === value);
                        if (provider) handleProviderSelect(value, provider.name, 'billing');
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 border-l-4 border-l-blue-500 pl-10 h-8 text-xs px-2">
                        <User className="h-4 w-4 absolute left-2 text-gray-500" />
                        <SelectValue placeholder="Search provider..." />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search providers..."
                            value={providerSearch}
                            onChange={(e) => setProviderSearch(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        {filteredProviders.length > 0 ? (
                          filteredProviders.slice(0, 50).map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name} {provider.npi ? `(${provider.npi})` : ''}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-xs text-gray-500">No providers found</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Supervising Provider */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-gray-700 text-xs mb-1">Supervising Provider</Label>
                    <Select
                      value={selectedSupervisingProviderId}
                      onValueChange={(value) => {
                        const provider = providers.find(p => p.id === value);
                        if (provider) handleProviderSelect(value, provider.name, 'supervising');
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 pl-10 h-8 text-xs px-2">
                        <User className="h-4 w-4 absolute left-2 text-gray-500" />
                        <SelectValue placeholder="Search provider..." />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search providers..."
                            value={providerSearch}
                            onChange={(e) => setProviderSearch(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        {filteredProviders.slice(0, 50).map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name} {provider.npi ? `(${provider.npi})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 text-xs mb-1">Ordering Provider</Label>
                    <Select
                      value={selectedOrderingProviderId}
                      onValueChange={(value) => {
                        const provider = providers.find(p => p.id === value);
                        if (provider) handleProviderSelect(value, provider.name, 'ordering');
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 pl-10 h-8 text-xs px-2">
                        <User className="h-4 w-4 absolute left-2 text-gray-500" />
                        <SelectValue placeholder="Search provider..." />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search providers..."
                            value={providerSearch}
                            onChange={(e) => setProviderSearch(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        {filteredProviders.slice(0, 50).map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name} {provider.npi ? `(${provider.npi})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 text-xs mb-1">Referring/PCP Provider</Label>
                    <div className="flex gap-2">
                      <Select
                        value={selectedReferringProviderId}
                        onValueChange={(value) => {
                          const provider = providers.find(p => p.id === value);
                          if (provider) handleProviderSelect(value, provider.name, 'referring');
                        }}
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900 pl-10 flex-1 h-8 text-xs px-2">
                          <User className="h-4 w-4 absolute left-2 text-gray-500" />
                          <SelectValue placeholder="Search provider..." />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <Input
                              placeholder="Search providers..."
                              value={providerSearch}
                              onChange={(e) => setProviderSearch(e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                          {filteredProviders.slice(0, 50).map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name} {provider.npi ? `(${provider.npi})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="w-20 bg-white border-gray-300 text-gray-900 h-8 text-xs px-2">
                          <SelectValue placeholder="Ref" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ref">Ref</SelectItem>
                          <SelectItem value="pcp">PCP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Facility */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-gray-700 text-xs mb-1">Facility</Label>
                    <Select
                      value={selectedFacilityId}
                      onValueChange={(value) => {
                        const facility = facilities.find(f => f.id === value);
                        if (facility) handleFacilitySelect(value, facility.name);
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 pl-10 h-8 text-xs px-2">
                        <Building className="h-4 w-4 absolute left-2 text-gray-500" />
                        <SelectValue placeholder="Search facility..." />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search facilities..."
                            value={facilitySearch}
                            onChange={(e) => setFacilitySearch(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        {filteredFacilities.length > 0 ? (
                          filteredFacilities.slice(0, 50).map((facility) => (
                            <SelectItem key={facility.id} value={facility.id}>
                              {facility.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-xs text-gray-500">No facilities found</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 text-xs mb-1">Office Location</Label>
                    <Select>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main Office</SelectItem>
                        <SelectItem value="branch1">Branch Office 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Insurance */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-gray-700 text-xs mb-1">Primary Insurance</Label>
                    <Select
                      value={selectedPrimaryInsuranceId}
                      onValueChange={(value) => {
                        const payer = payers.find(p => p.id === value);
                        if (payer) handlePayerSelect(value, payer.name, 'primary');
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 border-l-4 border-l-blue-500 pl-10 h-8 text-xs px-2">
                        <CreditCard className="h-4 w-4 absolute left-2 text-gray-500" />
                        <SelectValue placeholder="Search insurance..." />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search insurance..."
                            value={payerSearch}
                            onChange={(e) => setPayerSearch(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        {filteredPayers.length > 0 ? (
                          filteredPayers.slice(0, 50).map((payer) => (
                            <SelectItem key={payer.id} value={payer.id}>
                              {payer.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-xs text-gray-500">No insurance found</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 text-xs mb-1">Secondary Insurance</Label>
                    <Select
                      value={selectedSecondaryInsuranceId}
                      onValueChange={(value) => {
                        const payer = payers.find(p => p.id === value);
                        if (payer) handlePayerSelect(value, payer.name, 'secondary');
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 pl-10 h-8 text-xs px-2">
                        <CreditCard className="h-4 w-4 absolute left-2 text-gray-500" />
                        <SelectValue placeholder="Search insurance..." />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search insurance..."
                            value={payerSearch}
                            onChange={(e) => setPayerSearch(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        {filteredPayers.slice(0, 50).map((payer) => (
                          <SelectItem key={payer.id} value={payer.id}>
                            {payer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 text-xs mb-1">Tertiary Insurance</Label>
                    <Select
                      value={selectedTertiaryInsuranceId}
                      onValueChange={(value) => {
                        const payer = payers.find(p => p.id === value);
                        if (payer) handlePayerSelect(value, payer.name, 'tertiary');
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 pl-10 h-8 text-xs px-2">
                        <CreditCard className="h-4 w-4 absolute left-2 text-gray-500" />
                        <SelectValue placeholder="Search insurance..." />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search insurance..."
                            value={payerSearch}
                            onChange={(e) => setPayerSearch(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        {filteredPayers.slice(0, 50).map((payer) => (
                          <SelectItem key={payer.id} value={payer.id}>
                            {payer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="charges" className="space-y-3">
                {/* ICD Codes Section */}
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <Label className="text-gray-700 text-xs font-semibold mb-2 block">ICD Codes</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((letter) => (
                      <div key={letter} className="flex gap-1">
                        <Input
                          value={icdCodes[`icd${letter}` as keyof typeof icdCodes]}
                          onChange={(e) => setIcdCodes({ ...icdCodes, [`icd${letter}`]: e.target.value })}
                          placeholder={`ICD ${letter}`}
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50"
                          onClick={() => {
                            // TODO: Implement ICD code search
                            console.log(`Search ICD ${letter}`);
                          }}
                        >
                          <Search className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Charges Table Section */}
                <div className="bg-white border border-gray-200 rounded-md">
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-700 text-xs font-semibold">
                        {charges.filter(c => !c.delete).length} Charges
                      </Label>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                            <div className="flex items-center gap-1">
                              From
                              <Calendar className="h-3 w-3 text-gray-500" />
                            </div>
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                            <div className="flex items-center gap-1">
                              To
                              <Calendar className="h-3 w-3 text-gray-500" />
                            </div>
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                            <div className="flex items-center gap-1">
                              Procedure
                              <Search className="h-3 w-3 text-gray-500" />
                            </div>
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                            <div className="flex items-center gap-1">
                              POS
                              <Search className="h-3 w-3 text-gray-500" />
                            </div>
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                            <div className="flex items-center gap-1">
                              TOS
                              <Search className="h-3 w-3 text-gray-500" />
                            </div>
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                            <div className="flex items-center gap-1">
                              Mod 1
                              <Search className="h-3 w-3 text-gray-500" />
                            </div>
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                            <div className="flex items-center gap-1">
                              Mod 2
                              <Search className="h-3 w-3 text-gray-500" />
                            </div>
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                            <div className="flex items-center gap-1">
                              Mod 3
                              <Search className="h-3 w-3 text-gray-500" />
                            </div>
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                            <div className="flex items-center gap-1">
                              Mod 4
                              <Search className="h-3 w-3 text-gray-500" />
                            </div>
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                            <div className="flex items-center gap-1">
                              DX Pointers
                              <Search className="h-3 w-3 text-gray-500" />
                            </div>
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                            Unit Price
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                            Units
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                            Amount
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                            Status
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                            Other
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">
                            Delete
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {charges.map((charge, index) => (
                          <tr key={charge.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-2 py-1.5 border-r border-gray-200">
                              <Input
                                type="date"
                                value={charge.from}
                                onChange={(e) => {
                                  const updated = [...charges];
                                  updated[index].from = e.target.value;
                                  setCharges(updated);
                                }}
                                className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 w-20"
                              />
                            </td>
                            <td className="px-2 py-1.5 border-r border-gray-200">
                              <Input
                                type="date"
                                value={charge.to}
                                onChange={(e) => {
                                  const updated = [...charges];
                                  updated[index].to = e.target.value;
                                  setCharges(updated);
                                }}
                                className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 w-20"
                              />
                            </td>
                            <td className="px-2 py-1.5 border-r border-gray-200">
                              <div className="flex gap-1">
                                <Input
                                  value={charge.procedure}
                                  onChange={(e) => {
                                    const updated = [...charges];
                                    updated[index].procedure = e.target.value;
                                    setCharges(updated);
                                  }}
                                  placeholder="Procedure"
                                  className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50"
                                  onClick={() => console.log('Search procedure')}
                                >
                                  <Search className="h-3 w-3 text-gray-500" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-2 py-1.5 border-r border-gray-200">
                              <div className="flex gap-1">
                                <Input
                                  value={charge.pos}
                                  onChange={(e) => {
                                    const updated = [...charges];
                                    updated[index].pos = e.target.value;
                                    setCharges(updated);
                                  }}
                                  placeholder="POS"
                                  className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 w-12"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50"
                                  onClick={() => console.log('Search POS')}
                                >
                                  <Search className="h-3 w-3 text-gray-500" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-2 py-1.5 border-r border-gray-200">
                              <div className="flex gap-1">
                                <Input
                                  value={charge.tos}
                                  onChange={(e) => {
                                    const updated = [...charges];
                                    updated[index].tos = e.target.value;
                                    setCharges(updated);
                                  }}
                                  placeholder="TOS"
                                  className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 w-12"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50"
                                  onClick={() => console.log('Search TOS')}
                                >
                                  <Search className="h-3 w-3 text-gray-500" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-2 py-1.5 border-r border-gray-200">
                              <div className="flex gap-1">
                                <Input
                                  value={charge.mod1}
                                  onChange={(e) => {
                                    const updated = [...charges];
                                    updated[index].mod1 = e.target.value;
                                    setCharges(updated);
                                  }}
                                  placeholder="Mod 1"
                                  className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 w-12"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50"
                                  onClick={() => console.log('Search Mod 1')}
                                >
                                  <Search className="h-3 w-3 text-gray-500" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-2 py-1.5 border-r border-gray-200">
                              <div className="flex gap-1">
                                <Input
                                  value={charge.mod2}
                                  onChange={(e) => {
                                    const updated = [...charges];
                                    updated[index].mod2 = e.target.value;
                                    setCharges(updated);
                                  }}
                                  placeholder="Mod 2"
                                  className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 w-12"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50"
                                  onClick={() => console.log('Search Mod 2')}
                                >
                                  <Search className="h-3 w-3 text-gray-500" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-2 py-1.5 border-r border-gray-200">
                              <div className="flex gap-1">
                                <Input
                                  value={charge.mod3}
                                  onChange={(e) => {
                                    const updated = [...charges];
                                    updated[index].mod3 = e.target.value;
                                    setCharges(updated);
                                  }}
                                  placeholder="Mod 3"
                                  className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 w-12"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50"
                                  onClick={() => console.log('Search Mod 3')}
                                >
                                  <Search className="h-3 w-3 text-gray-500" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-2 py-1.5 border-r border-gray-200">
                              <div className="flex gap-1">
                                <Input
                                  value={charge.mod4}
                                  onChange={(e) => {
                                    const updated = [...charges];
                                    updated[index].mod4 = e.target.value;
                                    setCharges(updated);
                                  }}
                                  placeholder="Mod 4"
                                  className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 w-12"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50"
                                  onClick={() => console.log('Search Mod 4')}
                                >
                                  <Search className="h-3 w-3 text-gray-500" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-2 py-1.5 border-r border-gray-200">
                              <div className="flex gap-1">
                                <Input
                                  value={charge.dxPointers}
                                  onChange={(e) => {
                                    const updated = [...charges];
                                    updated[index].dxPointers = e.target.value;
                                    setCharges(updated);
                                  }}
                                  placeholder="DX"
                                  className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 w-12"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50"
                                  onClick={() => console.log('Search DX Pointers')}
                                >
                                  <Search className="h-3 w-3 text-gray-500" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-2 py-1.5 border-r border-gray-200">
                              <Input
                                type="number"
                                step="0.01"
                                value={charge.unitPrice}
                                onChange={(e) => {
                                  const updated = [...charges];
                                  updated[index].unitPrice = e.target.value;
                                  const unitPrice = parseFloat(e.target.value) || 0;
                                  const units = parseFloat(updated[index].units) || 0;
                                  updated[index].amount = (unitPrice * units).toFixed(2);
                                  setCharges(updated);
                                }}
                                className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 w-16 text-right"
                              />
                            </td>
                            <td className="px-2 py-1.5 border-r border-gray-200">
                              <Input
                                type="number"
                                step="0.01"
                                value={charge.units}
                                onChange={(e) => {
                                  const updated = [...charges];
                                  updated[index].units = e.target.value;
                                  const unitPrice = parseFloat(updated[index].unitPrice) || 0;
                                  const units = parseFloat(e.target.value) || 0;
                                  updated[index].amount = (unitPrice * units).toFixed(2);
                                  setCharges(updated);
                                }}
                                className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 w-16 text-right"
                              />
                            </td>
                            <td className="px-2 py-1.5 border-r border-gray-200">
                              <Input
                                value={charge.amount}
                                readOnly
                                className="bg-gray-50 border-gray-300 text-gray-900 h-8 text-xs px-2 w-16 text-right font-medium"
                              />
                            </td>
                            <td className="px-2 py-1.5 border-r border-gray-200">
                              <Select
                                value={charge.status}
                                onValueChange={(value) => {
                                  const updated = [...charges];
                                  updated[index].status = value;
                                  setCharges(updated);
                                }}
                              >
                                <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="BALANCE DUE PATIENT">BALANCE DUE PATIENT</SelectItem>
                                  <SelectItem value="PAID">PAID</SelectItem>
                                  <SelectItem value="PENDING">PENDING</SelectItem>
                                  <SelectItem value="DENIED">DENIED</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-2 py-1.5 border-r border-gray-200">
                              <Select
                                value={charge.other}
                                onValueChange={(value) => {
                                  const updated = [...charges];
                                  updated[index].other = value;
                                  setCharges(updated);
                                }}
                              >
                                <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Other">Other</SelectItem>
                                  <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex items-center justify-center">
                                <Checkbox
                                  checked={charge.delete}
                                  onCheckedChange={(checked) => {
                                    const updated = [...charges];
                                    updated[index].delete = !!checked;
                                    setCharges(updated);
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-2 border-t border-gray-200 flex items-center gap-2 bg-gray-50">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setCharges([...charges, {
                          id: Date.now().toString(),
                          from: '',
                          to: '',
                          procedure: '',
                          pos: '',
                          tos: '',
                          mod1: '',
                          mod2: '',
                          mod3: '',
                          mod4: '',
                          dxPointers: '',
                          unitPrice: '0.00',
                          units: '1.00',
                          amount: '0.00',
                          status: 'BALANCE DUE PATIENT',
                          other: 'Other',
                          delete: false,
                        }]);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Charge
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-red-600 hover:text-red-700"
                      onClick={() => {
                        setCharges(charges.filter(c => !c.delete));
                      }}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="additional" className="space-y-3">
                {/* Show Additional Information Section */}
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <Label className="text-gray-700 text-xs font-semibold mb-2 block">
                    Show Additional Information about each field
                  </Label>
                  <RadioGroup
                    value={additionalInfo.showAdditionalInfo}
                    onValueChange={(value) => 
                      setAdditionalInfo({ ...additionalInfo, showAdditionalInfo: value })
                    }
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="info-none" />
                        <Label htmlFor="info-none" className="text-xs text-gray-700 cursor-pointer">
                        None
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ansi" id="info-ansi" />
                      <Label htmlFor="info-ansi" className="text-xs text-gray-700 cursor-pointer">
                        ANSI Location (For Electronic Claims)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cms1500" id="info-cms1500" />
                      <Label htmlFor="info-cms1500" className="text-xs text-gray-700 cursor-pointer">
                        CMS 1500 (02-12) Box Numbers (For Printed Claims)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Patient Condition Section */}
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <h3 className="text-gray-900 text-sm font-semibold mb-3">Patient Condition</h3>
                  
                  <div className="space-y-3">
                    <Label className="text-gray-700 text-xs font-medium block mb-2">
                      Is Patient Condition Related to:
                    </Label>
                    
                    {/* Employment */}
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-700 text-xs">Employment</Label>
                      <RadioGroup
                        value={additionalInfo.patientCondition.employment}
                        onValueChange={(value) => 
                          setAdditionalInfo({
                            ...additionalInfo,
                            patientCondition: {
                              ...additionalInfo.patientCondition,
                              employment: value
                            }
                          })
                        }
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="employment-yes" />
                          <Label htmlFor="employment-yes" className="text-xs text-gray-700 cursor-pointer">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="employment-no" />
                          <Label htmlFor="employment-no" className="text-xs text-gray-700 cursor-pointer">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Auto Accident */}
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-700 text-xs">Auto Accident</Label>
                      <RadioGroup
                        value={additionalInfo.patientCondition.autoAccident}
                        onValueChange={(value) => 
                          setAdditionalInfo({
                            ...additionalInfo,
                            patientCondition: {
                              ...additionalInfo.patientCondition,
                              autoAccident: value
                            }
                          })
                        }
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="auto-yes" />
                          <Label htmlFor="auto-yes" className="text-xs text-gray-700 cursor-pointer">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="auto-no" />
                          <Label htmlFor="auto-no" className="text-xs text-gray-700 cursor-pointer">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Other Accident */}
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-700 text-xs">Other Accident</Label>
                      <RadioGroup
                        value={additionalInfo.patientCondition.otherAccident}
                        onValueChange={(value) => 
                          setAdditionalInfo({
                            ...additionalInfo,
                            patientCondition: {
                              ...additionalInfo.patientCondition,
                              otherAccident: value
                            }
                          })
                        }
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="other-yes" />
                          <Label htmlFor="other-yes" className="text-xs text-gray-700 cursor-pointer">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="other-no" />
                          <Label htmlFor="other-no" className="text-xs text-gray-700 cursor-pointer">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                {/* Date Fields Section */}
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <div className="grid grid-cols-3 gap-3">
                    {/* Accident/Illness Date */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Accident/Illness Date</Label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={additionalInfo.dates.accidentIllnessDate}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              dates: {
                                ...additionalInfo.dates,
                                accidentIllnessDate: e.target.value
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500"
                          onClick={() => {
                            // Date picker would open here
                            const input = document.querySelector('input[type="date"]') as HTMLInputElement;
                            input?.showPicker();
                          }}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Last Menstrual Period */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Last Menstrual Period</Label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={additionalInfo.dates.lastMenstrualPeriod}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              dates: {
                                ...additionalInfo.dates,
                                lastMenstrualPeriod: e.target.value
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Initial Treatment Date */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Initial Treatment Date</Label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={additionalInfo.dates.initialTreatmentDate}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              dates: {
                                ...additionalInfo.dates,
                                initialTreatmentDate: e.target.value
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Date Last Seen */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Date Last Seen</Label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={additionalInfo.dates.dateLastSeen}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              dates: {
                                ...additionalInfo.dates,
                                dateLastSeen: e.target.value
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Unable to Work From Date */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Unable to Work From Date</Label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={additionalInfo.dates.unableToWorkFrom}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              dates: {
                                ...additionalInfo.dates,
                                unableToWorkFrom: e.target.value
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Unable to Work To Date */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Unable to Work To Date</Label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={additionalInfo.dates.unableToWorkTo}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              dates: {
                                ...additionalInfo.dates,
                                unableToWorkTo: e.target.value
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient is homebound Section */}
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-700 text-xs font-medium">Patient is homebound?</Label>
                    <RadioGroup
                      value={additionalInfo.isHomebound}
                      onValueChange={(value) => 
                        setAdditionalInfo({ ...additionalInfo, isHomebound: value })
                      }
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="homebound-yes" />
                          <Label htmlFor="homebound-yes" className="text-xs text-gray-700 cursor-pointer">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="homebound-no" />
                        <Label htmlFor="homebound-no" className="text-xs text-gray-700 cursor-pointer">
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Claim Information Section */}
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <h3 className="text-gray-900 text-sm font-semibold mb-3">Claim Information</h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      {/* Claim Codes */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Claim Codes</Label>
                        <Input
                          value={additionalInfo.claimInformation.claimCodes}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              claimInformation: {
                                ...additionalInfo.claimInformation,
                                claimCodes: e.target.value
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                          placeholder="Enter claim codes"
                        />
                      </div>

                      {/* Other Claim ID */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Other Claim ID</Label>
                        <Input
                          value={additionalInfo.claimInformation.otherClaimId}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              claimInformation: {
                                ...additionalInfo.claimInformation,
                                otherClaimId: e.target.value
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                          placeholder="Enter other claim ID"
                        />
                      </div>
                    </div>

                    {/* Additional Claim Information */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Additional Claim Information</Label>
                      <textarea
                        value={additionalInfo.claimInformation.additionalClaimInformation}
                        onChange={(e) => 
                          setAdditionalInfo({
                            ...additionalInfo,
                            claimInformation: {
                              ...additionalInfo.claimInformation,
                              additionalClaimInformation: e.target.value
                            }
                          })
                        }
                        className="w-full bg-white border border-gray-300 text-gray-900 text-xs px-2 py-1.5 rounded-md min-h-[60px] resize-y"
                        placeholder="Enter additional claim information"
                      />
                    </div>

                    {/* Claim Note */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Claim Note</Label>
                      <textarea
                        value={additionalInfo.claimInformation.claimNote}
                        onChange={(e) => 
                          setAdditionalInfo({
                            ...additionalInfo,
                            claimInformation: {
                              ...additionalInfo.claimInformation,
                              claimNote: e.target.value
                            }
                          })
                        }
                        className="w-full bg-white border border-gray-300 text-gray-900 text-xs px-2 py-1.5 rounded-md min-h-[60px] resize-y"
                        placeholder="Enter claim note"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Resubmit Reason Code */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Resubmit Reason Code</Label>
                        <Input
                          value={additionalInfo.claimInformation.resubmitReasonCode}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              claimInformation: {
                                ...additionalInfo.claimInformation,
                                resubmitReasonCode: e.target.value
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                          placeholder="Enter resubmit reason code"
                        />
                      </div>

                      {/* Delay Reason Code */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Delay Reason Code</Label>
                        <Select
                          value={additionalInfo.claimInformation.delayReasonCode}
                          onValueChange={(value) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              claimInformation: {
                                ...additionalInfo.claimInformation,
                                delayReasonCode: value
                              }
                            })
                          }
                        >
                          <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="None">None</SelectItem>
                            <SelectItem value="Authorization">Authorization</SelectItem>
                            <SelectItem value="Documentation">Documentation</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Hospitalized From Date */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Hospitalized From Date</Label>
                        <div className="relative">
                          <Input
                            type="date"
                            value={additionalInfo.claimInformation.hospitalizedFromDate}
                            onChange={(e) => 
                              setAdditionalInfo({
                                ...additionalInfo,
                                claimInformation: {
                                  ...additionalInfo.claimInformation,
                                  hospitalizedFromDate: e.target.value
                                }
                              })
                            }
                            className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500"
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Hospitalized To Date */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Hospitalized To Date</Label>
                        <div className="relative">
                          <Input
                            type="date"
                            value={additionalInfo.claimInformation.hospitalizedToDate}
                            onChange={(e) => 
                              setAdditionalInfo({
                                ...additionalInfo,
                                claimInformation: {
                                  ...additionalInfo.claimInformation,
                                  hospitalizedToDate: e.target.value
                                }
                              })
                            }
                            className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500"
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Lab Charges */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Lab Charges</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={additionalInfo.claimInformation.labCharges}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              claimInformation: {
                                ...additionalInfo.claimInformation,
                                labCharges: e.target.value
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 text-right"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Special Program Code */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Special Program Code</Label>
                        <Select
                          value={additionalInfo.claimInformation.specialProgramCode || undefined}
                          onValueChange={(value) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              claimInformation: {
                                ...additionalInfo.claimInformation,
                                specialProgramCode: value === 'none' ? '' : value
                              }
                            })
                          }
                        >
                          <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2">
                            <SelectValue placeholder="Select program code" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="EPSDT">EPSDT</SelectItem>
                            <SelectItem value="Family Planning">Family Planning</SelectItem>
                            <SelectItem value="Mammography">Mammography</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assignment of Benefits Section */}
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <h3 className="text-gray-900 text-sm font-semibold mb-3">Assignment of Benefits</h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {/* Patient's Signature on File */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Patient's Signature on File</Label>
                      <Select
                        value={additionalInfo.assignmentOfBenefits.patientSignatureOnFile}
                        onValueChange={(value) => 
                          setAdditionalInfo({
                            ...additionalInfo,
                            assignmentOfBenefits: {
                              ...additionalInfo.assignmentOfBenefits,
                              patientSignatureOnFile: value
                            }
                          })
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Insured's Signature on File */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Insured's Signature on File</Label>
                      <Select
                        value={additionalInfo.assignmentOfBenefits.insuredSignatureOnFile}
                        onValueChange={(value) => 
                          setAdditionalInfo({
                            ...additionalInfo,
                            assignmentOfBenefits: {
                              ...additionalInfo.assignmentOfBenefits,
                              insuredSignatureOnFile: value
                            }
                          })
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Provider Accept Assignment */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Provider Accept Assignment</Label>
                      <Select
                        value={additionalInfo.assignmentOfBenefits.providerAcceptAssignment}
                        onValueChange={(value) => 
                          setAdditionalInfo({
                            ...additionalInfo,
                            assignmentOfBenefits: {
                              ...additionalInfo.assignmentOfBenefits,
                              providerAcceptAssignment: value
                            }
                          })
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Default">Default</SelectItem>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Other Reference Information Section */}
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <h3 className="text-gray-900 text-sm font-semibold mb-3">Other Reference Information</h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      {/* Documentation Method */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Documentation Method</Label>
                        <Select
                          value={additionalInfo.otherReferenceInfo.documentationMethod}
                          onValueChange={(value) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              otherReferenceInfo: {
                                ...additionalInfo.otherReferenceInfo,
                                documentationMethod: value
                              }
                            })
                          }
                        >
                          <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="No Documentation">No Documentation</SelectItem>
                            <SelectItem value="Electronic">Electronic</SelectItem>
                            <SelectItem value="Paper">Paper</SelectItem>
                            <SelectItem value="Fax">Fax</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Documentation Type */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Documentation Type</Label>
                        <Select
                          value={additionalInfo.otherReferenceInfo.documentationType || undefined}
                          onValueChange={(value) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              otherReferenceInfo: {
                                ...additionalInfo.otherReferenceInfo,
                                documentationType: value === 'none' ? '' : value
                              }
                            })
                          }
                        >
                          <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2">
                            <SelectValue placeholder="Select documentation type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="Clinical Notes">Clinical Notes</SelectItem>
                            <SelectItem value="Lab Results">Lab Results</SelectItem>
                            <SelectItem value="Imaging">Imaging</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Patient Height */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Patient Height (in.)</Label>
                        <Input
                          type="number"
                          value={additionalInfo.otherReferenceInfo.patientHeight}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              otherReferenceInfo: {
                                ...additionalInfo.otherReferenceInfo,
                                patientHeight: e.target.value
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                          placeholder="0"
                        />
                      </div>

                      {/* Patient Weight */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Patient Weight (lbs.)</Label>
                        <Input
                          type="number"
                          value={additionalInfo.otherReferenceInfo.patientWeight}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              otherReferenceInfo: {
                                ...additionalInfo.otherReferenceInfo,
                                patientWeight: e.target.value
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Service Authorization Exception */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Service Authorization Exception</Label>
                      <Select
                        value={additionalInfo.otherReferenceInfo.serviceAuthorizationException || undefined}
                        onValueChange={(value) => 
                          setAdditionalInfo({
                            ...additionalInfo,
                            otherReferenceInfo: {
                              ...additionalInfo.otherReferenceInfo,
                              serviceAuthorizationException: value === 'none' ? '' : value
                            }
                          })
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2">
                          <SelectValue placeholder="Select authorization exception" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                          <SelectItem value="Urgent">Urgent</SelectItem>
                          <SelectItem value="Retroactive">Retroactive</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Demonstration Project */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Demonstration Project</Label>
                        <Input
                          value={additionalInfo.otherReferenceInfo.demonstrationProject}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              otherReferenceInfo: {
                                ...additionalInfo.otherReferenceInfo,
                                demonstrationProject: e.target.value
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                          placeholder="Enter demonstration project"
                        />
                      </div>

                      {/* Mammography Certification */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Mammography Certification</Label>
                        <Input
                          value={additionalInfo.otherReferenceInfo.mammographyCertification}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              otherReferenceInfo: {
                                ...additionalInfo.otherReferenceInfo,
                                mammographyCertification: e.target.value
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                          placeholder="Enter mammography certification"
                        />
                      </div>

                      {/* Investigational Device Exemption */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Investigational Device Exemption</Label>
                        <Input
                          value={additionalInfo.otherReferenceInfo.investigationalDeviceExemption}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              otherReferenceInfo: {
                                ...additionalInfo.otherReferenceInfo,
                                investigationalDeviceExemption: e.target.value
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                          placeholder="Enter investigational device exemption"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Ambulatory Patient Group */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Ambulatory Patient Group</Label>
                        <Input
                          value={additionalInfo.otherReferenceInfo.ambulatoryPatientGroup}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              otherReferenceInfo: {
                                ...additionalInfo.otherReferenceInfo,
                                ambulatoryPatientGroup: e.target.value
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                          placeholder="Enter ambulatory patient group"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ambulance" className="space-y-3">
                {/* Ambulance Claim Section */}
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-700 text-xs font-medium">Ambulance claim</Label>
                    <RadioGroup
                      value={additionalInfo.ambulanceInfo.ambulanceClaim}
                      onValueChange={(value) => 
                        setAdditionalInfo({
                          ...additionalInfo,
                          ambulanceInfo: {
                            ...additionalInfo.ambulanceInfo,
                            ambulanceClaim: value
                          }
                        })
                      }
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ambulance-yes" />
                        <Label htmlFor="ambulance-yes" className="text-xs text-gray-700 cursor-pointer">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ambulance-no" />
                        <Label htmlFor="ambulance-no" className="text-xs text-gray-700 cursor-pointer">
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Transport Reason and Miles Section */}
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <div className="grid grid-cols-3 gap-3">
                    {/* Transport Reason */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Transport Reason</Label>
                      <Select
                        value={additionalInfo.ambulanceInfo.transportReason || undefined}
                        onValueChange={(value) => 
                          setAdditionalInfo({
                            ...additionalInfo,
                            ambulanceInfo: {
                              ...additionalInfo.ambulanceInfo,
                              transportReason: value === 'none' ? '' : value
                            }
                          })
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2">
                          <SelectValue placeholder="Select transport reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                          <SelectItem value="Non-Emergency">Non-Emergency</SelectItem>
                          <SelectItem value="Transfer">Transfer</SelectItem>
                          <SelectItem value="Discharge">Discharge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Transport Miles */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Transport Miles</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={additionalInfo.ambulanceInfo.transportMiles}
                        onChange={(e) => 
                          setAdditionalInfo({
                            ...additionalInfo,
                            ambulanceInfo: {
                              ...additionalInfo.ambulanceInfo,
                              transportMiles: e.target.value
                            }
                          })
                        }
                        className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2 text-right"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                </div>

                {/* Round Trip and Stretcher Reason Section */}
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <div className="grid grid-cols-3 gap-3">
                    {/* Round Trip Reason */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Round Trip Reason</Label>
                      <Input
                        value={additionalInfo.ambulanceInfo.roundTripReason}
                        onChange={(e) => 
                          setAdditionalInfo({
                            ...additionalInfo,
                            ambulanceInfo: {
                              ...additionalInfo.ambulanceInfo,
                              roundTripReason: e.target.value
                            }
                          })
                        }
                        className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                        placeholder="Enter round trip reason"
                      />
                    </div>

                    {/* Stretcher Reason */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Stretcher Reason</Label>
                      <Input
                        value={additionalInfo.ambulanceInfo.stretcherReason}
                        onChange={(e) => 
                          setAdditionalInfo({
                            ...additionalInfo,
                            ambulanceInfo: {
                              ...additionalInfo.ambulanceInfo,
                              stretcherReason: e.target.value
                            }
                          })
                        }
                        className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                        placeholder="Enter stretcher reason"
                      />
                    </div>
                  </div>
                </div>

                {/* Pickup Address Section */}
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <h3 className="text-gray-900 text-sm font-semibold mb-3">Pickup Address</h3>
                  
                  <div className="space-y-3">
                    {/* Address */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Address</Label>
                      <textarea
                        value={additionalInfo.ambulanceInfo.pickupAddress.address}
                        onChange={(e) => 
                          setAdditionalInfo({
                            ...additionalInfo,
                            ambulanceInfo: {
                              ...additionalInfo.ambulanceInfo,
                              pickupAddress: {
                                ...additionalInfo.ambulanceInfo.pickupAddress,
                                address: e.target.value
                              }
                            }
                          })
                        }
                        className="w-full bg-white border border-gray-300 text-gray-900 text-xs px-2 py-1.5 rounded-md min-h-[50px] resize-y"
                        placeholder="Enter pickup address"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* City */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">City</Label>
                        <Input
                          value={additionalInfo.ambulanceInfo.pickupAddress.city}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              ambulanceInfo: {
                                ...additionalInfo.ambulanceInfo,
                                pickupAddress: {
                                  ...additionalInfo.ambulanceInfo.pickupAddress,
                                  city: e.target.value
                                }
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                          placeholder="City"
                        />
                      </div>

                      {/* State */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">State</Label>
                        <Input
                          value={additionalInfo.ambulanceInfo.pickupAddress.state}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              ambulanceInfo: {
                                ...additionalInfo.ambulanceInfo,
                                pickupAddress: {
                                  ...additionalInfo.ambulanceInfo.pickupAddress,
                                  state: e.target.value
                                }
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                          placeholder="State"
                        />
                      </div>

                      {/* ZIP Code */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">ZIP Code</Label>
                        <Input
                          value={additionalInfo.ambulanceInfo.pickupAddress.zipCode}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              ambulanceInfo: {
                                ...additionalInfo.ambulanceInfo,
                                pickupAddress: {
                                  ...additionalInfo.ambulanceInfo.pickupAddress,
                                  zipCode: e.target.value
                                }
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                          placeholder="ZIP Code"
                        />
                      </div>
                    </div>

                    {/* International Address Checkbox */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pickup-international"
                        checked={additionalInfo.ambulanceInfo.pickupAddress.internationalAddress}
                        onCheckedChange={(checked) => 
                          setAdditionalInfo({
                            ...additionalInfo,
                            ambulanceInfo: {
                              ...additionalInfo.ambulanceInfo,
                              pickupAddress: {
                                ...additionalInfo.ambulanceInfo.pickupAddress,
                                internationalAddress: !!checked
                              }
                            }
                          })
                        }
                      />
                      <Label htmlFor="pickup-international" className="text-xs text-gray-700 cursor-pointer">
                        International Address
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Dropoff Address Section */}
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-900 text-base font-semibold">Dropoff Address</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        // TODO: Implement copy from facility functionality
                        console.log('Copy from facility');
                      }}
                    >
                      Copy from Facility
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Name */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Name</Label>
                      <Input
                        value={additionalInfo.ambulanceInfo.dropoffAddress.name}
                        onChange={(e) => 
                          setAdditionalInfo({
                            ...additionalInfo,
                            ambulanceInfo: {
                              ...additionalInfo.ambulanceInfo,
                              dropoffAddress: {
                                ...additionalInfo.ambulanceInfo.dropoffAddress,
                                name: e.target.value
                              }
                            }
                          })
                        }
                        className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                        placeholder="Enter name"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1.5 block font-medium">Address</Label>
                      <textarea
                        value={additionalInfo.ambulanceInfo.dropoffAddress.address}
                        onChange={(e) => 
                          setAdditionalInfo({
                            ...additionalInfo,
                            ambulanceInfo: {
                              ...additionalInfo.ambulanceInfo,
                              dropoffAddress: {
                                ...additionalInfo.ambulanceInfo.dropoffAddress,
                                address: e.target.value
                              }
                            }
                          })
                        }
                        className="w-full bg-white border border-gray-300 text-gray-900 text-xs px-2 py-1.5 rounded-md min-h-[50px] resize-y"
                        placeholder="Enter dropoff address"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* City */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">City</Label>
                        <Input
                          value={additionalInfo.ambulanceInfo.dropoffAddress.city}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              ambulanceInfo: {
                                ...additionalInfo.ambulanceInfo,
                                dropoffAddress: {
                                  ...additionalInfo.ambulanceInfo.dropoffAddress,
                                  city: e.target.value
                                }
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                          placeholder="City"
                        />
                      </div>

                      {/* State */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">State</Label>
                        <Input
                          value={additionalInfo.ambulanceInfo.dropoffAddress.state}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              ambulanceInfo: {
                                ...additionalInfo.ambulanceInfo,
                                dropoffAddress: {
                                  ...additionalInfo.ambulanceInfo.dropoffAddress,
                                  state: e.target.value
                                }
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                          placeholder="State"
                        />
                      </div>

                      {/* ZIP Code */}
                      <div>
                        <Label className="text-gray-700 text-xs mb-1.5 block font-medium">ZIP Code</Label>
                        <Input
                          value={additionalInfo.ambulanceInfo.dropoffAddress.zipCode}
                          onChange={(e) => 
                            setAdditionalInfo({
                              ...additionalInfo,
                              ambulanceInfo: {
                                ...additionalInfo.ambulanceInfo,
                                dropoffAddress: {
                                  ...additionalInfo.ambulanceInfo.dropoffAddress,
                                  zipCode: e.target.value
                                }
                              }
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900 h-8 text-xs px-2"
                          placeholder="ZIP Code"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certification Fields Section */}
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-900 text-base font-semibold">Certification Fields</h3>
                    <span className="text-xs text-gray-500">Select up to 5</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cert-admitted"
                        checked={additionalInfo.ambulanceInfo.certificationFields.admittedToHospital}
                        onCheckedChange={(checked) => {
                          const currentCount = Object.values(additionalInfo.ambulanceInfo.certificationFields).filter(Boolean).length;
                          if (checked && currentCount >= 5) {
                            return; // Don't allow more than 5
                          }
                          setAdditionalInfo({
                            ...additionalInfo,
                            ambulanceInfo: {
                              ...additionalInfo.ambulanceInfo,
                              certificationFields: {
                                ...additionalInfo.ambulanceInfo.certificationFields,
                                admittedToHospital: !!checked
                              }
                            }
                          });
                        }}
                      />
                      <Label htmlFor="cert-admitted" className="text-xs text-gray-700 cursor-pointer">
                        Patient was admitted to a hospital
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cert-stretcher"
                        checked={additionalInfo.ambulanceInfo.certificationFields.movedByStretcher}
                        onCheckedChange={(checked) => {
                          const currentCount = Object.values(additionalInfo.ambulanceInfo.certificationFields).filter(Boolean).length;
                          if (checked && currentCount >= 5) {
                            return;
                          }
                          setAdditionalInfo({
                            ...additionalInfo,
                            ambulanceInfo: {
                              ...additionalInfo.ambulanceInfo,
                              certificationFields: {
                                ...additionalInfo.ambulanceInfo.certificationFields,
                                movedByStretcher: !!checked
                              }
                            }
                          });
                        }}
                      />
                      <Label htmlFor="cert-stretcher" className="text-sm text-gray-700 cursor-pointer">
                        Patient was moved by stretcher
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cert-unconscious"
                        checked={additionalInfo.ambulanceInfo.certificationFields.unconsciousOrShock}
                        onCheckedChange={(checked) => {
                          const currentCount = Object.values(additionalInfo.ambulanceInfo.certificationFields).filter(Boolean).length;
                          if (checked && currentCount >= 5) {
                            return;
                          }
                          setAdditionalInfo({
                            ...additionalInfo,
                            ambulanceInfo: {
                              ...additionalInfo.ambulanceInfo,
                              certificationFields: {
                                ...additionalInfo.ambulanceInfo.certificationFields,
                                unconsciousOrShock: !!checked
                              }
                            }
                          });
                        }}
                      />
                      <Label htmlFor="cert-unconscious" className="text-sm text-gray-700 cursor-pointer">
                        Patient was unconscious or in shock
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cert-emergency"
                        checked={additionalInfo.ambulanceInfo.certificationFields.emergencyTransport}
                        onCheckedChange={(checked) => {
                          const currentCount = Object.values(additionalInfo.ambulanceInfo.certificationFields).filter(Boolean).length;
                          if (checked && currentCount >= 5) {
                            return;
                          }
                          setAdditionalInfo({
                            ...additionalInfo,
                            ambulanceInfo: {
                              ...additionalInfo.ambulanceInfo,
                              certificationFields: {
                                ...additionalInfo.ambulanceInfo.certificationFields,
                                emergencyTransport: !!checked
                              }
                            }
                          });
                        }}
                      />
                      <Label htmlFor="cert-emergency" className="text-sm text-gray-700 cursor-pointer">
                        Patient was transported in an emergency situation
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cert-restrained"
                        checked={additionalInfo.ambulanceInfo.certificationFields.physicallyRestrained}
                        onCheckedChange={(checked) => {
                          const currentCount = Object.values(additionalInfo.ambulanceInfo.certificationFields).filter(Boolean).length;
                          if (checked && currentCount >= 5) {
                            return;
                          }
                          setAdditionalInfo({
                            ...additionalInfo,
                            ambulanceInfo: {
                              ...additionalInfo.ambulanceInfo,
                              certificationFields: {
                                ...additionalInfo.ambulanceInfo.certificationFields,
                                physicallyRestrained: !!checked
                              }
                            }
                          });
                        }}
                      />
                      <Label htmlFor="cert-restrained" className="text-sm text-gray-700 cursor-pointer">
                        Patient had to be physically restrained
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cert-hemorrhaging"
                        checked={additionalInfo.ambulanceInfo.certificationFields.visibleHemorrhaging}
                        onCheckedChange={(checked) => {
                          const currentCount = Object.values(additionalInfo.ambulanceInfo.certificationFields).filter(Boolean).length;
                          if (checked && currentCount >= 5) {
                            return;
                          }
                          setAdditionalInfo({
                            ...additionalInfo,
                            ambulanceInfo: {
                              ...additionalInfo.ambulanceInfo,
                              certificationFields: {
                                ...additionalInfo.ambulanceInfo.certificationFields,
                                visibleHemorrhaging: !!checked
                              }
                            }
                          });
                        }}
                      />
                      <Label htmlFor="cert-hemorrhaging" className="text-sm text-gray-700 cursor-pointer">
                        Patient had visible hemorrhaging
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cert-necessary"
                        checked={additionalInfo.ambulanceInfo.certificationFields.medicallyNecessary}
                        onCheckedChange={(checked) => {
                          const currentCount = Object.values(additionalInfo.ambulanceInfo.certificationFields).filter(Boolean).length;
                          if (checked && currentCount >= 5) {
                            return;
                          }
                          setAdditionalInfo({
                            ...additionalInfo,
                            ambulanceInfo: {
                              ...additionalInfo.ambulanceInfo,
                              certificationFields: {
                                ...additionalInfo.ambulanceInfo.certificationFields,
                                medicallyNecessary: !!checked
                              }
                            }
                          });
                        }}
                      />
                      <Label htmlFor="cert-necessary" className="text-sm text-gray-700 cursor-pointer">
                        Ambulance service was medically necessary
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cert-confined"
                        checked={additionalInfo.ambulanceInfo.certificationFields.confinedToBedOrChair}
                        onCheckedChange={(checked) => {
                          const currentCount = Object.values(additionalInfo.ambulanceInfo.certificationFields).filter(Boolean).length;
                          if (checked && currentCount >= 5) {
                            return;
                          }
                          setAdditionalInfo({
                            ...additionalInfo,
                            ambulanceInfo: {
                              ...additionalInfo.ambulanceInfo,
                              certificationFields: {
                                ...additionalInfo.ambulanceInfo.certificationFields,
                                confinedToBedOrChair: !!checked
                              }
                            }
                          });
                        }}
                      />
                      <Label htmlFor="cert-confined" className="text-sm text-gray-700 cursor-pointer">
                        Patient was confined to a bed or chair
                      </Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Side - Claim Summary and Additional Accordions */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto">
            <Accordion type="single" defaultValue={activeTab === 'charges' ? 'charge-options' : 'claim-summary'} collapsible className="w-full">
              {/* Charge Options - Only show on Charges tab */}
              {activeTab === 'charges' && (
                <AccordionItem value="charge-options" className="border-b border-gray-200">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <h3 className="font-semibold text-gray-900">Charge Options</h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="update-patient-defaults"
                            checked={chargeOptions.updatePatientDefaults}
                            onCheckedChange={(checked) => 
                              setChargeOptions({ ...chargeOptions, updatePatientDefaults: !!checked })
                            }
                          />
                          <Label htmlFor="update-patient-defaults" className="text-sm text-gray-700 cursor-pointer">
                            Update patient ICD & Procedure Code defaults
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="create-charge-panel"
                            checked={chargeOptions.createChargePanel}
                            onCheckedChange={(checked) => 
                              setChargeOptions({ ...chargeOptions, createChargePanel: !!checked })
                            }
                          />
                          <Label htmlFor="create-charge-panel" className="text-sm text-gray-700 cursor-pointer">
                            Create a new charge panel from procedure(s)
                          </Label>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Label className="text-sm text-gray-700 mb-2 block">Set all charges to</Label>
                        <Select
                          value={chargeOptions.setAllChargesTo}
                          onValueChange={(value) => 
                            setChargeOptions({ ...chargeOptions, setAllChargesTo: value })
                          }
                        >
                          <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NO CHANGE">NO CHANGE</SelectItem>
                            <SelectItem value="PAID">PAID</SelectItem>
                            <SelectItem value="BALANCE DUE PATIENT">BALANCE DUE PATIENT</SelectItem>
                            <SelectItem value="PENDING">PENDING</SelectItem>
                            <SelectItem value="DENIED">DENIED</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              {/* Claim Summary Accordion */}
              <AccordionItem value="claim-summary" className="border-b border-gray-200">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <h3 className="font-semibold text-gray-900">Claim Summary</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-gray-500 text-xs">Form Version</Label>
                      <p className="text-gray-900">CMS-1500 02-12</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Total Amount</Label>
                      <p className="text-gray-900">$0.00</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Ins Payments</Label>
                      <p className="text-gray-900">$0.00</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Pat Payments</Label>
                      <p className="text-gray-900">$0.00</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Adjustments</Label>
                      <p className="text-gray-900">$0.00</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Balance</Label>
                      <p className="text-gray-900">$0.00</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Patient Credits</Label>
                      <p className="text-gray-900">$0.00</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Patient Follow Up Date</Label>
                      <p className="text-gray-900">--</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Patient Recall Date</Label>
                      <p className="text-gray-900">--</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Date of Service</Label>
                      <p className="text-gray-900">--</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Estimate Accordion */}
              <AccordionItem value="estimate" className="border-b border-gray-200">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <h3 className="font-semibold text-gray-900">Estimate</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full justify-between bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                        >
                          New Estimate
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuItem>Create New Estimate</DropdownMenuItem>
                        <DropdownMenuItem>View Existing Estimates</DropdownMenuItem>
                        <DropdownMenuItem>Copy from Previous</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Add your estimate list/content here */}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Patient Notes Accordion */}
              <AccordionItem value="patient-notes" className="border-b border-gray-200">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <h3 className="font-semibold text-gray-900">Patient Notes</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 justify-start bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                      <div className="flex items-center gap-1">
                        <Select defaultValue="notes-for-claim">
                          <SelectTrigger className="w-48 bg-white border-gray-300 text-gray-700 h-9 text-sm">
                            <SelectValue placeholder="Notes for this Claim" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-notes">All Notes</SelectItem>
                            <SelectItem value="appointment-notes">Appointment Notes</SelectItem>
                            <SelectItem value="claim-notes">Claim Notes</SelectItem>
                            <SelectItem value="my-notes">My Notes</SelectItem>
                            <SelectItem value="patient-notes">Patient Notes</SelectItem>
                            <SelectItem value="payment-notes">Payment Notes</SelectItem>
                            <SelectItem value="notes-for-claim">Notes for this Claim</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex flex-col">
                          <Button variant="ghost" size="sm" className="h-3 w-6 p-0">
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-3 w-6 p-0">
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                          <ExternalLink className="h-4 w-4 text-gray-600" />
                        </Button>
                      </div>
                    </div>
                    {/* Add your patient notes list/content here */}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Follow Up Activity Accordion */}
              <AccordionItem value="follow-up-activity" className="border-b border-gray-200">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <h3 className="font-semibold text-gray-900">Follow Up Activity</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start bg-teal-50 hover:bg-teal-100 text-gray-900 border-l-4 border-l-green-500 pl-3"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Follow Up Notes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full justify-start bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                    {/* Add your follow up activity content here */}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Alerts Accordion */}
              <AccordionItem value="alerts" className="border-b border-gray-200">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <h3 className="font-semibold text-gray-900">Alerts</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Alerts</span>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full justify-start bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Alert
                      </Button>
                    </div>
                    {/* Add your alerts list/content here */}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Tasks Accordion */}
              <AccordionItem value="tasks" className="border-b border-gray-200">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <h3 className="font-semibold text-gray-900">Tasks</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Task
                      </Button>
                      <div className="flex items-center gap-2">
                        <Checkbox id="show-completed-tasks" />
                        <label 
                          htmlFor="show-completed-tasks" 
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          Show Completed Tasks
                        </label>
                      </div>
                      <Select defaultValue="claim-tasks">
                        <SelectTrigger className="w-32 bg-gray-100 border-gray-300 text-gray-700 h-9 text-sm">
                          <SelectValue placeholder="Claim Tasks" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="claim-tasks">Claim Tasks</SelectItem>
                          <SelectItem value="all-tasks">All Tasks</SelectItem>
                          <SelectItem value="my-tasks">My Tasks</SelectItem>
                          <SelectItem value="overdue-tasks">Overdue Tasks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Add your tasks list/content here */}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Documents Accordion */}
              <AccordionItem value="documents" className="border-b border-gray-200">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <h3 className="font-semibold text-gray-900">Documents</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                          >
                            Add
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem>Upload Document</DropdownMenuItem>
                          <DropdownMenuItem>Create New Document</DropdownMenuItem>
                          <DropdownMenuItem>Link Existing Document</DropdownMenuItem>
                          <DropdownMenuItem>Scan Document</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <div className="flex items-center gap-1">
                        <Select defaultValue="claim-documents">
                          <SelectTrigger className="w-40 bg-gray-100 border-gray-300 text-gray-700 h-9 text-sm">
                            <SelectValue placeholder="Claim Documents" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="claim-documents">Claim Documents</SelectItem>
                            <SelectItem value="all-documents">All Documents</SelectItem>
                            <SelectItem value="patient-documents">Patient Documents</SelectItem>
                            <SelectItem value="claim-related">Claim Related</SelectItem>
                            <SelectItem value="attachments">Attachments</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 w-9 p-0 hover:bg-gray-100"
                          title="Sort/Refresh"
                        >
                          <div className="flex flex-col">
                            <ChevronUp className="h-3 w-3 text-gray-600" />
                            <ChevronDown className="h-3 w-3 text-gray-600 -mt-1" />
                          </div>
                        </Button>
                      </div>
                    </div>
                    {/* Add your documents list/content here */}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Payment Accordion */}
              <AccordionItem value="payment" className="border-b border-gray-200">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <h3 className="font-semibold text-gray-900">Payment</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    {/* Balance Fields */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-gray-500 text-xs mb-1">Current Balance</Label>
                        <p className="text-gray-900 font-medium">${paymentData.currentBalance}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500 text-xs mb-1">New Balance</Label>
                        <p className="text-gray-900 font-medium">${paymentData.newBalance}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500 text-xs mb-1">Copay Due</Label>
                        <p className="text-gray-900 font-medium">${paymentData.copayDue}</p>
                      </div>
                    </div>

                    {/* Payment Application Options */}
                    <div>
                      <Label className="text-gray-700 text-sm font-medium mb-2 block">Payment Application Options</Label>
                      <RadioGroup 
                        value={paymentData.paymentApplication} 
                        onValueChange={(value) => setPaymentData({...paymentData, paymentApplication: value})}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cannot-apply" id="cannot-apply" disabled />
                          <label htmlFor="cannot-apply" className="text-sm text-gray-500 cursor-not-allowed">
                            Cannot apply copay to claim with no copay due
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="apply-credit" id="apply-credit" />
                          <label htmlFor="apply-credit" className="text-sm text-gray-700 cursor-pointer">
                            Apply account credit to claim
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="post-new-payment" id="post-new-payment" />
                          <label htmlFor="post-new-payment" className="text-sm text-gray-700 cursor-pointer">
                            Post new payment to claim
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="do-not-apply" id="do-not-apply" />
                          <label htmlFor="do-not-apply" className="text-sm text-gray-700 cursor-pointer">
                            Do not apply a payment or credit
                          </label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Payment Details */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-700 text-xs mb-1">Payment Amount</Label>
                        <Input
                          type="number"
                          value={paymentData.paymentAmount}
                          onChange={(e) => setPaymentData({...paymentData, paymentAmount: e.target.value})}
                          className="bg-white border-gray-300 text-gray-900 h-9 text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="send-receipt" 
                          checked={paymentData.sendReceipt}
                          onCheckedChange={(checked) => setPaymentData({...paymentData, sendReceipt: !!checked})}
                        />
                        <label htmlFor="send-receipt" className="text-sm text-gray-700 cursor-pointer">
                          Send receipt
                        </label>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-gray-700 text-xs mb-1">Received Date</Label>
                          <div className="relative">
                            <Input
                              type="date"
                              value={paymentData.receivedDate}
                              onChange={(e) => setPaymentData({...paymentData, receivedDate: e.target.value})}
                              className="bg-white border-gray-300 text-gray-900 h-9 text-sm pr-10"
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-700 text-xs mb-1">Deposit Date</Label>
                          <div className="relative">
                            <Input
                              type="date"
                              value={paymentData.depositDate}
                              onChange={(e) => setPaymentData({...paymentData, depositDate: e.target.value})}
                              className="bg-white border-gray-300 text-gray-900 h-9 text-sm pr-10"
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-700 text-xs mb-1">Check #</Label>
                        <Input
                          value={paymentData.checkNumber}
                          onChange={(e) => setPaymentData({...paymentData, checkNumber: e.target.value})}
                          className="bg-white border-gray-300 text-gray-900 h-9 text-sm"
                          placeholder="Enter check number"
                        />
                      </div>
                    </div>

                    {/* Payment Type and Source */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-gray-700 text-sm font-medium mb-2 block">Type</Label>
                        <RadioGroup 
                          value={paymentData.paymentType} 
                          onValueChange={(value) => setPaymentData({...paymentData, paymentType: value})}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="copay" id="type-copay" />
                            <label htmlFor="type-copay" className="text-sm text-gray-700 cursor-pointer">
                              Copay
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="payment" id="type-payment" />
                            <label htmlFor="type-payment" className="text-sm text-gray-700 cursor-pointer">
                              Payment
                            </label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div>
                        <Label className="text-gray-700 text-sm font-medium mb-2 block">Source</Label>
                        <RadioGroup 
                          value={paymentData.paymentSource} 
                          onValueChange={(value) => setPaymentData({...paymentData, paymentSource: value})}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="check" id="source-check" />
                            <label htmlFor="source-check" className="text-sm text-gray-700 cursor-pointer">
                              Check
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="cash" id="source-cash" />
                            <label htmlFor="source-cash" className="text-sm text-gray-700 cursor-pointer">
                              Cash
                            </label>
                          </div>
                          <div className="flex items-center space-x-2 gap-2">
                            <RadioGroupItem value="credit-card" id="source-credit-card" />
                            <label htmlFor="source-credit-card" className="text-sm text-gray-700 cursor-pointer">
                              Credit Card
                            </label>
                            {paymentData.paymentSource === 'credit-card' && (
                              <Select value={paymentData.otherSource} onValueChange={(value) => setPaymentData({...paymentData, otherSource: value})}>
                                <SelectTrigger className="w-24 h-7 text-xs bg-white border-gray-300">
                                  <SelectValue placeholder="Other" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="visa">Visa</SelectItem>
                                  <SelectItem value="mastercard">Mastercard</SelectItem>
                                  <SelectItem value="amex">Amex</SelectItem>
                                  <SelectItem value="discover">Discover</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    {/* Memo */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1">Memo</Label>
                      <Input
                        value={paymentData.memo}
                        onChange={(e) => setPaymentData({...paymentData, memo: e.target.value})}
                        className="bg-white border-gray-300 text-gray-900 h-9 text-sm"
                        placeholder="Enter memo"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}

