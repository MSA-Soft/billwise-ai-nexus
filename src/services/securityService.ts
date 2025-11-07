// Enhanced Security Service
// Multi-factor authentication, RBAC, audit logging

import { supabase } from '@/integrations/supabase/client';

// Simple TOTP implementation (in production, use a library like otplib)
class SimpleTOTP {
  static generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  }

  static generateQRCodeUrl(accountName: string, serviceName: string, secret: string): string {
    const encodedAccount = encodeURIComponent(accountName);
    const encodedService = encodeURIComponent(serviceName);
    return `otpauth://totp/${encodedService}:${encodedAccount}?secret=${secret}&issuer=${encodedService}`;
  }

  static verify(token: string, secret: string): boolean {
    // In production, use proper TOTP verification
    // For now, this is a placeholder
    return token.length === 6 && /^\d{6}$/.test(token);
  }
}

export interface MFASetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface AuditLog {
  id?: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string;
}

export class SecurityService {
  private static instance: SecurityService;

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // ============================================================================
  // MULTI-FACTOR AUTHENTICATION (MFA)
  // ============================================================================

  // Setup MFA for user
  async setupMFA(userId: string): Promise<MFASetup> {
    try {
      // Generate secret
      const secret = SimpleTOTP.generateSecret();
      const serviceName = 'BillWise AI Nexus';
      const accountName = userId; // Would use user email in production

      // Generate QR code URL
      const qrCodeUrl = SimpleTOTP.generateQRCodeUrl(accountName, serviceName, secret);

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();

      // Store MFA secret (encrypted in production)
      await supabase
        .from('user_mfa')
        .upsert({
          user_id: userId,
          secret: secret, // In production, encrypt this
          backup_codes: backupCodes,
          is_enabled: false, // Not enabled until verified
          created_at: new Date().toISOString(),
        });

      return {
        secret,
        qrCodeUrl,
        backupCodes,
      };
    } catch (error: any) {
      console.error('Error setting up MFA:', error);
      throw new Error(error.message || 'Failed to setup MFA');
    }
  }

  // Verify MFA token
  async verifyMFAToken(userId: string, token: string): Promise<boolean> {
    try {
      // Get user's MFA secret
      const { data: mfaData, error } = await supabase
        .from('user_mfa')
        .select('secret, backup_codes, is_enabled')
        .eq('user_id', userId)
        .single();

      if (error || !mfaData || !mfaData.is_enabled) {
        return false;
      }

      // Check if token is a backup code
      if (mfaData.backup_codes && mfaData.backup_codes.includes(token)) {
        // Remove used backup code
        const updatedCodes = mfaData.backup_codes.filter((code: string) => code !== token);
        await supabase
          .from('user_mfa')
          .update({ backup_codes: updatedCodes })
          .eq('user_id', userId);
        return true;
      }

      // Verify TOTP token
      const isValid = SimpleTOTP.verify(token, mfaData.secret);

      return isValid;
    } catch (error: any) {
      console.error('Error verifying MFA token:', error);
      return false;
    }
  }

  // Enable MFA (after verification)
  async enableMFA(userId: string, verificationToken: string): Promise<boolean> {
    try {
      const isValid = await this.verifyMFAToken(userId, verificationToken);
      
      if (!isValid) {
        return false;
      }

      await supabase
        .from('user_mfa')
        .update({ is_enabled: true })
        .eq('user_id', userId);

      // Log MFA enablement
      await this.logAuditEvent({
        userId,
        action: 'mfa_enabled',
        resource: 'user',
        resourceId: userId,
        severity: 'high',
      });

      return true;
    } catch (error: any) {
      console.error('Error enabling MFA:', error);
      return false;
    }
  }

  // Disable MFA
  async disableMFA(userId: string, password: string): Promise<boolean> {
    try {
      // In production, verify password first
      // For now, just disable MFA
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      await supabase
        .from('user_mfa')
        .update({ is_enabled: false })
        .eq('user_id', user.user.id);

      // Log MFA disablement
      await this.logAuditEvent({
        userId: user.user.id,
        action: 'mfa_disabled',
        resource: 'user',
        resourceId: user.user.id,
        severity: 'high',
      });

      return true;
    } catch (error: any) {
      console.error('Error disabling MFA:', error);
      return false;
    }
  }

