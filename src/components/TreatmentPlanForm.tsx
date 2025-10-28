import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  User, 
  Save,
  X,
  Plus,
  Target,
  CheckCircle
} from 'lucide-react';

interface TreatmentPlanFormProps {
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: any) => void;
}

export function TreatmentPlanForm({ patientId, patientName, isOpen, onClose, onSave }: TreatmentPlanFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Treatment Plan
  const [planDate, setPlanDate] = useState(new Date().toISOString().split('T')[0]);
  const [provider, setProvider] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentGoals, setTreatmentGoals] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [medications, setMedications] = useState('');
  const [procedures, setProcedures] = useState('');
  const [lifestyleModifications, setLifestyleModifications] = useState('');
  const [followUpSchedule, setFollowUpSchedule] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [riskFactors, setRiskFactors] = useState('');
  const [contraindications, setContraindications] = useState('');
  const [patientEducation, setPatientEducation] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!planDate.trim()) newErrors.planDate = 'Plan date is required';
    if (!provider.trim()) newErrors.provider = 'Provider is required';
    if (!diagnosis.trim()) newErrors.diagnosis = 'Diagnosis is required';
    if (!treatmentGoals.trim()) newErrors.treatmentGoals = 'Treatment goals are required';
    if (!treatmentPlan.trim()) newErrors.treatmentPlan = 'Treatment plan is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const treatmentPlanData = {
        patientId,
        patientName,
        planDate,
        provider,
        diagnosis,
        treatmentGoals,
        treatmentPlan,
        medications,
        procedures,
        lifestyleModifications,
        followUpSchedule,
        expectedOutcome,
        riskFactors,
        contraindications,
        patientEducation,
        additionalNotes,
        timestamp: new Date().toISOString(),
        createdBy: 'Current User' // This would come from auth context
      };

      onSave(treatmentPlanData);
      
      // Reset form
      setPlanDate(new Date().toISOString().split('T')[0]);
      setProvider('');
      setDiagnosis('');
      setTreatmentGoals('');
      setTreatmentPlan('');
      setMedications('');
      setProcedures('');
      setLifestyleModifications('');
      setFollowUpSchedule('');
      setExpectedOutcome('');
      setRiskFactors('');
      setContraindications('');
      setPatientEducation('');
      setAdditionalNotes('');
      setErrors({});
    } catch (error) {
      console.error('Error saving treatment plan:', error);
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
            <Target className="h-6 w-6 mr-2 text-green-600" />
            Treatment Plan - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Plan Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planDate">Plan Date *</Label>
                  <Input
                    id="planDate"
                    type="date"
                    value={planDate}
                    onChange={(e) => setPlanDate(e.target.value)}
                    className={errors.planDate ? 'border-red-500' : ''}
                  />
                  {errors.planDate && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.planDate}
                    </p>
                  )}
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
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Primary Diagnosis *</Label>
                  <Input
                    id="diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Primary diagnosis"
                    className={errors.diagnosis ? 'border-red-500' : ''}
                  />
                  {errors.diagnosis && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.diagnosis}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Treatment Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Target className="h-5 w-5 mr-2 text-green-600" />
                Treatment Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="treatmentGoals">Treatment Goals *</Label>
                <Textarea
                  id="treatmentGoals"
                  value={treatmentGoals}
                  onChange={(e) => setTreatmentGoals(e.target.value)}
                  placeholder="Define specific, measurable treatment goals for this patient..."
                  rows={4}
                  className={errors.treatmentGoals ? 'border-red-500' : ''}
                />
                {errors.treatmentGoals && (
                  <p className="text-sm text-red-600 flex items-center">
                    <X className="h-3 w-3 mr-1" />
                    {errors.treatmentGoals}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Treatment Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                Treatment Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="treatmentPlan">Treatment Plan *</Label>
                <Textarea
                  id="treatmentPlan"
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  placeholder="Detailed treatment plan including interventions, timeline, and approach..."
                  rows={4}
                  className={errors.treatmentPlan ? 'border-red-500' : ''}
                />
                {errors.treatmentPlan && (
                  <p className="text-sm text-red-600 flex items-center">
                    <X className="h-3 w-3 mr-1" />
                    {errors.treatmentPlan}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Plus className="h-5 w-5 mr-2 text-red-600" />
                Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="medications">Medications</Label>
                <Textarea
                  id="medications"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="List medications including dosage, frequency, duration, and special instructions..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Procedures */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2 text-purple-600" />
                Procedures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="procedures">Procedures</Label>
                <Textarea
                  id="procedures"
                  value={procedures}
                  onChange={(e) => setProcedures(e.target.value)}
                  placeholder="List any procedures, tests, or interventions planned..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Lifestyle Modifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Target className="h-5 w-5 mr-2 text-orange-600" />
                Lifestyle Modifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="lifestyleModifications">Lifestyle Modifications</Label>
                <Textarea
                  id="lifestyleModifications"
                  value={lifestyleModifications}
                  onChange={(e) => setLifestyleModifications(e.target.value)}
                  placeholder="Diet, exercise, smoking cessation, stress management, sleep hygiene, etc..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Follow-up Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                Follow-up Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="followUpSchedule">Follow-up Schedule</Label>
                <Textarea
                  id="followUpSchedule"
                  value={followUpSchedule}
                  onChange={(e) => setFollowUpSchedule(e.target.value)}
                  placeholder="Schedule for follow-up visits, monitoring, and reassessment..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Expected Outcome */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Expected Outcome
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="expectedOutcome">Expected Outcome</Label>
                <Textarea
                  id="expectedOutcome"
                  value={expectedOutcome}
                  onChange={(e) => setExpectedOutcome(e.target.value)}
                  placeholder="Expected outcomes, prognosis, and success metrics..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Risk Factors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Target className="h-5 w-5 mr-2 text-red-600" />
                Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="riskFactors">Risk Factors</Label>
                <Textarea
                  id="riskFactors"
                  value={riskFactors}
                  onChange={(e) => setRiskFactors(e.target.value)}
                  placeholder="Identified risk factors and potential complications..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contraindications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <X className="h-5 w-5 mr-2 text-red-600" />
                Contraindications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="contraindications">Contraindications</Label>
                <Textarea
                  id="contraindications"
                  value={contraindications}
                  onChange={(e) => setContraindications(e.target.value)}
                  placeholder="Any contraindications or precautions for treatment..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Patient Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Patient Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="patientEducation">Patient Education</Label>
                <Textarea
                  id="patientEducation"
                  value={patientEducation}
                  onChange={(e) => setPatientEducation(e.target.value)}
                  placeholder="Patient education provided, resources given, and self-care instructions..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Plus className="h-5 w-5 mr-2 text-gray-600" />
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
                  placeholder="Any additional notes, considerations, or special instructions..."
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
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Treatment Plan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
