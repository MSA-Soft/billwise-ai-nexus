import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from "lucide-react";

const formSchema = z.object({
  attorney_firm: z.string().min(1, "Attorney firm name is required"),
  attorney_contact: z.string().optional(),
  attorney_email: z.string().email().optional().or(z.literal("")),
  attorney_phone: z.string().optional(),
  case_number: z.string().optional(),
  expected_action: z.string().optional(),
  notes: z.string().optional(),
});

interface AttorneyReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  onSuccess: () => void;
}

export function AttorneyReferralDialog({
  open,
  onOpenChange,
  accountId,
  onSuccess,
}: AttorneyReferralDialogProps) {
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState<any>(null);
  const [eligibilityChecks, setEligibilityChecks] = useState({
    balance: false,
    daysOverdue: false,
    contactAttempts: false,
  });
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      attorney_firm: "",
      expected_action: "File lawsuit and obtain judgment",
    },
  });

  useEffect(() => {
    if (open && accountId) {
      loadAccountData();
    }
  }, [open, accountId]);

  const loadAccountData = async () => {
    const { data: account, error } = await supabase
      .from("collections_accounts")
      .select("*")
      .eq("id", accountId)
      .single();

    if (!error && account) {
      setAccountData(account);

      // Check eligibility criteria
      const balance = Number(account.current_balance) >= 500;
      const days = account.days_overdue >= 120;

      // Check number of contact attempts
      const { data: activities } = await supabase
        .from("collection_activities")
        .select("id")
        .eq("collection_account_id", accountId)
        .in("activity_type", ["phone_call", "email_sent", "letter_sent"]);

      const attempts = (activities?.length || 0) >= 3;

      setEligibilityChecks({
        balance,
        daysOverdue: days,
        contactAttempts: attempts,
      });
    }
  };

  const isEligible = Object.values(eligibilityChecks).every((check) => check);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("attorney_referrals").insert({
        collection_account_id: accountId,
        user_id: user.id,
        attorney_firm: values.attorney_firm,
        attorney_contact: values.attorney_contact || null,
        attorney_email: values.attorney_email || null,
        attorney_phone: values.attorney_phone || null,
        referral_amount: Number(accountData.current_balance),
        account_balance_at_referral: Number(accountData.current_balance),
        case_number: values.case_number || null,
        expected_action: values.expected_action || null,
        notes: values.notes || null,
      });

      if (error) throw error;

      // Update account status
      await supabase
        .from("collections_accounts")
        .update({ collection_status: "attorney_referral" })
        .eq("id", accountId);

      toast({
        title: "Success",
        description: "Account referred to attorney successfully",
      });

      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attorney Referral</DialogTitle>
          <DialogDescription>
            Refer this collection account to an attorney for legal action
          </DialogDescription>
        </DialogHeader>

        {accountData && (
          <div className="space-y-4">
            <Alert variant={isEligible ? "default" : "destructive"}>
              {isEligible ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="font-medium mb-2">
                  {isEligible ? "Account is eligible for attorney referral" : "Account may not meet all criteria"}
                </div>
                <ul className="space-y-1 text-sm">
                  <li className={eligibilityChecks.balance ? "text-green-600" : "text-red-600"}>
                    {eligibilityChecks.balance ? "✓" : "✗"} Balance ≥ $500 (${Number(accountData.current_balance).toFixed(2)})
                  </li>
                  <li className={eligibilityChecks.daysOverdue ? "text-green-600" : "text-red-600"}>
                    {eligibilityChecks.daysOverdue ? "✓" : "✗"} Days overdue ≥ 120 ({accountData.days_overdue} days)
                  </li>
                  <li className={eligibilityChecks.contactAttempts ? "text-green-600" : "text-red-600"}>
                    {eligibilityChecks.contactAttempts ? "✓" : "✗"} At least 3 contact attempts made
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="attorney_firm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attorney Firm</FormLabel>
                      <FormControl>
                        <Input placeholder="Law Firm Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="attorney_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Attorney name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="attorney_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 555-5555" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="attorney_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="attorney@lawfirm.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="case_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Case reference number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expected_action"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Action (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., File lawsuit, obtain judgment, wage garnishment" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional information for the attorney..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Documents will be automatically included: account statement, payment history, collection attempts log
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !isEligible}>
                    {loading ? "Referring..." : "Refer to Attorney"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