  // Check if MFA is enabled for user
  async isMFAEnabled(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_mfa')
        .select('is_enabled')
        .eq('user_id', userId)
        .single();

      return data?.is_enabled || false;
    } catch (error) {
      return false;
    }
  }

  // Generate backup codes
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // ============================================================================
  // ROLE-BASED ACCESS CONTROL (RBAC)
  // ============================================================================

  // Get user roles
  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*, roles(*)')
        .eq('user_id', userId);

      if (error) throw error;

      return (data || []).map((ur: any) => ({
        id: ur.roles.id,
        name: ur.roles.name,
        description: ur.roles.description,
        permissions: ur.roles.permissions || [],
        isSystem: ur.roles.is_system || false,
      }));
    } catch (error: any) {
      console.error('Error getting user roles:', error);
      return [];
    }
  }

  // Check if user has permission
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const roles = await this.getUserRoles(userId);
      
      for (const role of roles) {
        if (role.permissions.includes(permission) || role.permissions.includes('*')) {
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  // Check if user has any of the permissions
  async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(userId, permission)) {
        return true;
      }
    }
    return false;
  }

  // Check if user has all permissions
  async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.hasPermission(userId, permission))) {
        return false;
      }
    }
    return true;
  }

  // Assign role to user
  async assignRole(userId: string, roleId: string, assignedBy: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleId,
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Log role assignment
      await this.logAuditEvent({
        userId: assignedBy,
        action: 'role_assigned',
        resource: 'user_role',
        resourceId: userId,
        details: { roleId },
        severity: 'medium',
      });

      return true;
    } catch (error: any) {
      console.error('Error assigning role:', error);
      return false;
    }
  }

  // Remove role from user
  async removeRole(userId: string, roleId: string, removedBy: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleId);

      if (error) throw error;

      // Log role removal
      await this.logAuditEvent({
        userId: removedBy,
        action: 'role_removed',
        resource: 'user_role',
        resourceId: userId,
        details: { roleId },
        severity: 'medium',
      });

      return true;
    } catch (error: any) {
      console.error('Error removing role:', error);
      return false;
    }
  }

  // Get all roles
  async getAllRoles(): Promise<Role[]> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) throw error;

      return (data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        permissions: r.permissions || [],
        isSystem: r.is_system || false,
      }));
    } catch (error: any) {
      console.error('Error getting roles:', error);
      return [];
    }
  }

  // ============================================================================
  // AUDIT LOGGING
  // ============================================================================

  // Log audit event
  async logAuditEvent(log: AuditLog): Promise<void> {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: log.userId,
          action: log.action,
          resource: log.resource,
          resource_id: log.resourceId,
          details: log.details,
          ip_address: log.ipAddress || this.getClientIP(),
          user_agent: log.userAgent || navigator.userAgent,
          severity: log.severity,
          timestamp: log.timestamp || new Date().toISOString(),
        });

      if (error) {
        console.error('Error logging audit event:', error);
      }
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  // Get audit logs
  async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    severity?: AuditLog['severity'];
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AuditLog[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.resource) {
        query = query.eq('resource', filters.resource);
      }
      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((log: any) => ({
        id: log.id,
        userId: log.user_id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resource_id,
        details: log.details,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        timestamp: log.timestamp,
        severity: log.severity,
      }));
    } catch (error: any) {
      console.error('Error getting audit logs:', error);
      return [];
    }
  }

  // Get client IP (mock - would use actual IP detection in production)
  private getClientIP(): string {
    // In production, would get from request headers or API
    return 'unknown';
  }

  // ============================================================================
  // SECURITY UTILITIES
  // ============================================================================

  // Check password strength
  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number; // 0-4
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('Password must be at least 8 characters');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Add uppercase letters');

    if (/[0-9]/.test(password)) score++;
    else feedback.push('Add numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score++;
    else feedback.push('Add special characters');

    return {
      isValid: score >= 4,
      score,
      feedback: feedback.length > 0 ? feedback : ['Strong password'],
    };
  }

  // Generate secure token
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      token += chars[array[i] % chars.length];
    }
    return token;
  }
}

export const securityService = SecurityService.getInstance();

