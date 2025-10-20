import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { authorizationId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch authorization request
    const { data: authRequest, error: authError } = await supabase
      .from('authorization_requests')
      .select('*, payers(*)')
      .eq('id', authorizationId)
      .single();

    if (authError) throw authError;

    // Fetch related documents
    const { data: documents } = await supabase
      .from('authorization_documents')
      .select('*')
      .eq('authorization_request_id', authorizationId);

    // Analyze authorization using AI
    const analysisPrompt = `Analyze this prior authorization request for approval likelihood and provide optimization suggestions:

Patient: ${authRequest.patient_name}, DOB: ${authRequest.patient_dob}
Payer: ${authRequest.payer_name}
Procedure: ${authRequest.procedure_code} - ${authRequest.procedure_description}
Diagnosis Codes: ${authRequest.diagnosis_codes.join(', ')}
Clinical Indication: ${authRequest.clinical_indication}
Urgency: ${authRequest.urgency}
Requested Dates: ${authRequest.requested_start_date} to ${authRequest.requested_end_date || 'ongoing'}
Units: ${authRequest.units_requested}
Documents: ${documents?.length || 0} supporting documents

Provide analysis in the following format:
1. Completeness Score (0-100)
2. Medical Necessity Score (0-100)
3. Overall Approval Probability (percentage)
4. Missing Elements (list any missing documentation or information)
5. Recommendations (specific actionable suggestions to improve approval chances)
6. Risk Factors (any red flags that might lead to denial)
7. Estimated Decision Time (in business days)`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert healthcare authorization specialist with deep knowledge of insurance payer requirements, medical necessity criteria, and authorization optimization strategies.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;

    // Parse AI response and extract scores
    const completenessMatch = analysisText.match(/Completeness Score.*?(\d+)/i);
    const necessityMatch = analysisText.match(/Medical Necessity Score.*?(\d+)/i);
    const probabilityMatch = analysisText.match(/Approval Probability.*?(\d+)/i);

    const completenessScore = completenessMatch ? parseInt(completenessMatch[1]) : 75;
    const necessityScore = necessityMatch ? parseInt(necessityMatch[1]) : 75;
    const overallScore = Math.round((completenessScore + necessityScore) / 2);
    const approvalProbability = probabilityMatch ? parseInt(probabilityMatch[1]) : overallScore;

    // Extract recommendations and missing elements
    const missingElements: string[] = [];
    const recommendations: any[] = [];
    
    if (analysisText.includes('Missing Elements')) {
      const missingSection = analysisText.split('Missing Elements')[1]?.split('\n\n')[0];
      if (missingSection) {
        missingSection.split('\n').forEach((line: string) => {
          const cleaned = line.replace(/^[-*•]\s*/, '').trim();
          if (cleaned && cleaned.length > 5) {
            missingElements.push(cleaned);
          }
        });
      }
    }

    if (analysisText.includes('Recommendations')) {
      const recSection = analysisText.split('Recommendations')[1]?.split('\n\n')[0];
      if (recSection) {
        recSection.split('\n').forEach((line: string, index: number) => {
          const cleaned = line.replace(/^[-*•]\d+\.\s*/, '').trim();
          if (cleaned && cleaned.length > 10) {
            recommendations.push({
              category: 'optimization',
              priority: index === 0 ? 'high' : 'medium',
              suggestion: cleaned
            });
          }
        });
      }
    }

    // Save AI analysis to database
    const { error: insertError } = await supabase
      .from('ai_approval_suggestions')
      .insert({
        authorization_request_id: authorizationId,
        analysis_type: 'comprehensive',
        score: overallScore,
        suggestions: recommendations,
        missing_elements: missingElements,
        recommended_actions: recommendations.map((r: any) => r.suggestion)
      });

    if (insertError) {
      console.error('Error saving AI analysis:', insertError);
    }

    return new Response(
      JSON.stringify({
        overall_score: overallScore,
        completeness_score: completenessScore,
        medical_necessity_score: necessityScore,
        approval_probability: approvalProbability,
        recommendations,
        missing_elements: missingElements,
        full_analysis: analysisText
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-authorization:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});