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
import { Slider } from "@/components/ui/slider";

const formSchema = z.object({
  offer_percentage: z.number().min(10).max(100),
  expiration_date: z.string().min(1, "Expiration date is required"),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
});

interface SettlementOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  onSuccess: () => void;
}

export function SettlementOfferDialog({
  open,
  onOpenChange,
  accountId,
  onSuccess,
}: SettlementOfferDialogProps) {
  const [loading, setLoading] = useState(false);
  const [accountBalance, setAccountBalance] = useState(0);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      offer_percentage: 70,
      payment_terms: "Full payment due within 30 days of acceptance",
    },
  });

  useEffect(() => {
    if (open && accountId) {
      loadAccountBalance();
    }
  }, [open, accountId]);

  const loadAccountBalance = async () => {
    const { data, error } = await supabase
      .from("collections_accounts")
      .select("current_balance")
      .eq("id", accountId)
      .single();

    if (!error && data) {
      setAccountBalance(Number(data.current_balance));
    }
  };

  const offerPercentage = form.watch("offer_percentage") || 70;
  const offerAmount = (accountBalance * offerPercentage) / 100;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("settlement_offers").insert({
        collection_account_id: accountId,
        user_id: user.id,
        original_amount: accountBalance,
        offer_amount: offerAmount,
        offer_percentage: values.offer_percentage,
        expiration_date: values.expiration_date,
        payment_terms: values.payment_terms || null,
        notes: values.notes || null,
      });

      if (error) throw error;

      // Log activity
      await supabase.from("collection_activities").insert({
        collection_account_id: accountId,
        user_id: user.id,
        activity_type: "settlement_offer",
        notes: `Settlement offer created: ${values.offer_percentage}% ($${offerAmount.toFixed(2)}) of $${accountBalance.toFixed(2)}`,
        amount_discussed: offerAmount,
      });

      toast({
        title: "Success",
        description: "Settlement offer created successfully",
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
          <DialogTitle>Create Settlement Offer</DialogTitle>
          <DialogDescription>
            Propose a settlement amount to resolve the collection account
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-muted p-4 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Original Balance</p>
              <p className="text-2xl font-bold">${accountBalance.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offer Amount</p>
              <p className="text-2xl font-bold text-green-600">${offerAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Discount</p>
              <p className="text-2xl font-bold text-red-600">
                ${(accountBalance - offerAmount).toFixed(2)} ({100 - offerPercentage}%)
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="offer_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Settlement Percentage: {field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={10}
                      max={100}
                      step={5}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Adjust the slider to set the settlement percentage (typically 50-80%)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiration_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Date by which the patient must accept the offer
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Full payment due within 30 days, or 3 monthly installments" 
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
                    <Textarea placeholder="Additional notes about this settlement offer..." {...field} />
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
                {loading ? "Creating..." : "Create Offer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
