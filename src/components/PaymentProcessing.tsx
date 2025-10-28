import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  FileText,
  Download,
  Upload,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getEDIService, RemittanceAdvice } from "@/services/ediService";

const PaymentProcessing = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [remittanceAdvice, setRemittanceAdvice] = useState<RemittanceAdvice | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    claimId: "",
    payerId: "",
    checkNumber: "",
    paymentDate: "",
  });

  const payers = [
    { id: "MEDICARE", name: "Medicare" },
    { id: "BCBS", name: "Blue Cross Blue Shield" },
    { id: "AETNA", name: "Aetna" },
    { id: "CIGNA", name: "Cigna" },
    { id: "HUMANA", name: "Humana" },
    { id: "UHC", name: "UnitedHealth" },
  ];

  // Load pending payments on component mount
  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    // Simulate loading pending payments
    setPendingPayments([
      {
        id: "PAY-001",
        claimId: "CLM-2024-001",
        patientName: "Ahmad Hassan",
        amount: 450.00,
        payerId: "MEDICARE",
        status: "pending",
        submittedDate: "2024-06-28",
      },
      {
        id: "PAY-002",
        claimId: "CLM-2024-002",
        patientName: "Fatima Al-Zahra",
        amount: 1275.50,
        payerId: "BCBS",
        status: "processing",
        submittedDate: "2024-06-29",
      },
      {
        id: "PAY-003",
        claimId: "CLM-2024-003",
        patientName: "Omar Abdullah",
        amount: 325.75,
        payerId: "AETNA",
        status: "paid",
        submittedDate: "2024-06-30",
      },
    ]);
  };

  const handleProcessRemittance = async () => {
    if (!formData.claimId || !formData.payerId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const remittanceData = {
        claimId: formData.claimId,
        payerId: formData.payerId,
        checkNumber: formData.checkNumber,
        paymentDate: formData.paymentDate,
      };

      const ediService = getEDIService();
      const result = await ediService.processRemittance(remittanceData);
      setRemittanceAdvice(result);

      // Add to payment history
      setPaymentHistory(prev => [{
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        claimId: formData.claimId,
        totalPaid: result.totalPaid,
        adjustments: result.adjustments,
        patientResponsibility: result.patientResponsibility,
        paymentDate: result.paymentDate,
        checkNumber: result.checkNumber,
      }, ...prev]);

      toast({
        title: "Remittance Processed",
        description: `Payment of $${result.totalPaid.toFixed(2)} processed successfully`,
      });

    } catch (error: any) {
      toast({
        title: "Processing Failed",
        description: error.message || "Unable to process remittance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Processing</h1>
          <p className="text-muted-foreground">Process EDI 835 remittance advice and track payments</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <DollarSign className="h-4 w-4 mr-2" />
          EDI 835 Enabled
        </Badge>
      </div>

      <Tabs defaultValue="process" className="space-y-6">
        <TabsList>
          <TabsTrigger value="process">Process Remittance</TabsTrigger>
          <TabsTrigger value="pending">Pending Payments</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="process" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Processing Form */}
            <Card>
              <CardHeader>
                <CardTitle>Remittance Processing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="claimId">Claim ID</Label>
                  <Input
                    id="claimId"
                    value={formData.claimId}
                    onChange={(e) => setFormData(prev => ({ ...prev, claimId: e.target.value }))}
                    placeholder="Enter claim ID"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payerId">Insurance Payer</Label>
                    <Select value={formData.payerId} onValueChange={(value) => setFormData(prev => ({ ...prev, payerId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payer" />
                      </SelectTrigger>
                      <SelectContent>
                        {payers.map((payer) => (
                          <SelectItem key={payer.id} value={payer.id}>
                            {payer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="checkNumber">Check Number</Label>
                    <Input
                      id="checkNumber"
                      value={formData.checkNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkNumber: e.target.value }))}
                      placeholder="Enter check number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                  />
                </div>

                <Button onClick={handleProcessRemittance} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Process Remittance
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Remittance Results */}
            <Card>
              <CardHeader>
                <CardTitle>Remittance Advice</CardTitle>
              </CardHeader>
              <CardContent>
                {remittanceAdvice ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-600">Payment Processed</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Claim ID:</span>
                        <span className="text-sm font-medium">{remittanceAdvice.claimId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Paid:</span>
                        <span className="text-sm font-medium text-green-600">
                          ${remittanceAdvice.totalPaid.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Patient Responsibility:</span>
                        <span className="text-sm font-medium">
                          ${remittanceAdvice.patientResponsibility.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Payment Date:</span>
                        <span className="text-sm font-medium">
                          {new Date(remittanceAdvice.paymentDate).toLocaleDateString()}
                        </span>
                      </div>
                      {remittanceAdvice.checkNumber && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Check Number:</span>
                          <span className="text-sm font-medium">{remittanceAdvice.checkNumber}</span>
                        </div>
                      )}
                    </div>

                    {remittanceAdvice.adjustments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Adjustments</h4>
                        <div className="space-y-2">
                          {remittanceAdvice.adjustments.map((adjustment, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{adjustment.reason}</span>
                              <span className="text-red-600">-${adjustment.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter remittance information and click "Process Remittance" to process payment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.claimId}</TableCell>
                      <TableCell>{payment.patientName}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{payment.payerId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(payment.submittedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Check Status
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentHistory.length > 0 ? (
                <div className="space-y-4">
                  {paymentHistory.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium">Claim {entry.claimId}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          ${entry.totalPaid.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.checkNumber && `Check #${entry.checkNumber}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payment history yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentProcessing;
