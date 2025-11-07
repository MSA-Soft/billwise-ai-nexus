import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  MessageSquare,
  CreditCard,
  User,
  Settings,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  Download,
  Eye,
  Bell,
  BellOff,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { patientPortalService, type AuthorizationStatus, type PatientMessage, type PaymentInfo, type PatientProfile } from '@/services/patientPortalService';

const PatientPortal: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('authorizations');
  const [patientId, setPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Data states
  const [authorizations, setAuthorizations] = useState<AuthorizationStatus[]>([]);
  const [messages, setMessages] = useState<PatientMessage[]>([]);
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [profile, setProfile] = useState<PatientProfile | null>(null);

  // Dialog states
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedAuth, setSelectedAuth] = useState<AuthorizationStatus | null>(null);

  // Form states
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentInfo['paymentMethod']>('credit_card');

  useEffect(() => {
    // In production, would get patientId from auth context
    const mockPatientId = 'patient-123'; // Replace with actual patient ID from auth
    setPatientId(mockPatientId);
    loadData(mockPatientId);
  }, []);

  const loadData = async (id: string) => {
    setLoading(true);
    try {
      const [auths, msgs, pays, prof] = await Promise.all([
        patientPortalService.getAuthorizationStatuses(id),
        patientPortalService.getMessages(id),
        patientPortalService.getPayments(id),
        patientPortalService.getPatientProfile(id),
      ]);

      setAuthorizations(auths);
      setMessages(msgs);
      setPayments(pays);
      setProfile(prof);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!uploadFile || !selectedAuth || !patientId) return;

    setLoading(true);
    try {
      const result = await patientPortalService.uploadDocument(
        patientId,
        selectedAuth.id,
        uploadFile,
        'supporting_document'
      );

      if (result.success) {
        toast({
          title: 'Document Uploaded',
          description: 'Your document has been uploaded successfully',
        });
        setShowUploadDialog(false);
        setUploadFile(null);
        loadData(patientId);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageSubject || !messageText || !patientId) return;

    setLoading(true);
    try {
      const result = await patientPortalService.sendMessage({
        patientId,
        subject: messageSubject,
        message: messageText,
        from: 'patient',
        status: 'unread',
      });

      if (result.success) {
        toast({
          title: 'Message Sent',
          description: 'Your message has been sent successfully',
        });
        setShowMessageDialog(false);
        setMessageSubject('');
        setMessageText('');
        loadData(patientId);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Send Failed',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!paymentAmount || !patientId) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Get first pending payment
      const pendingPayment = payments.find(p => p.status === 'pending' || p.status === 'overdue');
      if (!pendingPayment) {
        throw new Error('No pending payment found');
      }

      const result = await patientPortalService.processPayment(
        patientId,
        pendingPayment.id || '',
        amount,
        paymentMethod || 'credit_card'
      );

      if (result.success) {
        toast({
          title: 'Payment Processed',
          description: `Payment of $${amount.toFixed(2)} processed successfully`,
        });
        setShowPaymentDialog(false);
        setPaymentAmount('');
        loadData(patientId);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: AuthorizationStatus['status']) => {
    const variants: Record<string, { className: string; icon: React.ReactNode }> = {
      approved: { className: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      denied: { className: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
      pending: { className: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
      expired: { className: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="h-3 w-3" /> },
      cancelled: { className: 'bg-gray-100 text-gray-800', icon: <XCircle className="h-3 w-3" /> },
    };

    const variant = variants[status] || variants.pending;
    return (
      <Badge className={variant.className}>
        {variant.icon}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Patient Portal</h1>
        <p className="text-muted-foreground mt-2">
          Manage your authorizations, messages, payments, and profile
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="authorizations">
            <FileText className="h-4 w-4 mr-2" />
            Authorizations
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="documents">
            <Upload className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* Authorizations Tab */}
        <TabsContent value="authorizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authorization Status</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : authorizations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No authorizations found
                </div>
              ) : (
                <div className="space-y-4">
                  {authorizations.map((auth) => (
                    <Card key={auth.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{auth.serviceType}</h3>
                            {getStatusBadge(auth.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Request #: {auth.requestNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Submitted: {new Date(auth.submittedDate).toLocaleDateString()}
                          </p>
                          {auth.decisionDate && (
                            <p className="text-sm text-muted-foreground">
                              Decision: {new Date(auth.decisionDate).toLocaleDateString()}
                            </p>
                          )}
                          {auth.notes && (
                            <Alert className="mt-2">
                              <AlertDescription>{auth.notes}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAuth(auth);
                            setShowUploadDialog(true);
                          }}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Document
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Secure Messages</CardTitle>
                <Button onClick={() => setShowMessageDialog(true)}>
                  <Send className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No messages yet
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <Card key={msg.id} className={`p-4 ${msg.status === 'unread' ? 'border-blue-500' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{msg.subject}</h3>
                            {msg.status === 'unread' && (
                              <Badge variant="secondary">New</Badge>
                            )}
                            <Badge variant="outline">
                              {msg.from === 'patient' ? 'You' : 'Staff'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{msg.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {msg.created_at && new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment Information</CardTitle>
                <Button onClick={() => setShowPaymentDialog(true)}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Make Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No payments due
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <Card key={payment.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{payment.description}</h3>
                          <p className="text-2xl font-bold">${payment.amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Due: {new Date(payment.dueDate).toLocaleDateString()}
                          </p>
                          <Badge className={`mt-2 ${
                            payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                            payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Document management coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile && (
                <>
                  <div>
                    <Label>Name</Label>
                    <Input value={profile.name} disabled />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={profile.email} disabled />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={profile.phone || ''} />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input value={profile.dateOfBirth || ''} disabled />
                  </div>
                  <div>
                    <Label>Notification Preferences</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span>Email Notifications</span>
                        <Button variant="outline" size="sm">
                          {profile.notificationPreferences?.email ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>SMS Notifications</span>
                        <Button variant="outline" size="sm">
                          {profile.notificationPreferences?.sms ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full">Save Changes</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Document Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select File</Label>
              <Input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
            {selectedAuth && (
              <Alert>
                <AlertDescription>
                  Uploading document for: {selectedAuth.serviceType} (Request #{selectedAuth.requestNumber})
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadDocument} disabled={!uploadFile || loading}>
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Secure Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Enter message subject"
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Enter your message"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!messageSubject || !messageText || loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Payment Amount</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentInfo['paymentMethod'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessPayment} disabled={!paymentAmount || loading}>
              {loading ? 'Processing...' : 'Process Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientPortal;

