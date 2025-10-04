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
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const formSchema = z.object({
  dispute_reason: z.string().min(10, "Please provide a detailed dispute reason"),
});

interface DisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  onSuccess: () => void;
}

export function DisputeDialog({
  open,
  onOpenChange,
  accountId,
  onSuccess,
}: DisputeDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dispute_reason: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("dispute_claims").insert({
        collection_account_id: accountId,
        user_id: user.id,
        dispute_reason: values.dispute_reason,
      });

      if (error) throw error;

      // Update account status to dispute
      await supabase
        .from("collections_accounts")
        .update({ collection_status: "dispute" })
        .eq("id", accountId);

      // Log activity
      await supabase.from("collection_activities").insert({
        collection_account_id: accountId,
        user_id: user.id,
        activity_type: "dispute_received",
        notes: `Dispute filed: ${values.dispute_reason}`,
      });

      toast({
        title: "Success",
        description: "Dispute claim filed successfully. Collection activities have been paused.",
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
          <DialogTitle>File Dispute Claim</DialogTitle>
          <DialogDescription>
            Record a patient dispute regarding this collection account
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Filing a dispute will automatically pause all collection activities 
            on this account. Under FDCPA regulations, disputes must be investigated and resolved within 30 days. 
            Collection activities cannot resume until the dispute is resolved.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dispute_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dispute Reason</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide detailed information about the dispute..." 
                      className="min-h-[150px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include all relevant details: patient claims, supporting documentation references, 
                    and any other pertinent information. This will help with the investigation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium mb-2">Next Steps</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Dispute claim will be marked as "open"</li>
                <li>Account status will change to "dispute"</li>
                <li>All collection activities will be paused</li>
                <li>Investigation must be completed within 30 days</li>
                <li>Dispute must be resolved before collections can resume</li>
              </ol>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} variant="destructive">
                {loading ? "Filing..." : "File Dispute"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
