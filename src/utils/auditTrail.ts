// Audit trail utilities for HIPAA compliance

import { supabase } from '@/integrations/supabase/client';
import { encryptAuditLog } from './encryption';
import { logger } from './logger';

export interface AuditEvent {
  id?: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

export interface AuditQuery {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

class AuditTrail {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = import.meta.env.VITE_AUDIT_TRAIL_ENABLED === 'true';
  }

  // Log an audit event
  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // TODO: Create audit_logs table before using this feature
      logger.info('Audit event (table not created)', { 
        action: event.action, 
        resource: event.resource,
        userId: event.userId 
      });
    } catch (error) {
      logger.error('Audit logging failed', { error, event });
      // Don't throw error to avoid breaking the main operation
    }
  }

  // Query audit events
  async queryEvents(query: AuditQuery): Promise<AuditEvent[]> {
    try {
      // TODO: Create audit_logs table before using this feature
      logger.warn('Audit query attempted (table not created)');
      return [];
    } catch (error) {
      logger.error('Audit query failed', { error, query });
      throw error;
    }
  }

  // Get audit events for a specific resource
  async getResourceHistory(resource: string, resourceId: string): Promise<AuditEvent[]> {
    return this.queryEvents({ resource });
  }

  // Get user activity
  async getUserActivity(userId: string, limit: number = 100): Promise<AuditEvent[]> {
    return this.queryEvents({ userId, limit });
  }

  // Get failed login attempts
  async getFailedLogins(startDate?: string, endDate?: string): Promise<AuditEvent[]> {
    return this.queryEvents({
      action: 'login',
      startDate,
      endDate,
    });
  }

  // Get data access events
  async getDataAccessEvents(resource: string, startDate?: string, endDate?: string): Promise<AuditEvent[]> {
    return this.queryEvents({
      action: 'access',
      resource,
      startDate,
      endDate,
    });
  }

  // Get data modification events
  async getDataModificationEvents(resource: string, startDate?: string, endDate?: string): Promise<AuditEvent[]> {
    return this.queryEvents({
      action: 'modify',
      resource,
      startDate,
      endDate,
    });
  }
}

// Create singleton instance
export const auditTrail = new AuditTrail();

// Convenience functions for common audit events
export const audit = {
  // Authentication events
  login: (userId: string, success: boolean, details?: Record<string, any>) => {
    return auditTrail.logEvent({
      userId,
      action: 'login',
      resource: 'auth',
      resourceId: userId,
      details: { ...details, success },
      success,
    });
  },

  logout: (userId: string, details?: Record<string, any>) => {
    return auditTrail.logEvent({
      userId,
      action: 'logout',
      resource: 'auth',
      resourceId: userId,
      details,
      success: true,
    });
  },

  // Data access events
  viewPatient: (userId: string, patientId: string, details?: Record<string, any>) => {
    return auditTrail.logEvent({
      userId,
      action: 'view',
      resource: 'patient',
      resourceId: patientId,
      details,
      success: true,
    });
  },

  viewBillingStatement: (userId: string, statementId: string, details?: Record<string, any>) => {
    return auditTrail.logEvent({
      userId,
      action: 'view',
      resource: 'billing_statement',
      resourceId: statementId,
      details,
      success: true,
    });
  },

  // Data modification events
  createPatient: (userId: string, patientId: string, details?: Record<string, any>) => {
    return auditTrail.logEvent({
      userId,
      action: 'create',
      resource: 'patient',
      resourceId: patientId,
      details,
      success: true,
    });
  },

  updatePatient: (userId: string, patientId: string, details?: Record<string, any>) => {
    return auditTrail.logEvent({
      userId,
      action: 'update',
      resource: 'patient',
      resourceId: patientId,
      details,
      success: true,
    });
  },

  deletePatient: (userId: string, patientId: string, details?: Record<string, any>) => {
    return auditTrail.logEvent({
      userId,
      action: 'delete',
      resource: 'patient',
      resourceId: patientId,
      details,
      success: true,
    });
  },

  // System events
  systemError: (userId: string, error: Error, details?: Record<string, any>) => {
    return auditTrail.logEvent({
      userId,
      action: 'error',
      resource: 'system',
      resourceId: 'system',
      details: { ...details, error: error.message, stack: error.stack },
      success: false,
      errorMessage: error.message,
    });
  },

  // Export events
  exportData: (userId: string, resource: string, details?: Record<string, any>) => {
    return auditTrail.logEvent({
      userId,
      action: 'export',
      resource,
      resourceId: resource,
      details,
      success: true,
    });
  },
};
