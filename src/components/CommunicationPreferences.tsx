import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, FileText, Globe } from "lucide-react";

interface CommunicationPreferencesProps {
  patientId: string;
  patientName: string;
}

const CommunicationPreferences = ({ patientId, patientName }: CommunicationPreferencesProps) => {
  const [preferences, setPreferences] = useState({
    patient_email: "",
    patient_phone: "",
    preferred_channel: "email" as "email" | "sms" | "paper" | "portal",
    email_enabled: true,
    sms_enabled: false,
    paper_enabled: false,
    portal_enabled: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, [patientId]);

  const loadPreferences = async () => {
    try {
      const { data } = await supabase
        .from("patient_communication_preferences")
        .select("*")
        .eq("patient_id", patientId)
        .maybeSingle();

      if (data) {
        setPreferences({
          patient_email: data.patient_email || "",
          patient_phone: data.patient_phone || "",
          preferred_channel: data.preferred_channel,
          email_enabled: data.email_enabled,
          sms_enabled: data.sms_enabled,
          paper_enabled: data.paper_enabled,
          portal_enabled: data.portal_enabled,
        });
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("patient_communication_preferences")
        .upsert({
          patient_id: patientId,
          patient_name: patientName,
          ...preferences,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Communication preferences saved successfully",
      });
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
    <Card>
      <CardHeader>
        <CardTitle>Communication Preferences</CardTitle>
        <CardDescription>
          Manage how you want to receive billing statements and reminders for {patientName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={preferences.patient_email}
            onChange={(e) => setPreferences({ ...preferences, patient_email: e.target.value })}
            placeholder="patient@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={preferences.patient_phone}
            onChange={(e) => setPreferences({ ...preferences, patient_phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="space-y-2">
          <Label>Preferred Communication Channel</Label>
          <Select
            value={preferences.preferred_channel}
            onValueChange={(val: any) => setPreferences({ ...preferences, preferred_channel: val })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
              </SelectItem>
              <SelectItem value="sms">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  SMS/Text
                </div>
              </SelectItem>
              <SelectItem value="paper">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Paper Mail
                </div>
              </SelectItem>
              <SelectItem value="portal">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Patient Portal
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium">Enabled Channels</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label>Email Notifications</Label>
            </div>
            <Switch
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => setPreferences({ ...preferences, email_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <Label>SMS Notifications</Label>
            </div>
            <Switch
              checked={preferences.sms_enabled}
              onCheckedChange={(checked) => setPreferences({ ...preferences, sms_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <Label>Paper Statements</Label>
            </div>
            <Switch
              checked={preferences.paper_enabled}
              onCheckedChange={(checked) => setPreferences({ ...preferences, paper_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Label>Patient Portal Access</Label>
            </div>
            <Switch
              checked={preferences.portal_enabled}
              onCheckedChange={(checked) => setPreferences({ ...preferences, portal_enabled: checked })}
            />
          </div>
        </div>

        <Button onClick={savePreferences} disabled={loading} className="w-full">
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
};

export default CommunicationPreferences;