import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing billing cycle...");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get active billing cycles
    const { data: cycles } = await supabase
      .from("billing_cycles")
      .select("*")
      .eq("is_active", true);

    if (!cycles || cycles.length === 0) {
      console.log("No active billing cycles found");
      return new Response(
        JSON.stringify({ message: "No active cycles" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get pending statements
    const { data: statements } = await supabase
      .from("billing_statements")
      .select("*")
      .eq("status", "pending");

    let processedCount = 0;

    for (const statement of statements || []) {
      // Get patient communication preferences
      const { data: prefs } = await supabase
        .from("patient_communication_preferences")
        .select("*")
        .eq("patient_id", statement.patient_id)
        .single();

      if (prefs) {
        // Send via preferred channel
        const channel = prefs.preferred_channel;
        
        console.log(`Processing statement for ${statement.patient_name} via ${channel}`);
        
        // Update statement status
        await supabase
          .from("billing_statements")
          .update({
            status: "sent",
            channel: channel,
            sent_at: new Date().toISOString(),
          })
          .eq("id", statement.id);

        // Create reminder for follow-up
        const reminderDate = new Date();
        reminderDate.setDate(reminderDate.getDate() + 15);

        await supabase.from("payment_reminders").insert({
          statement_id: statement.id,
          patient_id: statement.patient_id,
          reminder_type: "15_day_reminder",
          scheduled_for: reminderDate.toISOString(),
          channel: channel,
        });

        processedCount++;
      }
    }

    console.log(`Processed ${processedCount} statements`);

    return new Response(
      JSON.stringify({ 
        message: "Billing cycle processed", 
        processedCount 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing billing cycle:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});