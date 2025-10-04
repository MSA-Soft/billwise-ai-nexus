import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Calendar, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

interface PaymentPlan {
  id: string;
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
  notes: string;
}

interface PaymentInstallment {
  id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  paid_amount: number;
  status: string;
  paid_date: string | null;
  payment_method: string | null;
}

export default function PaymentPlanManagement() {
  const { toast } = useToast();
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [installments, setInstallments] = useState<PaymentInstallment[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [installmentDialogOpen, setInstallmentDialogOpen] = useState(false);

  // Create new plan form
  const [newPlan, setNewPlan] = useState({
    total_amount: "",
    down_payment: "",
    monthly_payment: "",
    number_of_payments: "",
    start_date: "",
    auto_pay: false,
    notes: "",
  });

  useEffect(() => {
    loadPaymentPlans();
  }, []);

  const loadPaymentPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_plans")
        .select("*")
        .order("created_at", { ascending: false });

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
        .from("payment_installments")
        .select("*")
        .eq("payment_plan_id", planId)
        .order("installment_number", { ascending: true });

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
      const totalAmount = parseFloat(newPlan.total_amount);
      const downPayment = parseFloat(newPlan.down_payment || "0");
      const monthlyPayment = parseFloat(newPlan.monthly_payment);
      const numPayments = parseInt(newPlan.number_of_payments);

      if (!totalAmount || !monthlyPayment || !numPayments || !newPlan.start_date) {
        toast({
          variant: "destructive",
          title: "Missing fields",
          description: "Please fill in all required fields",
        });
        return;
      }

      const remainingBalance = totalAmount - downPayment;
      const startDate = new Date(newPlan.start_date);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + numPayments);

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // Create payment plan
      const { data: plan, error: planError } = await supabase
        .from("payment_plans")
        .insert({
          user_id: user.user.id,
          total_amount: totalAmount,
          down_payment: downPayment,
          remaining_balance: remainingBalance,
          monthly_payment: monthlyPayment,
          number_of_payments: numPayments,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          auto_pay: newPlan.auto_pay,
          notes: newPlan.notes,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create installments
      const installmentsToCreate = [];
      for (let i = 0; i < numPayments; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        installmentsToCreate.push({
          payment_plan_id: plan.id,
          installment_number: i + 1,
          due_date: dueDate.toISOString(),
          amount: monthlyPayment,
          status: "pending",
        });
      }

      const { error: installmentError } = await supabase
        .from("payment_installments")
        .insert(installmentsToCreate);

      if (installmentError) throw installmentError;

      toast({
        title: "Payment plan created",
        description: `Successfully created payment plan with ${numPayments} installments`,
      });

      setCreateDialogOpen(false);
      setNewPlan({
        total_amount: "",
        down_payment: "",
        monthly_payment: "",
        number_of_payments: "",
        start_date: "",
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
        .from("payment_installments")
        .update({
          paid_amount: amount,
          status: "paid",
          paid_date: new Date().toISOString(),
          payment_method: "manual",
        })
        .eq("id", installmentId);

      if (error) throw error;

      toast({
        title: "Payment recorded",
        description: "Installment payment has been recorded successfully",
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      active: { color: "bg-blue-100 text-blue-800", icon: Clock },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      defaulted: { color: "bg-red-100 text-red-800", icon: XCircle },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: XCircle },
    };

    const variant = variants[status] || variants.active;
    const Icon = variant.icon;

    return (
      <Badge className={variant.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getInstallmentStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
      partial: "bg-orange-100 text-orange-800",
    };

    return (
      <Badge className={colors[status] || colors.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading payment plans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Plan Management</h2>
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
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_amount">Total Amount *</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    placeholder="1000.00"
                    value={newPlan.total_amount}
                    onChange={(e) => setNewPlan({ ...newPlan, total_amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="down_payment">Down Payment</Label>
                  <Input
                    id="down_payment"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newPlan.down_payment}
                    onChange={(e) => setNewPlan({ ...newPlan, down_payment: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly_payment">Monthly Payment *</Label>
                  <Input
                    id="monthly_payment"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={newPlan.monthly_payment}
                    onChange={(e) => setNewPlan({ ...newPlan, monthly_payment: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number_of_payments">Number of Payments *</Label>
                  <Input
                    id="number_of_payments"
                    type="number"
                    placeholder="12"
                    value={newPlan.number_of_payments}
                    onChange={(e) => setNewPlan({ ...newPlan, number_of_payments: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newPlan.start_date}
                  onChange={(e) => setNewPlan({ ...newPlan, start_date: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto_pay"
                  checked={newPlan.auto_pay}
                  onCheckedChange={(checked) => setNewPlan({ ...newPlan, auto_pay: checked })}
                />
                <Label htmlFor="auto_pay">Enable Auto-Pay</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={newPlan.notes}
                  onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
                />
              </div>

              <Button onClick={createPaymentPlan} className="w-full">
                Create Payment Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentPlans.filter((p) => p.status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${paymentPlans.reduce((sum, p) => sum + p.remaining_balance, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Plans</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentPlans.filter((p) => p.status === "completed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Total Amount</TableHead>
                <TableHead>Monthly Payment</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Auto-Pay</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">${plan.total_amount.toFixed(2)}</TableCell>
                  <TableCell>${plan.monthly_payment.toFixed(2)}</TableCell>
                  <TableCell>
                    {plan.payments_completed}/{plan.number_of_payments}
                  </TableCell>
                  <TableCell>${plan.remaining_balance.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(plan.status)}</TableCell>
                  <TableCell>{plan.auto_pay ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Dialog
                      open={installmentDialogOpen && selectedPlan?.id === plan.id}
                      onOpenChange={(open) => {
                        setInstallmentDialogOpen(open);
                        if (open) {
                          setSelectedPlan(plan);
                          loadInstallments(plan.id);
                        } else {
                          setSelectedPlan(null);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Payment Plan Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Amount</p>
                              <p className="text-lg font-semibold">${plan.total_amount.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Down Payment</p>
                              <p className="text-lg font-semibold">${plan.down_payment.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Monthly Payment</p>
                              <p className="text-lg font-semibold">${plan.monthly_payment.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Remaining</p>
                              <p className="text-lg font-semibold">${plan.remaining_balance.toFixed(2)}</p>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-3">Installments</h3>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>#</TableHead>
                                  <TableHead>Due Date</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Paid</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {installments.map((installment) => (
                                  <TableRow key={installment.id}>
                                    <TableCell>{installment.installment_number}</TableCell>
                                    <TableCell>{format(new Date(installment.due_date), "MMM dd, yyyy")}</TableCell>
                                    <TableCell>${installment.amount.toFixed(2)}</TableCell>
                                    <TableCell>${installment.paid_amount.toFixed(2)}</TableCell>
                                    <TableCell>{getInstallmentStatusBadge(installment.status)}</TableCell>
                                    <TableCell>
                                      {installment.status !== "paid" && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => recordPayment(installment.id, installment.amount)}
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
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {paymentPlans.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No payment plans found. Create your first payment plan to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
