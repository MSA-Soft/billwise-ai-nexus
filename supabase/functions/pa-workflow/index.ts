import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type PaWorkflowInput = {
  authorizationId: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const token = authHeader.replace('Bearer ', '');

    const { authorizationId } = (await req.json()) as PaWorkflowInput;
    if (!authorizationId) {
      return new Response(
        JSON.stringify({ error: "authorizationId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 1) Load authorization request
    const { data: auth, error: authError } = await supabase
      .from("authorization_requests")
      .select("*")
      .eq("id", authorizationId)
      .single();
    if (authError || !auth) {
      throw new Error("Authorization request not found");
    }

    // 2) Check payer rules via sub-function
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
    const functionsBase = `https://${projectRef}.functions.supabase.co`;

    const rulesRes = await fetch(`${functionsBase}/check-payer-rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ authorizationId }),
    });
    if (!rulesRes.ok) {
      throw new Error(`check-payer-rules failed: ${rulesRes.status}`);
    }
    const rulesData = await rulesRes.json();
    const paRequired = !!rulesData.pa_required;

    // 3) Validate medical necessity (stubbed)
    const medicalNecessityValid = true; // Placeholder

    // 4) If PA required, call 278 generator and simulate decision
    let submissionRef: string | null = null;
    let ackStatus: string | null = null;
    let reviewStatus: string | null = null;
    let authNumber: string | null = null;

    if (paRequired && medicalNecessityValid) {
      // Decide submission channel: simple heuristic - if payer_id present, use 278; else portal
      const submissionChannel = auth.payer_id ? 'x12_278' : 'portal';

      if (submissionChannel === 'x12_278') {
        const genRes = await fetch(`${functionsBase}/generate-278`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ authorizationId }),
        });
        if (!genRes.ok) {
          throw new Error(`generate-278 failed: ${genRes.status}`);
        }
        const genData = await genRes.json();
        submissionRef = genData.ack?.submission_ref || null;
        ackStatus = genData.ack?.status || "ACK_RECEIVED";
      } else {
        // Portal path (stub)
        submissionRef = `PORTAL-${authorizationId.slice(0, 8)}-${Date.now()}`;
        ackStatus = "SUBMITTED_PORTAL";
      }

      reviewStatus = "PENDING_REVIEW";

      // Simulate payer decision (approved for stub)
      authNumber = `AUTH-${authorizationId.slice(0, 8)}-${Math.floor(Math.random() * 10000)}`;
      reviewStatus = "APPROVED";
    }

    // 5) Persist updates back to authorization request
    const updates: Record<string, unknown> = {
      pa_required: paRequired,
      submission_channel: paRequired ? (auth.payer_id ? 'x12_278' : 'portal') : null,
      submission_ref: submissionRef,
      ack_status: ackStatus,
      review_status: paRequired ? reviewStatus : "NOT_REQUIRED",
      auth_number: authNumber,
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from("authorization_requests")
      .update(updates)
      .eq("id", authorizationId);

    // 6) Emit simple event record if an events table exists (best-effort)
    await supabase
      .from("authorization_events")
      .insert({
        authorization_request_id: authorizationId,
        event_type: "pa_workflow_completed",
        payload: updates,
      } as any)
      .catch(() => {});

    return new Response(
      JSON.stringify({
        pa_required: paRequired,
        medical_necessity_valid: medicalNecessityValid,
        submission_ref: submissionRef,
        ack_status: ackStatus,
        review_status: reviewStatus,
        auth_number: authNumber,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error in pa-workflow:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});


