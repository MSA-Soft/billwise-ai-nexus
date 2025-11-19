import React from 'react';
import { Permission } from '@/utils/permissions';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGateProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  resource?: string;
  action?: string;
  resourceId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  permissions,
  requireAll = false,
  resource,
  action,
  resourceId,
  fallback = null,
  children,
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessResource,
    canPerformAction,
  } = usePermissions();

  // Check permission based on props
  const hasAccess = (): boolean => {
    // Single permission check
    if (permission) {
      return hasPermission(permission);
    }

    // Multiple permissions check
    if (permissions) {
      return requireAll 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
    }

    // Resource-based check
    if (resource && action) {
      return canPerformAction(resource, action, resourceId);
    }

    // Default to true if no specific checks
    return true;
  };

  return hasAccess() ? <>{children}</> : <>{fallback}</>;
};

// Higher-order component for permission-based rendering
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <PermissionGate permission={permission} fallback={fallback}>
      <Component {...props} />
    </PermissionGate>
  );
};

// Hook for conditional rendering based on permissions
export const usePermissionGate = (
  permission?: Permission,
  permissions?: Permission[],
  requireAll?: boolean,
  resource?: string,
  action?: string,
  resourceId?: string
): boolean => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canPerformAction,
  } = usePermissions();

  if (permission) {
    return hasPermission(permission);
  }

  if (permissions) {
    return requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  if (resource && action) {
    return canPerformAction(resource, action, resourceId);
  }

  return true;
};
