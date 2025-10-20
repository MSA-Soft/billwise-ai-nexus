import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Input = {
  authorizationId: string;
};

function buildX12278(auth: any): string {
  // NOTE: This is a stub, not a complete 278 implementation.
  const now = new Date();
  const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const control = `000${Math.floor(Math.random() * 999999)}`;
  return [
    `ISA*00*          *00*          *ZZ*SENDERID      *ZZ*RECEIVERID    *${ts}*0000*^*00501*${control}*0*T*:~`,
    `GS*HI*SENDERID*RECEIVERID*${ts}*0000*1*X*005010X217~`,
    `ST*278*0001*005010X217~`,
    `BHT*0007*13*${auth.id}*${ts}*0000*RP~`,
    `HL*1**20*1~`,
    `NM1*X3*2*${(auth.insurance_payers?.name || auth.payer_name_custom || 'PAYER').toString().slice(0,35)}*****PI*PAYERID~`,
    `HL*2*1*21*1~`,
    `NM1*1P*1*${(auth.provider_name_custom || 'PROVIDER').toString().slice(0,35)}****XX*${(auth.provider_npi_custom || '0000000000').toString()}~`,
    `HL*3*2*22*0~`,
    `NM1*IL*1*${(auth.patient_name || 'PATIENT').toString().slice(0,35)}****MI*${(auth.patient_member_id || 'UNKNOWN').toString()}~`,
    `UM*SC*I*${(auth.procedure_codes?.[0] || '00000').toString()}*${(auth.diagnosis_codes?.[0] || 'Z000').toString()}~`,
    `SE*10*0001~`,
    `GE*1*1~`,
    `IEA*1*${control}~`,
  ].join('\n');
}

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
      .select("*, insurance_payers(name)")
      .eq("id", authorizationId)
      .single();

    const x12 = buildX12278(auth);
    const submissionRef = `SUB-${authorizationId.slice(0, 8)}-${Date.now()}`;

    // Here you would post to clearinghouse or payer API. We'll simulate ACK.
    const ack = { status: "ACK_RECEIVED", submission_ref: submissionRef };

    return new Response(
      JSON.stringify({ x12, ack }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error in generate-278:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});


