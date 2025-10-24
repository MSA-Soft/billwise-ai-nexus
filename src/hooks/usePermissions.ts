import { useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { permissions, Permission, Role } from '@/utils/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  // Check if user has specific permission
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user?.id) return false;
    return permissions.hasPermission(user.id, permission);
  }, [user?.id]);

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback((permissionList: Permission[]): boolean => {
    if (!user?.id) return false;
    return permissions.hasAnyPermission(user.id, permissionList);
  }, [user?.id]);

  // Check if user has all of the specified permissions
  const hasAllPermissions = useCallback((permissionList: Permission[]): boolean => {
    if (!user?.id) return false;
    return permissions.hasAllPermissions(user.id, permissionList);
  }, [user?.id]);

  // Check if user can access specific resource
  const canAccessResource = useCallback((resource: string, action: string): boolean => {
    if (!user?.id) return false;
    return permissions.canAccessResource(user.id, resource, action);
  }, [user?.id]);

  // Check if user can perform action on specific record
  const canPerformAction = useCallback((resource: string, action: string, resourceId?: string): boolean => {
    if (!user?.id) return false;
    return permissions.canPerformAction(user.id, resource, action, resourceId);
  }, [user?.id]);

  // Get user's role
  const userRole = useMemo(() => {
    if (!user?.id) return null;
    return permissions.getUserRole(user.id);
  }, [user?.id]);

  // Get user's permissions
  const userPermissions = useMemo(() => {
    if (!user?.id) return [];
    return permissions.getUserPermissions(user.id);
  }, [user?.id]);

  // Get accessible resources
  const accessibleResources = useMemo(() => {
    if (!user?.id) return [];
    return permissions.getAccessibleResources(user.id);
  }, [user?.id]);

  // Check if user can manage another user
  const canManageUser = useCallback((targetUserId: string): boolean => {
    if (!user?.id) return false;
    return permissions.canManageUser(user.id, targetUserId);
  }, [user?.id]);

  // Role-based checks
  const isAdmin = useMemo(() => userRole === Role.ADMIN, [userRole]);
  const isBillingManager = useMemo(() => userRole === Role.BILLING_MANAGER, [userRole]);
  const isBillingStaff = useMemo(() => userRole === Role.BILLING_STAFF, [userRole]);
  const isCollectionsAgent = useMemo(() => userRole === Role.COLLECTIONS_AGENT, [userRole]);
  const isPatient = useMemo(() => userRole === Role.PATIENT, [userRole]);

  // Permission-based checks
  const canViewPatients = useMemo(() => hasPermission(Permission.VIEW_PATIENTS), [hasPermission]);
  const canCreatePatients = useMemo(() => hasPermission(Permission.CREATE_PATIENTS), [hasPermission]);
  const canUpdatePatients = useMemo(() => hasPermission(Permission.UPDATE_PATIENTS), [hasPermission]);
  const canDeletePatients = useMemo(() => hasPermission(Permission.DELETE_PATIENTS), [hasPermission]);

  const canViewBilling = useMemo(() => hasPermission(Permission.VIEW_BILLING), [hasPermission]);
  const canCreateBilling = useMemo(() => hasPermission(Permission.CREATE_BILLING), [hasPermission]);
  const canUpdateBilling = useMemo(() => hasPermission(Permission.UPDATE_BILLING), [hasPermission]);
  const canDeleteBilling = useMemo(() => hasPermission(Permission.DELETE_BILLING), [hasPermission]);

  const canViewCollections = useMemo(() => hasPermission(Permission.VIEW_COLLECTIONS), [hasPermission]);
  const canCreateCollections = useMemo(() => hasPermission(Permission.CREATE_COLLECTIONS), [hasPermission]);
  const canUpdateCollections = useMemo(() => hasPermission(Permission.UPDATE_COLLECTIONS), [hasPermission]);
  const canDeleteCollections = useMemo(() => hasPermission(Permission.DELETE_COLLECTIONS), [hasPermission]);

  const canViewAuthorizations = useMemo(() => hasPermission(Permission.VIEW_AUTHORIZATIONS), [hasPermission]);
  const canCreateAuthorizations = useMemo(() => hasPermission(Permission.CREATE_AUTHORIZATIONS), [hasPermission]);
  const canUpdateAuthorizations = useMemo(() => hasPermission(Permission.UPDATE_AUTHORIZATIONS), [hasPermission]);
  const canDeleteAuthorizations = useMemo(() => hasPermission(Permission.DELETE_AUTHORIZATIONS), [hasPermission]);

  const canViewPayments = useMemo(() => hasPermission(Permission.VIEW_PAYMENTS), [hasPermission]);
  const canCreatePayments = useMemo(() => hasPermission(Permission.CREATE_PAYMENTS), [hasPermission]);
  const canUpdatePayments = useMemo(() => hasPermission(Permission.UPDATE_PAYMENTS), [hasPermission]);
  const canDeletePayments = useMemo(() => hasPermission(Permission.DELETE_PAYMENTS), [hasPermission]);

  const canViewAnalytics = useMemo(() => hasPermission(Permission.VIEW_ANALYTICS), [hasPermission]);
  const canExportData = useMemo(() => hasPermission(Permission.EXPORT_DATA), [hasPermission]);
  const canManageUsers = useMemo(() => hasPermission(Permission.MANAGE_USERS), [hasPermission]);
  const canManageSettings = useMemo(() => hasPermission(Permission.MANAGE_SETTINGS), [hasPermission]);
  const canViewAuditLogs = useMemo(() => hasPermission(Permission.VIEW_AUDIT_LOGS), [hasPermission]);
  const canManageBackups = useMemo(() => hasPermission(Permission.MANAGE_BACKUPS), [hasPermission]);

  return {
    // Basic permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessResource,
    canPerformAction,
    
    // User info
    userRole,
    userPermissions,
    accessibleResources,
    canManageUser,
    
    // Role checks
    isAdmin,
    isBillingManager,
    isBillingStaff,
    isCollectionsAgent,
    isPatient,
    
    // Patient permissions
    canViewPatients,
    canCreatePatients,
    canUpdatePatients,
    canDeletePatients,
    
    // Billing permissions
    canViewBilling,
    canCreateBilling,
    canUpdateBilling,
    canDeleteBilling,
    
    // Collections permissions
    canViewCollections,
    canCreateCollections,
    canUpdateCollections,
    canDeleteCollections,
    
    // Authorization permissions
    canViewAuthorizations,
    canCreateAuthorizations,
    canUpdateAuthorizations,
    canDeleteAuthorizations,
    
    // Payment permissions
    canViewPayments,
    canCreatePayments,
    canUpdatePayments,
    canDeletePayments,
    
    // System permissions
    canViewAnalytics,
    canExportData,
    canManageUsers,
    canManageSettings,
    canViewAuditLogs,
    canManageBackups,
  };
};
