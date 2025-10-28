import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Stethoscope, 
  Heart, 
  AlertCircle, 
  Save,
  X,
  Plus,
  Trash2,
  Calendar,
  User
} from 'lucide-react';

interface MedicalHistoryFormProps {
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (history: any) => void;
}

export function MedicalHistoryForm({ patientId, patientName, isOpen, onClose, onSubmit }: MedicalHistoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Medical History
  const [allergies, setAllergies] = useState<Array<{allergen: string, reaction: string, severity: string}>>([]);
  const [medications, setMedications] = useState<Array<{name: string, dosage: string, frequency: string, startDate: string}>>([]);
  const [conditions, setConditions] = useState<Array<{condition: string, diagnosisDate: string, status: string, notes: string}>>([]);
  const [surgeries, setSurgeries] = useState<Array<{procedure: string, date: string, surgeon: string, hospital: string}>>([]);
  const [familyHistory, setFamilyHistory] = useState<Array<{relation: string, condition: string, age: string}>>([]);

  // Form inputs for adding new items
  const [newAllergen, setNewAllergen] = useState('');
  const [newReaction, setNewReaction] = useState('');
  const [newSeverity, setNewSeverity] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFrequency, setNewFrequency] = useState('');
  const [newMedStartDate, setNewMedStartDate] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newDiagnosisDate, setNewDiagnosisDate] = useState('');
  const [newConditionStatus, setNewConditionStatus] = useState('');
  const [newConditionNotes, setNewConditionNotes] = useState('');
  const [newProcedure, setNewProcedure] = useState('');
  const [newSurgeryDate, setNewSurgeryDate] = useState('');
  const [newSurgeon, setNewSurgeon] = useState('');
  const [newHospital, setNewHospital] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newFamilyCondition, setNewFamilyCondition] = useState('');
  const [newFamilyAge, setNewFamilyAge] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    // Basic validation - at least one item in each category
    if (allergies.length === 0 && medications.length === 0 && conditions.length === 0) {
      newErrors.general = 'Please add at least one allergy, medication, or condition';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addAllergy = () => {
    if (newAllergen.trim() && newReaction.trim()) {
      setAllergies(prev => [...prev, {
        allergen: newAllergen.trim(),
        reaction: newReaction.trim(),
        severity: newSeverity || 'Unknown'
      }]);
      setNewAllergen('');
      setNewReaction('');
      setNewSeverity('');
    }
  };

  const removeAllergy = (index: number) => {
    setAllergies(prev => prev.filter((_, i) => i !== index));
  };

  const addMedication = () => {
    if (newMedication.trim() && newDosage.trim()) {
      setMedications(prev => [...prev, {
        name: newMedication.trim(),
        dosage: newDosage.trim(),
        frequency: newFrequency.trim(),
        startDate: newMedStartDate || new Date().toISOString().split('T')[0]
      }]);
      setNewMedication('');
      setNewDosage('');
      setNewFrequency('');
      setNewMedStartDate('');
    }
  };

  const removeMedication = (index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setConditions(prev => [...prev, {
        condition: newCondition.trim(),
        diagnosisDate: newDiagnosisDate || new Date().toISOString().split('T')[0],
        status: newConditionStatus || 'Active',
        notes: newConditionNotes.trim()
      }]);
      setNewCondition('');
      setNewDiagnosisDate('');
      setNewConditionStatus('');
      setNewConditionNotes('');
    }
  };

  const removeCondition = (index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  };

  const addSurgery = () => {
    if (newProcedure.trim() && newSurgeryDate.trim()) {
      setSurgeries(prev => [...prev, {
        procedure: newProcedure.trim(),
        date: newSurgeryDate,
        surgeon: newSurgeon.trim(),
        hospital: newHospital.trim()
      }]);
      setNewProcedure('');
      setNewSurgeryDate('');
      setNewSurgeon('');
      setNewHospital('');
    }
  };

  const removeSurgery = (index: number) => {
    setSurgeries(prev => prev.filter((_, i) => i !== index));
  };

  const addFamilyHistory = () => {
    if (newRelation.trim() && newFamilyCondition.trim()) {
      setFamilyHistory(prev => [...prev, {
        relation: newRelation.trim(),
        condition: newFamilyCondition.trim(),
        age: newFamilyAge.trim()
      }]);
      setNewRelation('');
      setNewFamilyCondition('');
      setNewFamilyAge('');
    }
  };

  const removeFamilyHistory = (index: number) => {
    setFamilyHistory(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const medicalHistory = {
        patientId,
        patientName,
        allergies,
        medications,
        conditions,
        surgeries,
        familyHistory,
        timestamp: new Date().toISOString(),
        createdBy: 'Current User'
      };

      onSubmit(medicalHistory);
      
      // Reset form
      setAllergies([]);
      setMedications([]);
      setConditions([]);
      setSurgeries([]);
      setFamilyHistory([]);
      setErrors({});
    } catch (error) {
      console.error('Error submitting medical history:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Stethoscope className="h-6 w-6 mr-2 text-blue-600" />
            Medical History - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Allergies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                Allergies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newAllergen">Allergen</Label>
                    <Input
                      id="newAllergen"
                      value={newAllergen}
                      onChange={(e) => setNewAllergen(e.target.value)}
                      placeholder="e.g., Penicillin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newReaction">Reaction</Label>
                    <Input
                      id="newReaction"
                      value={newReaction}
                      onChange={(e) => setNewReaction(e.target.value)}
                      placeholder="e.g., Rash, Hives"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newSeverity">Severity</Label>
                    <Select value={newSeverity} onValueChange={setNewSeverity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                        <SelectItem value="life-threatening">Life-threatening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button onClick={addAllergy} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
                
                {allergies.length > 0 && (
                  <div className="space-y-2">
                    {allergies.map((allergy, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded bg-red-50">
                        <div className="flex-1">
                          <p className="font-medium text-red-800">{allergy.allergen}</p>
                          <p className="text-sm text-red-600">{allergy.reaction}</p>
                          <p className="text-xs text-red-500 capitalize">{allergy.severity}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => removeAllergy(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Heart className="h-5 w-5 mr-2 text-blue-600" />
                Current Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newMedication">Medication</Label>
                    <Input
                      id="newMedication"
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      placeholder="e.g., Lisinopril"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newDosage">Dosage</Label>
                    <Input
                      id="newDosage"
                      value={newDosage}
                      onChange={(e) => setNewDosage(e.target.value)}
                      placeholder="e.g., 10mg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newFrequency">Frequency</Label>
                    <Input
                      id="newFrequency"
                      value={newFrequency}
                      onChange={(e) => setNewFrequency(e.target.value)}
                      placeholder="e.g., Once daily"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newMedStartDate">Start Date</Label>
                    <Input
                      id="newMedStartDate"
                      type="date"
                      value={newMedStartDate}
                      onChange={(e) => setNewMedStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button onClick={addMedication} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
                
                {medications.length > 0 && (
                  <div className="space-y-2">
                    {medications.map((med, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded bg-blue-50">
                        <div className="flex-1">
                          <p className="font-medium text-blue-800">{med.name}</p>
                          <p className="text-sm text-blue-600">{med.dosage} - {med.frequency}</p>
                          <p className="text-xs text-blue-500">Started: {med.startDate}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => removeMedication(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Medical Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Stethoscope className="h-5 w-5 mr-2 text-purple-600" />
                Medical Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newCondition">Condition</Label>
                    <Input
                      id="newCondition"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      placeholder="e.g., Hypertension"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newDiagnosisDate">Diagnosis Date</Label>
                    <Input
                      id="newDiagnosisDate"
                      type="date"
                      value={newDiagnosisDate}
                      onChange={(e) => setNewDiagnosisDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newConditionStatus">Status</Label>
                    <Select value={newConditionStatus} onValueChange={setNewConditionStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="chronic">Chronic</SelectItem>
                        <SelectItem value="monitoring">Monitoring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newConditionNotes">Notes</Label>
                    <Input
                      id="newConditionNotes"
                      value={newConditionNotes}
                      onChange={(e) => setNewConditionNotes(e.target.value)}
                      placeholder="Additional notes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button onClick={addCondition} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
                
                {conditions.length > 0 && (
                  <div className="space-y-2">
                    {conditions.map((condition, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded bg-purple-50">
                        <div className="flex-1">
                          <p className="font-medium text-purple-800">{condition.condition}</p>
                          <p className="text-sm text-purple-600">Diagnosed: {condition.diagnosisDate} - Status: {condition.status}</p>
                          {condition.notes && <p className="text-xs text-purple-500">{condition.notes}</p>}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => removeCondition(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Surgical History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2 text-green-600" />
                Surgical History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newProcedure">Procedure</Label>
                    <Input
                      id="newProcedure"
                      value={newProcedure}
                      onChange={(e) => setNewProcedure(e.target.value)}
                      placeholder="e.g., Appendectomy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newSurgeryDate">Date</Label>
                    <Input
                      id="newSurgeryDate"
                      type="date"
                      value={newSurgeryDate}
                      onChange={(e) => setNewSurgeryDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newSurgeon">Surgeon</Label>
                    <Input
                      id="newSurgeon"
                      value={newSurgeon}
                      onChange={(e) => setNewSurgeon(e.target.value)}
                      placeholder="Surgeon name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newHospital">Hospital</Label>
                    <Input
                      id="newHospital"
                      value={newHospital}
                      onChange={(e) => setNewHospital(e.target.value)}
                      placeholder="Hospital name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button onClick={addSurgery} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
                
                {surgeries.length > 0 && (
                  <div className="space-y-2">
                    {surgeries.map((surgery, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded bg-green-50">
                        <div className="flex-1">
                          <p className="font-medium text-green-800">{surgery.procedure}</p>
                          <p className="text-sm text-green-600">Date: {surgery.date}</p>
                          <p className="text-xs text-green-500">Surgeon: {surgery.surgeon} - Hospital: {surgery.hospital}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => removeSurgery(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Family History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2 text-orange-600" />
                Family History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newRelation">Relation</Label>
                    <Input
                      id="newRelation"
                      value={newRelation}
                      onChange={(e) => setNewRelation(e.target.value)}
                      placeholder="e.g., Mother, Father"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newFamilyCondition">Condition</Label>
                    <Input
                      id="newFamilyCondition"
                      value={newFamilyCondition}
                      onChange={(e) => setNewFamilyCondition(e.target.value)}
                      placeholder="e.g., Diabetes, Heart Disease"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newFamilyAge">Age at Diagnosis</Label>
                    <Input
                      id="newFamilyAge"
                      value={newFamilyAge}
                      onChange={(e) => setNewFamilyAge(e.target.value)}
                      placeholder="e.g., 45"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button onClick={addFamilyHistory} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
                
                {familyHistory.length > 0 && (
                  <div className="space-y-2">
                    {familyHistory.map((family, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded bg-orange-50">
                        <div className="flex-1">
                          <p className="font-medium text-orange-800">{family.relation}</p>
                          <p className="text-sm text-orange-600">{family.condition}</p>
                          {family.age && <p className="text-xs text-orange-500">Age at diagnosis: {family.age}</p>}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => removeFamilyHistory(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {errors.general && (
            <div className="text-sm text-red-600 flex items-center">
              <X className="h-3 w-3 mr-1" />
              {errors.general}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Medical History
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
