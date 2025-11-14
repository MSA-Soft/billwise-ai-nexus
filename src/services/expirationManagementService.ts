// Expiration Management Service
// Handles authorization expiration alerts, renewals, and expired authorization management
// Based on industry best practices with multi-tier alerting system

import { supabase } from '@/integrations/supabase/client';

export interface ExpirationAlert {
  authorization_id: string;
  patient_name: string;
  expiration_date: string;
  days_until_expiry: number;
  alert_tier: '90_days' | '60_days' | '30_days' | '14_days' | '7_days' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  action_required: string;
}

export interface ExpiringAuthorization {
  id: string;
  patient_name: string;
  payer_name: string;
  service_type: string;
  authorization_expiration_date: string;
  days_until_expiry: number;
  visits_authorized: number;
  visits_used: number;
  visits_remaining: number;
  status: string;
  renewal_initiated: boolean;
  expired_at?: string;
}

export interface RenewalInfo {
  authorization_id: string;
  renewal_initiated_at: string;
  renewal_status: 'not_started' | 'preparing' | 'submitted' | 'approved' | 'denied';
  renewal_of_authorization_id?: string;
}

export class ExpirationManagementService {
  private static instance: ExpirationManagementService;

  static getInstance(): ExpirationManagementService {
    if (!ExpirationManagementService.instance) {
      ExpirationManagementService.instance = new ExpirationManagementService();
    }
    return ExpirationManagementService.instance;
  }

  // Get authorizations expiring within specified days
  async getExpiringAuthorizations(days: number = 30): Promise<ExpiringAuthorization[]> {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);

      const { data, error } = await supabase
        .from('authorization_requests')
        .select(`
          id,
          patient_name,
          payer_name_custom,
          service_type,
          authorization_expiration_date,
          visits_authorized,
          visits_used,
          status,
          renewal_initiated,
          expired_at
        `)
        .not('authorization_expiration_date', 'is', null)
        .lte('authorization_expiration_date', targetDate.toISOString().split('T')[0])
        .in('status', ['approved', 'pending'])
        .order('authorization_expiration_date', { ascending: true });

      if (error) throw error;

