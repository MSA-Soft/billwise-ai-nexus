// Authorization Audit Service
// Complete audit logging for all authorization actions
// Tracks who did what, when, and why (HIPAA compliant)

import { supabase } from '@/integrations/supabase/client';

export interface AuthorizationAuditLog {
  id?: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  authorization_request_id: string;
  action: AuthorizationAction;
  action_category: ActionCategory;
  old_status?: string;
  new_status?: string;
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

export type AuthorizationAction = 
  | 'create'
  | 'update'
  | 'submit'
  | 'approve'
  | 'deny'
  | 'use_visit'
  | 'renew'
  | 'appeal'
  | 'cancel'
  | 'delete'
  | 'view'
  | 'export';

export type ActionCategory = 
  | 'creation'
  | 'status_change'
  | 'visit_usage'
  | 'renewal'
  | 'appeal'
  | 'modification'
  | 'access'
  | 'export';

export interface AuditLogQuery {
  authorization_request_id?: string;
  user_id?: string;
  action?: AuthorizationAction;
  action_category?: ActionCategory;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export class AuthorizationAuditService {
  private static instance: AuthorizationAuditService;

  static getInstance(): AuthorizationAuditService {
    if (!AuthorizationAuditService.instance) {
      AuthorizationAuditService.instance = new AuthorizationAuditService();
    }
    return AuthorizationAuditService.instance;
  }

  // Get current user info for audit logs
  private async getCurrentUserInfo(): Promise<{ id: string; email?: string; name?: string }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        throw new Error('User not authenticated');
      }

      // Try to get user profile for name from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const userName = profile?.full_name 
        || user.email?.split('@')[0] || 'Unknown';

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
    // In browser environment, we can't get IP directly
    // This would need to be handled server-side or via a proxy
    return {
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };
  }

  // Determine severity based on action
  private getSeverity(action: AuthorizationAction, oldStatus?: string, newStatus?: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (action) {
      case 'delete':
      case 'cancel':
        return 'high';
      case 'deny':
      case 'appeal':
        return 'medium';
      case 'approve':
        return 'medium';
      case 'use_visit':
        return 'low';
      case 'create':
      case 'update':
      case 'submit':
        return 'low';
      case 'view':
      case 'export':
        return 'low';
      default:
        return 'medium';
    }
  }

  // Determine action category
  private getActionCategory(action: AuthorizationAction, oldStatus?: string, newStatus?: string): ActionCategory {
    switch (action) {
      case 'create':
        return 'creation';
      case 'approve':
      case 'deny':
      case 'submit':
        if (oldStatus && newStatus && oldStatus !== newStatus) {
          return 'status_change';
        }
        return oldStatus ? 'status_change' : 'creation';
      case 'use_visit':
        return 'visit_usage';
      case 'renew':
        return 'renewal';
      case 'appeal':
        return 'appeal';
      case 'update':
        return 'modification';
      case 'view':
        return 'access';
      case 'export':
        return 'export';
      default:
        return 'modification';
    }
  }

