import React, { useState, useEffect } from 'react';
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

// Mock data for demonstration - in real app this would come from your database
const mockPatients = [
  {
    id: '1',
    name: 'John Doe',
    age: 45,
    dateOfBirth: '1978-05-15',
    phone: '(555) 123-4567',
    email: 'john.doe@email.com',
    address: '123 Main St, Anytown, ST 12345',
    insurance: 'Blue Cross Blue Shield',
    status: 'active' as const,
    emergencyContact: {
      name: 'Jane Doe',
      phone: '(555) 987-6543',
      relation: 'Spouse'
    },
    medicalInfo: {
      allergies: ['Penicillin', 'Shellfish'],
      medications: ['Lisinopril 10mg', 'Metformin 500mg'],
      conditions: ['Hypertension', 'Type 2 Diabetes']
    },
    appointments: [
      {
        date: '2024-01-15',
        time: '10:00 AM',
        type: 'Follow-up',
        status: 'confirmed',
        provider: 'Dr. Smith'
      },
      {
        date: '2024-02-01',
        time: '2:00 PM',
        type: 'Annual Physical',
        status: 'scheduled',
        provider: 'Dr. Johnson'
      }
    ],
    documents: [
      {
        name: 'Lab Results - Jan 2024',
        type: 'Lab Report',
        date: '2024-01-10'
      },
      {
        name: 'Insurance Card',
        type: 'Insurance',
        date: '2023-12-01'
      }
    ],
    nextAppointment: '2024-01-15',
    totalVisits: 12,
    outstandingBalance: 150.00,
    riskLevel: 'medium' as const,
    preferredProvider: 'Dr. Smith'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    age: 32,
    dateOfBirth: '1991-08-22',
    phone: '(555) 234-5678',
    email: 'sarah.wilson@email.com',
    address: '456 Oak Ave, Somewhere, ST 67890',
    insurance: 'Aetna',
    status: 'active' as const,
    emergencyContact: {
      name: 'Mike Wilson',
      phone: '(555) 876-5432',
      relation: 'Brother'
    },
    medicalInfo: {
      allergies: [],
      medications: ['Prenatal Vitamins'],
      conditions: ['Pregnancy']
    },
    appointments: [
      {
        date: '2024-01-20',
        time: '9:00 AM',
        type: 'Prenatal Checkup',
        status: 'confirmed',
        provider: 'Dr. Brown'
      }
    ],
    documents: [
      {
        name: 'Ultrasound Report',
        type: 'Imaging',
        date: '2024-01-05'
      }
    ],
    nextAppointment: '2024-01-20',
    totalVisits: 8,
    outstandingBalance: 0,
    riskLevel: 'low' as const,
    preferredProvider: 'Dr. Brown'
  }
];

export function Patients() {
  const [activeTab, setActiveTab] = useState('search');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patients, setPatients] = useState(mockPatients);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const handlePatientUpdate = (updatedPatient: any) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    setSelectedPatient(updatedPatient);
    setShowEditForm(false);
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

      // Update local state with a simplified patient card
      const patientCard = {
        id: (created as any).id,
        name: `${(created as any).first_name} ${(created as any).last_name}`.trim(),
        age: new Date().getFullYear() - new Date((created as any).date_of_birth).getFullYear(),
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

      setPatients(prev => [...prev, patientCard]);
      setShowRegistrationForm(false);
      setSelectedPatient(patientCard);
      setActiveTab('dashboard');
      toast({ title: 'Success', description: 'Patient saved to database.' });
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
