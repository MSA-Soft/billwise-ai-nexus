import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X, Plus, Trash2, FileText, Eye, Download } from "lucide-react";
import { authorizationAuditService } from "@/services/authorizationAuditService";
import { useAuth } from "@/contexts/AuthContext";

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
  const { currentCompany } = useAuth();
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
  const [facilities, setFacilities] = useState<any[]>([]);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ id: string; name: string; type: string; url: string; size: number }>>([]);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [comments, setComments] = useState<Array<{ id: string; comment: string; is_internal: boolean; comment_type: string; user_id: string; created_at: string; user_name?: string }>>([]);
  const [newComment, setNewComment] = useState("");
  const [newCommentType, setNewCommentType] = useState("general");
  const [isCommentInternal, setIsCommentInternal] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [formData, setFormData] = useState({
    // Simplified fields as per requirements
    serial_no: "", // S.No
    scheduled_location: "", // Scheduled Location
    order_date: "", // Order Date
    type_of_visit: "", // Type of Visit
    patient_name: "", // Patient Name
    primary_insurance: "", // Primary Insurance (payer_name)
    primary_insurance_id: "", // Primary Insurance ID
    description: "", // Description
    prior_auth_required: false, // Prior Auth Required (checkbox)
    prior_authorization_status: "pending", // Prior Authorization Status
    remarks: "", // Remarks
    secondary_insurance: "", // Secondary Insurance
    secondary_insurance_id: "", // Secondary Insurance ID
    secondary_prior_auth_required: false, // Prior Auth Required (secondary) (checkbox)
    secondary_prior_authorization_status: "pending", // Prior Authorization Status (secondary)
    // Hidden fields for database compatibility (mapped from simplified fields)
    payer_id: "",
    payer_name: "",
    secondary_payer_id: "",
    secondary_payer_name: "",
    status: "pending",
    service_type: "",
    facility_id: "",
    facility_name: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPayers();
      fetchPatients();
      fetchFacilities();
      if (authorizationId) {
        setIsEditMode(true);
        loadAuthorizationData(authorizationId);
        loadComments(authorizationId);
      } else {
        setIsEditMode(false);
        setSelectedPatientId(null);
        // Pre-populate from patientData if provided
        if (patientData) {
          const timestamp = Date.now();
          const serialNo = `AUTH-${timestamp.toString().slice(-8)}`;
          setFormData(prev => ({
            ...prev,
            serial_no: serialNo,
            patient_name: patientData.name || prev.patient_name,
            primary_insurance: patientData.payerName || prev.primary_insurance,
            primary_insurance_id: patientData.payerId || prev.primary_insurance_id,
            payer_id: patientData.payerId || prev.payer_id,
            payer_name: patientData.payerName || prev.payer_name,
          }));
          if (patientData.name) {
            setPatientSearchTerm(patientData.name);
            setSelectedPatientId(patientId || 'pre-filled');
          }
        } else if (patientId) {
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
        // Map database fields to simplified form fields
        setFormData(prev => ({
          ...prev,
          serial_no: authData.id ? authData.id.substring(0, 8).toUpperCase() : `AUTH-${Date.now().toString().slice(-8)}`,
          scheduled_location: authData.facility_name || "",
          order_date: authData.service_start_date || authData.created_at ? new Date(authData.service_start_date || authData.created_at).toISOString().split('T')[0] : "",
          type_of_visit: authData.service_type || "",
          patient_name: authData.patient_name || "",
          primary_insurance: authData.payer_name_custom || "",
          primary_insurance_id: authData.payer_id || "",
          description: authData.service_type || authData.procedure_description || "",
          prior_auth_required: authData.status && authData.status !== "draft" ? true : false,
          prior_authorization_status: authData.status || "pending",
          remarks: authData.internal_notes || "",
          secondary_insurance: authData.secondary_payer_name || "",
          secondary_insurance_id: authData.secondary_payer_id || "",
          secondary_prior_auth_required: authData.secondary_payer_id ? true : false,
          secondary_prior_authorization_status: authData.status || "pending",
          // Keep mapping for database compatibility
          payer_id: authData.payer_id || "",
          payer_name: authData.payer_name_custom || "",
          secondary_payer_id: authData.secondary_payer_id || "",
          secondary_payer_name: authData.secondary_payer_name || "",
          status: authData.status || "pending",
          service_type: authData.service_type || "",
          facility_id: authData.facility_id || "",
          facility_name: authData.facility_name || "",
        }));
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
    // Generate serial number
    const timestamp = Date.now();
    const serialNo = `AUTH-${timestamp.toString().slice(-8)}`;
    
    setFormData({
      serial_no: serialNo,
      scheduled_location: "",
      order_date: "",
      type_of_visit: "",
      patient_name: "",
      primary_insurance: "",
      primary_insurance_id: "",
      description: "",
      prior_auth_required: false,
      prior_authorization_status: "pending",
      remarks: "",
      secondary_insurance: "",
      secondary_insurance_id: "",
      secondary_prior_auth_required: false,
      secondary_prior_authorization_status: "pending",
      payer_id: "",
      payer_name: "",
      secondary_payer_id: "",
      secondary_payer_name: "",
      status: "pending",
      service_type: "",
      facility_id: "",
      facility_name: "",
    });
    setUploadedDocuments([]);
    setSelectedPatientId(null);
    setComments([]);
    setNewComment("");
    setNewCommentType("general");
    setIsCommentInternal(false);
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
        return; // Don't show error toast, facilities are optional
      }

      setFacilities(data || []);
    } catch (error: any) {
      console.error('Error fetching facilities:', error);
    } finally {
      setIsLoadingFacilities(false);
    }
  };

  const loadComments = async (authId: string) => {
    try {
      setIsLoadingComments(true);
      const { data, error } = await supabase
        .from('authorization_request_comments' as any)
        .select(`
          *,
          user:user_id (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq('authorization_request_id', authId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading comments:', error);
        return;
      }

      const formattedComments = (data || []).map((comment: any) => ({
        id: comment.id,
        comment: comment.comment,
        is_internal: comment.is_internal,
        comment_type: comment.comment_type || 'general',
        user_id: comment.user_id,
        created_at: comment.created_at,
        user_name: comment.user?.raw_user_meta_data?.full_name || comment.user?.email || 'Unknown User',
      }));

      setComments(formattedComments);
    } catch (error: any) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    // For new requests, we need to create the authorization first
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive"
      });
      return;
    }
    
    // If no authorizationId yet (new request), save the comment for later or show error
    if (!authorizationId && !isEditMode) {
      toast({
        title: "Error",
        description: "Please save the authorization request first before adding comments",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to add comments');
      }

      const { data, error } = await supabase
        .from('authorization_request_comments' as any)
        .insert({
          authorization_request_id: authorizationId,
          user_id: user.id,
          comment: newComment.trim(),
          is_internal: isCommentInternal,
          comment_type: newCommentType,
          company_id: currentCompany?.id || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh comments if authorizationId exists
      if (authorizationId) {
        await loadComments(authorizationId);
      }
      
      // Clear comment input
      setNewComment("");
      setIsCommentInternal(false);
      setNewCommentType("general");

      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive"
      });
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
          // Auto-fill order date to today if not already set
          order_date: prev.order_date || new Date().toISOString().split('T')[0],
          // Note: patient_dob and requested_end_date don't exist in simplified form
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
        try {
          // Build query step by step
          let query = supabase
            .from('patient_insurance' as any)
            .select('insurance_company_id, is_primary, member_id, group_number')
            .eq('patient_id', id);
          
          // Add company_id filter if available (for multi-tenant RLS)
          if (currentCompany?.id) {
            query = query.eq('company_id', currentCompany.id);
          }
          
          const { data: piData, error: piError } = await query
            .order('is_primary', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Check for specific error codes
          if (piError) {
            // 400 Bad Request could mean:
            // - Table doesn't exist
            // - Column doesn't exist
            // - RLS policy is blocking
            // - Invalid query syntax
            if (piError.code === 'PGRST116' || piError.message?.includes('does not exist')) {
              console.log('ℹ️ patient_insurance table or column does not exist (this is okay)');
            } else if (piError.code === '42501' || piError.message?.includes('permission denied')) {
              console.log('ℹ️ RLS policy blocking patient_insurance access (this is okay)');
            } else {
              console.log('ℹ️ Error fetching from patient_insurance table:', piError.message, piError.code);
            }
          } else if (piData) {
            const pi = piData as any;
            // Only use the data if there's no error and data exists
            // Map the data to match expected format
            insuranceData = {
              insurance_id: pi.insurance_company_id,
              payer_id: pi.insurance_company_id, // Use insurance_company_id as payer_id
              group_number: pi.group_number,
              policy_number: null, // Not available in patient_insurance table
              member_id: pi.member_id,
              insurance_company: null, // Will fetch from insurance_payers table
            };
          }
        } catch (tableError: any) {
          // Table might not exist or RLS is blocking - this is okay
          console.log('ℹ️ patient_insurance table query failed (this is okay):', tableError.message);
        }
        
        // Method 2: Try to get from patients table if it has insurance fields
        // Some schemas store insurance_id directly in patients table
        if (!insuranceData && basicData && (basicData as any).primary_insurance_id) {
          insuranceData = {
            insurance_id: (basicData as any).primary_insurance_id,
            payer_id: (basicData as any).primary_insurance_id,
            member_id: (basicData as any).insurance_member_id || null,
          };
        }

        if (insuranceData) {
          const insurance = insuranceData as any;
          console.log('✅ Insurance data found:', insurance);
          
          setFormData(prev => ({
            ...prev,
            // Note: patient_member_id doesn't exist in simplified form, but keeping for compatibility
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
                // Populate the simplified form fields that are actually displayed
                primary_insurance: payer.name || prev.primary_insurance,
                primary_insurance_id: payer.id || prev.primary_insurance_id,
              }));
            }
          }
        } else {
          console.log('ℹ️ No insurance data found for this patient');
        }

        // Try to load secondary insurance if available
        try {
          const { data: secondaryInsuranceData, error: secondaryError } = await supabase
            .from('patient_insurance' as any)
            .select('insurance_company_id, is_primary, member_id, group_number')
            .eq('patient_id', id)
            .eq('is_primary', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!secondaryError && secondaryInsuranceData) {
            const secInsurance = secondaryInsuranceData as any;
            const { data: secPayerData, error: secPayerError } = await supabase
              .from('insurance_payers' as any)
              .select('id, name')
              .eq('id', secInsurance.insurance_company_id)
              .maybeSingle();

            if (!secPayerError && secPayerData) {
              const secPayer = secPayerData as any;
              console.log('✅ Secondary payer data found:', secPayer);
              setFormData(prev => ({
                ...prev,
                secondary_insurance: secPayer.name || prev.secondary_insurance,
                secondary_insurance_id: secPayer.id || prev.secondary_insurance_id,
                secondary_payer_id: secPayer.id || prev.secondary_payer_id,
                secondary_payer_name: secPayer.name || prev.secondary_payer_name,
                secondary_prior_auth_required: secPayer.id ? true : prev.secondary_prior_auth_required,
              }));
            }
          }
        } catch (secErr: any) {
          console.log('ℹ️ Secondary insurance data not available (this is okay):', secErr.message);
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
        // Note: patient_dob and patient_member_id don't exist in simplified form
        // Keep only fields that exist in simplified form
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

      const selectedPayer = payers.find(p => p.id === formData.primary_insurance_id || p.id === formData.payer_id);
      
      // Validate required fields for simplified form
      if (!formData.patient_name || !formData.patient_name.trim()) {
        toast({
          title: "Validation Error",
          description: "Patient name is required",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      if (!formData.order_date) {
        toast({
          title: "Validation Error",
          description: "Order date is required",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      if (!formData.description || !formData.description.trim()) {
        toast({
          title: "Validation Error",
          description: "Description is required",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Prepare data object with simplified fields
      const authData: any = {
        user_id: user.id,
        company_id: currentCompany?.id || null,
        // Patient Information
        patient_name: formData.patient_name,
        // Payer Information
        payer_id: formData.primary_insurance_id || formData.payer_id || null,
        payer_name_custom: formData.primary_insurance || (selectedPayer ? selectedPayer.name : null),
        // Facility Information
        facility_id: formData.facility_id || null,
        facility_name: formData.scheduled_location || formData.facility_name || null,
        // Service Information
        service_type: formData.description || formData.type_of_visit || null,
        service_start_date: formData.order_date || null,
        // Secondary Insurance
        secondary_payer_id: formData.secondary_insurance_id || formData.secondary_payer_id || null,
        secondary_payer_name: formData.secondary_insurance || null,
        // Status and workflow
        status: formData.prior_authorization_status || formData.status || 'pending',
        authorization_type: 'prior',
        // Internal notes/remarks
        internal_notes: formData.remarks || null,
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
            },
            'Authorization created via simplified form'
          );
          
          // If there are comments and this is a new request, reload comments after creation
          if (authorizationId) {
            await loadComments(authRecord.id);
          }
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Authorization Request' : 'New Prior Authorization Request'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update the authorization request details below. Changes to expiration date and visits will affect tracking and alerts.'
              : 'Complete the form below to submit a new prior authorization request. Set expiration date and visit limits for proper tracking.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Simplified Prior Authorization Form */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Prior Authorization Request</h3>
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
            
            {/* Simplified Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="serial_no">S.No</Label>
                <Input
                  id="serial_no"
                  value={formData.serial_no}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="scheduled_location">Scheduled Location *</Label>
                <Select
                  value={formData.facility_id || "__none__"}
                  onValueChange={(value) => {
                    if (value === "__none__") {
                      setFormData({ ...formData, facility_id: "", facility_name: "", scheduled_location: "" });
                    } else {
                      const facility = facilities.find(f => f.id === value);
                      setFormData({ 
                        ...formData, 
                        facility_id: value,
                        facility_name: facility?.name || '',
                        scheduled_location: facility?.name || ''
                      });
                    }
                  }}
                  disabled={isLoadingFacilities}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingFacilities ? "Loading..." : "Select location"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {facilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name || facility.facility_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="order_date">Order Date *</Label>
                <Input
                  id="order_date"
                  type="date"
                  value={formData.order_date}
                  onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type_of_visit">Type of Visit *</Label>
                <Input
                  id="type_of_visit"
                  value={formData.type_of_visit}
                  onChange={(e) => setFormData({ ...formData, type_of_visit: e.target.value, service_type: e.target.value, description: e.target.value })}
                  placeholder="e.g., Office Visit, Consultation"
                  required
                />
              </div>
              <div>
                <Label htmlFor="patient_name_display">Patient Name *</Label>
                <Input
                  id="patient_name_display"
                  value={formData.patient_name}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="primary_insurance">Primary Insurance *</Label>
                <Select
                  value={formData.primary_insurance_id || formData.payer_id || ""}
                  onValueChange={(value) => {
                    const payer = payers.find(p => p.id === value);
                    setFormData({ 
                      ...formData, 
                      payer_id: value,
                      payer_name: payer?.name || '',
                      primary_insurance: payer?.name || '',
                      primary_insurance_id: value
                    });
                  }}
                  disabled={isLoadingPayers}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingPayers ? "Loading..." : "Select insurance"} />
                  </SelectTrigger>
                  <SelectContent>
                    {payers.length === 0 && !isLoadingPayers ? (
                      <SelectItem value="none" disabled>No payers found</SelectItem>
                    ) : (
                      payers.map((payer) => (
                        <SelectItem key={payer.id} value={payer.id}>
                          {payer.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value, service_type: e.target.value })}
                  placeholder="Enter procedure/service description"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="prior_auth_required"
                  checked={formData.prior_auth_required}
                  onCheckedChange={(checked) => setFormData({ ...formData, prior_auth_required: checked === true })}
                />
                <Label htmlFor="prior_auth_required" className="cursor-pointer">
                  Prior Auth Required *
                </Label>
              </div>
              <div>
                <Label htmlFor="prior_authorization_status">Prior Authorization Status *</Label>
                <Select
                  value={formData.prior_authorization_status}
                  onValueChange={(value) => setFormData({ ...formData, prior_authorization_status: value, status: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Enter any remarks or notes"
                />
              </div>
              
              {/* Secondary Insurance Section */}
              <div className="col-span-2 border-t pt-4 mt-2">
                <h4 className="font-semibold mb-3">Secondary Insurance</h4>
              </div>
              <div className="col-span-2">
                <Label htmlFor="secondary_insurance">Secondary Insurance</Label>
                <Select
                  value={formData.secondary_insurance_id || formData.secondary_payer_id || "__none__"}
                  onValueChange={(value) => {
                    if (value === "__none__") {
                      setFormData({ 
                        ...formData, 
                        secondary_payer_id: "",
                        secondary_payer_name: "",
                        secondary_insurance: "",
                        secondary_insurance_id: ""
                      });
                    } else {
                      const payer = payers.find(p => p.id === value);
                      setFormData({ 
                        ...formData, 
                        secondary_payer_id: value,
                        secondary_payer_name: payer?.name || '',
                        secondary_insurance: payer?.name || '',
                        secondary_insurance_id: value
                      });
                    }
                  }}
                  disabled={isLoadingPayers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select secondary insurance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {payers.map((payer) => (
                      <SelectItem key={payer.id} value={payer.id}>
                        {payer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="secondary_prior_auth_required"
                  checked={formData.secondary_prior_auth_required}
                  onCheckedChange={(checked) => setFormData({ ...formData, secondary_prior_auth_required: checked === true })}
                />
                <Label htmlFor="secondary_prior_auth_required" className="cursor-pointer">
                  Prior Auth Required (Secondary)
                </Label>
              </div>
              <div>
                <Label htmlFor="secondary_prior_authorization_status">Prior Authorization Status (Secondary)</Label>
                <Select
                  value={formData.secondary_prior_authorization_status}
                  onValueChange={(value) => setFormData({ ...formData, secondary_prior_authorization_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Comments Section - Always visible */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg">Comments & Notes</h3>
              
              {/* Add New Comment */}
              <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="comment_type">Comment Type</Label>
                    <Select
                      value={newCommentType}
                      onValueChange={(value) => setNewCommentType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="status_update">Status Update</SelectItem>
                        <SelectItem value="payer_communication">Payer Communication</SelectItem>
                        <SelectItem value="clinical_note">Clinical Note</SelectItem>
                        <SelectItem value="appeal_note">Appeal Note</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="is_internal_comment"
                      checked={isCommentInternal}
                      onCheckedChange={(checked) => setIsCommentInternal(checked === true)}
                    />
                    <Label htmlFor="is_internal_comment" className="cursor-pointer">
                      Internal Only
                    </Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="new_comment">Add Comment</Label>
                  <Textarea
                    id="new_comment"
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Enter your comment here..."
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
                {!authorizationId && !isEditMode && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Save the authorization request first to add comments
                  </p>
                )}
              </div>

              {/* Existing Comments */}
              <div className="space-y-3">
                <Label>Comments History</Label>
                {isLoadingComments ? (
                  <div className="text-center py-4 text-gray-500">Loading comments...</div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No comments yet</div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-3 border rounded-lg ${
                          comment.is_internal ? 'bg-yellow-50 border-yellow-200' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.user_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {comment.comment_type.replace('_', ' ')}
                            </Badge>
                            {comment.is_internal && (
                              <Badge variant="outline" className="text-xs bg-yellow-100">
                                Internal
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {comment.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
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