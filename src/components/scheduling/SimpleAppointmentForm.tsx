import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, UserPlus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface SimpleAppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  existingAppointment?: any; // Appointment to edit (optional)
}

export function SimpleAppointmentForm({ isOpen, onClose, onSave, existingAppointment }: SimpleAppointmentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    provider_id: '',
    appointment_type: 'consultation',
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '09:00',
    duration_minutes: 30,
    status: 'scheduled',
    location: '',
    notes: ''
  });

  const [providers, setProviders] = useState<any[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);

  const [quickAddData, setQuickAddData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    typeOfVisit: 'consultation',
    primaryInsurance: '',
    primaryInsuranceId: '',
    secondaryInsurance: '',
    secondaryInsuranceId: '',
    icd: '',
    cpt: ''
  });

  // Search for patients
  useEffect(() => {
    const searchPatients = async () => {
      // Don't search if a patient is already selected (to avoid re-searching when displaying selected patient)
      if (selectedPatient) {
        return;
      }

      if (!searchTerm || searchTerm.length < 1) {
        setFilteredPatients([]);
        setShowQuickAdd(false);
        return;
      }

      setIsSearching(true);
      try {
        const searchTermLower = searchTerm.toLowerCase().trim();
        
        // Search in patients table by first_name, last_name, and patient_id
        // Use ilike for case-insensitive search
        const { data: patientsData, error } = await supabase
          .from('patients' as any)
          .select('id, patient_id, first_name, last_name, phone, email, date_of_birth')
          .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,patient_id.ilike.%${searchTerm}%`)
          .limit(20);

        if (error) {
          console.error('Search error:', error);
          throw error;
        }

        // Map to patient objects
        let patients = (patientsData || []).map((patient: any) => {
          return {
            id: patient.id, // UUID from patients table
            patient_id: patient.patient_id, // Patient ID like PAT-123456
            name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim(),
            firstName: patient.first_name,
            lastName: patient.last_name,
            email: patient.email || '',
            phone: patient.phone || '',
            dateOfBirth: patient.date_of_birth
          };
        });

        // Prioritize exact matches
        patients = patients.sort((a, b) => {
          const searchLower = searchTermLower;
          const aIdLower = (a.patient_id || '').toLowerCase();
          const bIdLower = (b.patient_id || '').toLowerCase();
          const aNameLower = a.name.toLowerCase();
          const bNameLower = b.name.toLowerCase();
          
          // Exact ID match first
          if (aIdLower === searchLower && bIdLower !== searchLower) return -1;
          if (bIdLower === searchLower && aIdLower !== searchLower) return 1;
          
          // Then starts with match
          if (aIdLower.startsWith(searchLower) && !bIdLower.startsWith(searchLower)) return -1;
          if (bIdLower.startsWith(searchLower) && !aIdLower.startsWith(searchLower)) return 1;
          
          // Then name starts with
          if (aNameLower.startsWith(searchLower) && !bNameLower.startsWith(searchLower)) return -1;
          if (bNameLower.startsWith(searchLower) && !aNameLower.startsWith(searchLower)) return 1;
          
          return 0;
        });

        console.log('Search results for "' + searchTerm + '":', patients);
        setFilteredPatients(patients);
        
        // Don't show quick add if:
        // 1. A patient is already selected, OR
        // 2. Search term looks like a selected patient display format (contains "(" and "PAT-"), OR
        // 3. Patients were found
        const looksLikeSelectedPatient = searchTerm.includes('(') && searchTerm.includes('PAT-');
        setShowQuickAdd(
          !selectedPatient && 
          !looksLikeSelectedPatient && 
          patients.length === 0 && 
          searchTerm.length >= 2
        );
      } catch (error) {
        console.error('Error searching patients:', error);
        setFilteredPatients([]);
        // Only show quick add on error if search term is substantial and doesn't look like selected patient
        const looksLikeSelectedPatient = searchTerm.includes('(') && searchTerm.includes('PAT-');
        setShowQuickAdd(!selectedPatient && !looksLikeSelectedPatient && searchTerm.length >= 2);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchPatients();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedPatient]);

  // Fetch providers on component mount
  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoadingProviders(true);
      try {
        const { data, error } = await supabase
          .from('providers' as any)
          .select('id, npi, first_name, last_name, title')
          .eq('is_active', true)
          .order('last_name', { ascending: true })
          .limit(100);

        if (error) {
          console.error('Error fetching providers:', error);
          // If providers table doesn't exist or error, set empty array
          setProviders([]);
        } else {
          setProviders(data || []);
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
        setProviders([]);
      } finally {
        setIsLoadingProviders(false);
      }
    };

    if (isOpen) {
      fetchProviders();
    }
  }, [isOpen]);

  // Pre-fill form when editing an existing appointment
  useEffect(() => {
    if (existingAppointment && isOpen) {
      console.log('📝 Pre-filling form with existing appointment:', existingAppointment);
      
      // Set form data from existing appointment
      setFormData({
        patient_id: existingAppointment.patient_id || '',
        provider_id: existingAppointment.provider_id || '',
        appointment_type: existingAppointment.appointment_type || 'consultation',
        scheduled_date: existingAppointment.scheduled_date || new Date().toISOString().split('T')[0],
        scheduled_time: existingAppointment.scheduled_time || '09:00',
        duration_minutes: existingAppointment.duration_minutes || 30,
        status: existingAppointment.status || 'scheduled',
        location: existingAppointment.location || '',
        notes: existingAppointment.notes || ''
      });

      // Set selected patient if patient data exists
      if (existingAppointment.patient) {
        const patientObj = {
          id: existingAppointment.patient.id || existingAppointment.patient_id,
          patient_id: existingAppointment.patient.patient_id || existingAppointment.patient.id,
          name: `${existingAppointment.patient.first_name || ''} ${existingAppointment.patient.last_name || ''}`.trim(),
          firstName: existingAppointment.patient.first_name,
          lastName: existingAppointment.patient.last_name,
          email: existingAppointment.patient.email || '',
          phone: existingAppointment.patient.phone || '',
          dateOfBirth: existingAppointment.patient.date_of_birth
        };
        setSelectedPatient(patientObj);
        setSearchTerm(`${patientObj.name} (${patientObj.patient_id || patientObj.id})`);
      } else if (existingAppointment.patient_id) {
        // If patient data not loaded, fetch it
        const fetchPatient = async () => {
          try {
            const { data: patientData, error } = await supabase
              .from('patients' as any)
              .select('id, patient_id, first_name, last_name, phone, email, date_of_birth')
              .eq('id', existingAppointment.patient_id)
              .single();

            if (patientData && !error) {
              const patient = patientData as any;
              const patientObj = {
                id: patient.id,
                patient_id: patient.patient_id,
                name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim(),
                firstName: patient.first_name,
                lastName: patient.last_name,
                email: patient.email || '',
                phone: patient.phone || '',
                dateOfBirth: patient.date_of_birth
              };
              setSelectedPatient(patientObj);
              setSearchTerm(`${patientObj.name} (${patientObj.patient_id || patientObj.id})`);
            }
          } catch (error) {
            console.error('Error fetching patient for edit:', error);
          }
        };
        fetchPatient();
      }
    } else if (isOpen && !existingAppointment) {
      // Reset form when opening for new appointment
      setFormData({
        patient_id: '',
        provider_id: '',
        appointment_type: 'consultation',
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '09:00',
        duration_minutes: 30,
        status: 'scheduled',
        location: '',
        notes: ''
      });
      setSelectedPatient(null);
      setSearchTerm('');
    }
  }, [existingAppointment, isOpen]);

  const handlePatientSelect = (patient: any) => {
    // Clear search results and quick add first
    setFilteredPatients([]);
    setShowQuickAdd(false);
    
    // Set selected patient
    setSelectedPatient(patient);
    
    // Use the UUID (id) for patient_id in appointments table
    setFormData({ ...formData, patient_id: patient.id });
    
    // Display patient_id (PAT-123456) in search term, not UUID
    // This is just for display - the search useEffect will skip because selectedPatient is now set
    setSearchTerm(`${patient.name} (${patient.patient_id || patient.id})`);
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to add a patient',
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields
    if (!quickAddData.firstName.trim() || !quickAddData.lastName.trim() || !quickAddData.dob) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields: First Name, Last Name, and Date of Birth',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Generate a patient ID (same format as Patients component)
      const { generatePatientId } = await import('@/utils/patientIdGenerator').catch(() => {
        // Fallback if dynamic import fails
        return { generatePatientId: async () => `PAT-${Date.now()}` };
      });
      const patientId = await generatePatientId();
      
      // Create patient record in patients table
      const { data: newPatient, error: patientError } = await supabase
        .from('patients' as any)
        .insert({
          patient_id: patientId,
          user_id: user.id,
          first_name: quickAddData.firstName.trim(),
          last_name: quickAddData.lastName.trim(),
          date_of_birth: quickAddData.dob,
          status: 'active'
        })
        .select()
        .single();

      if (patientError) {
        console.error('Error creating patient:', patientError);
        throw patientError;
      }

      if (!newPatient || !(newPatient as any).id) {
        throw new Error('Failed to create patient - no ID returned');
      }

      const patientIdUuid = (newPatient as any).id;

      // Save insurance information if provided
      if (quickAddData.primaryInsurance || quickAddData.primaryInsuranceId || 
          quickAddData.secondaryInsurance || quickAddData.secondaryInsuranceId) {
        const { error: insuranceError } = await supabase
          .from('patient_insurance' as any)
          .insert({
            patient_id: patientIdUuid, // Use UUID from patients table
            primary_insurance_company: quickAddData.primaryInsurance || null,
            primary_insurance_id: quickAddData.primaryInsuranceId || null,
            secondary_insurance_company: quickAddData.secondaryInsurance || null,
            secondary_insurance_id: quickAddData.secondaryInsuranceId || null
          });

        if (insuranceError) {
          console.error('Error saving insurance:', insuranceError);
          // Don't throw - patient is already created, just log the error
        }
      }

      // Set the selected patient and update form data
      const patientObj = {
        id: patientIdUuid, // UUID
        patient_id: patientId, // PAT-123456
        name: `${quickAddData.firstName} ${quickAddData.lastName}`,
        firstName: quickAddData.firstName,
        lastName: quickAddData.lastName,
        dob: quickAddData.dob,
        email: '',
        phone: '',
        dateOfBirth: quickAddData.dob
      };

      setSelectedPatient(patientObj);
      setFormData({ 
        ...formData, 
        patient_id: patientIdUuid, // Use UUID for appointments table
        appointment_type: quickAddData.typeOfVisit,
        notes: `ICD: ${quickAddData.icd || 'N/A'}, CPT: ${quickAddData.cpt || 'N/A'}${formData.notes ? '\n' + formData.notes : ''}`
      });
      setSearchTerm(`${quickAddData.firstName} ${quickAddData.lastName} (${patientId})`);
      setShowQuickAdd(false);
      
      toast({
        title: 'Success',
        description: 'Patient added successfully. You can now schedule their appointment.',
      });
    } catch (error: any) {
      console.error('Error creating patient:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create patient. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select or add a patient',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.provider_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select a provider',
        variant: 'destructive',
      });
      return;
    }

    const submitData = {
      ...formData,
      patient: selectedPatient,
      // Include appointment ID if editing
      id: existingAppointment?.id || null
    };

    onSave(submitData);
    handleClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setFilteredPatients([]);
    setSelectedPatient(null);
    setShowQuickAdd(false);
    setQuickAddData({
      firstName: '',
      lastName: '',
      dob: '',
      typeOfVisit: 'consultation',
      primaryInsurance: '',
      primaryInsuranceId: '',
      secondaryInsurance: '',
      secondaryInsuranceId: '',
      icd: '',
      cpt: ''
    });
    setFormData({
      patient_id: '',
      provider_id: '',
      appointment_type: 'consultation',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '09:00',
      duration_minutes: 30,
      status: 'scheduled',
      location: '',
      notes: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existingAppointment ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
          <DialogDescription>
            {existingAppointment 
              ? 'Update the appointment details below.'
              : 'Search for an existing patient or add a new patient to schedule an appointment.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Search */}
          <div className="space-y-2">
            <Label htmlFor="patientSearch">Search Patient</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="patientSearch"
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedPatient(null);
                  setFormData({ ...formData, patient_id: '' });
                }}
                placeholder="Search by patient name or ID..."
                className="pl-10"
              />
            </div>

            {/* Patient Search Results */}
            {filteredPatients.length > 0 && (
              <Card className="mt-2">
                <CardContent className="p-2">
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => handlePatientSelect(patient)}
                        className="p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-sm text-gray-500">{patient.patient_id || patient.id}</div>
                        </div>
                        <Button type="button" variant="ghost" size="sm">
                          Select
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Add Patient Option */}
            {showQuickAdd && searchTerm.length >= 2 && !selectedPatient && (
              <Card className="mt-2 border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">Patient Not Found - Quick Add</h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuickAdd(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={quickAddData.firstName}
                          onChange={(e) => setQuickAddData({ ...quickAddData, firstName: e.target.value })}
                          required
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={quickAddData.lastName}
                          onChange={(e) => setQuickAddData({ ...quickAddData, lastName: e.target.value })}
                          required
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="dob">Date of Birth *</Label>
                        <Input
                          id="dob"
                          type="date"
                          value={quickAddData.dob}
                          onChange={(e) => setQuickAddData({ ...quickAddData, dob: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="typeOfVisit">Type of Visit *</Label>
                        <Select
                          value={quickAddData.typeOfVisit}
                          onValueChange={(value) => setQuickAddData({ ...quickAddData, typeOfVisit: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="follow_up">Follow-up</SelectItem>
                            <SelectItem value="routine_checkup">Routine Checkup</SelectItem>
                            <SelectItem value="physical_therapy">Physical Therapy</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="specialist">Specialist Visit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="font-medium mb-2">Primary Insurance</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="primaryInsurance">Insurance Name</Label>
                          <Input
                            id="primaryInsurance"
                            value={quickAddData.primaryInsurance}
                            onChange={(e) => setQuickAddData({ ...quickAddData, primaryInsurance: e.target.value })}
                            placeholder="Blue Cross Blue Shield"
                          />
                        </div>
                        <div>
                          <Label htmlFor="primaryInsuranceId">Insurance ID</Label>
                          <Input
                            id="primaryInsuranceId"
                            value={quickAddData.primaryInsuranceId}
                            onChange={(e) => setQuickAddData({ ...quickAddData, primaryInsuranceId: e.target.value })}
                            placeholder="123456789"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="font-medium mb-2">Secondary Insurance (Optional)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="secondaryInsurance">Insurance Name</Label>
                          <Input
                            id="secondaryInsurance"
                            value={quickAddData.secondaryInsurance}
                            onChange={(e) => setQuickAddData({ ...quickAddData, secondaryInsurance: e.target.value })}
                            placeholder="Aetna"
                          />
                        </div>
                        <div>
                          <Label htmlFor="secondaryInsuranceId">Insurance ID</Label>
                          <Input
                            id="secondaryInsuranceId"
                            value={quickAddData.secondaryInsuranceId}
                            onChange={(e) => setQuickAddData({ ...quickAddData, secondaryInsuranceId: e.target.value })}
                            placeholder="987654321"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="font-medium mb-2">Diagnosis & Procedure Codes (Optional)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="icd">ICD Code</Label>
                          <Input
                            id="icd"
                            value={quickAddData.icd}
                            onChange={(e) => setQuickAddData({ ...quickAddData, icd: e.target.value })}
                            placeholder="Z00.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cpt">CPT Code</Label>
                          <Input
                            id="cpt"
                            value={quickAddData.cpt}
                            onChange={(e) => setQuickAddData({ ...quickAddData, cpt: e.target.value })}
                            placeholder="99213"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowQuickAdd(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button"
                        onClick={handleQuickAddSubmit}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Patient & Continue
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Selected Patient Display */}
            {selectedPatient && (
              <Card className="mt-2 border-green-200 bg-green-50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-green-900">
                        {selectedPatient.name || `${selectedPatient.firstName} ${selectedPatient.lastName}`}
                      </div>
                      <div className="text-sm text-green-700">ID: {selectedPatient.patient_id || selectedPatient.id}</div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(null);
                        setSearchTerm('');
                        setFormData({ ...formData, patient_id: '' });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Only show appointment form fields when patient is selected and quick add is not active */}
          {selectedPatient && !showQuickAdd && (
            <>
              {/* Appointment Type */}
              <div>
                <Label htmlFor="appointmentType">Appointment Type</Label>
                <Select
                  value={formData.appointment_type}
                  onValueChange={(value) => setFormData({ ...formData, appointment_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="routine_checkup">Routine Checkup</SelectItem>
                    <SelectItem value="physical_therapy">Physical Therapy</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="specialist">Specialist Visit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Provider Selection */}
              <div>
                <Label htmlFor="provider">Provider *</Label>
                <Select
                  value={formData.provider_id}
                  onValueChange={(value) => setFormData({ ...formData, provider_id: value })}
                  disabled={isLoadingProviders}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingProviders ? "Loading providers..." : "Select a provider"} />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">No providers available</div>
                    ) : (
                      providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.title ? `${provider.title} ` : ''}{provider.first_name} {provider.last_name}
                          {provider.npi ? ` (NPI: ${provider.npi})` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {providers.length === 0 && !isLoadingProviders && (
                  <p className="text-sm text-gray-500 mt-1">No providers found. Please add providers in the Providers section.</p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledDate">Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="scheduledTime">Time</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Duration and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select
                    value={formData.duration_minutes.toString()}
                    onValueChange={(value) => setFormData({ ...formData, duration_minutes: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Room 101, etc."
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {existingAppointment ? 'Update Appointment' : 'Create Appointment'}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
