import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  DollarSign,
  Users,
  TrendingUp,
  Activity,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Play,
  Pause,
  Stop
} from 'lucide-react';
import { getEDIService } from '@/services/ediService';

interface EDITransaction {
  id: string;
  transactionType: '270' | '271' | '276' | '277' | '837' | '835';
  status: 'pending' | 'sent' | 'acknowledged' | 'rejected' | 'processed';
  patientId: string;
  payerId: string;
  amount?: number;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

const EDIDashboard = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<EDITransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<EDITransaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states for different EDI transactions
  const [eligibilityForm, setEligibilityForm] = useState({
    patientId: '',
    subscriberId: '',
    payerId: '',
    serviceDate: '',
    serviceCodes: [] as string[],
    diagnosisCodes: [] as string[]
  });

  const [claimForm, setClaimForm] = useState({
    patientId: '',
    payerId: '',
    serviceDate: '',
    diagnosisCodes: [] as string[],
    procedureCodes: [] as string[],
    totalAmount: 0
  });

  const [statusForm, setStatusForm] = useState({
    claimId: '',
    patientId: '',
    payerId: '',
    serviceDate: ''
  });

  // Load sample transactions on component mount
  useEffect(() => {
    loadSampleTransactions();
  }, []);

  const loadSampleTransactions = () => {
    const sampleTransactions: EDITransaction[] = [
      {
        id: 'EDI-001',
        transactionType: '270',
        status: 'processed',
        patientId: 'PAT-001',
        payerId: 'AETNA',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'EDI-002',
        transactionType: '837',
        status: 'acknowledged',
        patientId: 'PAT-002',
        payerId: 'BCBS',
        amount: 1250.00,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'EDI-003',
        transactionType: '276',
        status: 'pending',
        patientId: 'PAT-003',
        payerId: 'CIGNA',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        updatedAt: new Date(Date.now() - 900000).toISOString()
      },
      {
        id: 'EDI-004',
        transactionType: '835',
        status: 'processed',
        patientId: 'PAT-004',
        payerId: 'HUMANA',
        amount: 850.00,
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        updatedAt: new Date(Date.now() - 5400000).toISOString()
      }
    ];
    setTransactions(sampleTransactions);
  };

