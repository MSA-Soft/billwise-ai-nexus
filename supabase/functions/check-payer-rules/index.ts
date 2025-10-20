import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Input = {
  authorizationId: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { authorizationId } = (await req.json()) as Input;
    if (!authorizationId) {
      return new Response(
        JSON.stringify({ error: "authorizationId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: auth } = await supabase
      .from("authorization_requests")
      .select("patient_name, diagnosis_codes, procedure_codes, payer_id, payer_name_custom, urgency_level")
      .eq("id", authorizationId)
      .single();

    // Basic heuristic rules stub: require PA for high-cost procedures or urgent requests
    const cpt = (auth?.procedure_codes?.[0] || "").toString();
    const urgent = (auth?.urgency_level || "routine").toLowerCase() !== "routine";
    const highCostCptPrefixes = ["27", "33", "71", "73", "93"]; // illustrative
    const paRequired = urgent || highCostCptPrefixes.some((p) => cpt.startsWith(p));

    return new Response(
      JSON.stringify({
        pa_required: paRequired,
        rationale: paRequired ? "Urgency or high-cost CPT detected" : "No PA required by heuristic",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error in check-payer-rules:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});


