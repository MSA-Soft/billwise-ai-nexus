// Denial Management Automation Service
// Automated denial analysis, root cause identification, appeal workflows

import { supabase } from '@/integrations/supabase/client';
import { aiService } from './aiService';
import { workflowService } from './workflowService';
import { notificationService } from './notificationService';

export interface DenialAnalysis {
  denialId: string;
  claimId: string;
  rootCause: RootCause;
  category: DenialCategory;
  appealability: Appealability;
  recommendedActions: RecommendedAction[];
  similarDenials: SimilarDenial[];
  preventionStrategies: string[];
  estimatedRecoveryAmount: number;
  estimatedRecoveryProbability: number;
}

export interface RootCause {
  primary: string;
  secondary?: string[];
  confidence: 'high' | 'medium' | 'low';
  evidence: string[];
}

export interface DenialCategory {
  type: 'administrative' | 'clinical' | 'billing' | 'authorization' | 'eligibility' | 'other';
  subcategory: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface Appealability {
  canAppeal: boolean;
  appealType: 'standard' | 'expedited' | 'external' | 'not_appealable';
  successProbability: number; // 0-100
  recommendedAppealStrategy: string;
  deadline?: string;
  requiredDocuments: string[];
}

export interface RecommendedAction {
  action: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  estimatedTime: string;
  automated: boolean;
}

export interface SimilarDenial {
  claimId: string;
  denialCode: string;
  resolution: 'appealed' | 'resubmitted' | 'written_off' | 'pending';
  outcome?: 'approved' | 'denied' | 'partial';
  notes?: string;
}

export interface AppealWorkflow {
  id?: string;
  denialId: string;
  claimId: string;
  appealType: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'denied' | 'withdrawn';
  appealLetter: string;
  supportingDocuments: string[];
  submittedAt?: string;
  responseReceivedAt?: string;
  outcome?: 'approved' | 'denied' | 'partial';
  outcomeAmount?: number;
  created_by?: string;
  created_at?: string;
}

export class DenialManagementService {
  private static instance: DenialManagementService;

  static getInstance(): DenialManagementService {
    if (!DenialManagementService.instance) {
      DenialManagementService.instance = new DenialManagementService();
    }
    return DenialManagementService.instance;
  }

  // Analyze denial automatically
  async analyzeDenial(denialId: string, claimId: string): Promise<DenialAnalysis> {
    try {
      // Get denial data
      const { data: denial, error: denialError } = await supabase
        .from('claim_denials')
        .select('*')
        .eq('id', denialId)
        .single();

      if (denialError || !denial) {
        throw new Error('Denial not found');
      }

      // Get claim data
      const { data: claim, error: claimError } = await supabase
        .from('claims')
        .select('*')
        .eq('id', claimId)
        .single();

      if (claimError || !claim) {
        throw new Error('Claim not found');
      }

      // Analyze using AI
      const aiAnalysis = await aiService.analyzeDenial({
        claimId: claim.claim_number || claimId,
        patientName: claim.patient_name || 'Unknown',
        denialCode: denial.denial_code || '',
        denialReason: denial.denial_reason || '',
        amount: parseFloat(denial.denied_amount || '0'),
        procedureCodes: claim.procedure_codes || [],
        diagnosisCodes: claim.diagnosis_codes || [],
      });

      // Identify root cause
      const rootCause = this.identifyRootCause(denial, claim, aiAnalysis);

      // Categorize denial
      const category = this.categorizeDenial(denial, claim);

      // Determine appealability
      const appealability = this.determineAppealability(denial, claim, aiAnalysis);

      // Get similar denials
      const similarDenials = await this.findSimilarDenials(denial, claim);

      // Generate recommended actions
      const recommendedActions = this.generateRecommendedActions(
        denial,
        claim,
        rootCause,
        appealability
      );

      // Calculate prevention strategies
      const preventionStrategies = this.generatePreventionStrategies(denial, rootCause);

      // Estimate recovery
      const recovery = this.estimateRecovery(denial, appealability);

      return {
        denialId,
        claimId,
        rootCause,
        category,
        appealability,
        recommendedActions,
        similarDenials,
        preventionStrategies,
        estimatedRecoveryAmount: recovery.amount,
        estimatedRecoveryProbability: recovery.probability,
      };
    } catch (error: any) {
      console.error('Error analyzing denial:', error);
      throw new Error(error.message || 'Failed to analyze denial');
    }
  }

