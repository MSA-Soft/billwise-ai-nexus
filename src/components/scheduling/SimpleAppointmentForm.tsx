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

interface SimpleAppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function SimpleAppointmentForm({ isOpen, onClose, onSave }: SimpleAppointmentFormProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_type: 'consultation',
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '09:00',
    duration_minutes: 30,
    status: 'scheduled',
    location: '',
    notes: ''
  });

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
      if (!searchTerm || searchTerm.length < 1) {
        setFilteredPatients([]);
        setShowQuickAdd(false);
        return;
      }

      setIsSearching(true);
      try {
        // Search in collections_accounts table (which has patient information)
        const searchTermLower = searchTerm.toLowerCase().trim();
        
        // Fetch all records and filter client-side for more reliable search
        // This avoids PostgREST query syntax issues
        const { data: allData, error } = await supabase
          .from('collections_accounts')
          .select('patient_id, patient_name, patient_email, patient_phone')
          .limit(100); // Get more records to search through

        if (error) {
          console.error('Search error:', error);
          throw error;
        }

        // Normalize patient ID to a common format for comparison
        // Handles formats: "PAT-002", "P002", "p002", "P-002", "p-002", "002" -> all normalize to "pat-002"
        const normalizePatientId = (id: string): string => {
          if (!id) return '';
          const idLower = id.toLowerCase().trim();
          
          // Remove "PAT-" prefix if present first
          let normalized = idLower.replace(/^pat-/, '');
          
          // If it's just numbers, add "pat-" prefix
          if (/^\d+$/.test(normalized)) {
            return `pat-${normalized}`;
          }
          
          // Handle "P-002" or "p-002" format (with hyphen)
          const hyphenMatch = normalized.match(/^p-(\d+)$/);
          if (hyphenMatch) {
            return `pat-${hyphenMatch[1]}`;
          }
          
          // Handle "P002" or "p002" format (no hyphen)
          const noHyphenMatch = normalized.match(/^p(\d+)$/);
          if (noHyphenMatch) {
            return `pat-${noHyphenMatch[1]}`;
          }
          
          // If it already has "pat-" prefix, return as is (this handles cases where replace didn't match)
          if (idLower.startsWith('pat-')) {
            return idLower;
          }
          
          // Otherwise return original
          return idLower;
        };
        
        // Normalize search term
        const normalizedSearchTerm = normalizePatientId(searchTermLower);
        
        // Filter client-side for case-insensitive search with ID format normalization
        const filteredData = (allData || []).filter((item: any) => {
          // If patient_id exists, check both ID and name
          if (item.patient_id) {
            const itemIdNormalized = normalizePatientId(item.patient_id);
            
            // Check normalized ID match or contains match
            const idMatch = itemIdNormalized === normalizedSearchTerm || 
                           itemIdNormalized.includes(normalizedSearchTerm) ||
                           normalizedSearchTerm.includes(itemIdNormalized) ||
                           item.patient_id.toLowerCase().includes(searchTermLower);
            
            const nameMatch = item.patient_name?.toLowerCase().includes(searchTermLower);
            return idMatch || nameMatch;
          }
          
          // If patient_id is null, only search by name
          const nameMatch = item.patient_name?.toLowerCase().includes(searchTermLower);
          return nameMatch;
        });

        const data = filteredData.slice(0, 20); // Limit to 20 results

        // Map to patient objects, handling null patient_ids
        let patients = (data || []).map((item: any) => {
          // If patient_id is null, use the collection account id or generate a temporary ID
          const patientId = item.patient_id || `TEMP-${item.id}` || `TEMP-${Date.now()}`;
          
          return {
            id: patientId,
            originalId: item.patient_id, // Store original for reference
            name: item.patient_name || 'Unknown',
            email: item.patient_email || '',
            phone: item.patient_phone || '',
            collectionAccountId: item.id // Store the collection account ID
          };
        });

        // Prioritize exact ID matches (case-insensitive)
        patients = patients.sort((a, b) => {
          const aIdLower = a.id.toLowerCase();
          const bIdLower = b.id.toLowerCase();
          const aExactMatch = aIdLower === searchTermLower || aIdLower.includes(searchTermLower);
          const bExactMatch = bIdLower === searchTermLower || bIdLower.includes(searchTermLower);
          
          // Exact match first
          if (aIdLower === searchTermLower && bIdLower !== searchTermLower) return -1;
          if (bIdLower === searchTermLower && aIdLower !== searchTermLower) return 1;
          
          // Then starts with match
          if (aIdLower.startsWith(searchTermLower) && !bIdLower.startsWith(searchTermLower)) return -1;
          if (bIdLower.startsWith(searchTermLower) && !aIdLower.startsWith(searchTermLower)) return 1;
          
          return 0;
        });

        console.log('Search term:', searchTermLower);
        console.log('Normalized search term:', normalizedSearchTerm);
        console.log('Total records fetched:', allData?.length || 0);
        console.log('Sample records from DB:', allData?.slice(0, 5).map((item: any) => ({
          patient_id: item.patient_id,
          patient_name: item.patient_name,
          id: item.id
        })) || []);
        console.log('Filtered records:', filteredData.length);
        console.log('Search results for "' + searchTerm + '":', patients);
        setFilteredPatients(patients);
        // Only show quick add if no patients found AND search term is at least 2 characters
        setShowQuickAdd(patients.length === 0 && searchTerm.length >= 2);
      } catch (error) {
        console.error('Error searching patients:', error);
        setFilteredPatients([]);
        // Only show quick add on error if search term is substantial
        setShowQuickAdd(searchTerm.length >= 2);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchPatients();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setFormData({ ...formData, patient_id: patient.id });
    setSearchTerm(`${patient.name} (${patient.id})`);
    setFilteredPatients([]);
    setShowQuickAdd(false);
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      alert('You must be logged in to add a patient');
      return;
    }
    
    try {
      // Generate a patient ID
      const patientId = `PAT-${Date.now()}`;
      
      // Create patient record in collections_accounts (or you might want to create a patients table)
      const { data: collectionAccount, error } = await supabase
        .from('collections_accounts')
        .insert({
          patient_id: patientId,
          patient_name: `${quickAddData.firstName} ${quickAddData.lastName}`,
          current_balance: 0,
          original_balance: 0,
          days_overdue: 0,
          collection_stage: 'early_collection',
          collection_status: 'active',
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Set the selected patient and update form data
      const newPatient = {
        id: patientId,
        name: `${quickAddData.firstName} ${quickAddData.lastName}`,
        firstName: quickAddData.firstName,
        lastName: quickAddData.lastName,
        dob: quickAddData.dob,
        primaryInsurance: quickAddData.primaryInsurance,
        primaryInsuranceId: quickAddData.primaryInsuranceId,
        secondaryInsurance: quickAddData.secondaryInsurance,
        secondaryInsuranceId: quickAddData.secondaryInsuranceId,
        icd: quickAddData.icd,
        cpt: quickAddData.cpt
      };

      setSelectedPatient(newPatient);
      setFormData({ 
        ...formData, 
        patient_id: patientId,
        appointment_type: quickAddData.typeOfVisit,
        notes: `ICD: ${quickAddData.icd || 'N/A'}, CPT: ${quickAddData.cpt || 'N/A'}\n${formData.notes}`
      });
      setSearchTerm(`${quickAddData.firstName} ${quickAddData.lastName} (${patientId})`);
      setShowQuickAdd(false);
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Failed to create patient. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient_id) {
      alert('Please select or add a patient');
      return;
    }

    const submitData = {
      ...formData,
      patient: selectedPatient
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
          <DialogTitle>New Appointment</DialogTitle>
          <DialogDescription>
            Search for an existing patient or add a new patient to schedule an appointment.
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
                          <div className="text-sm text-gray-500">{patient.id}</div>
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
                      <div className="text-sm text-green-700">ID: {formData.patient_id}</div>
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
                  Create Appointment
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
