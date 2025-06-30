
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, DollarSign, CreditCard, Mail, Phone, Calendar, Eye, Send, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PatientBalanceBilling = () => {
  const { toast } = useToast();

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patient-balances">Patient Balances</TabsTrigger>
          <TabsTrigger value="payment-plans">Payment Plans</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
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
                      <Button variant="outline" size="sm">
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
          <Card>
            <CardHeader>
              <CardTitle>Active Payment Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Payment Plan Management</h3>
                <p className="text-gray-600 mb-4">
                  Set up flexible payment plans to help patients manage their balances.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Payment Plan
                </Button>
              </div>
            </CardContent>
          </Card>
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
      </Tabs>
    </div>
  );
};

export default PatientBalanceBilling;
