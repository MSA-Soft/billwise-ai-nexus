// Automated Claim Submission Service
// Batch submission, automatic resubmission, status tracking

import { supabase } from '@/integrations/supabase/client';
import { claimSubmissionService } from './claimSubmissionService';
import { claimScrubbingService } from './claimScrubbingService';
import { notificationService } from './notificationService';

export interface BatchSubmission {
  id?: string;
  name: string;
  claim_ids: string[];
  submission_method: 'EDI' | 'Paper';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  submitted_at?: string;
  completed_at?: string;
  results?: BatchSubmissionResults;
  created_by?: string;
  created_at?: string;
}

export interface BatchSubmissionResults {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ claim_id: string; error: string }>;
}

export interface ResubmissionRule {
  id?: string;
  name: string;
  conditions: {
    status: string[];
    denial_codes?: string[];
    days_since_submission?: number;
    max_attempts?: number;
  };
  isActive: boolean;
  created_by?: string;
}

export class AutomatedClaimSubmissionService {
  private static instance: AutomatedClaimSubmissionService;

  static getInstance(): AutomatedClaimSubmissionService {
    if (!AutomatedClaimSubmissionService.instance) {
      AutomatedClaimSubmissionService.instance = new AutomatedClaimSubmissionService();
    }
    return AutomatedClaimSubmissionService.instance;
  }

  // Batch submit claims
  async batchSubmitClaims(
    claimIds: string[],
    submissionMethod: 'EDI' | 'Paper',
    userId: string,
    batchName?: string
  ): Promise<BatchSubmission> {
    const batch: BatchSubmission = {
      name: batchName || `Batch ${new Date().toISOString()}`,
      claim_ids: claimIds,
      submission_method: submissionMethod,
      status: 'processing',
      created_by: userId,
    };

    try {
      // Save batch record
      const { data: savedBatch, error: saveError } = await supabase
        .from('claim_batch_submissions')
        .insert({
          name: batch.name,
          claim_ids: batch.claim_ids,
          submission_method: batch.submission_method,
          status: batch.status,
          created_by: userId,
        })
        .select()
        .single();

      if (saveError) throw saveError;
      batch.id = savedBatch.id;

      // Process each claim
      const results: BatchSubmissionResults = {
        total: claimIds.length,
        successful: 0,
        failed: 0,
        errors: [],
      };

      for (const claimId of claimIds) {
        try {
          // Get claim data
          const { data: claim, error: claimError } = await supabase
            .from('claims')
            .select('*')
            .eq('id', claimId)
            .single();

          if (claimError || !claim) {
            results.failed++;
            results.errors.push({
              claim_id: claimId,
              error: 'Claim not found',
            });
            continue;
          }

          // Scrub claim before submission
          const scrubbingResult = await claimScrubbingService.scrubClaim(claim as any);
          
          if (!scrubbingResult.canSubmit) {
            results.failed++;
            results.errors.push({
              claim_id: claimId,
              error: `Claim failed scrubbing: ${scrubbingResult.errors.map(e => e.message).join(', ')}`,
            });
            continue;
          }

          // Submit claim
          await claimSubmissionService.submitClaim(claim as any, userId);

          // Update claim status
          await supabase
            .from('claims')
            .update({
              status: 'submitted',
              submitted_at: new Date().toISOString(),
              submission_method: submissionMethod,
              updated_at: new Date().toISOString(),
            })
            .eq('id', claimId);

          results.successful++;
        } catch (error: any) {
          results.failed++;
          results.errors.push({
            claim_id: claimId,
            error: error.message || 'Submission failed',
          });
        }
      }

      // Update batch status
      batch.status = results.failed === 0 ? 'completed' : results.failed === results.total ? 'failed' : 'partial';
      batch.results = results;
      batch.completed_at = new Date().toISOString();

      await supabase
        .from('claim_batch_submissions')
        .update({
          status: batch.status,
          results: batch.results,
          completed_at: batch.completed_at,
        })
        .eq('id', batch.id);

      // Notify user
      if (userId) {
        await notificationService.sendEmailNotification(
          '', // Would get from user profile
          `Batch Submission ${batch.status === 'completed' ? 'Completed' : 'Completed with Errors'}`,
          `Batch "${batch.name}" has been processed. ${results.successful} successful, ${results.failed} failed.`
        );
      }

      return batch;
    } catch (error: any) {
      batch.status = 'failed';
      batch.completed_at = new Date().toISOString();
      
      if (batch.id) {
        await supabase
          .from('claim_batch_submissions')
          .update({
            status: 'failed',
            completed_at: batch.completed_at,
          })
          .eq('id', batch.id);
      }

      throw new Error(error.message || 'Batch submission failed');
    }
  }

  // Automatic resubmission based on rules
  async autoResubmitClaims(rule: ResubmissionRule): Promise<number> {
    if (!rule.isActive) return 0;

    try {
      // Find claims matching conditions
      let query = supabase
        .from('claims')
        .select('*')
        .in('status', rule.conditions.status);

      // Apply additional filters
      if (rule.conditions.denial_codes && rule.conditions.denial_codes.length > 0) {
        query = query.in('denial_code', rule.conditions.denial_codes);
      }

      if (rule.conditions.days_since_submission) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - rule.conditions.days_since_submission);
        query = query.lte('submitted_at', cutoffDate.toISOString());
      }

