import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { PatientDashboard } from './PatientDashboard';
import { PatientSearchSystem } from './PatientSearchSystem';
import { PatientRegistrationForm } from './PatientRegistrationForm';
import { EditPatientForm } from './EditPatientForm';
import { MedicalHistoryForm } from './MedicalHistoryForm';
import { VitalSignsForm } from './VitalSignsForm';
import { ProgressNotesForm } from './ProgressNotesForm';
import { TreatmentPlanForm } from './TreatmentPlanForm';
import { ScheduleAppointmentForm } from './ScheduleAppointmentForm';
import { DocumentUploadForm } from './DocumentUploadForm';
import { MessagingForm } from './MessagingForm';
import { EditContactForm } from './EditContactForm';
import { EditInsuranceForm } from './EditInsuranceForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  UserPlus, 
  FileText, 
  Heart, 
  Calendar,
  Upload,
  MessageSquare,
  Edit,
  Phone,
  Shield
} from 'lucide-react';

// NOTE: Mock data removed - all patient data now comes from database
// This ensures no fallback to mock data on reload

export function Patients() {
  // CRITICAL: Log component mount to verify it's remounting on reload
  console.log('🔄 Patients component MOUNTED/REMOUNTED at:', new Date().toISOString());
  
  const [activeTab, setActiveTab] = useState('search');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]); // Start with empty array, not mock data
  const [isLoading, setIsLoading] = useState(true); // Start as loading
  const isFetchingRef = useRef(false); // Use ref to prevent duplicate fetches (avoids race conditions)
  const { toast } = useToast();
  
  // CRITICAL: Log initial state
  console.log('📊 Initial patients state length:', patients.length);

  // Fetch patients from database on component mount
  // Use auth state listener to ensure session is ready before fetching
  useEffect(() => {
    let mounted = true;
    let authListener: { data: { subscription: any } } | null = null;
    let hasFetched = false; // Prevent multiple fetches on initial load
    
    // Function to fetch if not already fetched
    const fetchIfNeeded = () => {
      if (mounted && !hasFetched) {
        hasFetched = true;
      fetchPatientsFromDatabase();
      }
    };

    // First, try to get session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session && !hasFetched) {
        fetchIfNeeded();
      } else if (mounted && !session) {
        // No session, clear and stop loading
        setPatients([]);
        setIsLoading(false);
      }
    });

    // Also listen for auth state changes (handles reload scenarios)
    authListener = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, session ? 'Has session' : 'No session');
      if (!mounted) return;
      
      if (event === 'SIGNED_OUT') {
        // Only clear on actual sign out, not token refresh
        setPatients([]);
        setIsLoading(false);
        hasFetched = false; // Reset so we can fetch again if user signs back in
      } else if (session && !hasFetched) {
        // Session is available and we haven't fetched yet
        fetchIfNeeded();
      } else if (session && event === 'SIGNED_IN') {
        // User just signed in (not initial load), fetch fresh data
        hasFetched = false;
        fetchIfNeeded();
      }
      // Note: We ignore TOKEN_REFRESHED - don't clear data on token refresh!
    });
    
    return () => {
      mounted = false;
      if (authListener?.data?.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

  const fetchPatientsFromDatabase = async () => {
    // Prevent duplicate concurrent fetches using ref (avoids race conditions with state)
    if (isFetchingRef.current) {
      console.log('⏸️ Fetch already in progress, skipping...');
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      console.log('🔍 Fetching patients from database...');
      
      // Check authentication first
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      console.log('🔐 Auth session:', session ? 'Authenticated' : 'Not authenticated');
      console.log('👤 User ID:', session?.user?.id || 'No user');
      
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch patients. Showing empty list.');
        setPatients([]); // Set to empty array instead of keeping mock data
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }
      
      // CRITICAL: Log user_id to check RLS filtering
      console.log('👤 Current user ID for RLS check:', session.user.id);
      
      const { data, error } = await supabase
        .from('patients' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      // CRITICAL: Log the actual query result immediately
      console.log('🔍 QUERY RESULT - Data:', data);
      console.log('🔍 QUERY RESULT - Error:', error);
      console.log('🔍 QUERY RESULT - Data length:', data?.length);
      console.log('🔍 QUERY RESULT - Is array:', Array.isArray(data));

      if (error) {
        console.error('❌ Error fetching patients:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        // If table doesn't exist or RLS issue, show empty
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('⚠️ Patients table not found. Showing empty list. Run COMPLETE_DATABASE_SCHEMA.sql in Supabase.');
          setPatients([]); // Set to empty array
          setIsLoading(false);
          isFetchingRef.current = false;
          return;
        }
        // RLS or permission error
        if (error.code === '42501' || error.message.includes('permission denied') || error.message.includes('policy')) {
          console.error('🚫 RLS Policy Error - Check your Row Level Security policies!');
          console.error('Current user:', session?.user?.id);
          console.error('Error:', error.message);
          toast({
            title: 'Permission Denied',
            description: 'Row Level Security policy is blocking access. Check RLS policies in Supabase.',
            variant: 'destructive',
          });
          setPatients([]);
          setIsLoading(false);
          isFetchingRef.current = false;
          return;
        }
        toast({
          title: 'Error loading patients',
          description: error.message,
          variant: 'destructive',
        });
        setPatients([]); // Ensure state is set even on error
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }

      console.log('📦 Raw data from Supabase:', data);
      console.log('📊 Data type:', typeof data);
      console.log('📊 Is array:', Array.isArray(data));
      console.log('📊 Data length:', data?.length || 0);
      console.log('📊 First patient (if any):', data?.[0]);

      // CRITICAL: Always update patients state, even if empty
      // This ensures we never show stale/mock data
      if (data && Array.isArray(data) && data.length > 0) {
        console.log(`📊 Fetched ${data.length} patients from database:`, data);
        
        // Helper function to calculate accurate age from date of birth
        const calculateAge = (dateOfBirth: string): number | null => {
          if (!dateOfBirth) return null;
          
          try {
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            
            // Check if date is valid
            if (isNaN(birthDate.getTime())) return null;
            
            // Check if date is in the future
            if (birthDate > today) {
              console.warn(`⚠️ Future date of birth detected: ${dateOfBirth}`);
              return 0; // Return 0 for future dates
            }
            
            // Calculate age accurately
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            // If birthday hasn't occurred this year, subtract 1
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            
            return age >= 0 ? age : 0; // Ensure age is never negative
          } catch (error) {
            console.error('Error calculating age:', error);
            return null;
          }
        };
        
        // Transform database records to match component's patient format
        const transformedPatients = data.map((dbPatient: any) => ({
          id: dbPatient.id,
          name: `${dbPatient.first_name || ''} ${dbPatient.last_name || ''}`.trim(),
          age: calculateAge(dbPatient.date_of_birth),
          dateOfBirth: dbPatient.date_of_birth,
          phone: dbPatient.phone_primary || dbPatient.phone || '', // Use phone_primary first, fallback to phone
          email: dbPatient.email,
          address: [
            dbPatient.address_line1,
            dbPatient.city,
            dbPatient.state,
            dbPatient.zip_code,
          ].filter(Boolean).join(', '),
          insurance: '', // Will be populated from patient_insurance table if needed
          status: dbPatient.status || 'active',
          emergencyContact: {
            name: dbPatient.emergency_contact_name,
            phone: dbPatient.emergency_contact_phone,
            relation: dbPatient.emergency_contact_relationship || dbPatient.emergency_contact_relation || '', // Use relationship first, fallback to relation
          },
          medicalInfo: {
            allergies: [],
            medications: [],
            conditions: [],
          },
          appointments: [],
          documents: [],
          nextAppointment: null,
          totalVisits: 0,
          outstandingBalance: 0,
          riskLevel: 'low' as const,
          preferredProvider: '',
          lastVisit: '',
          // Additional fields from database
          patient_id: dbPatient.patient_id,
          gender: dbPatient.gender,
          ssn: dbPatient.ssn,
          maritalStatus: dbPatient.marital_status,
          race: dbPatient.race,
          ethnicity: dbPatient.ethnicity,
          language: dbPatient.language,
        }));

        console.log(`✅ Successfully loaded ${transformedPatients.length} patients from database`);
        console.log('📋 Transformed patients count:', transformedPatients.length);
        console.log('📋 First 3 patient names:', transformedPatients.slice(0, 3).map(p => p.name));
        
        // CRITICAL: Force state update and verify
        setPatients(transformedPatients);
        
        // Verify state was set correctly after a brief delay
        setTimeout(() => {
          console.log('🔍 STATE VERIFICATION - Patients state should now have', transformedPatients.length, 'patients');
        }, 50);
      } else {
        // No patients in database - set empty array (not mock data)
        console.warn('⚠️ No patients found in database.');
        console.warn('⚠️ Data received:', data);
        console.warn('⚠️ Data is null?', data === null);
        console.warn('⚠️ Data is undefined?', data === undefined);
        console.warn('⚠️ Data is array?', Array.isArray(data));
        console.warn('⚠️ Data length:', data?.length);
        setPatients([]); // Explicitly set to empty array - NEVER use mock data
        console.log('✅ Patients state set to empty array []');
      }
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchPatientsFromDatabase:', error);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      setPatients([]); // Always set to empty on error
      toast({
        title: 'Error loading patients',
        description: error.message || 'Failed to load patients from database',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
      console.log('🏁 Fetch completed. Loading state set to false.');
      console.log('📊 Final patients state length:', patients.length);
    }
  };

  // Form states
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMedicalHistoryForm, setShowMedicalHistoryForm] = useState(false);
  const [showVitalSignsForm, setShowVitalSignsForm] = useState(false);
  const [showProgressNotesForm, setShowProgressNotesForm] = useState(false);
  const [showTreatmentPlanForm, setShowTreatmentPlanForm] = useState(false);
  const [showScheduleAppointmentForm, setShowScheduleAppointmentForm] = useState(false);
  const [showDocumentUploadForm, setShowDocumentUploadForm] = useState(false);
  const [showMessagingForm, setShowMessagingForm] = useState(false);
  const [showEditContactForm, setShowEditContactForm] = useState(false);
  const [showEditInsuranceForm, setShowEditInsuranceForm] = useState(false);

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setActiveTab('dashboard');
  };

  const handlePatientUpdate = async (updatedPatient: any) => {
    try {
      if (!updatedPatient.id) {
        throw new Error('Patient ID is required for update');
      }

      console.log('💾 Updating patient in database:', updatedPatient.id);
      
      // Extract first and last name from full name
      const nameParts = updatedPatient.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Parse address if it's a string (format: "address, city, state zip")
      let addressLine1 = updatedPatient.address || '';
      let city = updatedPatient.city || '';
      let state = updatedPatient.state || '';
      let zipCode = updatedPatient.zipCode || '';

      // If address is a string, try to parse it
      if (typeof addressLine1 === 'string' && addressLine1.includes(',')) {
        const addressParts = addressLine1.split(',');
        if (addressParts.length >= 3) {
          addressLine1 = addressParts[0].trim();
          city = addressParts[1].trim();
          const stateZip = addressParts[2].trim().split(' ');
          state = stateZip[0] || '';
          zipCode = stateZip.slice(1).join(' ') || '';
        }
      }

      // Prepare update data for patients table
      const updateData: any = {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: updatedPatient.dateOfBirth,
        phone: updatedPatient.phone || null,
        email: updatedPatient.email || null,
        address_line1: addressLine1 || null,
        city: city || null,
        state: state || null,
        zip_code: zipCode || null,
        status: updatedPatient.status || 'active',
        emergency_contact_name: updatedPatient.emergencyContact?.name || null,
        emergency_contact_phone: updatedPatient.emergencyContact?.phone || null,
        emergency_contact_relation: updatedPatient.emergencyContact?.relation || null,
      };

      // Add optional fields if they exist
      if (updatedPatient.gender) {
        const genderMap: Record<string, string> = {
          'male': 'M', 'female': 'F', 'other': 'O', 'prefer-not-to-say': 'U',
          'M': 'M', 'F': 'F', 'O': 'O', 'U': 'U'
        };
        updateData.gender = genderMap[updatedPatient.gender.toLowerCase()] || updatedPatient.gender;
      }
      if (updatedPatient.ssn) updateData.ssn = updatedPatient.ssn;
      if (updatedPatient.maritalStatus) updateData.marital_status = updatedPatient.maritalStatus;
      if (updatedPatient.race) updateData.race = updatedPatient.race;
      if (updatedPatient.ethnicity) updateData.ethnicity = updatedPatient.ethnicity;
      if (updatedPatient.language) updateData.language = updatedPatient.language;

      console.log('📝 Update data:', updateData);

      // Update patients table
      const { data: updated, error: patientError } = await supabase
        .from('patients' as any)
        .update(updateData)
        .eq('id', updatedPatient.id)
        .select()
        .single();

      if (patientError) {
        console.error('❌ Error updating patient:', patientError);
        throw new Error(patientError.message || 'Failed to update patient in database');
      }

      console.log('✅ Patient updated successfully:', updated);

      // Update insurance if provided
      if (updatedPatient.insuranceCompany || updatedPatient.insuranceId) {
        // Check if insurance record exists
        const { data: existingInsurance } = await supabase
          .from('patient_insurance' as any)
          .select('id')
          .eq('patient_id', updatedPatient.id)
          .single();

        const insuranceData: any = {
          patient_id: updatedPatient.id,
          primary_insurance_company: updatedPatient.insuranceCompany || updatedPatient.insurance || null,
          primary_insurance_id: updatedPatient.insuranceId || null,
          primary_group_number: updatedPatient.groupNumber || null,
          primary_policy_holder_name: updatedPatient.policyHolderName || null,
          primary_policy_holder_relationship: updatedPatient.policyHolderRelationship || null,
          secondary_insurance_company: updatedPatient.secondaryInsurance || null,
          secondary_insurance_id: updatedPatient.secondaryInsuranceId || null,
        };

        if (existingInsurance) {
          // Update existing insurance
          await supabase
            .from('patient_insurance' as any)
            .update(insuranceData)
            .eq('patient_id', updatedPatient.id);
        } else {
          // Insert new insurance record
          await supabase
            .from('patient_insurance' as any)
            .insert(insuranceData);
        }
      }

      // Update medical history if provided
      if (updatedPatient.medicalInfo) {
        const allergies = updatedPatient.medicalInfo.allergies || [];
        const medications = updatedPatient.medicalInfo.medications || [];
        const conditions = updatedPatient.medicalInfo.conditions || [];
        const surgeries = (updatedPatient.previousSurgeries || '')
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s);
        const familyHistory = (updatedPatient.familyHistory || '')
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s);

        // Check if medical history exists
        const { data: existingHistory } = await supabase
          .from('patient_medical_history' as any)
          .select('id')
          .eq('patient_id', updatedPatient.id)
          .single();

        const medicalHistoryData: any = {
          patient_id: updatedPatient.id,
          allergies,
          medications,
          conditions,
          surgeries,
          family_history: familyHistory,
        };

        if (existingHistory) {
          // Update existing medical history
          await supabase
            .from('patient_medical_history' as any)
            .update(medicalHistoryData)
            .eq('patient_id', updatedPatient.id);
        } else {
          // Insert new medical history
          await supabase
            .from('patient_medical_history' as any)
            .insert(medicalHistoryData);
        }
      }

      // Transform updated database record to match component format
      const transformedPatient = {
        id: updated.id,
        name: `${updated.first_name || ''} ${updated.last_name || ''}`.trim(),
        age: updatedPatient.age, // Keep calculated age
        dateOfBirth: updated.date_of_birth,
        phone: updated.phone_primary || updated.phone || '',
        email: updated.email,
        address: [
          updated.address_line1,
          updated.city,
          updated.state,
          updated.zip_code,
        ].filter(Boolean).join(', '),
        city: updated.city,
        state: updated.state,
        zipCode: updated.zip_code,
        insurance: updatedPatient.insurance || updatedPatient.insuranceCompany || '',
        status: updated.status || 'active',
        emergencyContact: {
          name: updated.emergency_contact_name,
          phone: updated.emergency_contact_phone,
          relation: updated.emergency_contact_relationship || updated.emergency_contact_relation || '',
        },
        medicalInfo: updatedPatient.medicalInfo || { allergies: [], medications: [], conditions: [] },
        appointments: updatedPatient.appointments || [],
        documents: updatedPatient.documents || [],
        nextAppointment: updatedPatient.nextAppointment || null,
        totalVisits: updatedPatient.totalVisits || 0,
        outstandingBalance: updatedPatient.outstandingBalance || 0,
        riskLevel: updatedPatient.riskLevel || 'low',
        preferredProvider: updatedPatient.preferredProvider || '',
        lastVisit: updatedPatient.lastVisit || '',
        // Additional fields
        patient_id: updated.patient_id,
        gender: updated.gender,
        ssn: updated.ssn,
        maritalStatus: updated.marital_status,
        race: updated.race,
        ethnicity: updated.ethnicity,
        language: updated.language,
      };

      // Update local state
      setPatients(prev => prev.map(p => p.id === transformedPatient.id ? transformedPatient : p));
      setSelectedPatient(transformedPatient);
    setShowEditForm(false);
      
      toast({ 
        title: 'Success', 
        description: 'Patient information updated successfully in database.' 
      });

      // Refresh patients list to ensure consistency
      await fetchPatientsFromDatabase();
    } catch (error: any) {
      console.error('💥 Error updating patient:', error);
      toast({ 
        title: 'Error updating patient', 
        description: error.message || 'Failed to update patient. Please try again.',
        variant: 'destructive',
        duration: 5000
      });
      throw error; // Re-throw so EditPatientForm can handle it
    }
  };

  const handleNewPatient = async (newPatient: any) => {
    try {
      // Generate external patient_id string
      const externalId = `PAT-${Date.now().toString().slice(-6)}`;

      // Extract first and last name properly
      let firstName = newPatient.firstName || '';
      let lastName = newPatient.lastName || '';
      
      // If name is provided as full name, split it
      if (!firstName && !lastName && newPatient.name) {
        const nameParts = newPatient.name.trim().split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }

      // Validate required fields
      if (!firstName.trim()) {
        throw new Error('First name is required');
      }
      if (!lastName.trim()) {
        throw new Error('Last name is required');
      }
      if (!newPatient.dateOfBirth) {
        throw new Error('Date of birth is required');
      }

      // Prepare insert data - only include required fields first, then add optional ones
      const insertData: any = {
        patient_id: externalId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: newPatient.dateOfBirth,
        status: 'active',
      };

      // Add optional fields only if they have values (to avoid column errors)
      // Map gender values to match database enum (if it's an enum) or keep as-is
      if (newPatient.gender) {
        // Map common gender values to database format
        const genderMap: Record<string, string> = {
          'male': 'M',
          'female': 'F',
          'other': 'O',
          'prefer-not-to-say': 'U',
          'M': 'M',
          'F': 'F',
          'O': 'O',
          'U': 'U'
        };
        insertData.gender = genderMap[newPatient.gender.toLowerCase()] || newPatient.gender;
      }
      if (newPatient.ssn) insertData.ssn = newPatient.ssn;
      if (newPatient.maritalStatus) insertData.marital_status = newPatient.maritalStatus;
      if (newPatient.race) insertData.race = newPatient.race;
      if (newPatient.ethnicity) insertData.ethnicity = newPatient.ethnicity;
      if (newPatient.language) insertData.language = newPatient.language;
      if (newPatient.phone) insertData.phone = newPatient.phone;
      if (newPatient.email) insertData.email = newPatient.email;
      if (newPatient.address) insertData.address_line1 = newPatient.address;
      if (newPatient.city) insertData.city = newPatient.city;
      if (newPatient.state) insertData.state = newPatient.state;
      if (newPatient.zipCode) insertData.zip_code = newPatient.zipCode;
      if (newPatient.emergencyContact?.name) insertData.emergency_contact_name = newPatient.emergencyContact.name;
      if (newPatient.emergencyContact?.phone) insertData.emergency_contact_phone = newPatient.emergencyContact.phone;
      if (newPatient.emergencyContact?.relation) insertData.emergency_contact_relation = newPatient.emergencyContact.relation;

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        insertData.user_id = user.id;
      }

      console.log('Inserting patient data:', insertData);
      console.log('User authenticated:', !!user);

      // Insert into patients table
      const { data: created, error } = await supabase
        .from('patients' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        // Provide more detailed error message
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          throw new Error('The patients table does not exist. Please run the database schema SQL file first.');
        } else if (error.code === '22P02' || error.message?.includes('invalid input value for enum')) {
          // Enum value error
          const enumMatch = error.message?.match(/enum (\w+): "([^"]+)"/);
          if (enumMatch) {
            throw new Error(`Invalid value "${enumMatch[2]}" for ${enumMatch[1]}. Please check the allowed values in the database.`);
          }
          throw new Error(`Invalid enum value: ${error.message}`);
        } else if (error.code === 'PGRST204' || error.message?.includes('Could not find') || error.message?.includes('column')) {
          // Column not found - table structure mismatch
          const columnName = error.message?.match(/column ['"]([^'"]+)['"]/)?.[1] || 'unknown';
          throw new Error(`Column '${columnName}' not found in patients table. The table structure may not match the expected schema. Please check your database schema.`);
        } else if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('policy')) {
          throw new Error('Permission denied. Please check Row Level Security (RLS) policies for the patients table.');
        } else if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
          throw new Error('A patient with this ID already exists. Please try again.');
        } else {
          throw new Error(error.message || `Database error: ${error.code || 'Unknown error'}`);
        }
      }

      // Insert insurance if provided
      if (newPatient.insurance || newPatient.insuranceId) {
        await supabase.from('patient_insurance' as any).insert({
          patient_id: (created as any).id,
          primary_insurance_company: newPatient.insurance || newPatient.insuranceCompany || null,
          primary_insurance_id: newPatient.insuranceId || null,
          primary_group_number: newPatient.groupNumber || null,
          primary_policy_holder_name: newPatient.policyHolderName || null,
          primary_policy_holder_relationship: newPatient.policyHolderRelationship || null,
          secondary_insurance_company: newPatient.secondaryInsurance || null,
          secondary_insurance_id: newPatient.secondaryInsuranceId || null,
        });
      }

      // Insert medical history if provided
      const allergies = newPatient.medicalInfo?.allergies || [];
      const medications = newPatient.medicalInfo?.medications || [];
      const conditions = newPatient.medicalInfo?.conditions || [];
      const surgeries = (newPatient.previousSurgeries || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s);
      const familyHistory = (newPatient.familyHistory || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s);

      if (allergies.length || medications.length || conditions.length || surgeries.length || familyHistory.length) {
        await supabase.from('patient_medical_history' as any).insert({
          patient_id: (created as any).id,
          allergies,
          medications,
          conditions,
          surgeries,
          family_history: familyHistory,
        });
      }

      // Helper function to calculate accurate age
      const calculateAge = (dateOfBirth: string): number | null => {
        if (!dateOfBirth) return null;
        try {
          const birthDate = new Date(dateOfBirth);
          const today = new Date();
          if (isNaN(birthDate.getTime()) || birthDate > today) return 0;
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age >= 0 ? age : 0;
        } catch {
          return null;
        }
      };

      // Update local state with a simplified patient card
      const patientCard = {
        id: (created as any).id,
        name: `${(created as any).first_name} ${(created as any).last_name}`.trim(),
        age: calculateAge((created as any).date_of_birth),
        dateOfBirth: (created as any).date_of_birth,
        phone: (created as any).phone,
        email: (created as any).email,
        address: [
          (created as any).address_line1,
          (created as any).city,
          (created as any).state,
          (created as any).zip_code,
        ].filter(Boolean).join(', '),
        insurance: newPatient.insurance || newPatient.insuranceCompany || '',
        status: (created as any).status,
        emergencyContact: {
          name: (created as any).emergency_contact_name,
          phone: (created as any).emergency_contact_phone,
          relation: (created as any).emergency_contact_relation,
        },
        medicalInfo: newPatient.medicalInfo || { allergies: [], medications: [], conditions: [] },
        appointments: [],
        documents: [],
        nextAppointment: null,
        totalVisits: 0,
        outstandingBalance: 0,
        riskLevel: 'low' as const,
        preferredProvider: '',
        lastVisit: '',
      };

      // Refresh patients list from database to include the new patient
      await fetchPatientsFromDatabase();
      
      setShowRegistrationForm(false);
      setSelectedPatient(patientCard);
      setActiveTab('dashboard');
      toast({ 
        title: 'Success', 
        description: 'Patient saved to database and will persist after refresh.' 
      });
    } catch (e: any) {
      console.error('Error saving patient:', e);
      const errorMessage = e.message || 'Unknown error occurred while saving patient';
      toast({ 
        title: 'Error saving patient', 
        description: errorMessage,
        variant: 'destructive',
        duration: 5000 // Show longer for important errors
      });
    }
  };

  const handleScheduleAppointment = async (appointment: any) => {
    try {
      if (!selectedPatient) return;
      await supabase.from('appointments' as any).insert({
        patient_id: selectedPatient.id,
        patient_id_string: null,
        appointment_type: appointment.appointmentType || null,
        scheduled_date: appointment.appointmentDate,
        scheduled_time: appointment.appointmentTime,
        duration_minutes: appointment.duration || 30,
        status: 'scheduled',
        location: appointment.location || null,
        notes: appointment.notes || null,
      });
      const updatedPatient = {
        ...selectedPatient,
        appointments: [...(selectedPatient.appointments || []), appointment]
      };
      handlePatientUpdate(updatedPatient);
      toast({ title: 'Success', description: 'Appointment scheduled.' });
    } catch (e: any) {
      toast({ title: 'Error scheduling appointment', description: e.message, variant: 'destructive' });
    } finally {
      setShowScheduleAppointmentForm(false);
    }
  };

  const handleVitalSignsSave = async (vitals: any) => {
    try {
      if (!selectedPatient) return;
      await supabase.from('patient_vital_signs' as any).insert({
        patient_id: selectedPatient.id,
        blood_pressure_systolic: vitals.bloodPressure?.systolic ?? null,
        blood_pressure_diastolic: vitals.bloodPressure?.diastolic ?? null,
        heart_rate: vitals.heartRate ?? null,
        temperature: vitals.temperature ?? null,
        respiratory_rate: vitals.respiratoryRate ?? null,
        oxygen_saturation: vitals.oxygenSaturation ?? null,
        weight: vitals.weight ?? null,
        height: vitals.height ?? null,
        bmi: vitals.bmi ?? null,
        pain_level: vitals.painLevel ?? null,
        notes: vitals.notes || null,
        recorded_by: vitals.recordedBy || 'Current User',
        timestamp: vitals.timestamp || new Date().toISOString(),
      });
      toast({ title: 'Success', description: 'Vital signs saved to database.' });
    } catch (e: any) {
      toast({ title: 'Error saving vital signs', description: e.message, variant: 'destructive' });
    } finally {
      setShowVitalSignsForm(false);
    }
  };

  const handleProgressNotesSave = async (notes: any) => {
    try {
      if (!selectedPatient) return;
      await supabase.from('patient_progress_notes' as any).insert({
        patient_id: selectedPatient.id,
        note_type: notes.noteType || null,
        note_date: notes.noteDate || new Date().toISOString().split('T')[0],
        note_time: notes.noteTime || null,
        provider: notes.provider || null,
        chief_complaint: notes.chiefComplaint || null,
        history_of_present_illness: notes.historyOfPresentIllness || null,
        review_of_systems: notes.reviewOfSystems || null,
        physical_examination: notes.physicalExamination || null,
        assessment: notes.assessment || null,
        plan: notes.plan || null,
        medications: notes.medications || null,
        follow_up: notes.followUp || null,
        vital_signs: notes.vitalSigns || null,
        allergies: notes.allergies || null,
        social_history: notes.socialHistory || null,
        family_history: notes.familyHistory || null,
        created_by: 'Current User',
      });
      toast({ title: 'Success', description: 'Progress note saved.' });
    } catch (e: any) {
      toast({ title: 'Error saving progress note', description: e.message, variant: 'destructive' });
    } finally {
      setShowProgressNotesForm(false);
    }
  };

  const handleTreatmentPlanSave = async (plan: any) => {
    try {
      if (!selectedPatient) return;
      await supabase.from('patient_treatment_plans' as any).insert({
        patient_id: selectedPatient.id,
        plan_date: plan.planDate || new Date().toISOString().split('T')[0],
        provider: plan.provider || null,
        diagnosis: plan.diagnosis || null,
        treatment_goals: plan.treatmentGoals || null,
        treatment_plan: plan.treatmentPlan || null,
        medications: plan.medications || null,
        procedures: plan.procedures || null,
        lifestyle_modifications: plan.lifestyleModifications || null,
        follow_up_schedule: plan.followUpSchedule || null,
        expected_outcome: plan.expectedOutcome || null,
        risk_factors: plan.riskFactors || null,
        contraindications: plan.contraindications || null,
        patient_education: plan.patientEducation || null,
        additional_notes: plan.additionalNotes || null,
        created_by: 'Current User',
      });
      toast({ title: 'Success', description: 'Treatment plan saved.' });
    } catch (e: any) {
      toast({ title: 'Error saving treatment plan', description: e.message, variant: 'destructive' });
    } finally {
      setShowTreatmentPlanForm(false);
    }
  };

  const handleDocumentUpload = async (document: any) => {
    try {
      if (!selectedPatient) return;
      await supabase.from('patient_documents' as any).insert({
        patient_id: selectedPatient.id,
        document_type: 'medical_record',
        document_name: document.documentName,
        description: document.description || null,
        file_name: document.fileName || null,
        file_size: document.fileSize || null,
        file_type: document.fileType || null,
        file_url: null,
        uploaded_by: document.uploadedBy || null,
        upload_date: document.uploadDate || new Date().toISOString().split('T')[0],
      });
      toast({ title: 'Success', description: 'Document saved.' });
    } catch (e: any) {
      toast({ title: 'Error saving document', description: e.message, variant: 'destructive' });
    } finally {
      setShowDocumentUploadForm(false);
    }
  };

  const handleMessageSend = async (message: any) => {
    try {
      if (!selectedPatient) return;
      await supabase.from('patient_messages' as any).insert({
        patient_id: selectedPatient.id,
        message_type: message.messageType || 'other',
        subject: message.subject,
        message: message.message,
        priority: message.priority || 'normal',
        send_method: message.sendMethod,
        scheduled_send: !!message.scheduledSend,
        scheduled_time: message.scheduledTime || null,
        sender: message.sender,
        status: 'sent',
        attachments: [],
      });
      toast({ title: 'Success', description: 'Message saved.' });
    } catch (e: any) {
      toast({ title: 'Error saving message', description: e.message, variant: 'destructive' });
    } finally {
      setShowMessagingForm(false);
    }
  };

  const handleContactSave = async (contactData: any) => {
    try {
      if (!selectedPatient) return;
      await supabase
        .from('patients' as any)
        .update({
          phone: contactData.phone,
          email: contactData.email,
          address_line1: contactData.address,
          city: contactData.city,
          state: contactData.state,
          zip_code: contactData.zipCode,
          emergency_contact_name: contactData.emergencyContact?.name || null,
          emergency_contact_phone: contactData.emergencyContact?.phone || null,
          emergency_contact_relation: contactData.emergencyContact?.relation || null,
        })
        .eq('id', selectedPatient.id);
      const updatedPatient = {
        ...selectedPatient,
        phone: contactData.phone,
        email: contactData.email,
        address: [contactData.address, contactData.city, contactData.state, contactData.zipCode].filter(Boolean).join(', '),
        emergencyContact: contactData.emergencyContact,
      };
      handlePatientUpdate(updatedPatient);
      toast({ title: 'Success', description: 'Contact information updated.' });
    } catch (e: any) {
      toast({ title: 'Error updating contact', description: e.message, variant: 'destructive' });
    } finally {
      setShowEditContactForm(false);
    }
  };

  const handleInsuranceSave = async (insuranceData: any) => {
    try {
      if (!selectedPatient) return;
      await supabase.from('patient_insurance' as any).insert({
        patient_id: selectedPatient.id,
        primary_insurance_company: insuranceData.insurance_company,
        primary_insurance_id: insuranceData.insurance_id,
        primary_group_number: insuranceData.group_number || null,
        primary_policy_holder_name: insuranceData.policy_holder_name || null,
        primary_policy_holder_relationship: insuranceData.policy_holder_relationship || null,
        primary_effective_date: insuranceData.effective_date || null,
        primary_expiration_date: insuranceData.expiration_date || null,
        secondary_insurance_company: insuranceData.secondary_insurance_company || null,
        secondary_insurance_id: insuranceData.secondary_insurance_id || null,
        secondary_group_number: insuranceData.secondary_group_number || null,
        secondary_policy_holder_name: insuranceData.secondary_policy_holder_name || null,
        secondary_policy_holder_relationship: insuranceData.secondary_policy_holder_relationship || null,
      });
      const updatedPatient = {
        ...selectedPatient,
        insurance: insuranceData.insurance_company
      };
      handlePatientUpdate(updatedPatient);
      toast({ title: 'Success', description: 'Insurance information saved.' });
    } catch (e: any) {
      toast({ title: 'Error saving insurance', description: e.message, variant: 'destructive' });
    } finally {
      setShowEditInsuranceForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="h-8 w-8 mr-3 text-blue-600" />
                Patient Management
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive patient care and management system
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowRegistrationForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Register New Patient
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white shadow-lg border border-gray-200 p-1 rounded-xl">
            <TabsTrigger 
              value="search" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6"
            >
              <Search className="h-4 w-4 mr-2" />
              Patient Search
            </TabsTrigger>
            {selectedPatient && (
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6"
              >
                <FileText className="h-4 w-4 mr-2" />
                Patient Dashboard
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <PatientSearchSystem
              patients={patients}
              onPatientSelect={handlePatientSelect}
              isLoadingPatients={isLoading}
              isConnected={true}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            {selectedPatient ? (
              <PatientDashboard
                patient={selectedPatient}
                onEdit={() => setShowEditForm(true)}
                onScheduleAppointment={() => setShowScheduleAppointmentForm(true)}
                onViewMedicalHistory={() => setShowMedicalHistoryForm(true)}
                onVitalSigns={() => setShowVitalSignsForm(true)}
                onProgressNotes={() => setShowProgressNotesForm(true)}
                onTreatmentPlan={() => setShowTreatmentPlanForm(true)}
                onSendMessage={() => setShowMessagingForm(true)}
                onVerifyCoverage={() => console.log('Verify coverage')}
                onDownloadCard={() => console.log('Download card')}
                onUploadDocument={() => setShowDocumentUploadForm(true)}
                onViewDocument={(docName) => console.log('View document:', docName)}
                onDownloadDocument={(docName) => console.log('Download document:', docName)}
                onEditContact={() => setShowEditContactForm(true)}
                onEditInsurance={() => setShowEditInsuranceForm(true)}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Patient Selected</h3>
                  <p className="text-gray-600">Please select a patient from the search tab to view their dashboard.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Forms */}
        {showRegistrationForm && (
          <PatientRegistrationForm
            isOpen={showRegistrationForm}
            onClose={() => setShowRegistrationForm(false)}
            onSubmit={handleNewPatient}
          />
        )}

        {showEditForm && selectedPatient && (
          <EditPatientForm
            patient={selectedPatient}
            isOpen={showEditForm}
            onClose={() => setShowEditForm(false)}
            onSave={handlePatientUpdate}
          />
        )}

        {showMedicalHistoryForm && selectedPatient && (
          <MedicalHistoryForm
            patientId={selectedPatient.id}
            patientName={selectedPatient.name}
            isOpen={showMedicalHistoryForm}
            onClose={() => setShowMedicalHistoryForm(false)}
            onSubmit={async (data) => {
              try {
                await supabase.from('patient_medical_history' as any).insert({
                  patient_id: selectedPatient.id,
                  allergies: data.allergies || [],
                  medications: data.medications || [],
                  conditions: data.conditions || [],
                  surgeries: data.surgeries || [],
                  family_history: data.familyHistory || [],
                });
                toast({ title: 'Success', description: 'Medical history saved.' });
              } catch (e: any) {
                toast({ title: 'Error saving medical history', description: e.message, variant: 'destructive' });
              } finally {
                setShowMedicalHistoryForm(false);
              }
            }}
          />
        )}

        {showVitalSignsForm && selectedPatient && (
          <VitalSignsForm
            patientId={selectedPatient.id}
            patientName={selectedPatient.name}
            isOpen={showVitalSignsForm}
            onClose={() => setShowVitalSignsForm(false)}
            onSave={handleVitalSignsSave}
          />
        )}

        {showProgressNotesForm && selectedPatient && (
          <ProgressNotesForm
            patientId={selectedPatient.id}
            patientName={selectedPatient.name}
            isOpen={showProgressNotesForm}
            onClose={() => setShowProgressNotesForm(false)}
            onSave={handleProgressNotesSave}
          />
        )}

        {showTreatmentPlanForm && selectedPatient && (
          <TreatmentPlanForm
            patientId={selectedPatient.id}
            patientName={selectedPatient.name}
            isOpen={showTreatmentPlanForm}
            onClose={() => setShowTreatmentPlanForm(false)}
            onSave={handleTreatmentPlanSave}
          />
        )}

        {showScheduleAppointmentForm && selectedPatient && (
          <ScheduleAppointmentForm
            patientId={selectedPatient.id}
            patientName={selectedPatient.name}
            isOpen={showScheduleAppointmentForm}
            onClose={() => setShowScheduleAppointmentForm(false)}
            onSchedule={handleScheduleAppointment}
          />
        )}

        {showDocumentUploadForm && selectedPatient && (
          <DocumentUploadForm
            patientId={selectedPatient.id}
            patientName={selectedPatient.name}
            isOpen={showDocumentUploadForm}
            onClose={() => setShowDocumentUploadForm(false)}
            onUpload={handleDocumentUpload}
          />
        )}

        {showMessagingForm && selectedPatient && (
          <MessagingForm
            patientId={selectedPatient.id}
            patientName={selectedPatient.name}
            isOpen={showMessagingForm}
            onClose={() => setShowMessagingForm(false)}
            onSend={handleMessageSend}
          />
        )}

        {showEditContactForm && selectedPatient && (
          <EditContactForm
            patientId={selectedPatient.id}
            currentData={selectedPatient}
            isOpen={showEditContactForm}
            onClose={() => setShowEditContactForm(false)}
            onSave={handleContactSave}
          />
        )}

        {showEditInsuranceForm && selectedPatient && (
          <EditInsuranceForm
            patientId={selectedPatient.id}
            currentData={selectedPatient}
            isOpen={showEditInsuranceForm}
            onClose={() => setShowEditInsuranceForm(false)}
            onSave={handleInsuranceSave}
          />
        )}
      </div>
    </div>
  );
}