  // Identify root cause
  private identifyRootCause(denial: any, claim: any, aiAnalysis: any): RootCause {
    const denialCode = denial.denial_code || '';
    const denialReason = denial.denial_reason || '';

    // Common root causes by denial code
    const rootCauseMap: Record<string, { primary: string; secondary: string[] }> = {
      'CO-1': {
        primary: 'Deductible not met or incorrectly calculated',
        secondary: ['Patient eligibility issue', 'Benefit verification error'],
      },
      'CO-11': {
        primary: 'Diagnosis code not covered or invalid',
        secondary: ['Missing primary diagnosis', 'Incorrect diagnosis code'],
      },
      'CO-16': {
        primary: 'Prior authorization missing or expired',
        secondary: ['Authorization not linked to claim', 'Authorization number incorrect'],
      },
      'CO-18': {
        primary: 'Duplicate claim submitted',
        secondary: ['Same claim submitted multiple times', 'Overlapping service dates'],
      },
      'CO-22': {
        primary: 'Coordination of benefits issue',
        secondary: ['Primary/secondary insurance confusion', 'Other insurance coverage'],
      },
      'CO-50': {
        primary: 'Medical necessity not established',
        secondary: ['Insufficient clinical documentation', 'Procedure not medically necessary'],
      },
    };

    const mappedCause = rootCauseMap[denialCode] || {
      primary: 'Unknown root cause - requires manual review',
      secondary: [],
    };

    // Analyze claim data for additional evidence
    const evidence: string[] = [];
    
    if (!claim.prior_auth_number && denialCode === 'CO-16') {
      evidence.push('No prior authorization number found in claim');
    }
    
    if (!claim.diagnosis_codes || claim.diagnosis_codes.length === 0) {
      evidence.push('No diagnosis codes provided');
    }
    
    if (claim.service_date_from && new Date(claim.service_date_from) > new Date()) {
      evidence.push('Service date is in the future');
    }

    return {
      primary: mappedCause.primary,
      secondary: mappedCause.secondary,
      confidence: evidence.length > 0 ? 'high' : 'medium',
      evidence,
    };
  }

  // Categorize denial
  private categorizeDenial(denial: any, claim: any): DenialCategory {
    const denialCode = denial.denial_code || '';
    
    // Administrative denials
    const administrativeCodes = ['CO-1', 'CO-2', 'CO-3', 'CO-18', 'CO-22'];
    if (administrativeCodes.includes(denialCode)) {
      return {
        type: 'administrative',
        subcategory: 'Billing/Administrative Error',
        severity: 'medium',
      };
    }

    // Authorization denials
    if (denialCode === 'CO-16') {
      return {
        type: 'authorization',
        subcategory: 'Prior Authorization Required',
        severity: 'high',
      };
    }

    // Clinical denials
    const clinicalCodes = ['CO-11', 'CO-50'];
    if (clinicalCodes.includes(denialCode)) {
      return {
        type: 'clinical',
        subcategory: 'Medical Necessity/Clinical',
        severity: 'high',
      };
    }

    // Eligibility denials
    if (denialCode.startsWith('CO-4') || denialCode.startsWith('CO-5')) {
      return {
        type: 'eligibility',
        subcategory: 'Eligibility Issue',
        severity: 'critical',
      };
    }

    return {
      type: 'other',
      subcategory: 'Other',
      severity: 'medium',
    };
  }

