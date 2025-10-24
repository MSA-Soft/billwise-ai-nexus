// Role-based permissions system for BillWise AI Nexus

export enum Permission {
  // Patient permissions
  VIEW_PATIENTS = 'view_patients',
  CREATE_PATIENTS = 'create_patients',
  UPDATE_PATIENTS = 'update_patients',
  DELETE_PATIENTS = 'delete_patients',
  
  // Billing permissions
  VIEW_BILLING = 'view_billing',
  CREATE_BILLING = 'create_billing',
  UPDATE_BILLING = 'update_billing',
  DELETE_BILLING = 'delete_billing',
  
  // Collections permissions
  VIEW_COLLECTIONS = 'view_collections',
  CREATE_COLLECTIONS = 'create_collections',
  UPDATE_COLLECTIONS = 'update_collections',
  DELETE_COLLECTIONS = 'delete_collections',
  
  // Authorization permissions
  VIEW_AUTHORIZATIONS = 'view_authorizations',
  CREATE_AUTHORIZATIONS = 'create_authorizations',
  UPDATE_AUTHORIZATIONS = 'update_authorizations',
  DELETE_AUTHORIZATIONS = 'delete_authorizations',
  
  // Payment permissions
  VIEW_PAYMENTS = 'view_payments',
  CREATE_PAYMENTS = 'create_payments',
  UPDATE_PAYMENTS = 'update_payments',
  DELETE_PAYMENTS = 'delete_payments',
  
  // Analytics permissions
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_DATA = 'export_data',
  
  // System permissions
  MANAGE_USERS = 'manage_users',
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_BACKUPS = 'manage_backups',
}

export enum Role {
  ADMIN = 'admin',
  BILLING_MANAGER = 'billing_manager',
  BILLING_STAFF = 'billing_staff',
  COLLECTIONS_AGENT = 'collections_agent',
  PATIENT = 'patient',
}

// Role-permission mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // All permissions
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENTS,
    Permission.UPDATE_PATIENTS,
    Permission.DELETE_PATIENTS,
    Permission.VIEW_BILLING,
    Permission.CREATE_BILLING,
    Permission.UPDATE_BILLING,
    Permission.DELETE_BILLING,
    Permission.VIEW_COLLECTIONS,
    Permission.CREATE_COLLECTIONS,
    Permission.UPDATE_COLLECTIONS,
    Permission.DELETE_COLLECTIONS,
    Permission.VIEW_AUTHORIZATIONS,
    Permission.CREATE_AUTHORIZATIONS,
    Permission.UPDATE_AUTHORIZATIONS,
    Permission.DELETE_AUTHORIZATIONS,
    Permission.VIEW_PAYMENTS,
    Permission.CREATE_PAYMENTS,
    Permission.UPDATE_PAYMENTS,
    Permission.DELETE_PAYMENTS,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
    Permission.MANAGE_USERS,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.MANAGE_BACKUPS,
  ],
  
  [Role.BILLING_MANAGER]: [
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENTS,
    Permission.UPDATE_PATIENTS,
    Permission.VIEW_BILLING,
    Permission.CREATE_BILLING,
    Permission.UPDATE_BILLING,
    Permission.VIEW_COLLECTIONS,
    Permission.CREATE_COLLECTIONS,
    Permission.UPDATE_COLLECTIONS,
    Permission.VIEW_AUTHORIZATIONS,
    Permission.CREATE_AUTHORIZATIONS,
    Permission.UPDATE_AUTHORIZATIONS,
    Permission.VIEW_PAYMENTS,
    Permission.CREATE_PAYMENTS,
    Permission.UPDATE_PAYMENTS,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
  ],
  
  [Role.BILLING_STAFF]: [
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENTS,
    Permission.UPDATE_PATIENTS,
    Permission.VIEW_BILLING,
    Permission.CREATE_BILLING,
    Permission.UPDATE_BILLING,
    Permission.VIEW_COLLECTIONS,
    Permission.CREATE_COLLECTIONS,
    Permission.UPDATE_COLLECTIONS,
    Permission.VIEW_AUTHORIZATIONS,
    Permission.CREATE_AUTHORIZATIONS,
    Permission.VIEW_PAYMENTS,
    Permission.CREATE_PAYMENTS,
    Permission.VIEW_ANALYTICS,
  ],
  
  [Role.COLLECTIONS_AGENT]: [
    Permission.VIEW_PATIENTS,
    Permission.VIEW_COLLECTIONS,
    Permission.CREATE_COLLECTIONS,
    Permission.UPDATE_COLLECTIONS,
    Permission.VIEW_PAYMENTS,
    Permission.CREATE_PAYMENTS,
    Permission.UPDATE_PAYMENTS,
  ],
  
  [Role.PATIENT]: [
    Permission.VIEW_PATIENTS, // Only their own record
    Permission.VIEW_BILLING, // Only their own billing
    Permission.VIEW_PAYMENTS, // Only their own payments
  ],
};

