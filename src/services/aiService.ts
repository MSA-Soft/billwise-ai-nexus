// AI Service for BillWise AI Nexus
// This service handles all AI-related functionality

import { supabase } from '@/integrations/supabase/client';

export interface AIAnalysis {
  score: number;
  recommendations: string[];
  missingElements: string[];
  suggestedActions: string[];
}

export interface AppealSuggestion {
  appealText: string;
  supportingDocuments: string[];
  successProbability: number;
  estimatedProcessingTime: string;
}

export interface PatientMessageDraft {
  subject: string;
  message: string;
  channelHints?: string[];
}

type AIGatewayChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

let aiEdgeFunctionAvailable: boolean | null = null;

async function extractEdgeFunctionError(error: any): Promise<{ status?: number; message: string }> {
  const fallbackMessage = error?.message || 'AI function invoke failed';
  const ctx = error?.context;

  // In supabase-js, non-2xx returns FunctionsHttpError where `context` is a Response.
  const status: number | undefined = typeof ctx?.status === 'number' ? ctx.status : undefined;

  // Try to read structured JSON error from the Response body.
  if (ctx && typeof ctx === 'object' && typeof ctx.clone === 'function') {
    try {
      const json = await ctx.clone().json();
      const serverMsg =
        (typeof json?.error === 'string' && json.error) ||
        (typeof json?.message === 'string' && json.message) ||
        undefined;
      if (serverMsg) return { status, message: serverMsg };
    } catch {
      // ignore
    }

    // Fallback to text if JSON parse fails.
    try {
      const text = await ctx.clone().text();
      if (text && typeof text === 'string') return { status, message: text };
    } catch {
      // ignore
    }
  }

  return { status, message: fallbackMessage };
}

async function invokeAIAutomation<TOutput>(action: string, payload: any): Promise<TOutput> {
  // Skip if we already learned the function isn't deployed/reachable.
  if (aiEdgeFunctionAvailable === false) {
    throw new Error(
      'AI automation is not available (edge function not deployed/reachable). Deploy Supabase function "ai-automation".'
    );
  }

  try {
    const { data, error } = await supabase.functions.invoke('ai-automation', {
      body: { action, payload },
    });

    // `error` typically indicates network / function-level problems
    if (error) {
      const extracted = await extractEdgeFunctionError(error as any);
      let msg = extracted.message || 'AI function invoke failed';

      if (extracted.status === 401) {
        msg = 'Unauthorized. Please sign in again and retry.';
      }
      if (
        extracted.status === 429 ||
        msg.includes('(429)') ||
        msg.toLowerCase().includes('quota') ||
        msg.toLowerCase().includes('rate limit')
      ) {
        msg =
          'OpenAI quota/rate-limit hit (429). Add billing/credits in your OpenAI account (or use a different API key), then retry.';
      }
      if (msg.includes('OPENAI_API_KEY is not configured')) {
        msg =
          'OPENAI_API_KEY is not configured on the server. Set the Supabase secret OPENAI_API_KEY for the ai-automation Edge Function.';
      }

      // Mark unavailable only for "function missing / fetch failed" style errors
      if (
        extracted.status === 404 ||
        msg.includes('Failed to fetch') ||
        msg.includes('404') ||
        msg.toLowerCase().includes('not found')
      ) {
        aiEdgeFunctionAvailable = false;
      }
      throw new Error(msg);
    }

    aiEdgeFunctionAvailable = true;

    if (!data?.success) {
      throw new Error(data?.error || 'AI function returned an error');
    }

    return data.output as TOutput;
  } catch (e: any) {
    // If this looks like a network/CORS failure, treat function as unavailable to reduce spam.
    const msg = e?.message || String(e);
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      aiEdgeFunctionAvailable = false;
    }
    throw e;
  }
}

