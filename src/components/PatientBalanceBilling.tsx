import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Users, DollarSign, CreditCard, Mail, Phone, Calendar, Eye, Send, Plus, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BillingChat from "./BillingChat";
import BillingCycleConfig from "./BillingCycleConfig";
import CommunicationPreferences from "./CommunicationPreferences";
import PaymentPlanManagement from "./PaymentPlanManagement";

const PatientBalanceBilling = () => {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<typeof patientBalances[0] | null>(null);
  const [statementOpen, setStatementOpen] = useState(false);

  const patientBalances = [
    {
      id: "PAT-001",
      name: "John Smith",
      balance: 450.00,
      lastPayment: "2024-05-15",
      paymentMethod: "Auto-Pay",
      status: "Current",
      phone: "(555) 123-4567",
      email: "john.smith@email.com",
      insuranceClaim: "CLM-2024-001",
      daysOutstanding: 15
    },
    {
      id: "PAT-002",
      name: "Sarah Johnson",
      balance: 1275.80,
      lastPayment: "2024-04-22",
      paymentMethod: "Manual",
      status: "30+ Days",
      phone: "(555) 234-5678",
      email: "sarah.johnson@email.com",
      insuranceClaim: "CLM-2024-002",
      daysOutstanding: 38
    },
    {
      id: "PAT-003",
      name: "Mike Davis",
      balance: 89.25,
      lastPayment: "2024-06-10",
      paymentMethod: "Credit Card",
      status: "Current",
      phone: "(555) 345-6789",
      email: "mike.davis@email.com",
      insuranceClaim: "CLM-2024-003",
      daysOutstanding: 5
    },
    {
      id: "PAT-004",
      name: "Emily Wilson",
      balance: 2340.50,
      lastPayment: "2024-03-15",
      paymentMethod: "Check",
      status: "90+ Days",
      phone: "(555) 456-7890",
      email: "emily.wilson@email.com",
      insuranceClaim: "CLM-2024-004",
      daysOutstanding: 106
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Current": return "bg-green-100 text-green-800";
      case "30+ Days": return "bg-yellow-100 text-yellow-800";
      case "60+ Days": return "bg-orange-100 text-orange-800";
      case "90+ Days": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleSendStatement = (patientId: string) => {
    toast({
      title: "Statement Sent",
      description: `Patient statement sent successfully to ${patientId}.`,
    });
  };

  const handleSetupPaymentPlan = (patientId: string) => {
    toast({
      title: "Payment Plan Setup",
      description: `Payment plan configuration opened for ${patientId}.`,
    });
  };

  const handleViewDetails = (patient: typeof patientBalances[0]) => {
    setSelectedPatient(patient);
    setStatementOpen(true);
  };

  const handlePrintStatement = () => {
    window.print();
  };

  // Generate mock transaction history for the selected patient
  const getTransactionHistory = (patient: typeof patientBalances[0] | null) => {
    if (!patient) return [];
    
    return [
      {
        date: "2024-06-01",
        description: "Office Visit - Dr. Smith",
        type: "Charge",
        amount: 250.00,
        balance: patient.balance
      },
      {
        date: "2024-05-28",
        description: "Lab Work - Blood Panel",
        type: "Charge",
        amount: 180.00,
        balance: patient.balance - 250.00
      },
      {
        date: patient.lastPayment,
        description: `Payment Received - ${patient.paymentMethod}`,
        type: "Payment",
        amount: -150.00,
        balance: patient.balance - 430.00
      },
      {
        date: "2024-04-15",
        description: "Insurance Adjustment",
        type: "Adjustment",
        amount: -80.00,
        balance: patient.balance - 280.00
      }
    ];
  };

  const totalBalance = patientBalances.reduce((sum, patient) => sum + patient.balance, 0);
  const currentBalance = patientBalances.filter(p => p.status === "Current").reduce((sum, patient) => sum + patient.balance, 0);
  const overdueBalance = totalBalance - currentBalance;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Patient Balance Billing</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Bulk Statements
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Payment Plan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patient-balances">Patient Balances</TabsTrigger>
          <TabsTrigger value="payment-plans">Payment Plans</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across {patientBalances.length} patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balances</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${currentBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Within terms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Balances</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${overdueBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{Math.round((overdueBalance / totalBalance) * 100)}% of total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Auto-Pay Enrolled</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patientBalances.filter(p => p.paymentMethod === "Auto-Pay").length}
              </div>
              <p className="text-xs text-muted-foreground">of {patientBalances.length} patients</p>
            </CardContent>
          </Card>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Aging Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">Current (0-30 days)</div>
                      <div className="text-sm text-gray-600">
                        {patientBalances.filter(p => p.status === "Current").length} patients
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${currentBalance.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <div className="font-medium">30-60 days</div>
                      <div className="text-sm text-gray-600">
                        {patientBalances.filter(p => p.status === "30+ Days").length} patients
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ${patientBalances.filter(p => p.status === "30+ Days").reduce((sum, p) => sum + p.balance, 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium">90+ days</div>
                      <div className="text-sm text-gray-600">
                        {patientBalances.filter(p => p.status === "90+ Days").length} patients
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ${patientBalances.filter(p => p.status === "90+ Days").reduce((sum, p) => sum + p.balance, 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Auto-Pay", "Credit Card", "Manual", "Check"].map((method) => {
                    const count = patientBalances.filter(p => p.paymentMethod === method).length;
                    const percentage = Math.round((count / patientBalances.length) * 100);
                    
                    return (
                      <div key={method} className="flex items-center justify-between">
                        <span>{method}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patient-balances" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Patient Balances</CardTitle>
                <div className="flex space-x-2">
                  <Input placeholder="Search patients..." className="w-64" />
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="current">Current</SelectItem>
                      <SelectItem value="30-days">30+ Days</SelectItem>
                      <SelectItem value="90-days">90+ Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientBalances.map((patient) => (
                  <div key={patient.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <Users className="h-8 w-8 text-blue-500" />
                        <div>
                          <div className="font-semibold">{patient.name}</div>
                          <div className="text-sm text-gray-600">{patient.id}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                        <div className="text-right">
                          <div className="font-semibold text-lg">${patient.balance.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{patient.daysOutstanding} days</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Contact</div>
                        <div className="text-sm">{patient.phone}</div>
                        <div className="text-sm">{patient.email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Payment Method</div>
                        <div className="font-medium">{patient.paymentMethod}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Last Payment</div>
                        <div className="font-medium">{patient.lastPayment}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Related Claim</div>
                        <div className="font-medium">{patient.insuranceClaim}</div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(patient)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSendStatement(patient.id)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Statement
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Patient
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleSetupPaymentPlan(patient.id)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Payment Plan
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-plans" className="space-y-6">
          <PaymentPlanManagement />
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Collections Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientBalances.filter(p => p.status === "90+ Days").map((patient) => (
                  <div key={patient.id} className="border rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <DollarSign className="h-8 w-8 text-red-500" />
                        <div>
                          <div className="font-semibold">{patient.name}</div>
                          <div className="text-sm text-gray-600">
                            ${patient.balance.toFixed(2)} • {patient.daysOutstanding} days overdue
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          <Send className="h-4 w-4 mr-2" />
                          Collections Notice
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <BillingCycleConfig />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          {selectedPatient && (
            <CommunicationPreferences
              patientId={selectedPatient.id}
              patientName={selectedPatient.name}
            />
          )}
          {!selectedPatient && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Select a patient from the Patient Balances tab to manage their communication preferences
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Live Chat - shown when viewing patient details */}
      {selectedPatient && (
        <BillingChat
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
        />
      )}

      {/* Patient Statement Dialog */}
      <Dialog open={statementOpen} onOpenChange={setStatementOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Billing Statement</DialogTitle>
            <DialogDescription>
              Detailed billing statement for {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-6 print:p-8">
              {/* Statement Header */}
              <div className="flex justify-between items-start pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-primary">Medical Billing Services</h2>
                  <p className="text-sm text-muted-foreground mt-1">123 Healthcare Drive</p>
                  <p className="text-sm text-muted-foreground">Medical City, MC 12345</p>
                  <p className="text-sm text-muted-foreground">Phone: (555) 000-0000</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">STATEMENT</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Date: {new Date().toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Account #: {selectedPatient.id}
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div>
                <h3 className="font-semibold mb-3">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">Patient Name</div>
                    <div className="font-medium">{selectedPatient.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Patient ID</div>
                    <div className="font-medium">{selectedPatient.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div className="font-medium">{selectedPatient.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">{selectedPatient.email}</div>
                  </div>
                </div>
              </div>

              {/* Account Summary */}
              <div>
                <h3 className="font-semibold mb-3">Account Summary</h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Previous Balance</span>
                    <span className="font-medium">${(selectedPatient.balance - 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payments Received</span>
                    <span className="font-medium text-green-600">-$150.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">New Charges</span>
                    <span className="font-medium">${(selectedPatient.balance + 50).toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Current Balance</span>
                    <span className="font-bold">${selectedPatient.balance.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Aging Breakdown */}
              <div>
                <h3 className="font-semibold mb-3">Aging Breakdown</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground mb-1">Current</div>
                    <div className="font-semibold">
                      ${selectedPatient.status === "Current" ? selectedPatient.balance.toFixed(2) : "0.00"}
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground mb-1">31-60 Days</div>
                    <div className="font-semibold">
                      ${selectedPatient.status === "30+ Days" ? selectedPatient.balance.toFixed(2) : "0.00"}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground mb-1">61-90 Days</div>
                    <div className="font-semibold">
                      ${selectedPatient.status === "60+ Days" ? selectedPatient.balance.toFixed(2) : "0.00"}
                    </div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground mb-1">90+ Days</div>
                    <div className="font-semibold">
                      ${selectedPatient.status === "90+ Days" ? selectedPatient.balance.toFixed(2) : "0.00"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <h3 className="font-semibold mb-3">Transaction History</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Description</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-right p-3">Amount</th>
                        <th className="text-right p-3">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getTransactionHistory(selectedPatient).map((transaction, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{transaction.date}</td>
                          <td className="p-3">{transaction.description}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              {transaction.type}
                            </Badge>
                          </td>
                          <td className={`p-3 text-right font-medium ${
                            transaction.amount < 0 ? 'text-green-600' : ''
                          }`}>
                            {transaction.amount < 0 ? '-' : ''}${Math.abs(transaction.amount).toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-medium">
                            ${transaction.balance.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Due:</span>
                    <span className="font-bold text-lg">${selectedPatient.balance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div>
                    <div className="font-medium mb-1">Payment Methods Accepted:</div>
                    <ul className="list-disc list-inside text-muted-foreground text-xs space-y-1">
                      <li>Credit/Debit Card</li>
                      <li>Check (payable to: Medical Billing Services)</li>
                      <li>Online Payment Portal: www.medicalbilling.com/pay</li>
                      <li>Auto-Pay (enroll for automatic monthly payments)</li>
                    </ul>
                  </div>
                  <div className="mt-3">
                    <div className="font-medium mb-1">Mail Payments To:</div>
                    <div className="text-xs text-muted-foreground">
                      Medical Billing Services<br />
                      P.O. Box 12345<br />
                      Medical City, MC 12345
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Insurance Claim */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Related Insurance Claim</h3>
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Claim Number:</span>
                    <span className="font-medium">{selectedPatient.insuranceClaim}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline">Processed</Badge>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-xs text-muted-foreground border-t pt-4 space-y-1">
                <p>Questions about your bill? Contact us at (555) 000-0000 or billing@medicalbilling.com</p>
                <p>Payment plans available - call us to discuss options that work for you.</p>
                <p className="font-medium">Thank you for choosing our healthcare services!</p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t print:hidden">
                <Button
                  variant="outline"
                  onClick={handlePrintStatement}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Statement
                </Button>
                <Button
                  onClick={() => {
                    handleSendStatement(selectedPatient.id);
                    setStatementOpen(false);
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Statement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientBalanceBilling;