export interface UserPermissions {
  userId: string;
  role: Role;
  permissions: Permission[];
  customPermissions?: Permission[];
  restrictions?: string[];
}

class PermissionManager {
  private userPermissions: Map<string, UserPermissions> = new Map();

  // Check if user has specific permission
  hasPermission(userId: string, permission: Permission): boolean {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return false;

    return userPerms.permissions.includes(permission);
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(userId: string, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userId, permission));
  }

  // Check if user has all of the specified permissions
  hasAllPermissions(userId: string, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userId, permission));
  }

  // Check if user can access specific resource
  canAccessResource(userId: string, resource: string, action: string): boolean {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return false;

    // Check restrictions
    if (userPerms.restrictions?.includes(resource)) return false;

    // Map action to permission
    const permission = this.getPermissionForAction(resource, action);
    return this.hasPermission(userId, permission);
  }

  // Get user's role
  getUserRole(userId: string): Role | null {
    const userPerms = this.userPermissions.get(userId);
    return userPerms?.role || null;
  }

  // Get user's permissions
  getUserPermissions(userId: string): Permission[] {
    const userPerms = this.userPermissions.get(userId);
    return userPerms?.permissions || [];
  }

  // Set user permissions
  setUserPermissions(userId: string, role: Role, customPermissions?: Permission[], restrictions?: string[]): void {
    const permissions = [...ROLE_PERMISSIONS[role], ...(customPermissions || [])];
    
    this.userPermissions.set(userId, {
      userId,
      role,
      permissions,
      customPermissions,
      restrictions,
    });
  }

  // Remove user permissions
  removeUserPermissions(userId: string): void {
    this.userPermissions.delete(userId);
  }

  // Get permission for action
  private getPermissionForAction(resource: string, action: string): Permission {
    const resourceMap: Record<string, Record<string, Permission>> = {
      patients: {
        view: Permission.VIEW_PATIENTS,
        create: Permission.CREATE_PATIENTS,
        update: Permission.UPDATE_PATIENTS,
        delete: Permission.DELETE_PATIENTS,
      },
      billing: {
        view: Permission.VIEW_BILLING,
        create: Permission.CREATE_BILLING,
        update: Permission.UPDATE_BILLING,
        delete: Permission.DELETE_BILLING,
      },
      collections: {
        view: Permission.VIEW_COLLECTIONS,
        create: Permission.CREATE_COLLECTIONS,
        update: Permission.UPDATE_COLLECTIONS,
        delete: Permission.DELETE_COLLECTIONS,
      },
      authorizations: {
        view: Permission.VIEW_AUTHORIZATIONS,
        create: Permission.CREATE_AUTHORIZATIONS,
        update: Permission.UPDATE_AUTHORIZATIONS,
        delete: Permission.DELETE_AUTHORIZATIONS,
      },
      payments: {
        view: Permission.VIEW_PAYMENTS,
        create: Permission.CREATE_PAYMENTS,
        update: Permission.UPDATE_PAYMENTS,
        delete: Permission.DELETE_PAYMENTS,
      },
    };

    return resourceMap[resource]?.[action] || Permission.VIEW_PATIENTS;
  }

  // Check if user can perform action on specific record
  canPerformAction(userId: string, resource: string, action: string, resourceId?: string): boolean {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return false;

    // Check basic permission
    if (!this.canAccessResource(userId, resource, action)) return false;

    // Check resource-specific restrictions
    if (userPerms.role === Role.PATIENT) {
      // Patients can only access their own records
      return this.canAccessOwnResource(userId, resource, resourceId);
    }

    return true;
  }

  // Check if user can access their own resource
  private canAccessOwnResource(userId: string, resource: string, resourceId?: string): boolean {
    // This would typically check if the resource belongs to the user
    // For now, we'll assume patients can access their own records
    return true;
  }

  // Get accessible resources for user
  getAccessibleResources(userId: string): string[] {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return [];

    const resources: string[] = [];
    
    if (this.hasPermission(userId, Permission.VIEW_PATIENTS)) {
      resources.push('patients');
    }
    if (this.hasPermission(userId, Permission.VIEW_BILLING)) {
      resources.push('billing');
    }
    if (this.hasPermission(userId, Permission.VIEW_COLLECTIONS)) {
      resources.push('collections');
    }
    if (this.hasPermission(userId, Permission.VIEW_AUTHORIZATIONS)) {
      resources.push('authorizations');
    }
    if (this.hasPermission(userId, Permission.VIEW_PAYMENTS)) {
      resources.push('payments');
    }

    return resources;
  }

  // Get user's role hierarchy level
  getRoleHierarchyLevel(role: Role): number {
    const hierarchy: Record<Role, number> = {
      [Role.ADMIN]: 5,
      [Role.BILLING_MANAGER]: 4,
      [Role.BILLING_STAFF]: 3,
      [Role.COLLECTIONS_AGENT]: 2,
      [Role.PATIENT]: 1,
    };

    return hierarchy[role] || 0;
  }

  // Check if user can manage another user
  canManageUser(managerId: string, targetUserId: string): boolean {
    const managerPerms = this.userPermissions.get(managerId);
    const targetPerms = this.userPermissions.get(targetUserId);
    
    if (!managerPerms || !targetPerms) return false;

    // Must have manage users permission
    if (!this.hasPermission(managerId, Permission.MANAGE_USERS)) return false;

    // Must have higher role hierarchy
    const managerLevel = this.getRoleHierarchyLevel(managerPerms.role);
    const targetLevel = this.getRoleHierarchyLevel(targetPerms.role);
    
    return managerLevel > targetLevel;
  }
}