      return (data || []).map(auth => {
        const expDate = new Date(auth.authorization_expiration_date);
        const today = new Date();
        const daysUntil = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const visitsRemaining = (auth.visits_authorized || 0) - (auth.visits_used || 0);

        return {
          id: auth.id,
          patient_name: auth.patient_name,
          payer_name: auth.payer_name_custom || 'Unknown',
          service_type: auth.service_type || '',
          authorization_expiration_date: auth.authorization_expiration_date,
          days_until_expiry: daysUntil,
          visits_authorized: auth.visits_authorized || 0,
          visits_used: auth.visits_used || 0,
          visits_remaining: visitsRemaining,
          status: auth.status,
          renewal_initiated: auth.renewal_initiated || false,
          expired_at: auth.expired_at || undefined,
        };
      });
    } catch (error: any) {
      console.error('Error fetching expiring authorizations:', error);
      throw new Error(error.message || 'Failed to fetch expiring authorizations');
    }
  }

  // Get expired authorizations
  async getExpiredAuthorizations(): Promise<ExpiringAuthorization[]> {
    try {
      const { data, error } = await supabase
        .from('authorization_requests')
        .select(`
          id,
          patient_name,
          payer_name_custom,
          service_type,
          authorization_expiration_date,
          visits_authorized,
          visits_used,
          status,
          expired_at,
          expiration_handled
        `)
        .not('expired_at', 'is', null)
        .eq('expiration_handled', false)
        .order('expired_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(auth => {
        const expDate = new Date(auth.authorization_expiration_date);
        const today = new Date();
        const daysUntil = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const visitsRemaining = (auth.visits_authorized || 0) - (auth.visits_used || 0);

        return {
          id: auth.id,
          patient_name: auth.patient_name,
          payer_name: auth.payer_name_custom || 'Unknown',
          service_type: auth.service_type || '',
          authorization_expiration_date: auth.authorization_expiration_date,
          days_until_expiry: daysUntil,
          visits_authorized: auth.visits_authorized || 0,
          visits_used: auth.visits_used || 0,
          visits_remaining: visitsRemaining,
          status: auth.status,
          renewal_initiated: false,
          expired_at: auth.expired_at || undefined,
        };
      });
    } catch (error: any) {
      console.error('Error fetching expired authorizations:', error);
      throw new Error(error.message || 'Failed to fetch expired authorizations');
    }
  }

  // Check which alert tier should be sent
  getAlertTier(daysUntilExpiry: number): ExpirationAlert['alert_tier'] | null {
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 7) return '7_days';
    if (daysUntilExpiry <= 14) return '14_days';
    if (daysUntilExpiry <= 30) return '30_days';
    if (daysUntilExpiry <= 60) return '60_days';
    if (daysUntilExpiry <= 90) return '90_days';
    return null;
  }

  // Get priority based on alert tier
  getPriorityForTier(tier: ExpirationAlert['alert_tier']): ExpirationAlert['priority'] {
    switch (tier) {
      case 'expired':
        return 'critical';
      case '7_days':
        return 'urgent';
      case '14_days':
        return 'high';
      case '30_days':
        return 'medium';
      case '60_days':
      case '90_days':
        return 'low';
      default:
        return 'low';
    }
  }

  // Get action required message
  getActionRequired(tier: ExpirationAlert['alert_tier']): string {
    switch (tier) {
      case 'expired':
        return 'Authorization expired. New authorization required immediately.';
      case '7_days':
        return 'Authorization expires in 7 days. Submit renewal request urgently.';
      case '14_days':
        return 'Authorization expires in 14 days. Submit renewal request.';
      case '30_days':
        return 'Authorization expires in 30 days. Begin renewal process.';
      case '60_days':
        return 'Authorization expires in 60 days. Prepare renewal documentation.';
      case '90_days':
        return 'Authorization expires in 90 days. Review renewal requirements.';
      default:
        return 'Monitor authorization expiration.';
    }
  }

  // Mark alert tier as sent
  async markAlertTierSent(authorizationId: string, tier: ExpirationAlert['alert_tier']): Promise<void> {
    try {
      const { data: current } = await supabase
        .from('authorization_requests')
        .select('expiration_alert_sent_tiers')
        .eq('id', authorizationId)
        .single();

      const sentTiers = (current?.expiration_alert_sent_tiers as string[]) || [];
      
      if (!sentTiers.includes(tier)) {
        sentTiers.push(tier);
        
        await supabase
          .from('authorization_requests')
          .update({ expiration_alert_sent_tiers: sentTiers })
          .eq('id', authorizationId);
      }
    } catch (error: any) {
      console.error('Error marking alert tier as sent:', error);
      // Don't throw - this is not critical
    }
  }

  // Check if alert tier has been sent
  async hasAlertTierBeenSent(authorizationId: string, tier: ExpirationAlert['alert_tier']): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('authorization_requests')
        .select('expiration_alert_sent_tiers')
        .eq('id', authorizationId)
        .single();

      const sentTiers = (data?.expiration_alert_sent_tiers as string[]) || [];
      return sentTiers.includes(tier);
    } catch (error) {
      return false;
    }
  }

  // Get expiration alerts that need to be sent
  async getExpirationAlerts(): Promise<ExpirationAlert[]> {
    try {
      const expiringAuths = await this.getExpiringAuthorizations(90);
      const alerts: ExpirationAlert[] = [];

      for (const auth of expiringAuths) {
        const tier = this.getAlertTier(auth.days_until_expiry);
        if (!tier) continue;

        // Check if alert already sent
        const alreadySent = await this.hasAlertTierBeenSent(auth.id, tier);
        if (alreadySent) continue;

        alerts.push({
          authorization_id: auth.id,
          patient_name: auth.patient_name,
          expiration_date: auth.authorization_expiration_date,
          days_until_expiry: auth.days_until_expiry,
          alert_tier: tier,
          priority: this.getPriorityForTier(tier),
          action_required: this.getActionRequired(tier),
        });
      }

      // Also check expired
      const expiredAuths = await this.getExpiredAuthorizations();
      for (const auth of expiredAuths) {
        const alreadySent = await this.hasAlertTierBeenSent(auth.id, 'expired');
        if (!alreadySent) {
          alerts.push({
            authorization_id: auth.id,
            patient_name: auth.patient_name,
            expiration_date: auth.authorization_expiration_date,
            days_until_expiry: auth.days_until_expiry,
            alert_tier: 'expired',
            priority: 'critical',
            action_required: this.getActionRequired('expired'),
          });
        }
      }

      return alerts.sort((a, b) => {
        const priorityOrder = { critical: 0, urgent: 1, high: 2, medium: 3, low: 4 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    } catch (error: any) {
      console.error('Error getting expiration alerts:', error);
      throw new Error(error.message || 'Failed to get expiration alerts');
    }
  }

  // Initiate renewal
  async initiateRenewal(
    authorizationId: string,
    options: {
      userId: string;
      notes?: string;
    }
  ): Promise<RenewalInfo> {
    try {
      const { data, error } = await supabase
        .from('authorization_requests')
        .update({
          renewal_initiated: true,
          renewal_initiated_at: new Date().toISOString(),
          renewal_status: 'preparing',
        })
        .eq('id', authorizationId)
        .select()
        .single();

      if (error) throw error;

      // Create renewal task
      const { authorizationTaskService } = await import('./authorizationTaskService');
      await authorizationTaskService.createTaskFromAuthRequest(
        authorizationId,
        'follow_up',
        {
          userId: options.userId,
          priority: 'high',
          title: `Renewal Request - ${data.patient_name}`,
          description: options.notes || `Renewal initiated for authorization expiring on ${data.authorization_expiration_date}`,
        }
      );

      return {
        authorization_id: authorizationId,
        renewal_initiated_at: data.renewal_initiated_at,
        renewal_status: data.renewal_status as RenewalInfo['renewal_status'],
      };
    } catch (error: any) {
      console.error('Error initiating renewal:', error);
      throw new Error(error.message || 'Failed to initiate renewal');
    }
  }

  // Mark expiration as handled
  async markExpirationHandled(
    authorizationId: string,
    action: 'renewal_requested' | 'new_auth_created' | 'service_cancelled',
    notes?: string
  ): Promise<void> {
    try {
      await supabase
        .from('authorization_requests')
        .update({
          expiration_handled: true,
          expiration_action: action,
          expiration_impact_notes: notes,
        })
        .eq('id', authorizationId);
    } catch (error: any) {
      console.error('Error marking expiration as handled:', error);
      throw new Error(error.message || 'Failed to mark expiration as handled');
    }
  }

  // Get expiration statistics
  async getExpirationStats(): Promise<{
    expiring_this_week: number;
    expiring_this_month: number;
    expired: number;
    renewals_pending: number;
  }> {
    try {
      const today = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(today.getDate() + 7);
      const monthFromNow = new Date();
      monthFromNow.setDate(today.getDate() + 30);

      // Expiring this week
      const { count: expiringWeek } = await supabase
        .from('authorization_requests')
        .select('*', { count: 'exact', head: true })
        .not('authorization_expiration_date', 'is', null)
        .gte('authorization_expiration_date', today.toISOString().split('T')[0])
        .lte('authorization_expiration_date', weekFromNow.toISOString().split('T')[0])
        .in('status', ['approved']);

      // Expiring this month
      const { count: expiringMonth } = await supabase
        .from('authorization_requests')
        .select('*', { count: 'exact', head: true })
        .not('authorization_expiration_date', 'is', null)
        .gte('authorization_expiration_date', today.toISOString().split('T')[0])
        .lte('authorization_expiration_date', monthFromNow.toISOString().split('T')[0])
        .in('status', ['approved']);

      // Expired
      const { count: expired } = await supabase
        .from('authorization_requests')
        .select('*', { count: 'exact', head: true })
        .not('expired_at', 'is', null)
        .eq('expiration_handled', false);

      // Renewals pending
      const { count: renewalsPending } = await supabase
        .from('authorization_requests')
        .select('*', { count: 'exact', head: true })
        .eq('renewal_initiated', true)
        .in('renewal_status', ['preparing', 'submitted']);

      return {
        expiring_this_week: expiringWeek || 0,
        expiring_this_month: expiringMonth || 0,
        expired: expired || 0,
        renewals_pending: renewalsPending || 0,
      };
    } catch (error: any) {
      console.error('Error getting expiration stats:', error);
      return {
        expiring_this_week: 0,
        expiring_this_month: 0,
        expired: 0,
        renewals_pending: 0,
      };
    }
  }
}

export const expirationManagementService = ExpirationManagementService.getInstance();