export class AIService {
  private static instance: AIService;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * General staff copilot chat (server-side OpenAI call via Edge Function).
   * Never uses a browser API key.
   */
  async chatAssistant(text: string, history: AIGatewayChatMessage[] = []): Promise<string> {
    const output = await invokeAIAutomation<{ text: string }>('chat', { text, history });
    return output.text;
  }

  /**
   * Extract structured fields from clinical notes (server-side OpenAI call via Edge Function).
   */
  async extractClinicalNotes(text: string): Promise<{
    extractedData: any | null;
    confidence: number;
    extractionMethod: 'ai' | 'rule-based' | 'hybrid';
    raw?: string;
  }> {
    const output = await invokeAIAutomation<{
      extractedData: any | null;
      confidence: number;
      extractionMethod: 'ai' | 'rule-based' | 'hybrid';
      raw?: string;
    }>('extract_clinical_notes', { text });
    return output;
  }

  // Analyze denial and suggest appeal strategy
  async analyzeDenial(denialData: {
    claimId: string;
    patientName: string;
    denialCode: string;
    denialReason: string;
    amount: number;
    procedureCodes: string[];
    diagnosisCodes: string[];
  }): Promise<AppealSuggestion> {
    try {
      // Server-side AI (preferred). Falls back to templates if AI is not available.
      const analysis = await this.simulateAIAnalysis(denialData);
      return analysis;
    } catch (error) {
      console.error('AI Analysis failed:', error);
      throw new Error('Failed to analyze denial');
    }
  }

  // Generate automated appeal letter
  async generateAppealLetter(denialData: any): Promise<string> {
    // Try server-side AI first (better quality and payer-aware)
    try {
      const packet = await invokeAIAutomation<{
        letter?: string;
      }>('appeal_packet', {
        denial: {
          claimId: denialData.claimId,
          denialCode: denialData.denialCode,
          denialReason: denialData.denialReason,
          amount: denialData.amount,
          procedureCodes: denialData.procedureCodes,
          diagnosisCodes: denialData.diagnosisCodes,
        },
      });

      if (packet?.letter) return packet.letter;
    } catch {
      // ignore and fall back to templates below
    }

    const appealTemplates = {
      'CO-11': `Dear Claims Department,

I am writing to appeal the denial of claim ${denialData.claimId} for ${denialData.patientName}. 

The denial reason "Diagnosis Not Covered" appears to be incorrect based on the following:

1. The diagnosis code ${denialData.diagnosisCodes?.[0]} is clearly covered under your policy guidelines
2. The procedure performed is medically necessary for the patient's condition
3. All required documentation was submitted with the original claim

Please review this appeal and approve the claim for payment.

Sincerely,
Billing Department`,

      'CO-16': `Dear Claims Department,

I am writing to appeal the denial of claim ${denialData.claimId} for ${denialData.patientName}.

The denial reason "Prior Authorization Required" is being appealed because:

1. The procedure was performed under emergency conditions
2. The authorization was obtained but not properly linked to the claim
3. The authorization number is: [AUTH-NUMBER]

Please process this claim with the attached authorization documentation.

Sincerely,
Billing Department`,

      'CO-1': `Dear Claims Department,

I am writing to appeal the denial of claim ${denialData.claimId} for ${denialData.patientName}.

The denial reason "Deductible Amount" is being appealed because:

1. The patient's deductible has been met for this calendar year
2. The amount should be covered under the patient's insurance plan
3. Please verify the patient's deductible status

Please review and approve this claim.

Sincerely,
Billing Department`
    };

    return appealTemplates[denialData.denialCode as keyof typeof appealTemplates] || 
           `Dear Claims Department,

I am writing to appeal the denial of claim ${denialData.claimId} for ${denialData.patientName}.

The denial reason "${denialData.denialReason}" is being appealed based on the following:

1. All required documentation was submitted
2. The procedure is medically necessary
3. The patient's insurance coverage is active

Please review this appeal and approve the claim for payment.

Sincerely,
Billing Department`;
  }

