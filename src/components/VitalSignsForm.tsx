import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Weight, 
  Ruler, 
  Eye, 
  Save,
  X,
  FileText
} from 'lucide-react';

interface VitalSignsFormProps {
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (vitals: any) => void;
}

export function VitalSignsForm({ patientId, patientName, isOpen, onClose, onSave }: VitalSignsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Vital Signs
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState('');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [oxygenSaturation, setOxygenSaturation] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState('');
  const [painLevel, setPainLevel] = useState('');
  const [notes, setNotes] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!bloodPressureSystolic.trim()) newErrors.bloodPressureSystolic = 'Systolic pressure is required';
    if (!bloodPressureDiastolic.trim()) newErrors.bloodPressureDiastolic = 'Diastolic pressure is required';
    if (!heartRate.trim()) newErrors.heartRate = 'Heart rate is required';
    if (!temperature.trim()) newErrors.temperature = 'Temperature is required';
    if (!respiratoryRate.trim()) newErrors.respiratoryRate = 'Respiratory rate is required';
    if (!oxygenSaturation.trim()) newErrors.oxygenSaturation = 'Oxygen saturation is required';
    if (!weight.trim()) newErrors.weight = 'Weight is required';
    if (!height.trim()) newErrors.height = 'Height is required';

    // Numeric validation
    const systolic = parseFloat(bloodPressureSystolic);
    const diastolic = parseFloat(bloodPressureDiastolic);
    if (systolic && (systolic < 50 || systolic > 300)) {
      newErrors.bloodPressureSystolic = 'Systolic pressure must be between 50-300';
    }
    if (diastolic && (diastolic < 30 || diastolic > 200)) {
      newErrors.bloodPressureDiastolic = 'Diastolic pressure must be between 30-200';
    }
    if (systolic && diastolic && systolic <= diastolic) {
      newErrors.bloodPressureSystolic = 'Systolic must be higher than diastolic';
    }

    const hr = parseFloat(heartRate);
    if (hr && (hr < 30 || hr > 300)) {
      newErrors.heartRate = 'Heart rate must be between 30-300';
    }

    const temp = parseFloat(temperature);
    if (temp && (temp < 90 || temp > 110)) {
      newErrors.temperature = 'Temperature must be between 90-110°F';
    }

    const rr = parseFloat(respiratoryRate);
    if (rr && (rr < 8 || rr > 40)) {
      newErrors.respiratoryRate = 'Respiratory rate must be between 8-40';
    }

    const spo2 = parseFloat(oxygenSaturation);
    if (spo2 && (spo2 < 70 || spo2 > 100)) {
      newErrors.oxygenSaturation = 'Oxygen saturation must be between 70-100%';
    }

    const w = parseFloat(weight);
    if (w && (w < 50 || w > 1000)) {
      newErrors.weight = 'Weight must be between 50-1000 lbs';
    }

    const h = parseFloat(height);
    if (h && (h < 24 || h > 96)) {
      newErrors.height = 'Height must be between 24-96 inches';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (w && h) {
      const bmiValue = (w / (h * h)) * 703; // BMI formula for imperial units
      setBmi(bmiValue.toFixed(1));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const vitalSigns = {
        patientId,
        patientName,
        bloodPressure: {
          systolic: parseFloat(bloodPressureSystolic),
          diastolic: parseFloat(bloodPressureDiastolic)
        },
        heartRate: parseFloat(heartRate),
        temperature: parseFloat(temperature),
        respiratoryRate: parseFloat(respiratoryRate),
        oxygenSaturation: parseFloat(oxygenSaturation),
        weight: parseFloat(weight),
        height: parseFloat(height),
        bmi: parseFloat(bmi),
        painLevel: parseInt(painLevel),
        notes,
        timestamp: new Date().toISOString(),
        recordedBy: 'Current User' // This would come from auth context
      };

      onSave(vitalSigns);
      
      // Reset form
      setBloodPressureSystolic('');
      setBloodPressureDiastolic('');
      setHeartRate('');
      setTemperature('');
      setRespiratoryRate('');
      setOxygenSaturation('');
      setWeight('');
      setHeight('');
      setBmi('');
      setPainLevel('');
      setNotes('');
      setErrors({});
    } catch (error) {
      console.error('Error saving vital signs:', error);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Heart className="h-6 w-6 mr-2 text-red-600" />
            Vital Signs - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Blood Pressure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Activity className="h-5 w-5 mr-2 text-red-600" />
                Blood Pressure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systolic">Systolic (mmHg) *</Label>
                  <Input
                    id="systolic"
                    type="number"
                    value={bloodPressureSystolic}
                    onChange={(e) => setBloodPressureSystolic(e.target.value)}
                    placeholder="120"
                    className={errors.bloodPressureSystolic ? 'border-red-500' : ''}
                  />
                  {errors.bloodPressureSystolic && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.bloodPressureSystolic}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diastolic">Diastolic (mmHg) *</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    value={bloodPressureDiastolic}
                    onChange={(e) => setBloodPressureDiastolic(e.target.value)}
                    placeholder="80"
                    className={errors.bloodPressureDiastolic ? 'border-red-500' : ''}
                  />
                  {errors.bloodPressureDiastolic && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.bloodPressureDiastolic}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Heart Rate and Temperature */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Heart className="h-5 w-5 mr-2 text-pink-600" />
                Heart Rate & Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heartRate">Heart Rate (bpm) *</Label>
                  <Input
                    id="heartRate"
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="72"
                    className={errors.heartRate ? 'border-red-500' : ''}
                  />
                  {errors.heartRate && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.heartRate}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°F) *</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="98.6"
                    className={errors.temperature ? 'border-red-500' : ''}
                  />
                  {errors.temperature && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.temperature}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Respiratory Rate and Oxygen Saturation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Respiratory & Oxygen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="respiratoryRate">Respiratory Rate (breaths/min) *</Label>
                  <Input
                    id="respiratoryRate"
                    type="number"
                    value={respiratoryRate}
                    onChange={(e) => setRespiratoryRate(e.target.value)}
                    placeholder="16"
                    className={errors.respiratoryRate ? 'border-red-500' : ''}
                  />
                  {errors.respiratoryRate && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.respiratoryRate}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oxygenSaturation">Oxygen Saturation (%) *</Label>
                  <Input
                    id="oxygenSaturation"
                    type="number"
                    value={oxygenSaturation}
                    onChange={(e) => setOxygenSaturation(e.target.value)}
                    placeholder="98"
                    className={errors.oxygenSaturation ? 'border-red-500' : ''}
                  />
                  {errors.oxygenSaturation && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.oxygenSaturation}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weight and Height */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Weight className="h-5 w-5 mr-2 text-green-600" />
                Weight & Height
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => {
                      setWeight(e.target.value);
                      calculateBMI();
                    }}
                    placeholder="150"
                    className={errors.weight ? 'border-red-500' : ''}
                  />
                  {errors.weight && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.weight}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (inches) *</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={height}
                    onChange={(e) => {
                      setHeight(e.target.value);
                      calculateBMI();
                    }}
                    placeholder="68"
                    className={errors.height ? 'border-red-500' : ''}
                  />
                  {errors.height && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.height}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bmi">BMI</Label>
                  <Input
                    id="bmi"
                    value={bmi}
                    readOnly
                    placeholder="Auto-calculated"
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pain Level */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Eye className="h-5 w-5 mr-2 text-purple-600" />
                Pain Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="painLevel">Pain Level (0-10)</Label>
                <Select value={painLevel} onValueChange={setPainLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pain level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 - No Pain</SelectItem>
                    <SelectItem value="1">1 - Very Mild</SelectItem>
                    <SelectItem value="2">2 - Mild</SelectItem>
                    <SelectItem value="3">3 - Mild</SelectItem>
                    <SelectItem value="4">4 - Moderate</SelectItem>
                    <SelectItem value="5">5 - Moderate</SelectItem>
                    <SelectItem value="6">6 - Moderate</SelectItem>
                    <SelectItem value="7">7 - Severe</SelectItem>
                    <SelectItem value="8">8 - Severe</SelectItem>
                    <SelectItem value="9">9 - Very Severe</SelectItem>
                    <SelectItem value="10">10 - Worst Possible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2 text-gray-600" />
                Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional observations or notes about the vital signs..."
                  rows={4}
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
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Vital Signs
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
