import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';

interface ProgressNotesFormProps {
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: any) => void;
}

export function ProgressNotesForm({ patientId, patientName, isOpen, onClose, onSave }: ProgressNotesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Progress Note
  const [noteType, setNoteType] = useState('');
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [noteTime, setNoteTime] = useState(new Date().toTimeString().slice(0, 5));
  const [provider, setProvider] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [historyOfPresentIllness, setHistoryOfPresentIllness] = useState('');
  const [reviewOfSystems, setReviewOfSystems] = useState('');
  const [physicalExamination, setPhysicalExamination] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [medications, setMedications] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Additional sections
  const [vitalSigns, setVitalSigns] = useState('');
  const [allergies, setAllergies] = useState('');
  const [socialHistory, setSocialHistory] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!noteType.trim()) newErrors.noteType = 'Note type is required';
    if (!noteDate.trim()) newErrors.noteDate = 'Note date is required';
    if (!provider.trim()) newErrors.provider = 'Provider is required';
    if (!chiefComplaint.trim()) newErrors.chiefComplaint = 'Chief complaint is required';
    if (!assessment.trim()) newErrors.assessment = 'Assessment is required';
    if (!plan.trim()) newErrors.plan = 'Plan is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const progressNote = {
        patientId,
        patientName,
        noteType,
        noteDate,
        noteTime,
        provider,
        chiefComplaint,
        historyOfPresentIllness,
        reviewOfSystems,
        physicalExamination,
        assessment,
        plan,
        medications,
        followUp,
        additionalNotes,
        vitalSigns,
        allergies,
        socialHistory,
        familyHistory,
        timestamp: new Date().toISOString(),
        createdBy: 'Current User' // This would come from auth context
      };

      onSave(progressNote);
      
      // Reset form
      setNoteType('');
      setNoteDate(new Date().toISOString().split('T')[0]);
      setNoteTime(new Date().toTimeString().slice(0, 5));
      setProvider('');
      setChiefComplaint('');
      setHistoryOfPresentIllness('');
      setReviewOfSystems('');
      setPhysicalExamination('');
      setAssessment('');
      setPlan('');
      setMedications('');
      setFollowUp('');
      setAdditionalNotes('');
      setVitalSigns('');
      setAllergies('');
      setSocialHistory('');
      setFamilyHistory('');
      setErrors({});
    } catch (error) {
      console.error('Error saving progress notes:', error);
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
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            Progress Notes - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Note Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="noteType">Note Type *</Label>
                  <Select value={noteType} onValueChange={setNoteType}>
                    <SelectTrigger className={errors.noteType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select note type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office-visit">Office Visit</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                      <SelectItem value="telemedicine">Telemedicine</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.noteType && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.noteType}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noteDate">Date *</Label>
                  <Input
                    id="noteDate"
                    type="date"
                    value={noteDate}
                    onChange={(e) => setNoteDate(e.target.value)}
                    className={errors.noteDate ? 'border-red-500' : ''}
                  />
                  {errors.noteDate && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.noteDate}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noteTime">Time</Label>
                  <Input
                    id="noteTime"
                    type="time"
                    value={noteTime}
                    onChange={(e) => setNoteTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider *</Label>
                  <Input
                    id="provider"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    placeholder="Dr. Smith"
                    className={errors.provider ? 'border-red-500' : ''}
                  />
                  {errors.provider && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.provider}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chief Complaint */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2 text-green-600" />
                Chief Complaint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
                <Textarea
                  id="chiefComplaint"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Patient's main reason for the visit..."
                  rows={3}
                  className={errors.chiefComplaint ? 'border-red-500' : ''}
                />
                {errors.chiefComplaint && (
                  <p className="text-sm text-red-600 flex items-center">
                    <X className="h-3 w-3 mr-1" />
                    {errors.chiefComplaint}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* History of Present Illness */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                History of Present Illness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="historyOfPresentIllness">History of Present Illness</Label>
                <Textarea
                  id="historyOfPresentIllness"
                  value={historyOfPresentIllness}
                  onChange={(e) => setHistoryOfPresentIllness(e.target.value)}
                  placeholder="Detailed description of the current problem, including onset, duration, severity, associated symptoms, relieving/aggravating factors..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Review of Systems */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Review of Systems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="reviewOfSystems">Review of Systems</Label>
                <Textarea
                  id="reviewOfSystems"
                  value={reviewOfSystems}
                  onChange={(e) => setReviewOfSystems(e.target.value)}
                  placeholder="Systematic review of body systems (constitutional, cardiovascular, respiratory, gastrointestinal, genitourinary, musculoskeletal, neurological, psychiatric, endocrine, hematologic/lymphatic, allergic/immunologic)..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Physical Examination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2 text-red-600" />
                Physical Examination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="physicalExamination">Physical Examination</Label>
                <Textarea
                  id="physicalExamination"
                  value={physicalExamination}
                  onChange={(e) => setPhysicalExamination(e.target.value)}
                  placeholder="Detailed physical examination findings, including vital signs, general appearance, and system-specific examinations..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Assessment and Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Assessment and Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assessment">Assessment *</Label>
                <Textarea
                  id="assessment"
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  placeholder="Clinical assessment, differential diagnosis, and impression..."
                  rows={3}
                  className={errors.assessment ? 'border-red-500' : ''}
                />
                {errors.assessment && (
                  <p className="text-sm text-red-600 flex items-center">
                    <X className="h-3 w-3 mr-1" />
                    {errors.assessment}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Plan *</Label>
                <Textarea
                  id="plan"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  placeholder="Treatment plan, medications, procedures, referrals, patient education..."
                  rows={3}
                  className={errors.plan ? 'border-red-500' : ''}
                />
                {errors.plan && (
                  <p className="text-sm text-red-600 flex items-center">
                    <X className="h-3 w-3 mr-1" />
                    {errors.plan}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Plus className="h-5 w-5 mr-2 text-green-600" />
                Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="medications">Medications Prescribed/Modified</Label>
                <Textarea
                  id="medications"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="List any medications prescribed, modified, or discontinued during this visit..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Follow-up */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                Follow-up
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="followUp">Follow-up Instructions</Label>
                <Textarea
                  id="followUp"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="Follow-up instructions, return visit timing, when to seek immediate care..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2 text-gray-600" />
                Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any additional notes, patient concerns, or important information..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
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
                Save Progress Notes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
