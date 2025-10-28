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
  MapPin,
  Phone
} from 'lucide-react';

interface ScheduleAppointmentFormProps {
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (appointment: any) => void;
}

export function ScheduleAppointmentForm({ patientId, patientName, isOpen, onClose, onSchedule }: ScheduleAppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Appointment Details
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [provider, setProvider] = useState('');
  const [duration, setDuration] = useState('30');
  const [location, setLocation] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderMethod, setReminderMethod] = useState('');
  const [reminderTime, setReminderTime] = useState('24');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!appointmentDate.trim()) newErrors.appointmentDate = 'Appointment date is required';
    if (!appointmentTime.trim()) newErrors.appointmentTime = 'Appointment time is required';
    if (!appointmentType.trim()) newErrors.appointmentType = 'Appointment type is required';
    if (!provider.trim()) newErrors.provider = 'Provider is required';
    if (!reason.trim()) newErrors.reason = 'Reason for appointment is required';

    // Date validation
    const selectedDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.appointmentDate = 'Appointment date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSchedule = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const appointment = {
        patientId,
        patientName,
        appointmentDate,
        appointmentTime,
        appointmentType,
        provider,
        duration: parseInt(duration),
        location,
        reason,
        notes,
        reminderMethod,
        reminderTime: parseInt(reminderTime),
        status: 'scheduled',
        timestamp: new Date().toISOString(),
        createdBy: 'Current User' // This would come from auth context
      };

      onSchedule(appointment);
      
      // Reset form
      setAppointmentDate('');
      setAppointmentTime('');
      setAppointmentType('');
      setProvider('');
      setDuration('30');
      setLocation('');
      setReason('');
      setNotes('');
      setReminderMethod('');
      setReminderTime('24');
      setErrors({});
    } catch (error) {
      console.error('Error scheduling appointment:', error);
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
            <Calendar className="h-6 w-6 mr-2 text-blue-600" />
            Schedule Appointment - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate">Appointment Date *</Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className={errors.appointmentDate ? 'border-red-500' : ''}
                  />
                  {errors.appointmentDate && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.appointmentDate}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointmentTime">Appointment Time *</Label>
                  <Input
                    id="appointmentTime"
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className={errors.appointmentTime ? 'border-red-500' : ''}
                  />
                  {errors.appointmentTime && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.appointmentTime}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointmentType">Appointment Type *</Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger className={errors.appointmentType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="annual-physical">Annual Physical</SelectItem>
                      <SelectItem value="urgent-care">Urgent Care</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                      <SelectItem value="telemedicine">Telemedicine</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.appointmentType && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.appointmentType}
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
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Room 101, Main Office"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reason and Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2 text-green-600" />
                Reason & Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Appointment *</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Brief description of the reason for this appointment..."
                    rows={3}
                    className={errors.reason ? 'border-red-500' : ''}
                  />
                  {errors.reason && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.reason}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes or special instructions..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reminder Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 mr-2 text-purple-600" />
                Reminder Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reminderMethod">Reminder Method</Label>
                  <Select value={reminderMethod} onValueChange={setReminderMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reminder method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="sms">SMS Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="both">Phone & SMS</SelectItem>
                      <SelectItem value="all">All Methods</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminderTime">Reminder Time</Label>
                  <Select value={reminderTime} onValueChange={setReminderTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour before</SelectItem>
                      <SelectItem value="2">2 hours before</SelectItem>
                      <SelectItem value="4">4 hours before</SelectItem>
                      <SelectItem value="24">24 hours before</SelectItem>
                      <SelectItem value="48">48 hours before</SelectItem>
                      <SelectItem value="72">72 hours before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSchedule} 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
