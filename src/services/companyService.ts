import { supabase } from '@/integrations/supabase/client';

export interface Company {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  subscription_tier?: string;
  subscription_status?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  settings?: Record<string, any>;
  features?: Record<string, any>;
  is_active?: boolean;
  is_trial?: boolean;
  trial_end_date?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  // Statistics (for super admin view)
  total_users?: number;
  total_patients?: number;
  total_claims?: number;
  total_billing?: number;
  pending_amount?: number;
  paid_amount?: number;
}

export interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  is_primary: boolean;
  permissions?: Record<string, any>;
  is_active: boolean;
  invited_by?: string;
  invited_at?: string;
  joined_at?: string;
  created_at?: string;
  updated_at?: string;
  company?: Company;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export class CompanyService {
  private static instance: CompanyService;

  static getInstance(): CompanyService {
    if (!CompanyService.instance) {
      CompanyService.instance = new CompanyService();
    }
    return CompanyService.instance;
  }

  // Get all companies for the current user
  async getUserCompanies(): Promise<CompanyUser[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('User not authenticated');
        return [];
      }

      console.log('Fetching companies for user:', user.id);

      // First, try a simple query to company_users
      const { data: companyUsersData, error: companyUsersError } = await (supabase
        .from('company_users' as any)
        .select('id, company_id, user_id, role, is_primary, is_active, joined_at, created_at, updated_at')
        .eq('user_id', user.id)
        .eq('is_active', true) as any);

      if (companyUsersError) {
        console.error('Error fetching company_users:', companyUsersError);
        console.error('Error details:', JSON.stringify(companyUsersError, null, 2));
        // Return empty array to prevent crash
        return [];
      }

      if (!companyUsersData || companyUsersData.length === 0) {
        console.log('No company_users found for user');
        return [];
      }

      console.log('Found company_users:', companyUsersData.length);

      // Get company IDs
      const companyIds = companyUsersData.map((cu: any) => cu.company_id).filter(Boolean);
      
      if (companyIds.length === 0) {
        console.warn('No valid company IDs found');
        return [];
      }

      // Fetch companies separately with minimal fields
      const { data: companiesData, error: companiesError } = await (supabase
        .from('companies' as any)
        .select('id, name, slug, email, subscription_tier, subscription_status, is_active')
        .in('id', companyIds) as any);

      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
        console.error('Error details:', JSON.stringify(companiesError, null, 2));
        // Continue with company_users data even if companies fail
      }

      // Combine the data
      const result: CompanyUser[] = companyUsersData.map((cu: any) => {
        const company = companiesData?.find((c: any) => c.id === cu.company_id);
        return {
          ...cu,
          company: company || undefined,
        } as CompanyUser;
      });

      // Sort: primary first, then by joined_at
      result.sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        const aDate = a.joined_at ? new Date(a.joined_at).getTime() : 0;
        const bDate = b.joined_at ? new Date(b.joined_at).getTime() : 0;
        return aDate - bDate;
      });

      console.log('Successfully loaded companies:', result.length);
      return result;
    } catch (error: any) {
      console.error('Error fetching user companies:', error);
      console.error('Error stack:', error?.stack);
      // Return empty array instead of throwing to prevent UI crash
      return [];
    }
  }

  // Get current company (primary or first active)
  async getCurrentCompany(): Promise<Company | null> {
    try {
      const companies = await this.getUserCompanies();
      const primaryCompany = companies.find(cu => cu.is_primary);
      return primaryCompany?.company || companies[0]?.company || null;
    } catch (error) {
      console.error('Error fetching current company:', error);
      return null;
    }
  }

  // Set primary company for user
  async setPrimaryCompany(companyId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, unset all primary flags
      await (supabase
        .from('company_users' as any)
        .update({ is_primary: false })
        .eq('user_id', user.id) as any);

      // Then set the selected company as primary
      const { error } = await (supabase
        .from('company_users' as any)
        .update({ is_primary: true })
        .eq('user_id', user.id)
        .eq('company_id', companyId) as any);

      if (error) throw error;
    } catch (error) {
      console.error('Error setting primary company:', error);
      throw error;
    }
  }

  // Get company by ID
  async getCompany(companyId: string): Promise<Company> {
    try {
      const { data, error } = await (supabase
        .from('companies' as any)
        .select('*')
        .eq('id', companyId)
        .single() as any);

      if (error) throw error;
      return data as Company;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw error;
    }
  }

  // Create new company (admin only)
  async createCompany(companyData: Partial<Company>): Promise<Company> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate slug from name if not provided
      if (!companyData.slug && companyData.name) {
        companyData.slug = companyData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      const { data, error } = await (supabase
        .from('companies' as any)
        .insert([{
          ...companyData,
          created_by: user.id,
        }])
        .select()
        .single() as any);

      if (error) throw error;

      // Add creator as admin of the company
      await (supabase
        .from('company_users' as any)
        .insert({
          company_id: data.id,
          user_id: user.id,
          role: 'admin',
          is_primary: true,
          is_active: true,
        } as any));

      return data as Company;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  // Update company (admin/manager only)
  async updateCompany(companyId: string, updates: Partial<Company>): Promise<Company> {
    try {
      const { data, error } = await (supabase
        .from('companies' as any)
        .update(updates)
        .eq('id', companyId)
        .select()
        .single() as any);

      if (error) throw error;
      return data as Company;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  // Get company users
  async getCompanyUsers(companyId: string): Promise<CompanyUser[]> {
    try {
      const { data, error } = await (supabase
        .from('company_users' as any)
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true) as any);

      if (error) throw error;
      
      // Sort manually
      const sorted = (data || []).sort((a: any, b: any) => {
        const roleOrder = { admin: 1, manager: 2, user: 3, viewer: 4 };
        const aRole = roleOrder[a.role as keyof typeof roleOrder] || 5;
        const bRole = roleOrder[b.role as keyof typeof roleOrder] || 5;
        if (aRole !== bRole) return aRole - bRole;
        const aDate = a.joined_at ? new Date(a.joined_at).getTime() : 0;
        const bDate = b.joined_at ? new Date(b.joined_at).getTime() : 0;
        return aDate - bDate;
      });

      return sorted as CompanyUser[];
    } catch (error) {
      console.error('Error fetching company users:', error);
      throw error;
    }
  }

  // Add user to company
  async addUserToCompany(
    companyId: string,
    userId: string,
    role: 'admin' | 'manager' | 'user' | 'viewer' = 'user'
  ): Promise<CompanyUser> {
    try {
      const { data, error } = await (supabase
        .from('company_users' as any)
        .insert({
          company_id: companyId,
          user_id: userId,
          role,
          is_active: true,
        })
        .select()
        .single() as any);

      if (error) throw error;
      return data as CompanyUser;
    } catch (error) {
      console.error('Error adding user to company:', error);
      throw error;
    }
  }

  // Update user role in company
  async updateUserRole(
    companyId: string,
    userId: string,
    role: 'admin' | 'manager' | 'user' | 'viewer'
  ): Promise<void> {
    try {
      const { error } = await (supabase
        .from('company_users' as any)
        .update({ role })
        .eq('company_id', companyId)
        .eq('user_id', userId) as any);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Remove user from company
  async removeUserFromCompany(companyId: string, userId: string): Promise<void> {
    try {
      const { error } = await (supabase
        .from('company_users' as any)
        .update({ is_active: false })
        .eq('company_id', companyId)
        .eq('user_id', userId) as any);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing user from company:', error);
      throw error;
    }
  }

  // Check if user has permission
  async hasPermission(
    companyId: string,
    permission: string
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await (supabase
        .from('company_users' as any)
        .select('role')
        .eq('company_id', companyId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single() as any);

      if (!data) return false;

      // Admin and manager have all permissions
      if (data.role === 'admin' || data.role === 'manager') {
        return true;
      }

      // Check role permissions (simplified - can be enhanced)
      // For now, basic role check
      return true; // Implement actual permission check based on your needs
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  // Get user role in company
  async getUserRole(companyId: string): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await (supabase
        .from('company_users' as any)
        .select('role')
        .eq('company_id', companyId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single() as any);

      return data?.role || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  // ============================================================================
  // SUPER ADMIN METHODS
  // ============================================================================

  // Check if current user is super admin
  async isSuperAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await (supabase
        .from('profiles' as any)
        .select('is_super_admin')
        .eq('id', user.id)
        .single() as any);

      return data?.is_super_admin === true;
    } catch (error) {
      console.error('Error checking super admin status:', error);
      return false;
    }
  }

  // Get all companies (super admin only)
  async getAllCompanies(): Promise<Company[]> {
    try {
      const isSuper = await this.isSuperAdmin();
      if (!isSuper) {
        throw new Error('Only super admins can view all companies');
      }

      const { data, error } = await (supabase
        .from('companies' as any)
        .select('*')
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      return (data || []) as Company[];
    } catch (error) {
      console.error('Error fetching all companies:', error);
      throw error;
    }
  }

  // Get company statistics (super admin only)
  async getCompanyStatistics(companyId?: string): Promise<any> {
    try {
      const isSuper = await this.isSuperAdmin();
      if (!isSuper) {
        throw new Error('Only super admins can view statistics');
      }

      let query = supabase
        .from('super_admin_company_stats' as any)
        .select('*');

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await (query as any);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching company statistics:', error);
      throw error;
    }
  }

  // Delete company (super admin only)
  async deleteCompany(companyId: string): Promise<void> {
    try {
      const isSuper = await this.isSuperAdmin();
      if (!isSuper) {
        throw new Error('Only super admins can delete companies');
      }

      const { error } = await (supabase
        .from('companies' as any)
        .delete()
        .eq('id', companyId) as any);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  }

  // Disable/Enable company (super admin only)
  async toggleCompanyStatus(companyId: string, isActive: boolean): Promise<Company> {
    try {
      const isSuper = await this.isSuperAdmin();
      if (!isSuper) {
        throw new Error('Only super admins can change company status');
      }

      const { data, error } = await (supabase
        .from('companies' as any)
        .update({ is_active: isActive })
        .eq('id', companyId)
        .select()
        .single() as any);

      if (error) throw error;
      return data as Company;
    } catch (error) {
      console.error('Error toggling company status:', error);
      throw error;
    }
  }

  // Create user and add to company (super admin only)
  // Note: This requires an edge function for production
  // For now, we'll use a workaround that requires the user to sign up manually
  async createUserForCompany(
    companyId: string,
    userData: {
      email: string;
      password: string;
      fullName: string;
      role: 'admin' | 'manager' | 'user' | 'viewer';
    }
  ): Promise<{ user: any; companyUser: CompanyUser }> {
    try {
      const isSuper = await this.isSuperAdmin();
      if (!isSuper) {
        throw new Error('Only super admins can create users for companies');
      }

      // Use edge function to create user (requires service role)
      try {
        const { data, error } = await supabase.functions.invoke('create-company-user', {
          body: {
            companyId,
            userData,
          },
        });

        if (error) throw error;
        if (!data?.user) throw new Error('Failed to create user via edge function');

        // Get the created company user
        const companyUsers = await this.getCompanyUsers(companyId);
        const createdUser = companyUsers.find(cu => cu.user_id === data.user.id);

        if (!createdUser) {
          throw new Error('User created but not added to company');
        }

        return {
          user: data.user,
          companyUser: createdUser,
        };
      } catch (edgeError: any) {
        // Fallback: Provide manual instructions
        console.warn('Edge function not available:', edgeError);
        throw new Error(
          `Automatic user creation requires edge function setup. ` +
          `Please create the user manually in Supabase Auth Dashboard, then add them to the company. ` +
          `Error: ${edgeError.message}`
        );
      }
    } catch (error) {
      console.error('Error creating user for company:', error);
      throw error;
    }
  }

  // Get all users for a company (super admin or company admin)
  async getAllUsersForCompany(companyId: string): Promise<CompanyUser[]> {
    try {
      const isSuper = await this.isSuperAdmin();
      
      // Check if user has access (super admin or company admin)
      if (!isSuper) {
        const role = await this.getUserRole(companyId);
        if (role !== 'admin' && role !== 'manager') {
          throw new Error('Only admins can view all company users');
        }
      }

      return await this.getCompanyUsers(companyId);
    } catch (error) {
      console.error('Error fetching company users:', error);
      throw error;
    }
  }
}

export const companyService = CompanyService.getInstance();

