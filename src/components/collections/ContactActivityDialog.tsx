import { useState } from "react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  activity_type: z.enum(["phone_call", "email_sent", "letter_sent", "promise_to_pay", "partial_payment", "note_added"]),
  contact_method: z.enum(["phone", "email", "mail", "sms", "in_person"]).optional(),
  outcome: z.string().optional(),
  notes: z.string().min(1, "Notes are required"),
  promise_to_pay_date: z.string().optional(),
  amount_discussed: z.string().optional(),
  performed_by: z.string().optional(),
});

interface ContactActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  onSuccess: () => void;
}

export function ContactActivityDialog({
  open,
  onOpenChange,
  accountId,
  onSuccess,
}: ContactActivityDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activity_type: "phone_call",
      notes: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("collection_activities").insert({
        collection_account_id: accountId,
        user_id: user.id,
        activity_type: values.activity_type,
        contact_method: values.contact_method || null,
        outcome: values.outcome || null,
        notes: values.notes,
        promise_to_pay_date: values.promise_to_pay_date || null,
        amount_discussed: values.amount_discussed ? parseFloat(values.amount_discussed) : null,
        performed_by: values.performed_by || null,
      });

      if (error) throw error;

      // Update last contact date on the account
      await supabase
        .from("collections_accounts")
        .update({ last_contact_date: new Date().toISOString() })
        .eq("id", accountId);

      toast({
        title: "Success",
        description: "Collection activity logged successfully",
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log Contact Activity</DialogTitle>
          <DialogDescription>
            Record a contact attempt or communication with the patient
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="activity_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="phone_call">Phone Call</SelectItem>
                      <SelectItem value="email_sent">Email Sent</SelectItem>
                      <SelectItem value="letter_sent">Letter Sent</SelectItem>
                      <SelectItem value="promise_to_pay">Promise to Pay</SelectItem>
                      <SelectItem value="partial_payment">Partial Payment</SelectItem>
                      <SelectItem value="note_added">Note Added</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Method (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="mail">Mail</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outcome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outcome (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., No answer, Left voicemail, Spoke with patient" {...field} />
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detailed notes about this activity..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="promise_to_pay_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promise to Pay Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount_discussed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Discussed (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="performed_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Performed By (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Staff member name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Logging..." : "Log Activity"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
