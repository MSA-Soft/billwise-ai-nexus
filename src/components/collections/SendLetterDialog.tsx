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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const formSchema = z.object({
  letter_type: z.enum(["initial_notice", "second_notice", "final_notice", "pre_legal_notice", "cease_communication", "settlement_agreement"]),
});

interface SendLetterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  onSuccess: () => void;
}

export function SendLetterDialog({
  open,
  onOpenChange,
  accountId,
  onSuccess,
}: SendLetterDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      letter_type: "initial_notice",
    },
  });

  const letterDescriptions = {
    initial_notice: "First collection notice - friendly reminder (30 days overdue)",
    second_notice: "Second collection notice - more firm tone (60 days overdue)",
    final_notice: "Final notice before legal action (90 days overdue)",
    pre_legal_notice: "Intent to pursue legal action (120+ days overdue)",
    cease_communication: "Response to patient cease & desist request",
    settlement_agreement: "Formal settlement offer agreement",
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create letter record
      const { error } = await supabase.from("collection_letters").insert({
        collection_account_id: accountId,
        user_id: user.id,
        letter_type: values.letter_type,
        template_name: `${values.letter_type}_template`,
        delivery_status: "sent",
      });

      if (error) throw error;

      // Log activity
      await supabase.from("collection_activities").insert({
        collection_account_id: accountId,
        user_id: user.id,
        activity_type: "letter_sent",
        contact_method: "mail",
        notes: `Sent ${values.letter_type.replace("_", " ")} letter`,
      });

      toast({
        title: "Success",
        description: "Collection letter sent successfully",
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
          <DialogTitle>Send Collection Letter</DialogTitle>
          <DialogDescription>
            Select the type of collection letter to send to the patient
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            All collection letters must comply with FDCPA regulations and include required disclosures.
            Letters are sent via mail and tracked in the system.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="letter_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Letter Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select letter type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="initial_notice">Initial Notice</SelectItem>
                      <SelectItem value="second_notice">Second Notice</SelectItem>
                      <SelectItem value="final_notice">Final Notice</SelectItem>
                      <SelectItem value="pre_legal_notice">Pre-Legal Notice</SelectItem>
                      <SelectItem value="cease_communication">Cease Communication</SelectItem>
                      <SelectItem value="settlement_agreement">Settlement Agreement</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {letterDescriptions[field.value as keyof typeof letterDescriptions]}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium mb-2">Letter Preview</h4>
              <p className="text-sm text-muted-foreground">
                The letter will be generated using the standard template for {form.watch("letter_type")?.replace("_", " ")} 
                and will include all required FDCPA disclosures and patient information.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Letter"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