      const { data: claims, error } = await query;

      if (error) throw error;

      let resubmitted = 0;

      for (const claim of claims || []) {
        // Check max attempts
        if (rule.conditions.max_attempts) {
          const attemptCount = await this.getResubmissionAttempts(claim.id);
          if (attemptCount >= rule.conditions.max_attempts) {
            continue; // Skip if max attempts reached
          }
        }

        try {
          // Resubmit claim
          await claimSubmissionService.submitClaim(claim as any, rule.created_by || 'system');

          // Update claim
          await supabase
            .from('claims')
            .update({
              status: 'submitted',
              submitted_at: new Date().toISOString(),
              resubmission_count: (claim.resubmission_count || 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', claim.id);

          // Log resubmission
          await this.logResubmission(claim.id, rule.id || '', 'auto');

          resubmitted++;
        } catch (error: any) {
          console.error(`Failed to resubmit claim ${claim.id}:`, error);
        }
      }

      return resubmitted;
    } catch (error: any) {
      console.error('Auto resubmission error:', error);
      throw new Error(error.message || 'Auto resubmission failed');
    }
  }

  // Get resubmission attempts for a claim
  private async getResubmissionAttempts(claimId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('claim_resubmissions')
        .select('id')
        .eq('claim_id', claimId);

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      return 0;
    }
  }

  // Log resubmission
  private async logResubmission(claimId: string, ruleId: string, type: 'auto' | 'manual'): Promise<void> {
    try {
      await supabase.from('claim_resubmissions').insert({
        claim_id: claimId,
        rule_id: ruleId,
        type: type,
        resubmitted_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging resubmission:', error);
    }
  }

  // Track claim status
  async trackClaimStatus(claimId: string): Promise<{
    currentStatus: string;
    statusHistory: Array<{ status: string; date: string; notes?: string }>;
    daysInStatus: number;
    nextAction?: string;
  }> {
    try {
      // Get claim
      const { data: claim, error } = await supabase
        .from('claims')
        .select('*')
        .eq('id', claimId)
        .single();

      if (error || !claim) {
        throw new Error('Claim not found');
      }

      // Get status history
      const { data: history } = await supabase
        .from('claim_status_history')
        .select('*')
        .eq('claim_id', claimId)
        .order('created_at', { ascending: true });

      // Calculate days in current status
      const currentStatusDate = history && history.length > 0 
        ? new Date(history[history.length - 1].created_at)
        : new Date(claim.created_at);
      const daysInStatus = Math.floor(
        (Date.now() - currentStatusDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determine next action
      let nextAction: string | undefined;
      if (claim.status === 'submitted' && daysInStatus > 30) {
        nextAction = 'Follow up with payer';
      } else if (claim.status === 'denied') {
        nextAction = 'Review denial and consider appeal';
      } else if (claim.status === 'processing' && daysInStatus > 14) {
        nextAction = 'Check status with payer';
      }

      return {
        currentStatus: claim.status,
        statusHistory: (history || []).map(h => ({
          status: h.status,
          date: h.created_at,
          notes: h.notes,
        })),
        daysInStatus,
        nextAction,
      };
    } catch (error: any) {
      console.error('Error tracking claim status:', error);
      throw new Error(error.message || 'Failed to track claim status');
    }
  }

  // Schedule automatic status checks
  async scheduleStatusChecks(claimIds: string[], intervalDays: number = 7): Promise<void> {
    try {
      for (const claimId of claimIds) {
        await supabase.from('claim_status_checks').insert({
          claim_id: claimId,
          interval_days: intervalDays,
          next_check_date: new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
        });
      }
    } catch (error: any) {
      console.error('Error scheduling status checks:', error);
      throw new Error(error.message || 'Failed to schedule status checks');
    }
  }

  // Process scheduled status checks
  async processScheduledStatusChecks(): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: scheduledChecks, error } = await supabase
        .from('claim_status_checks')
        .select('*')
        .eq('is_active', true)
        .lte('next_check_date', today.toISOString());

      if (error) throw error;

      let processed = 0;

      for (const check of scheduledChecks || []) {
        try {
          // Check claim status (would call payer API in production)
          const statusInfo = await this.trackClaimStatus(check.claim_id);

          // Update next check date
          const nextCheck = new Date(check.next_check_date);
          nextCheck.setDate(nextCheck.getDate() + check.interval_days);

          await supabase
            .from('claim_status_checks')
            .update({
              last_check_date: new Date().toISOString(),
              next_check_date: nextCheck.toISOString(),
            })
            .eq('id', check.id);

          processed++;
        } catch (error: any) {
          console.error(`Error processing status check ${check.id}:`, error);
        }
      }

      return processed;
    } catch (error: any) {
      console.error('Error processing scheduled status checks:', error);
      throw new Error(error.message || 'Failed to process status checks');
    }
  }

  // Get batch submission history
  async getBatchSubmissions(userId?: string, limit: number = 50): Promise<BatchSubmission[]> {
    try {
      let query = supabase
        .from('claim_batch_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('created_by', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as BatchSubmission[];
    } catch (error: any) {
      console.error('Error fetching batch submissions:', error);
      throw new Error(error.message || 'Failed to fetch batch submissions');
    }
  }
}

export const automatedClaimSubmissionService = AutomatedClaimSubmissionService.getInstance();