  // Determine appealability
  private determineAppealability(denial: any, claim: any, aiAnalysis: any): Appealability {
    const denialCode = denial.denial_code || '';
    const successProbability = aiAnalysis.successProbability || 0;

    // Non-appealable codes
    const nonAppealableCodes = ['CO-1', 'CO-2', 'CO-3']; // Patient responsibility
    if (nonAppealableCodes.includes(denialCode)) {
      return {
        canAppeal: false,
        appealType: 'not_appealable',
        successProbability: 0,
        recommendedAppealStrategy: 'This denial is not appealable. Patient responsibility.',
        requiredDocuments: [],
      };
    }

    // Determine appeal type
    let appealType: 'standard' | 'expedited' | 'external' = 'standard';
    if (denial.urgency === 'urgent' || denial.urgency === 'stat') {
      appealType = 'expedited';
    }

    // Calculate success probability
    let probability = successProbability;
    if (denialCode === 'CO-16' && claim.prior_auth_number) {
      probability += 20; // Higher chance if auth exists but wasn't linked
    }
    if (denialCode === 'CO-11' && claim.diagnosis_codes && claim.diagnosis_codes.length > 0) {
      probability += 15; // Higher chance if diagnosis codes exist
    }

    // Required documents
    const requiredDocuments: string[] = [];
    if (denialCode === 'CO-16') {
      requiredDocuments.push('Prior authorization documentation');
    }
    if (denialCode === 'CO-11' || denialCode === 'CO-50') {
      requiredDocuments.push('Clinical notes', 'Medical necessity documentation');
    }
    requiredDocuments.push('Original claim', 'Denial letter', 'Appeal letter');

    // Appeal deadline (typically 60-180 days)
    const deadline = new Date(denial.denial_date || new Date());
    deadline.setDate(deadline.getDate() + 60); // Default 60 days

    return {
      canAppeal: true,
      appealType,
      successProbability: Math.min(100, probability),
      recommendedAppealStrategy: this.generateAppealStrategy(denialCode, claim),
      deadline: deadline.toISOString(),
      requiredDocuments,
    };
  }

  // Generate appeal strategy
  private generateAppealStrategy(denialCode: string, claim: any): string {
    const strategies: Record<string, string> = {
      'CO-11': 'Appeal by providing additional clinical documentation demonstrating medical necessity and correct diagnosis coding.',
      'CO-16': 'Appeal by providing prior authorization number and documentation showing authorization was obtained before service.',
      'CO-18': 'Verify if this is truly a duplicate. If not, provide evidence of different service dates or procedures.',
      'CO-22': 'Appeal by providing coordination of benefits information and proof of primary insurance exhaustion.',
      'CO-50': 'Appeal by providing comprehensive medical necessity documentation, clinical notes, and treatment plan.',
    };

    return strategies[denialCode] || 'Review denial reason and provide appropriate documentation to support appeal.';
  }

  // Find similar denials
  private async findSimilarDenials(denial: any, claim: any): Promise<SimilarDenial[]> {
    try {
      const { data: similarDenials } = await supabase
        .from('claim_denials')
        .select('*, claims(id, claim_number, status)')
        .eq('denial_code', denial.denial_code)
        .neq('id', denial.id)
        .limit(5);

      return (similarDenials || []).map((d: any) => ({
        claimId: d.claim_id,
        denialCode: d.denial_code,
        resolution: d.appeal_status || 'pending',
        outcome: d.appeal_outcome,
        notes: d.appeal_notes,
      }));
    } catch (error) {
      return [];
    }
  }

