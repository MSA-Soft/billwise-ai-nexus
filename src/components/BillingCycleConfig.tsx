import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Settings } from "lucide-react";

const BillingCycleConfig = () => {
  const [cycleName, setCycleName] = useState("Monthly Billing");
  const [frequency, setFrequency] = useState<"monthly" | "bi_weekly" | "weekly" | "quarterly">("monthly");
  const [dayOfCycle, setDayOfCycle] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const { toast } = useToast();

  const saveBillingCycle = async () => {
    try {
      const { error } = await supabase.from("billing_cycles").insert({
        name: cycleName,
        frequency,
        day_of_cycle: dayOfCycle,
        reminder_days: [15, 30, 60],
        is_active: isActive,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Billing cycle configuration saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const triggerBillingCycle = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("process-billing-cycle");

      if (error) throw error;

      toast({
        title: "Success",
        description: `Billing cycle processed. ${data?.processedCount || 0} statements sent.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>Billing Cycle Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure automated billing cycle settings for statement generation and reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cycleName">Cycle Name</Label>
            <Input
              id="cycleName"
              value={cycleName}
              onChange={(e) => setCycleName(e.target.value)}
              placeholder="e.g., Monthly Billing"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Billing Frequency</Label>
            <Select value={frequency} onValueChange={(val: any) => setFrequency(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dayOfCycle">Day of Cycle (1-31)</Label>
            <Input
              id="dayOfCycle"
              type="number"
              min="1"
              max="31"
              value={dayOfCycle}
              onChange={(e) => setDayOfCycle(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable this billing cycle
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={saveBillingCycle} className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
            <Button onClick={triggerBillingCycle} variant="outline" className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Run Now
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reminder Schedule</CardTitle>
          <CardDescription>
            Automated reminders are sent at the following intervals after statement generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium">First Reminder</span>
              <span className="text-muted-foreground">Day 15</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium">Second Reminder</span>
              <span className="text-muted-foreground">Day 30</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium">Final Notice</span>
              <span className="text-muted-foreground">Day 60</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingCycleConfig;