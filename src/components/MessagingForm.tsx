import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageSquare, 
  Send, 
  Save,
  X,
  Plus,
  Phone,
  Mail,
  Clock,
  Eye,
  File
} from 'lucide-react';

interface MessagingFormProps {
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: any) => void;
}

export function MessagingForm({ patientId, patientName, isOpen, onClose, onSend }: MessagingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Message Details
  const [messageType, setMessageType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [sendMethod, setSendMethod] = useState('');
  const [scheduledSend, setScheduledSend] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [sender, setSender] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!messageType.trim()) newErrors.messageType = 'Message type is required';
    if (!subject.trim()) newErrors.subject = 'Subject is required';
    if (!message.trim()) newErrors.message = 'Message content is required';
    if (!sendMethod.trim()) newErrors.sendMethod = 'Send method is required';
    if (!sender.trim()) newErrors.sender = 'Sender is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const messageData = {
        patientId,
        patientName,
        messageType,
        subject,
        message,
        priority,
        sendMethod,
        scheduledSend: scheduledSend === 'yes',
        scheduledTime: scheduledSend === 'yes' ? scheduledTime : null,
        sender,
        attachments,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      onSend(messageData);
      
      // Reset form
      setMessageType('');
      setSubject('');
      setMessage('');
      setPriority('normal');
      setSendMethod('');
      setScheduledSend('');
      setScheduledTime('');
      setSender('');
      setAttachments([]);
      setErrors({});
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setErrors({});
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <MessageSquare className="h-6 w-6 mr-2 text-blue-600" />
            Send Message - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Message Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                Message Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="messageType">Message Type *</Label>
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger className={errors.messageType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select message type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appointment-reminder">Appointment Reminder</SelectItem>
                      <SelectItem value="test-results">Test Results</SelectItem>
                      <SelectItem value="prescription-refill">Prescription Refill</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="general-inquiry">General Inquiry</SelectItem>
                      <SelectItem value="urgent">Urgent Message</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.messageType && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.messageType}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter message subject"
                    className={errors.subject ? 'border-red-500' : ''}
                  />
                  {errors.subject && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.subject}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender">From *</Label>
                  <Input
                    id="sender"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    placeholder="Dr. Smith"
                    className={errors.sender ? 'border-red-500' : ''}
                  />
                  {errors.sender && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.sender}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                Message Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={6}
                  className={errors.message ? 'border-red-500' : ''}
                />
                {errors.message && (
                  <p className="text-sm text-red-600 flex items-center">
                    <X className="h-3 w-3 mr-1" />
                    {errors.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Send Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Send className="h-5 w-5 mr-2 text-purple-600" />
                Send Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sendMethod">Send Method *</Label>
                  <Select value={sendMethod} onValueChange={setSendMethod}>
                    <SelectTrigger className={errors.sendMethod ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select send method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS Text</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="portal">Patient Portal</SelectItem>
                      <SelectItem value="mail">Physical Mail</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.sendMethod && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.sendMethod}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledSend">Schedule Send</Label>
                  <Select value={scheduledSend} onValueChange={setScheduledSend}>
                    <SelectTrigger>
                      <SelectValue placeholder="Send now or schedule?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">Send Now</SelectItem>
                      <SelectItem value="yes">Schedule Send</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {scheduledSend === 'yes' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledTime">Scheduled Date</Label>
                      <Input
                        id="scheduledTime"
                        type="datetime-local"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Plus className="h-5 w-5 mr-2 text-orange-600" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="attachments">Add Attachments</Label>
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    onChange={handleAttachmentChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                  />
                  <p className="text-xs text-gray-500">
                    You can attach multiple files (PDF, DOC, DOCX, JPG, PNG, TXT)
                  </p>
                </div>

                {/* Attachment List */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Attached Files</Label>
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded bg-gray-50">
                          <div className="flex items-center space-x-2">
                            <File className="h-4 w-4 text-gray-600" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message Preview */}
          {(subject || message) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Eye className="h-5 w-5 mr-2 text-gray-600" />
                  Message Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{subject || 'No subject'}</p>
                      <p className="text-sm text-gray-600">To: {patientName}</p>
                      <p className="text-sm text-gray-600">From: {sender || 'No sender'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{new Date().toLocaleString()}</p>
                      <p className="text-xs text-gray-500 capitalize">{priority} priority</p>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {message || 'No message content'}
                    </p>
                  </div>
                  {attachments.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                      <div className="space-y-1">
                        {attachments.map((file, index) => (
                          <p key={index} className="text-sm text-gray-600 flex items-center">
                            <File className="h-3 w-3 mr-1" />
                            {file.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