  // Enhanced AI-powered completeness checker
  async analyzeAuthorizationRequest(requestData: any): Promise<AIAnalysis> {
    const missingElements: string[] = [];
    const recommendations: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // ============================================
    // CRITICAL FIELDS CHECK (High Impact)
    // ============================================
    
    // Patient Information
    if (!requestData.patient_name) {
      missingElements.push('Patient name');
      score -= 15;
    }
    if (!requestData.patient_dob) {
      missingElements.push('Patient date of birth');
      score -= 10;
    }
    if (!requestData.patient_member_id) {
      missingElements.push('Patient member ID');
      score -= 10;
    }

    // Payer Information
    if (!requestData.payer_id && !requestData.payer_name_custom) {
      missingElements.push('Insurance payer');
      score -= 15;
    }

    // Provider Information
    if (!requestData.provider_name_custom && !requestData.provider_npi_custom) {
      missingElements.push('Provider name and NPI');
      score -= 10;
    }

    // Service Information
    if (!requestData.service_start_date) {
      missingElements.push('Service start date');
      score -= 15;
    }
    if (!requestData.service_type) {
      missingElements.push('Service type/description');
      score -= 10;
    }

    // Procedure Codes
    if (!requestData.procedure_codes || requestData.procedure_codes.length === 0) {
      missingElements.push('Procedure codes (CPT)');
      score -= 20;
    } else {
      // Validate CPT code format
      const invalidCodes = requestData.procedure_codes.filter((code: string) => 
        !/^\d{5}$/.test(code)
      );
      if (invalidCodes.length > 0) {
        warnings.push(`Invalid CPT code format: ${invalidCodes.join(', ')}`);
        score -= 5;
      }
    }

    // Diagnosis Codes
    if (!requestData.diagnosis_codes || requestData.diagnosis_codes.length === 0) {
      missingElements.push('Diagnosis codes (ICD-10)');
      score -= 20;
    } else {
      // Validate ICD-10 code format
      const invalidCodes = requestData.diagnosis_codes.filter((code: string) => 
        !/^[A-Z]\d{2,3}(\.\d{1,4})?$/.test(code)
      );
      if (invalidCodes.length > 0) {
        warnings.push(`Invalid ICD-10 code format: ${invalidCodes.join(', ')}`);
        score -= 5;
      }
      
      // Check for primary diagnosis
      if (requestData.diagnosis_codes.length > 0 && !requestData.primary_diagnosis) {
        warnings.push('Primary diagnosis not specified');
        score -= 5;
      }
    }

    // Clinical Information
    if (!requestData.clinical_indication || requestData.clinical_indication.trim().length < 50) {
      missingElements.push('Detailed clinical indication (minimum 50 characters)');
      score -= 15;
    }

    // ============================================
    // PAYER-SPECIFIC REQUIREMENTS
    // ============================================
    
    // Check payer-specific requirements (would query database in production)
    const payerName = requestData.payer_name_custom || 'Unknown';
    
    // Medicare requirements
    if (payerName.toLowerCase().includes('medicare')) {
      if (!requestData.medicare_beneficiary_id) {
        warnings.push('Medicare beneficiary ID recommended');
      }
    }
    
    // Commercial payer requirements
    if (!payerName.toLowerCase().includes('medicare') && !payerName.toLowerCase().includes('medicaid')) {
      if (!requestData.group_number) {
        warnings.push('Group number may be required');
      }
    }

    // ============================================
    // MEDICAL NECESSITY VALIDATION
    // ============================================
    
    if (!requestData.medical_necessity || requestData.medical_necessity.trim().length < 100) {
      missingElements.push('Medical necessity justification (minimum 100 characters)');
      score -= 10;
    }

    // ============================================
    // URGENCY AND TIMING VALIDATION
    // ============================================
    
    if (!requestData.urgency_level) {
      warnings.push('Urgency level not specified');
    } else if (requestData.urgency_level === 'stat') {
      // STAT requests need immediate attention
      if (!requestData.stat_justification) {
        warnings.push('STAT requests require justification');
      }
    }

    // Check service date is not in the past (for prior auth)
    if (requestData.service_start_date) {
      const serviceDate = new Date(requestData.service_start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (serviceDate < today && requestData.auth_type === 'prior') {
        warnings.push('Service date is in the past for prior authorization');
        score -= 5;
      }
    }

    // ============================================
    // DOCUMENTATION CHECK
    // ============================================
    
    if (!requestData.supporting_documents || requestData.supporting_documents.length === 0) {
      warnings.push('No supporting documents attached');
      recommendations.push('Attach clinical notes, lab results, or imaging reports');
    }

    // ============================================
    // CODE COMPATIBILITY CHECK
    // ============================================
    
    // Check if diagnosis codes support procedure codes
    if (requestData.procedure_codes && requestData.diagnosis_codes) {
      // In production, would check against payer-specific code compatibility rules
      recommendations.push('Verify diagnosis codes support the requested procedures');
    }

    // ============================================
    // GENERATE INTELLIGENT RECOMMENDATIONS
    // ============================================
    
    if (score < 70) {
      recommendations.push('⚠️ CRITICAL: Complete all required fields before submission');
      recommendations.push('Add detailed clinical justification');
      recommendations.push('Include supporting medical records');
    } else if (score < 85) {
      recommendations.push('Review and enhance clinical documentation');
      recommendations.push('Verify all codes are correct and current');
    } else {
      recommendations.push('✅ Request is well-documented');
      recommendations.push('Consider adding any optional supporting documentation');
    }

    // Payer-specific recommendations
    if (payerName.toLowerCase().includes('aetna')) {
      recommendations.push('Aetna typically requires detailed medical necessity documentation');
    }
    if (payerName.toLowerCase().includes('bcbs') || payerName.toLowerCase().includes('blue cross')) {
      recommendations.push('BCBS may require prior authorization for certain procedures');
    }

    // Urgency-based recommendations
    if (requestData.urgency_level === 'routine' && score > 70) {
      recommendations.push('Consider upgrading to urgent if clinically appropriate for faster processing');
    }

    // ============================================
    // APPROVAL PROBABILITY ESTIMATION
    // ============================================
    
    let approvalProbability = 0;
    if (score >= 90) {
      approvalProbability = 85; // High probability
    } else if (score >= 75) {
      approvalProbability = 65; // Medium-high probability
    } else if (score >= 60) {
      approvalProbability = 45; // Medium probability
    } else {
      approvalProbability = 25; // Low probability
    }

    // Adjust based on payer history (would use ML model in production)
    if (payerName.toLowerCase().includes('medicare')) {
      approvalProbability += 10; // Medicare typically has higher approval rates
    }

    // ============================================
    // SUGGESTED ACTIONS
    // ============================================
    
    const suggestedActions: string[] = [];
    
    if (missingElements.length > 0) {
      suggestedActions.push(`Complete ${missingElements.length} missing required field(s)`);
    }
    
    if (warnings.length > 0) {
      suggestedActions.push(`Address ${warnings.length} warning(s)`);
    }
    
    if (score < 80) {
      suggestedActions.push('Review payer-specific requirements');
      suggestedActions.push('Enhance clinical documentation');
    }
    
    if (approvalProbability < 50) {
      suggestedActions.push('Consider adding more supporting documentation');
      suggestedActions.push('Review denial patterns for this payer');
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      recommendations: [...recommendations, ...warnings],
      missingElements,
      suggestedActions,
      // Additional fields for enhanced analysis
      approvalProbability: Math.min(100, approvalProbability),
      completenessLevel: score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'fair' : 'poor',
      criticalIssues: missingElements.filter(e => 
        e.includes('Patient') || e.includes('Payer') || e.includes('Procedure') || e.includes('Diagnosis')
      ),
    } as any;
  }

  // Server-side AI analysis using Supabase Edge Function (with fallback)
  private async simulateAIAnalysis(denialData: any): Promise<AppealSuggestion> {
    try {
      const packet = await invokeAIAutomation<{
        letter?: string;
        attachments?: string[];
        checklist?: string[];
        risks?: string[];
        successProbability?: number; // 0-1
      }>('appeal_packet', {
        denial: {
          claimId: denialData.claimId,
          denialCode: denialData.denialCode,
          denialReason: denialData.denialReason,
          amount: denialData.amount,
          procedureCodes: denialData.procedureCodes,
          diagnosisCodes: denialData.diagnosisCodes,
        },
        });

      if (packet?.letter) {
          return {
          appealText: packet.letter,
          supportingDocuments: packet.attachments || [
              'Medical records',
              'Provider notes', 
              'Insurance verification',
            'Prior authorization (if applicable)',
            ],
          successProbability: typeof packet.successProbability === 'number' ? packet.successProbability : 0.75,
          estimatedProcessingTime: '7-14 business days',
          };
      }
    } catch (error) {
      console.log('AI edge function not available, using enhanced mock data');
    }

    // Enhanced mock data with more realistic responses
    const successRates = {
      'CO-11': 0.75,
      'CO-16': 0.85,
      'CO-1': 0.90,
      'CO-2': 0.80,
      'CO-3': 0.70
    };

    const successProbability = successRates[denialData.denialCode as keyof typeof successRates] || 0.70;

    return {
      appealText: await this.generateAppealLetter(denialData),
      supportingDocuments: [
        'Medical records',
        'Provider notes',
        'Insurance verification',
        'Prior authorization (if applicable)'
      ],
      successProbability,
      estimatedProcessingTime: '7-14 business days'
    };
  }

  // Generate patient communication suggestions (server-side AI via Edge Function)
  async generateCommunicationSuggestion(patientData: any, context: string): Promise<string> {
    try {
      const out = await invokeAIAutomation<{ message?: string; subject?: string }>('patient_message', {
        patient: patientData,
        context,
      });
      if (out?.message) return out.message;
    } catch (error) {
      console.log('AI not available, using enhanced templates');
    }

    // Enhanced templates with more realistic content
    const suggestions = {
      'payment_reminder': `Dear ${patientData.patient_name},

This is a friendly reminder that you have an outstanding balance of $${patientData.current_balance} on your account.

We understand that medical expenses can be challenging, and we're here to help. We offer several payment options:

1. Online payment through our patient portal
2. Payment plans with flexible terms
3. Financial assistance programs

Please contact us at (555) 123-4567 to discuss your options.

Best regards,
Billing Department`,

      'payment_plan': `Dear ${patientData.patient_name},

Thank you for your interest in setting up a payment plan for your outstanding balance of $${patientData.current_balance}.

We can offer you the following options:
- 6-month plan: $${(patientData.current_balance / 6).toFixed(2)}/month
- 12-month plan: $${(patientData.current_balance / 12).toFixed(2)}/month

Please call us at (555) 123-4567 to set up your payment plan.

Best regards,
Billing Department`,

      'collections': `Dear ${patientData.patient_name},

We have been unable to reach you regarding your outstanding balance of $${patientData.current_balance}.

This account is now ${patientData.days_overdue} days past due. To avoid further collection action, please contact us immediately to discuss payment options.

We're committed to working with you to resolve this matter.

Best regards,
Collections Department`
    };

    return suggestions[context as keyof typeof suggestions] || suggestions['payment_reminder'];
  }

  /**
   * Generate a patient-facing message draft (subject + message) via server-side AI.
   * This is used for autopilot/batch workflows and for any UI that needs a subject line.
   */
  async generatePatientMessageDraft(patientData: any, context: string): Promise<PatientMessageDraft> {
    try {
      const out = await invokeAIAutomation<{ message?: string; subject?: string; channelHints?: string[] }>(
        'patient_message',
        {
          patient: patientData,
          context,
        },
      );
      if (out?.message) {
        return {
          subject: out.subject || 'Billing message',
          message: out.message,
          channelHints: out.channelHints || [],
        };
      }
    } catch {
      // fall back below
    }

    const message = await this.generateCommunicationSuggestion(patientData, context);
    const subject =
      context === 'payment_plan'
        ? 'Payment plan options'
        : context === 'collections'
          ? 'Important: account balance notice'
          : 'Billing statement reminder';
    return { subject, message, channelHints: [] };
  }

  // AI Smart Suggestions - Intelligent recommendations for improving authorization requests
  async generateSmartSuggestions(requestData: any, analysis?: AIAnalysis): Promise<{
    documentationSuggestions: string[];
    improvementSuggestions: string[];
    payerSpecificSuggestions: string[];
    codeSuggestions: string[];
    urgencySuggestions: string[];
    priorityActions: string[];
  }> {
    const documentationSuggestions: string[] = [];
    const improvementSuggestions: string[] = [];
    const payerSpecificSuggestions: string[] = [];
    const codeSuggestions: string[] = [];
    const urgencySuggestions: string[] = [];
    const priorityActions: string[] = [];

    // Get analysis if not provided
    if (!analysis) {
      analysis = await this.analyzeAuthorizationRequest(requestData);
    }

    // Documentation Suggestions
    if (!requestData.supporting_documents || requestData.supporting_documents.length === 0) {
      documentationSuggestions.push('Attach clinical notes from the treating provider');
      documentationSuggestions.push('Include relevant lab results or imaging reports');
      documentationSuggestions.push('Add progress notes showing treatment history');
      priorityActions.push('Add supporting documentation - this significantly improves approval chances');
    } else if (requestData.supporting_documents.length < 3) {
      documentationSuggestions.push('Consider adding additional clinical documentation');
      documentationSuggestions.push('Include provider notes explaining medical necessity');
    }

    // Improvement Suggestions based on completeness score
    if (analysis.score < 70) {
      improvementSuggestions.push('⚠️ CRITICAL: Complete all required fields immediately');
      improvementSuggestions.push('Add detailed clinical indication (minimum 100 characters)');
      improvementSuggestions.push('Provide comprehensive medical necessity justification');
      priorityActions.push('Complete missing required fields - submission will be rejected without them');
    } else if (analysis.score < 85) {
      improvementSuggestions.push('Enhance clinical documentation for better approval chances');
      improvementSuggestions.push('Add more detail to medical necessity section');
      improvementSuggestions.push('Consider peer review or clinical consultation');
    }

    // Payer-Specific Suggestions
    const payerName = (requestData.payer_name_custom || '').toLowerCase();
    
    if (payerName.includes('aetna')) {
      payerSpecificSuggestions.push('Aetna requires detailed medical necessity documentation');
      payerSpecificSuggestions.push('Include specific clinical criteria met for the procedure');
      payerSpecificSuggestions.push('Aetna typically reviews within 3-5 business days');
    }
    
    if (payerName.includes('bcbs') || payerName.includes('blue cross')) {
      payerSpecificSuggestions.push('BCBS may require prior authorization for certain procedures');
      payerSpecificSuggestions.push('Verify procedure is covered under patient\'s plan');
      payerSpecificSuggestions.push('BCBS typically processes within 2-4 business days');
    }
    
    if (payerName.includes('medicare')) {
      payerSpecificSuggestions.push('Medicare requires specific documentation for medical necessity');
      payerSpecificSuggestions.push('Ensure all Medicare-specific fields are completed');
      payerSpecificSuggestions.push('Medicare typically has higher approval rates (95%+)');
    }
    
    if (payerName.includes('cigna')) {
      payerSpecificSuggestions.push('Cigna may require additional clinical information');
      payerSpecificSuggestions.push('Include detailed treatment plan and expected outcomes');
    }

    // Code Suggestions
    if (requestData.procedure_codes && requestData.procedure_codes.length > 0) {
      const invalidCodes = requestData.procedure_codes.filter((code: string) => 
        !/^\d{5}$/.test(code)
      );
      
      if (invalidCodes.length > 0) {
        codeSuggestions.push(`Fix invalid CPT codes: ${invalidCodes.join(', ')}`);
        codeSuggestions.push('CPT codes must be exactly 5 digits');
        priorityActions.push('Correct invalid procedure codes');
      } else {
        codeSuggestions.push('✅ All CPT codes are properly formatted');
      }
    }

    if (requestData.diagnosis_codes && requestData.diagnosis_codes.length > 0) {
      const invalidCodes = requestData.diagnosis_codes.filter((code: string) => 
        !/^[A-Z]\d{2,3}(\.\d{1,4})?$/.test(code)
      );
      
      if (invalidCodes.length > 0) {
        codeSuggestions.push(`Fix invalid ICD-10 codes: ${invalidCodes.join(', ')}`);
        codeSuggestions.push('ICD-10 codes must start with a letter followed by numbers');
        priorityActions.push('Correct invalid diagnosis codes');
      }

      if (requestData.diagnosis_codes.length > 1 && !requestData.primary_diagnosis) {
        codeSuggestions.push('Specify which diagnosis is primary');
        codeSuggestions.push('Primary diagnosis should be the main reason for the procedure');
      }
    }

    // Urgency Suggestions
    if (requestData.urgency_level === 'routine' && analysis.score >= 75) {
      urgencySuggestions.push('Consider upgrading to "urgent" if clinically appropriate');
      urgencySuggestions.push('Urgent requests typically process 2-3 days faster');
    } else if (requestData.urgency_level === 'stat') {
      if (!requestData.stat_justification) {
        urgencySuggestions.push('⚠️ STAT requests require justification');
        urgencySuggestions.push('Add explanation for why this is a STAT request');
        priorityActions.push('Provide STAT justification - required for STAT processing');
      }
    }

    // Additional Smart Suggestions based on analysis
    if (analysis.missingElements.length > 0) {
      priorityActions.push(`Complete ${analysis.missingElements.length} missing required field(s)`);
    }

    if ((analysis as any).approvalProbability && (analysis as any).approvalProbability < 60) {
      improvementSuggestions.push('⚠️ Low approval probability - significant improvements needed');
      improvementSuggestions.push('Review and address all risk factors');
      improvementSuggestions.push('Consider clinical peer review before submission');
    }

    // Generate AI-powered suggestions using OpenAI if available
    // NOTE: We intentionally do NOT auto-call the server AI here because this function can run
    // frequently (typing/forms). Use `priorAuthCopilot()` for deep AI analysis on-demand.

    return {
      documentationSuggestions,
      improvementSuggestions,
      payerSpecificSuggestions,
      codeSuggestions,
      urgencySuggestions,
      priorityActions: [...new Set(priorityActions)], // Remove duplicates
    };
  }

  /**
   * Deep prior-auth copilot analysis (server-side AI).
   * Use this for "one-click" deeper analysis (not on every keystroke).
   */
  async priorAuthCopilot(authorization: any): Promise<any> {
    return await invokeAIAutomation<any>('prior_auth_copilot', { authorization });
  }

  /**
   * Batch denial triage (server-side AI).
   * Use for a dashboard-level "what to work first" queue + clustering.
   */
  async triageDenials(denials: Array<{
    denialId: string;
    claimId: string;
    denialCode?: string;
    denialReason?: string;
    amount?: number;
    payerName?: string;
    procedureCodes?: string[];
    diagnosisCodes?: string[];
    denialDate?: string;
  }>): Promise<any> {
    return await invokeAIAutomation<any>('denial_triage', { denials });
  }
}

export const aiService = AIService.getInstance();