// Create singleton instance
export const permissionManager = new PermissionManager();

// Convenience functions
export const permissions = {
  hasPermission: (userId: string, permission: Permission) => 
    permissionManager.hasPermission(userId, permission),
  
  hasAnyPermission: (userId: string, permissions: Permission[]) => 
    permissionManager.hasAnyPermission(userId, permissions),
  
  hasAllPermissions: (userId: string, permissions: Permission[]) => 
    permissionManager.hasAllPermissions(userId, permissions),
  
  canAccessResource: (userId: string, resource: string, action: string) => 
    permissionManager.canAccessResource(userId, resource, action),
  
  canPerformAction: (userId: string, resource: string, action: string, resourceId?: string) => 
    permissionManager.canPerformAction(userId, resource, action, resourceId),
  
  getUserRole: (userId: string) => 
    permissionManager.getUserRole(userId),
  
  getUserPermissions: (userId: string) => 
    permissionManager.getUserPermissions(userId),
  
  setUserPermissions: (userId: string, role: Role, customPermissions?: Permission[], restrictions?: string[]) => 
    permissionManager.setUserPermissions(userId, role, customPermissions, restrictions),
  
  removeUserPermissions: (userId: string) => 
    permissionManager.removeUserPermissions(userId),
  
  getAccessibleResources: (userId: string) => 
    permissionManager.getAccessibleResources(userId),
  
  canManageUser: (managerId: string, targetUserId: string) => 
    permissionManager.canManageUser(managerId, targetUserId),
};