  const handleEligibilityCheck = async () => {
    if (!eligibilityForm.patientId || !eligibilityForm.subscriberId || !eligibilityForm.payerId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields for eligibility check.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const ediService = getEDIService();
      const result = await ediService.checkEligibility({
        patientId: eligibilityForm.patientId,
        subscriberId: eligibilityForm.subscriberId,
        payerId: eligibilityForm.payerId,
        serviceDate: eligibilityForm.serviceDate,
        serviceCodes: eligibilityForm.serviceCodes,
        diagnosisCodes: eligibilityForm.diagnosisCodes
      });

      // Add transaction to list
      const newTransaction: EDITransaction = {
        id: `EDI-${Date.now()}`,
        transactionType: '270',
        status: 'processed',
        patientId: eligibilityForm.patientId,
        payerId: eligibilityForm.payerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTransactions(prev => [newTransaction, ...prev]);

      toast({
        title: "Eligibility Check Complete",
        description: result.isEligible ? "Patient is eligible for coverage" : "Patient is not eligible for coverage"
      });

    } catch (error: any) {
      toast({
        title: "Eligibility Check Failed",
        description: error.message || "Unable to check eligibility",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitClaim = async () => {
    if (!claimForm.patientId || !claimForm.payerId || !claimForm.serviceDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields for claim submission.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const ediService = getEDIService();
      const result = await ediService.submitClaim({
        patientId: claimForm.patientId,
        payerId: claimForm.payerId,
        serviceDate: claimForm.serviceDate,
        diagnosisCodes: claimForm.diagnosisCodes,
        procedureCodes: claimForm.procedureCodes,
        totalAmount: claimForm.totalAmount
      });

      // Add transaction to list
      const newTransaction: EDITransaction = {
        id: result.id,
        transactionType: '837',
        status: 'sent',
        patientId: claimForm.patientId,
        payerId: claimForm.payerId,
        amount: claimForm.totalAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTransactions(prev => [newTransaction, ...prev]);

      toast({
        title: "Claim Submitted",
        description: `Claim ${result.id} has been submitted successfully`
      });

    } catch (error: any) {
      toast({
        title: "Claim Submission Failed",
        description: error.message || "Unable to submit claim",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!statusForm.claimId || !statusForm.patientId || !statusForm.payerId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields for status check.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const ediService = getEDIService();
      const result = await ediService.checkClaimStatus({
        claimId: statusForm.claimId,
        patientId: statusForm.patientId,
        payerId: statusForm.payerId,
        serviceDate: statusForm.serviceDate
      });

      // Add transaction to list
      const newTransaction: EDITransaction = {
        id: `EDI-${Date.now()}`,
        transactionType: '276',
        status: 'processed',
        patientId: statusForm.patientId,
        payerId: statusForm.payerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTransactions(prev => [newTransaction, ...prev]);

      toast({
        title: "Status Check Complete",
        description: `Claim status: ${result.status}`
      });

    } catch (error: any) {
      toast({
        title: "Status Check Failed",
        description: error.message || "Unable to check claim status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'acknowledged':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      processed: 'bg-green-100 text-green-800',
      acknowledged: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      sent: 'bg-purple-100 text-purple-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case '270':
      case '271':
        return <Users className="h-4 w-4 text-blue-500" />;
      case '276':
      case '277':
        return <FileText className="h-4 w-4 text-green-500" />;
      case '837':
        return <Send className="h-4 w-4 text-purple-500" />;
      case '835':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">EDI Dashboard</h2>
          <p className="text-gray-600">Manage Electronic Data Interchange transactions</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadSampleTransactions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processed</p>
                <p className="text-2xl font-bold text-green-600">
                  {transactions.filter(t => t.status === 'processed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {transactions.filter(t => t.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {transactions.filter(t => t.status === 'rejected').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility (270/271)</TabsTrigger>
          <TabsTrigger value="claims">Claims (837)</TabsTrigger>
          <TabsTrigger value="status">Status (276/277)</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent EDI Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transactions.slice(0, 10).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setIsDialogOpen(true);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {getTransactionTypeIcon(transaction.transactionType)}
                      <div>
                        <p className="font-medium">{transaction.id}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.transactionType} • {transaction.patientId} • {transaction.payerId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusBadge(transaction.status)}>
                        {transaction.status}
                      </Badge>
                      {getStatusIcon(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Eligibility Tab */}
        <TabsContent value="eligibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>270/271 - Eligibility Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eligibility-patient">Patient ID</Label>
                  <Input
                    id="eligibility-patient"
                    value={eligibilityForm.patientId}
                    onChange={(e) => setEligibilityForm(prev => ({ ...prev, patientId: e.target.value }))}
                    placeholder="Enter Patient ID"
                  />
                </div>
                <div>
                  <Label htmlFor="eligibility-subscriber">Subscriber ID</Label>
                  <Input
                    id="eligibility-subscriber"
                    value={eligibilityForm.subscriberId}
                    onChange={(e) => setEligibilityForm(prev => ({ ...prev, subscriberId: e.target.value }))}
                    placeholder="Enter Subscriber ID"
                  />
                </div>
                <div>
                  <Label htmlFor="eligibility-payer">Payer ID</Label>
                  <Select
                    value={eligibilityForm.payerId}
                    onValueChange={(value) => setEligibilityForm(prev => ({ ...prev, payerId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Payer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AETNA">Aetna</SelectItem>
                      <SelectItem value="BCBS">Blue Cross Blue Shield</SelectItem>
                      <SelectItem value="CIGNA">Cigna</SelectItem>
                      <SelectItem value="HUMANA">Humana</SelectItem>
                      <SelectItem value="UHC">UnitedHealthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="eligibility-date">Service Date</Label>
                  <Input
                    id="eligibility-date"
                    type="date"
                    value={eligibilityForm.serviceDate}
                    onChange={(e) => setEligibilityForm(prev => ({ ...prev, serviceDate: e.target.value }))}
                  />
                </div>
              </div>
              <Button 
                onClick={handleEligibilityCheck} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Check Eligibility
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claims Tab */}
        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>837 - Healthcare Claim Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="claim-patient">Patient ID</Label>
                  <Input
                    id="claim-patient"
                    value={claimForm.patientId}
                    onChange={(e) => setClaimForm(prev => ({ ...prev, patientId: e.target.value }))}
                    placeholder="Enter Patient ID"
                  />
                </div>
                <div>
                  <Label htmlFor="claim-payer">Payer ID</Label>
                  <Select
                    value={claimForm.payerId}
                    onValueChange={(value) => setClaimForm(prev => ({ ...prev, payerId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Payer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AETNA">Aetna</SelectItem>
                      <SelectItem value="BCBS">Blue Cross Blue Shield</SelectItem>
                      <SelectItem value="CIGNA">Cigna</SelectItem>
                      <SelectItem value="HUMANA">Humana</SelectItem>
                      <SelectItem value="UHC">UnitedHealthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="claim-date">Service Date</Label>
                  <Input
                    id="claim-date"
                    type="date"
                    value={claimForm.serviceDate}
                    onChange={(e) => setClaimForm(prev => ({ ...prev, serviceDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="claim-amount">Total Amount</Label>
                  <Input
                    id="claim-amount"
                    type="number"
                    value={claimForm.totalAmount}
                    onChange={(e) => setClaimForm(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter amount"
                  />
                </div>
              </div>
              <Button 
                onClick={handleSubmitClaim} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Submit Claim
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>276/277 - Claim Status Inquiry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status-claim">Claim ID</Label>
                  <Input
                    id="status-claim"
                    value={statusForm.claimId}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, claimId: e.target.value }))}
                    placeholder="Enter Claim ID"
                  />
                </div>
                <div>
                  <Label htmlFor="status-patient">Patient ID</Label>
                  <Input
                    id="status-patient"
                    value={statusForm.patientId}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, patientId: e.target.value }))}
                    placeholder="Enter Patient ID"
                  />
                </div>
                <div>
                  <Label htmlFor="status-payer">Payer ID</Label>
                  <Select
                    value={statusForm.payerId}
                    onValueChange={(value) => setStatusForm(prev => ({ ...prev, payerId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Payer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AETNA">Aetna</SelectItem>
                      <SelectItem value="BCBS">Blue Cross Blue Shield</SelectItem>
                      <SelectItem value="CIGNA">Cigna</SelectItem>
                      <SelectItem value="HUMANA">Humana</SelectItem>
                      <SelectItem value="UHC">UnitedHealthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status-date">Service Date</Label>
                  <Input
                    id="status-date"
                    type="date"
                    value={statusForm.serviceDate}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, serviceDate: e.target.value }))}
                  />
                </div>
              </div>
              <Button 
                onClick={handleCheckStatus} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Check Status
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Transaction ID</Label>
                  <p className="text-lg font-semibold">{selectedTransaction.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Type</Label>
                  <p className="text-lg font-semibold">{selectedTransaction.transactionType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={getStatusBadge(selectedTransaction.status)}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Patient ID</Label>
                  <p className="text-lg">{selectedTransaction.patientId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Payer ID</Label>
                  <p className="text-lg">{selectedTransaction.payerId}</p>
                </div>
                {selectedTransaction.amount && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Amount</Label>
                    <p className="text-lg font-semibold">${selectedTransaction.amount.toFixed(2)}</p>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Created</Label>
                <p className="text-sm">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                <p className="text-sm">{new Date(selectedTransaction.updatedAt).toLocaleString()}</p>
              </div>
              {selectedTransaction.errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <Label className="text-sm font-medium text-red-600">Error Message</Label>
                  <p className="text-sm text-red-700">{selectedTransaction.errorMessage}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EDIDashboard;

