// Visit Usage Management Service
// Handles visit tracking, validation, and exhaustion management
// Based on industry best practices for authorization visit management

import { supabase } from '@/integrations/supabase/client';
import { authorizationTaskService } from './authorizationTaskService';

export interface VisitUsageRecord {
  id: string;
  authorization_request_id: string;
  appointment_id?: string;
  visit_date: string;
  service_type?: string;
  cpt_codes?: string[];
  provider_id?: string;
  visit_number: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface VisitValidationResult {
  valid: boolean;
  can_proceed: boolean;
  errors: Array<{
    code: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: Array<{
    code: string;
    message: string;
    severity: 'warning';
  }>;
  visits_remaining?: number;
  days_until_expiry?: number;
}

export interface VisitUsageStats {
  total_visits: number;
  visits_authorized: number;
  visits_used: number;
  visits_remaining: number;
  usage_percentage: number;
  exhausted: boolean;
  last_visit_date?: string;
  first_visit_date?: string;
}

export class VisitUsageService {
  private static instance: VisitUsageService;

  static getInstance(): VisitUsageService {
    if (!VisitUsageService.instance) {
      VisitUsageService.instance = new VisitUsageService();
    }
    return VisitUsageService.instance;
  }

  // Validate visit usage before recording
  async validateVisitUsage(
    authorizationId: string,
    serviceDate: Date,
    cptCode?: string
  ): Promise<VisitValidationResult> {
    try {
      const { data: auth, error } = await supabase
        .from('authorization_requests')
        .select('*')
        .eq('id', authorizationId)
        .single();

      if (error) throw error;
      if (!auth) {
        return {
          valid: false,
          can_proceed: false,
          errors: [{
            code: 'AUTH_NOT_FOUND',
            message: 'Authorization not found',
            severity: 'error',
          }],
          warnings: [],
        };
      }

      const errors: VisitValidationResult['errors'] = [];
      const warnings: VisitValidationResult['warnings'] = [];

      // Check if expired
      if (auth.authorization_expiration_date) {
        const expDate = new Date(auth.authorization_expiration_date);
        if (expDate < serviceDate) {
          errors.push({
            code: 'AUTH_EXPIRED',
            message: `Authorization expired on ${auth.authorization_expiration_date}`,
            severity: 'error',
          });
        } else {
          const daysUntil = Math.ceil((expDate.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntil <= 7) {
            warnings.push({
              code: 'AUTH_EXPIRING_SOON',
              message: `Authorization expires in ${daysUntil} days`,
              severity: 'warning',
            });
          }
        }
      }

      // Check visits remaining
      const visitsAuthorized = auth.visits_authorized || 0;
      const visitsUsed = auth.visits_used || 0;
      const visitsRemaining = visitsAuthorized - visitsUsed;

      if (visitsAuthorized > 0) {
        if (visitsRemaining <= 0) {
          errors.push({
            code: 'VISITS_EXHAUSTED',
            message: 'All authorized visits have been used',
            severity: 'error',
          });
        } else if (visitsRemaining === 1) {
          warnings.push({
            code: 'VISITS_LOW',
            message: 'Only 1 visit remaining',
            severity: 'warning',
          });
        } else if (visitsRemaining <= 3) {
          warnings.push({
            code: 'VISITS_LOW',
            message: `Only ${visitsRemaining} visits remaining`,
            severity: 'warning',
          });
        }
      }

      // Check service match
      if (cptCode && auth.procedure_codes && auth.procedure_codes.length > 0) {
        if (!auth.procedure_codes.includes(cptCode)) {
          warnings.push({
            code: 'SERVICE_MISMATCH',
            message: 'Service code does not match authorization',
            severity: 'warning',
          });
        }
      }

      // Check date range
      if (auth.service_start_date && auth.service_end_date) {
        const startDate = new Date(auth.service_start_date);
        const endDate = new Date(auth.service_end_date);
        if (serviceDate < startDate || serviceDate > endDate) {
          errors.push({
            code: 'DATE_OUT_OF_RANGE',
            message: `Service date must be between ${auth.service_start_date} and ${auth.service_end_date}`,
            severity: 'error',
          });
        }
      }

      // Check status - show warning if not approved but allow it
      if (auth.status?.toLowerCase() !== 'approved') {
        warnings.push({
          code: 'AUTH_NOT_APPROVED',
          message: `Authorization status is ${auth.status} (not approved). Visit will be recorded anyway.`,
          severity: 'warning',
        });
      }

      return {
        valid: errors.length === 0,
        can_proceed: errors.length === 0,
        errors,
        warnings,
        visits_remaining: visitsRemaining,
        days_until_expiry: auth.authorization_expiration_date 
          ? Math.ceil((new Date(auth.authorization_expiration_date).getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24))
          : undefined,
      };
    } catch (error: any) {
      console.error('Error validating visit usage:', error);
      return {
        valid: false,
        can_proceed: false,
        errors: [{
          code: 'VALIDATION_ERROR',
          message: error.message || 'Failed to validate visit usage',
          severity: 'error',
        }],
        warnings: [],
      };
    }
  }

  // Record visit usage
  async recordVisitUsage(
    authorizationId: string,
    visitDetails: {
      appointment_id?: string;
      visit_date: Date;
      service_type?: string;
      cpt_codes?: string[];
      provider_id?: string;
      status?: VisitUsageRecord['status'];
      notes?: string;
    },
    userId: string
  ): Promise<VisitUsageRecord> {
    try {
      // Validate first
      const validation = await this.validateVisitUsage(
        authorizationId,
        visitDetails.visit_date,
        visitDetails.cpt_codes?.[0]
      );

      if (!validation.can_proceed) {
        throw new Error(`Visit validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Get current visit count to determine visit number
      const { data: auth } = await supabase
        .from('authorization_requests')
        .select('visits_used')
        .eq('id', authorizationId)
        .single();

      const visitNumber = (auth?.visits_used || 0) + 1;

      // Record visit
      const { data: visitRecord, error: visitError } = await supabase
        .from('authorization_visit_usage')
        .insert({
          authorization_request_id: authorizationId,
          appointment_id: visitDetails.appointment_id,
          visit_date: visitDetails.visit_date.toISOString().split('T')[0],
          service_type: visitDetails.service_type,
          cpt_codes: visitDetails.cpt_codes || [],
          provider_id: visitDetails.provider_id,
          visit_number: visitNumber,
          status: visitDetails.status || 'completed',
          notes: visitDetails.notes,
          created_by: userId,
        })
        .select()
        .single();

      if (visitError) throw visitError;

      // Update authorization (trigger will handle visit count update)
      // But we'll also update here to ensure consistency
      const { error: updateError } = await supabase
        .from('authorization_requests')
        .update({
          visits_used: visitNumber,
          last_visit_date: visitDetails.visit_date.toISOString().split('T')[0],
          first_visit_date: auth?.visits_used === 0 
            ? visitDetails.visit_date.toISOString().split('T')[0]
            : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authorizationId);

      if (updateError) {
        console.error('Error updating authorization visit count:', updateError);
        // Don't throw - visit is recorded, count will be updated by trigger
      }

      // Check if exhausted
      const { data: updatedAuth } = await supabase
        .from('authorization_requests')
        .select('visits_authorized, visits_used')
        .eq('id', authorizationId)
        .single();

      if (updatedAuth && updatedAuth.visits_authorized > 0) {
        const isExhausted = (updatedAuth.visits_used || 0) >= updatedAuth.visits_authorized;
        
        if (isExhausted) {
          // Mark as exhausted
          await supabase
            .from('authorization_requests')
            .update({
              exhausted_at: new Date().toISOString(),
              status: 'exhausted',
            })
            .eq('id', authorizationId);

          // Create renewal task
          await authorizationTaskService.createTaskFromAuthRequest(
            authorizationId,
            'follow_up',
            {
              userId,
              priority: 'high',
              title: `Visits Exhausted - Renewal Needed`,
              description: `All ${updatedAuth.visits_authorized} authorized visits have been used. Renewal or new authorization required.`,
            }
          );
        }
      }

      // Create audit event
      await supabase.from('authorization_events').insert({
        authorization_request_id: authorizationId,
        event_type: 'visit_recorded',
        payload: {
          visit_number: visitNumber,
          visit_date: visitDetails.visit_date.toISOString(),
          service_type: visitDetails.service_type,
          cpt_codes: visitDetails.cpt_codes,
        },
      });

      return visitRecord as VisitUsageRecord;
    } catch (error: any) {
      console.error('Error recording visit usage:', error);
      throw new Error(error.message || 'Failed to record visit usage');
    }
  }

  // Get visit history for an authorization
  async getVisitHistory(authorizationId: string): Promise<VisitUsageRecord[]> {
    try {
      const { data, error } = await supabase
        .from('authorization_visit_usage')
        .select('*')
        .eq('authorization_request_id', authorizationId)
        .order('visit_date', { ascending: false })
        .order('visit_number', { ascending: false });

      if (error) throw error;

      return (data || []) as VisitUsageRecord[];
    } catch (error: any) {
      console.error('Error getting visit history:', error);
      throw new Error(error.message || 'Failed to get visit history');
    }
  }

  // Get visit usage statistics
  async getVisitUsageStats(authorizationId: string): Promise<VisitUsageStats> {
    try {
      const { data: auth, error } = await supabase
        .from('authorization_requests')
        .select('visits_authorized, visits_used, last_visit_date, first_visit_date')
        .eq('id', authorizationId)
        .single();

      if (error) throw error;
      if (!auth) {
        throw new Error('Authorization not found');
      }

      const visitsAuthorized = auth.visits_authorized || 0;
      const visitsUsed = auth.visits_used || 0;
      const visitsRemaining = visitsAuthorized - visitsUsed;
      const usagePercentage = visitsAuthorized > 0 
        ? Math.round((visitsUsed / visitsAuthorized) * 100)
        : 0;

      return {
        total_visits: visitsUsed,
        visits_authorized: visitsAuthorized,
        visits_used: visitsUsed,
        visits_remaining: visitsRemaining,
        usage_percentage: usagePercentage,
        exhausted: visitsRemaining <= 0 && visitsAuthorized > 0,
        last_visit_date: auth.last_visit_date || undefined,
        first_visit_date: auth.first_visit_date || undefined,
      };
    } catch (error: any) {
      console.error('Error getting visit usage stats:', error);
      throw new Error(error.message || 'Failed to get visit usage stats');
    }
  }

  // Check if visits are exhausted
  async isVisitsExhausted(authorizationId: string): Promise<boolean> {
    try {
      const stats = await this.getVisitUsageStats(authorizationId);
      return stats.exhausted;
    } catch (error) {
      return false;
    }
  }

  // Validate authorization for appointment (before scheduling)
  async validateAuthorizationForAppointment(
    patientId: string,
    serviceDate: Date,
    cptCode?: string
  ): Promise<VisitValidationResult & { authorization?: any }> {
    try {
      // Find active authorization for patient
      const { data: auths, error } = await supabase
        .from('authorization_requests')
        .select('*')
        .eq('patient_name', patientId) // Note: This should be patient_id when we link properly
        .eq('status', 'approved')
        .not('authorization_expiration_date', 'is', null)
        .gte('authorization_expiration_date', serviceDate.toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!auths || auths.length === 0) {
        return {
          valid: false,
          can_proceed: false,
          errors: [{
            code: 'NO_AUTHORIZATION',
            message: 'No active authorization found for this service',
            severity: 'error',
          }],
          warnings: [],
        };
      }

      const auth = auths[0];
      const validation = await this.validateVisitUsage(auth.id, serviceDate, cptCode);

      return {
        ...validation,
        authorization: auth,
      };
    } catch (error: any) {
      console.error('Error validating authorization for appointment:', error);
      return {
        valid: false,
        can_proceed: false,
        errors: [{
          code: 'VALIDATION_ERROR',
          message: error.message || 'Failed to validate authorization',
          severity: 'error',
        }],
        warnings: [],
      };
    }
  }

  // Auto-record visit when appointment is completed
  async autoRecordVisitOnAppointmentCompletion(
    appointmentId: string,
    authorizationId: string,
    userId: string
  ): Promise<VisitUsageRecord | null> {
    try {
      // Get appointment details
      const { data: appointment, error: apptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (apptError) {
        console.error('Error fetching appointment:', apptError);
        return null;
      }

      if (!appointment || appointment.status !== 'completed') {
        return null; // Only record for completed appointments
      }

      // Record visit
      return await this.recordVisitUsage(
        authorizationId,
        {
          appointment_id: appointmentId,
          visit_date: new Date(appointment.appointment_date || appointment.created_at),
          service_type: appointment.service_type,
          cpt_codes: appointment.procedure_codes || [],
          provider_id: appointment.provider_id,
          status: 'completed',
          notes: `Auto-recorded from appointment completion`,
        },
        userId
      );
    } catch (error: any) {
      console.error('Error auto-recording visit:', error);
      return null; // Don't throw - this is optional
    }
  }
}

export const visitUsageService = VisitUsageService.getInstance();