  // Generate recommended actions
  private generateRecommendedActions(
    denial: any,
    claim: any,
    rootCause: RootCause,
    appealability: Appealability
  ): RecommendedAction[] {
    const actions: RecommendedAction[] = [];

    // Critical actions
    if (appealability.canAppeal && appealability.successProbability >= 70) {
      actions.push({
        action: 'File Appeal',
        priority: 'critical',
        description: `High success probability (${appealability.successProbability}%). File appeal before deadline.`,
        estimatedTime: '2-4 hours',
        automated: true,
      });
    }

    if (rootCause.primary.includes('authorization')) {
      actions.push({
        action: 'Obtain/Link Authorization',
        priority: 'critical',
        description: 'Prior authorization is required. Obtain or link existing authorization.',
        estimatedTime: '1-2 days',
        automated: false,
      });
    }

    if (rootCause.primary.includes('diagnosis')) {
      actions.push({
        action: 'Review Diagnosis Codes',
        priority: 'high',
        description: 'Verify diagnosis codes are correct and support the procedure.',
        estimatedTime: '30 minutes',
        automated: false,
      });
    }

    // Prevention actions
    if (denial.denial_code === 'CO-18') {
      actions.push({
        action: 'Check for Duplicates',
        priority: 'high',
        description: 'Verify this is not a duplicate submission before resubmitting.',
        estimatedTime: '15 minutes',
        automated: true,
      });
    }

    // Documentation actions
    actions.push({
      action: 'Gather Supporting Documents',
      priority: 'medium',
      description: `Collect required documents: ${appealability.requiredDocuments.join(', ')}`,
      estimatedTime: '1-2 hours',
      automated: false,
    });

    return actions;
  }

  // Generate prevention strategies
  private generatePreventionStrategies(denial: any, rootCause: RootCause): string[] {
    const strategies: string[] = [];

    if (rootCause.primary.includes('authorization')) {
      strategies.push('Verify prior authorization requirements before submitting claims');
      strategies.push('Link authorization numbers to claims at submission');
      strategies.push('Set up automated authorization checks');
    }

    if (rootCause.primary.includes('diagnosis')) {
      strategies.push('Validate diagnosis codes before claim submission');
      strategies.push('Ensure primary diagnosis is clearly identified');
      strategies.push('Verify diagnosis codes support procedure codes');
    }

    if (rootCause.primary.includes('duplicate')) {
      strategies.push('Implement duplicate claim detection before submission');
      strategies.push('Check claim history before submitting');
    }

    strategies.push('Use claim scrubbing before submission');
    strategies.push('Review payer-specific requirements');
    strategies.push('Maintain accurate patient eligibility records');

    return strategies;
  }

  // Estimate recovery
  private estimateRecovery(denial: any, appealability: Appealability): {
    amount: number;
    probability: number;
  } {
    const deniedAmount = parseFloat(denial.denied_amount || '0');
    const probability = appealability.successProbability / 100;

    // Estimate recovery amount (may be partial)
    const estimatedAmount = deniedAmount * probability * 0.9; // Assume 90% of appealed amount if successful

    return {
      amount: estimatedAmount,
      probability: appealability.successProbability,
    };
  }

