import React, { useState, useEffect } from 'react';
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

  const handleNewPatient = (newPatient: any) => {
    setPatients(prev => [...prev, newPatient]);
    setShowRegistrationForm(false);
    setSelectedPatient(newPatient);
    setActiveTab('dashboard');
  };

  const handleScheduleAppointment = (appointment: any) => {
    if (selectedPatient) {
      const updatedPatient = {
        ...selectedPatient,
        appointments: [...selectedPatient.appointments, appointment]
      };
      handlePatientUpdate(updatedPatient);
    }
    setShowScheduleAppointmentForm(false);
  };

  const handleVitalSignsSave = (vitals: any) => {
    console.log('Vital signs saved:', vitals);
    setShowVitalSignsForm(false);
  };

  const handleProgressNotesSave = async (notes: any) => {
    console.log('Progress notes saved:', notes);
    setShowProgressNotesForm(false);
  };

  const handleTreatmentPlanSave = async (plan: any) => {
    console.log('Treatment plan saved:', plan);
    setShowTreatmentPlanForm(false);
  };

  const handleDocumentUpload = async (document: any) => {
    console.log('Document uploaded:', document);
    setShowDocumentUploadForm(false);
  };

  const handleMessageSend = async (message: any) => {
    console.log('Message sent:', message);
    setShowMessagingForm(false);
  };

  const handleContactSave = async (contactData: any) => {
    if (selectedPatient) {
      const updatedPatient = {
        ...selectedPatient,
        ...contactData
      };
      handlePatientUpdate(updatedPatient);
    }
    setShowEditContactForm(false);
  };

  const handleInsuranceSave = async (insuranceData: any) => {
    if (selectedPatient) {
      const updatedPatient = {
        ...selectedPatient,
        insurance: insuranceData.insurance_company
      };
      handlePatientUpdate(updatedPatient);
    }
    setShowEditInsuranceForm(false);
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
            onSubmit={(data) => console.log('Medical history:', data)}
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
