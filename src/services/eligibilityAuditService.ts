// Eligibility Verification Audit Service
// Complete audit logging for all eligibility verification actions

import { supabase } from '@/integrations/supabase/client';

export interface EligibilityAuditLog {
  id?: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  eligibility_verification_id: string;
  action: EligibilityAction;
  action_category: ActionCategory;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  notes?: string;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  created_at?: string;
}

export type EligibilityAction = 
  | 'create'
  | 'update'
  | 'verify'
  | 'refresh'
  | 'duplicate'
  | 'export'
  | 'delete'
  | 'view';

export type ActionCategory = 
  | 'creation'
  | 'verification'
  | 'modification'
  | 'access'
  | 'export';

export class EligibilityAuditService {
  private static instance: EligibilityAuditService;

  static getInstance(): EligibilityAuditService {
    if (!EligibilityAuditService.instance) {
      EligibilityAuditService.instance = new EligibilityAuditService();
    }
    return EligibilityAuditService.instance;
  }

  // Get current user info for audit logs
  private async getCurrentUserInfo(): Promise<{ id: string; email?: string; name?: string }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        throw new Error('User not authenticated');
      }

      // Try to get user profile for name (if table exists)
      let userName = user.email?.split('@')[0] || 'Unknown';
      try {
        const { data: profile } = await supabase
          .from('user_profiles' as any)
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (profile) {
          const p = profile as any;
          userName = `${p.first_name || ''} ${p.last_name || ''}`.trim() || userName;
        }
      } catch {
        // User profiles table may not exist, use email
      }

      return {
        id: user.id,
        email: user.email,
        name: userName || user.email || 'Unknown',
      };
    } catch (error: any) {
      console.error('Error getting user info:', error);
      return {
        id: 'unknown',
        email: 'unknown',
        name: 'Unknown User',
      };
    }
  }

  // Get client IP and user agent (if available)
  private getClientInfo(): { ip_address?: string; user_agent?: string } {
    return {
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };
  }

  // Determine severity based on action
  private getSeverity(action: EligibilityAction): 'low' | 'medium' | 'high' | 'critical' {
    switch (action) {
      case 'delete':
        return 'high';
      case 'verify':
      case 'create':
        return 'medium';
      case 'update':
      case 'refresh':
        return 'low';
      case 'view':
      case 'export':
        return 'low';
      default:
        return 'low';
    }
  }

  // Determine action category
  private getActionCategory(action: EligibilityAction): ActionCategory {
    switch (action) {
      case 'create':
        return 'creation';
      case 'verify':
      case 'refresh':
        return 'verification';
      case 'update':
        return 'modification';
      case 'view':
      case 'export':
        return 'access';
      default:
        return 'modification';
    }
  }

  // Log an eligibility verification action
  async logAction(
    verificationId: string,
    action: EligibilityAction,
    options: {
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      notes?: string;
      reason?: string;
      details?: Record<string, any>;
      userId?: string; // Optional override
    } = {}
  ): Promise<void> {
    try {
      const userInfo = options.userId 
        ? { id: options.userId, email: undefined, name: undefined }
        : await this.getCurrentUserInfo();
      
      const clientInfo = this.getClientInfo();
      const severity = this.getSeverity(action);
      const actionCategory = this.getActionCategory(action);

      const auditLog: Omit<EligibilityAuditLog, 'id' | 'created_at'> = {
        user_id: userInfo.id,
        user_email: userInfo.email,
        user_name: userInfo.name,
        eligibility_verification_id: verificationId,
        action,
        action_category: actionCategory,
        old_values: options.oldValues || null,
        new_values: options.newValues || null,
        notes: options.notes,
        reason: options.reason,
        ip_address: clientInfo.ip_address,
        user_agent: clientInfo.user_agent,
        details: options.details || {},
        severity,
      };

      const { error } = await supabase
        .from('eligibility_audit_logs' as any)
        .insert(auditLog);

      if (error) {
        console.error('Error logging eligibility action:', error);
        // Don't throw - audit logging should not break main operations
      }
    } catch (error: any) {
      console.error('Error in eligibility audit logging:', error);
      // Don't throw - audit logging should not break main operations
    }
  }

  // Convenience methods for common actions
  async logCreate(verificationId: string, details?: Record<string, any>, notes?: string): Promise<void> {
    await this.logAction(verificationId, 'create', {
      newValues: details,
      notes,
      reason: 'Eligibility verification created',
    });
  }

  async logVerify(verificationId: string, verificationDetails: Record<string, any>, notes?: string): Promise<void> {
    await this.logAction(verificationId, 'verify', {
      newValues: verificationDetails,
      notes,
      reason: 'Eligibility verification performed',
    });
  }

  async logUpdate(verificationId: string, oldValues: Record<string, any>, newValues: Record<string, any>, notes?: string): Promise<void> {
    await this.logAction(verificationId, 'update', {
      oldValues,
      newValues,
      notes,
      reason: 'Eligibility verification updated',
    });
  }

  async logRefresh(verificationId: string, details?: Record<string, any>, notes?: string): Promise<void> {
    await this.logAction(verificationId, 'refresh', {
      details,
      notes,
      reason: 'Eligibility verification refreshed',
    });
  }

  // Get audit history for a specific verification
  async getVerificationHistory(verificationId: string): Promise<EligibilityAuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('eligibility_audit_logs' as any)
        .select('*')
        .eq('eligibility_verification_id', verificationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return ((data || []) as any) as EligibilityAuditLog[];
    } catch (error: any) {
      console.error('Error querying audit logs:', error);
      return [];
    }
  }
}

// Export singleton instance
export const eligibilityAuditService = EligibilityAuditService.getInstance();