  // Log an authorization action
  async logAction(
    authorizationId: string,
    action: AuthorizationAction,
    options: {
      oldStatus?: string;
      newStatus?: string;
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
      const severity = this.getSeverity(action, options.oldStatus, options.newStatus);
      const actionCategory = this.getActionCategory(action, options.oldStatus, options.newStatus);

      const auditLog: Omit<AuthorizationAuditLog, 'id' | 'created_at'> = {
        user_id: userInfo.id,
        user_email: userInfo.email,
        user_name: userInfo.name,
        authorization_request_id: authorizationId,
        action,
        action_category: actionCategory,
        old_status: options.oldStatus,
        new_status: options.newStatus,
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
        .from('authorization_audit_logs' as any)
        .insert(auditLog as any);

      if (error) {
        console.error('Error logging authorization action:', error);
        // Don't throw - audit logging should not break main operations
      }
    } catch (error: any) {
      console.error('Error in authorization audit logging:', error);
      // Don't throw - audit logging should not break main operations
    }
  }

  // Convenience methods for common actions
  async logCreate(authorizationId: string, details?: Record<string, any>, notes?: string): Promise<void> {
    await this.logAction(authorizationId, 'create', {
      newStatus: 'draft',
      details,
      notes,
    });
  }

  async logUpdate(authorizationId: string, oldValues: Record<string, any>, newValues: Record<string, any>, notes?: string): Promise<void> {
    await this.logAction(authorizationId, 'update', {
      oldValues,
      newValues,
      notes,
    });
  }

  async logStatusChange(
    authorizationId: string,
    oldStatus: string,
    newStatus: string,
    reason?: string,
    notes?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logAction(authorizationId, 
      newStatus === 'approved' ? 'approve' :
      newStatus === 'denied' ? 'deny' :
      newStatus === 'pending' ? 'submit' :
      'update',
      {
        oldStatus,
        newStatus,
        reason,
        notes,
        details,
      }
    );
  }

  async logSubmit(authorizationId: string, fromStatus: string, notes?: string): Promise<void> {
    await this.logAction(authorizationId, 'submit', {
      oldStatus: fromStatus,
      newStatus: 'pending',
      notes,
      reason: 'Authorization submitted to payer',
    });
  }

  async logUseVisit(authorizationId: string, visitDetails: Record<string, any>, notes?: string): Promise<void> {
    await this.logAction(authorizationId, 'use_visit', {
      details: visitDetails,
      notes,
      reason: 'Visit recorded against authorization',
    });
  }

  async logRenewal(authorizationId: string, renewalDetails: Record<string, any>, notes?: string): Promise<void> {
    await this.logAction(authorizationId, 'renew', {
      details: renewalDetails,
      notes,
      reason: 'Renewal initiated for expiring authorization',
    });
  }

  async logAppeal(authorizationId: string, appealDetails: Record<string, any>, notes?: string): Promise<void> {
    await this.logAction(authorizationId, 'appeal', {
      details: appealDetails,
      notes,
      reason: 'Appeal submitted for denied authorization',
    });
  }

  // Query audit logs
  async getAuditLogs(query: AuditLogQuery): Promise<AuthorizationAuditLog[]> {
    try {
      let supabaseQuery = supabase
        .from('authorization_audit_logs' as any)
        .select('*')
        .order('created_at', { ascending: false }) as any;

      if (query.authorization_request_id) {
        supabaseQuery = supabaseQuery.eq('authorization_request_id', query.authorization_request_id);
      }

      if (query.user_id) {
        supabaseQuery = supabaseQuery.eq('user_id', query.user_id);
      }

      if (query.action) {
        supabaseQuery = supabaseQuery.eq('action', query.action);
      }

      if (query.action_category) {
        supabaseQuery = supabaseQuery.eq('action_category', query.action_category);
      }

      if (query.start_date) {
        supabaseQuery = supabaseQuery.gte('created_at', query.start_date);
      }

      if (query.end_date) {
        supabaseQuery = supabaseQuery.lte('created_at', query.end_date);
      }

      if (query.limit) {
        supabaseQuery = supabaseQuery.limit(query.limit);
      }

      if (query.offset) {
        supabaseQuery = supabaseQuery.range(query.offset, query.offset + (query.limit || 100) - 1);
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;

      return (data || []) as AuthorizationAuditLog[];
    } catch (error: any) {
      console.error('Error querying audit logs:', error);
      throw new Error(error.message || 'Failed to query audit logs');
    }
  }

  // Get audit history for a specific authorization
  async getAuthorizationHistory(authorizationId: string): Promise<AuthorizationAuditLog[]> {
    return this.getAuditLogs({
      authorization_request_id: authorizationId,
      limit: 100,
    });
  }

  // Get user activity
  async getUserActivity(userId: string, limit: number = 100): Promise<AuthorizationAuditLog[]> {
    return this.getAuditLogs({
      user_id: userId,
      limit,
    });
  }
}

// Export singleton instance
export const authorizationAuditService = AuthorizationAuditService.getInstance();

