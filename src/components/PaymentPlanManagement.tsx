import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Eye, DollarSign, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface PaymentPlan {
  id: string;
  user_id: string;
  statement_id?: string;
  total_amount: number;
  down_payment: number;
  remaining_balance: number;
  monthly_payment: number;
  number_of_payments: number;
  payments_completed: number;
  start_date: string;
  end_date: string;
  status: string;
  auto_pay: boolean;
  notes?: string;
  created_at: string;
}

interface PaymentInstallment {
  id: string;
  payment_plan_id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  paid_amount: number;
  status: string;
  paid_date?: string;
  payment_method?: string;
  notes?: string;
}

export default function PaymentPlanManagement() {
  const { toast } = useToast();
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [installments, setInstallments] = useState<PaymentInstallment[]>([]);
  
  // Form state for new payment plan
  const [formData, setFormData] = useState({
    total_amount: "",
    down_payment: "",
    monthly_payment: "",
    number_of_payments: "",
    start_date: new Date().toISOString().split('T')[0],
    auto_pay: false,
    notes: "",
  });

  useEffect(() => {
    loadPaymentPlans();
  }, []);

  const loadPaymentPlans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('payment_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentPlans(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading payment plans",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInstallments = async (planId: string) => {
    try {
      const { data, error } = await supabase
        .from('payment_installments')
        .select('*')
        .eq('payment_plan_id', planId)
        .order('installment_number', { ascending: true });

      if (error) throw error;
      setInstallments(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading installments",
        description: error.message,
      });
    }
  };

  const createPaymentPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const totalAmount = parseFloat(formData.total_amount);
      const downPayment = parseFloat(formData.down_payment || "0");
      const monthlyPayment = parseFloat(formData.monthly_payment);
      const numPayments = parseInt(formData.number_of_payments);

      if (!totalAmount || !monthlyPayment || !numPayments) {
        toast({
          variant: "destructive",
          title: "Invalid input",
          description: "Please fill in all required fields",
        });
        return;
      }

      const remainingBalance = totalAmount - downPayment;
      const startDate = new Date(formData.start_date);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + numPayments);

      // Create payment plan
      const { data: plan, error: planError } = await supabase
        .from('payment_plans')
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          down_payment: downPayment,
          remaining_balance: remainingBalance,
          monthly_payment: monthlyPayment,
          number_of_payments: numPayments,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          auto_pay: formData.auto_pay,
          notes: formData.notes,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create installments
      const installmentsData = [];
      for (let i = 1; i <= numPayments; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        installmentsData.push({
          payment_plan_id: plan.id,
          installment_number: i,
          due_date: dueDate.toISOString(),
          amount: monthlyPayment,
        });
      }

      const { error: installmentsError } = await supabase
        .from('payment_installments')
        .insert(installmentsData);

      if (installmentsError) throw installmentsError;

      toast({
        title: "Payment plan created",
        description: "Payment plan has been successfully created",
      });

      setCreateDialogOpen(false);
      setFormData({
        total_amount: "",
        down_payment: "",
        monthly_payment: "",
        number_of_payments: "",
        start_date: new Date().toISOString().split('T')[0],
        auto_pay: false,
        notes: "",
      });
      loadPaymentPlans();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating payment plan",
        description: error.message,
      });
    }
  };

  const recordPayment = async (installmentId: string, amount: number) => {
    try {
      const { error } = await supabase
        .from('payment_installments')
        .update({
          paid_amount: amount,
          status: 'paid',
          paid_date: new Date().toISOString(),
          payment_method: 'manual',
        })
        .eq('id', installmentId);

      if (error) throw error;

      toast({
        title: "Payment recorded",
        description: "Payment has been successfully recorded",
      });

      if (selectedPlan) {
        loadInstallments(selectedPlan.id);
        loadPaymentPlans();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error recording payment",
        description: error.message,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'defaulted': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInstallmentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading payment plans...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Payment Plan Management</h2>
          <p className="text-muted-foreground">Create and manage patient payment plans</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Payment Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Payment Plan</DialogTitle>
              <DialogDescription>Set up a new payment plan for a patient</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total_amount">Total Amount</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    placeholder="1000.00"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="down_payment">Down Payment (Optional)</Label>
                  <Input
                    id="down_payment"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.down_payment}
                    onChange={(e) => setFormData({ ...formData, down_payment: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthly_payment">Monthly Payment</Label>
                  <Input
                    id="monthly_payment"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={formData.monthly_payment}
                    onChange={(e) => setFormData({ ...formData, monthly_payment: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="number_of_payments">Number of Payments</Label>
                  <Input
                    id="number_of_payments"
                    type="number"
                    placeholder="12"
                    value={formData.number_of_payments}
                    onChange={(e) => setFormData({ ...formData, number_of_payments: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto_pay"
                  checked={formData.auto_pay}
                  onCheckedChange={(checked) => setFormData({ ...formData, auto_pay: checked })}
                />
                <Label htmlFor="auto_pay">Enable Auto-Pay</Label>
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createPaymentPlan}>Create Plan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentPlans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentPlans.filter(p => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Plans</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentPlans.filter(p => p.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${paymentPlans
                .filter(p => p.status === 'active')
                .reduce((sum, p) => sum + p.remaining_balance, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Plans</CardTitle>
          <CardDescription>View and manage all payment plans</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan ID</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Monthly Payment</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Remaining Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-mono text-sm">
                    {plan.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>${plan.total_amount.toFixed(2)}</TableCell>
                  <TableCell>${plan.monthly_payment.toFixed(2)}</TableCell>
                  <TableCell>
                    {plan.payments_completed} / {plan.number_of_payments}
                  </TableCell>
                  <TableCell>${plan.remaining_balance.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(plan.status)}>
                      {plan.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(plan.start_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPlan(plan);
                        loadInstallments(plan.id);
                        setViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Plan Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment Plan Details</DialogTitle>
            <DialogDescription>
              View installment schedule and record payments
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Amount</Label>
                  <div className="text-2xl font-bold">
                    ${selectedPlan.total_amount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <Label>Remaining Balance</Label>
                  <div className="text-2xl font-bold text-orange-600">
                    ${selectedPlan.remaining_balance.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installments.map((inst) => (
                    <TableRow key={inst.id}>
                      <TableCell>{inst.installment_number}</TableCell>
                      <TableCell>
                        {new Date(inst.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${inst.amount.toFixed(2)}</TableCell>
                      <TableCell>${inst.paid_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getInstallmentStatusColor(inst.status)}>
                          {inst.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {inst.status !== 'paid' && (
                          <Button
                            size="sm"
                            onClick={() => recordPayment(inst.id, inst.amount)}
                          >
                            Record Payment
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
