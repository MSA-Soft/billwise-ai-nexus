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
    const { conversationId, message, patientId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get conversation history
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    // Build message history for AI
    const conversationHistory = messages?.map((msg: any) => ({
      role: msg.is_ai ? "assistant" : "user",
      content: msg.message,
    })) || [];

    // Add current message
    conversationHistory.push({ role: "user", content: message });

    // Call Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a helpful medical billing assistant. You can help patients with:
            - Checking their current balance
            - Explaining charges on their statements
            - Setting up payment plans
            - Understanding insurance claims
            - Answering billing questions
            
            Patient ID: ${patientId}
            
            Be professional, empathetic, and clear in your responses. If you need to access specific billing data or perform actions like setting up payment plans, let the patient know you'll need to escalate to a billing specialist.`
          },
          ...conversationHistory
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service unavailable. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    // Save user message
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      message: message,
      is_ai: false,
      sender_name: "Patient",
    });

    // Save AI response
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      message: aiMessage,
      is_ai: true,
      sender_name: "Billing Assistant",
    });

    return new Response(
      JSON.stringify({ message: aiMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in chat-assistant:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});