  // Create appeal workflow
  async createAppealWorkflow(
    denialId: string,
    claimId: string,
    appealType: string,
    userId: string
  ): Promise<AppealWorkflow> {
    try {
      // Get denial analysis
      const analysis = await this.analyzeDenial(denialId, claimId);

      if (!analysis.appealability.canAppeal) {
        throw new Error('This denial is not appealable');
      }

      // Generate appeal letter using AI
      const { data: denial } = await supabase
        .from('claim_denials')
        .select('*')
        .eq('id', denialId)
        .single();

      const { data: claim } = await supabase
        .from('claims')
        .select('*')
        .eq('id', claimId)
        .single();

      const appealLetter = await aiService.generateAppealLetter({
        claimId: claim?.claim_number || claimId,
        patientName: claim?.patient_name || 'Unknown',
        denialCode: denial?.denial_code || '',
        denialReason: denial?.denial_reason || '',
        amount: parseFloat(denial?.denied_amount || '0'),
      });

      // Create appeal workflow
      const workflow: AppealWorkflow = {
        denialId,
        claimId,
        appealType,
        status: 'draft',
        appealLetter,
        supportingDocuments: analysis.appealability.requiredDocuments,
        created_by: userId,
      };

      // Save to database
      const { data: savedWorkflow, error } = await supabase
        .from('appeal_workflows')
        .insert({
          denial_id: denialId,
          claim_id: claimId,
          appeal_type: appealType,
          status: 'draft',
          appeal_letter: appealLetter,
          supporting_documents: analysis.appealability.requiredDocuments,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      workflow.id = savedWorkflow.id;
      workflow.created_at = savedWorkflow.created_at;

      // Trigger workflow automation
      await workflowService.executeWorkflow('event', 'appeal_created', {
        appeal_id: workflow.id,
        denial_id: denialId,
        claim_id: claimId,
      });

      return workflow;
    } catch (error: any) {
      console.error('Error creating appeal workflow:', error);
      throw new Error(error.message || 'Failed to create appeal workflow');
    }
  }

  // Submit appeal
  async submitAppeal(appealId: string, userId: string): Promise<void> {
    try {
      const { data: appeal, error } = await supabase
        .from('appeal_workflows')
        .select('*')
        .eq('id', appealId)
        .single();

      if (error || !appeal) {
        throw new Error('Appeal not found');
      }

      // Update appeal status
      await supabase
        .from('appeal_workflows')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', appealId);

      // Update denial status
      await supabase
        .from('claim_denials')
        .update({
          appeal_status: 'submitted',
          appeal_submitted_at: new Date().toISOString(),
        })
        .eq('id', appeal.denial_id);

      // Trigger notifications
      await notificationService.notifyStatusChange(
        userId,
        'appeal',
        appealId,
        'draft',
        'submitted'
      );
    } catch (error: any) {
      console.error('Error submitting appeal:', error);
      throw new Error(error.message || 'Failed to submit appeal');
    }
  }

  // Get denial trends
  async getDenialTrends(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<{
    totalDenials: number;
    denialRate: number;
    topDenialCodes: Array<{ code: string; reason: string; count: number; rate: number }>;
    denialByPayer: Array<{ payer: string; count: number; rate: number }>;
    appealSuccessRate: number;
  }> {
    try {
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data: denials } = await supabase
        .from('claim_denials')
        .select('*')
        .gte('denial_date', startDate.toISOString());

      const { data: claims } = await supabase
        .from('claims')
        .select('id, status')
        .gte('created_at', startDate.toISOString());

      const totalDenials = denials?.length || 0;
      const totalClaims = claims?.length || 0;
      const denialRate = totalClaims > 0 ? (totalDenials / totalClaims) * 100 : 0;

      // Top denial codes
      const codeCounts = new Map<string, number>();
      denials?.forEach(d => {
        const code = d.denial_code || 'Unknown';
        codeCounts.set(code, (codeCounts.get(code) || 0) + 1);
      });

      const topDenialCodes = Array.from(codeCounts.entries())
        .map(([code, count]) => ({
          code,
          reason: this.getDenialReason(code),
          count,
          rate: totalDenials > 0 ? (count / totalDenials) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Denial by payer
      const payerCounts = new Map<string, number>();
      // Would need to join with claims table to get payer info

      // Appeal success rate
      const appeals = denials?.filter(d => d.appeal_status === 'approved') || [];
      const appealSuccessRate = denials && denials.length > 0
        ? (appeals.length / denials.filter(d => d.appeal_status).length) * 100
        : 0;

      return {
        totalDenials,
        denialRate,
        topDenialCodes,
        denialByPayer: [], // Would need payer data
        appealSuccessRate,
      };
    } catch (error: any) {
      console.error('Error getting denial trends:', error);
      throw new Error(error.message || 'Failed to get denial trends');
    }
  }

  // Get denial reason by code
  private getDenialReason(code: string): string {
    const reasons: Record<string, string> = {
      'CO-1': 'Deductible Amount',
      'CO-2': 'Coinsurance Amount',
      'CO-3': 'Co-payment Amount',
      'CO-11': 'Diagnosis Not Covered',
      'CO-16': 'Prior Authorization Required',
      'CO-18': 'Duplicate Claim',
      'CO-22': 'Coordination of Benefits',
      'CO-50': 'Non-covered Services',
    };
    return reasons[code] || 'Unknown Reason';
  }
}

export const denialManagementService = DenialManagementService.getInstance();

