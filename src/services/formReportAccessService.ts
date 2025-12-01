import { supabase } from '@/integrations/supabase/client';

export interface SystemFormReport {
  id: string;
  name: string;
  type: 'form' | 'report';
  category: string;
  description?: string;
  route_path: string;
  icon?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyFormReportAccess {
  id: string;
  company_id: string;
  form_report_id: string;
  is_enabled: boolean;
  permissions?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  form_report?: SystemFormReport;
  company?: {
    id: string;
    name: string;
  };
}

export interface UserFormReportAccess {
  id: string;
  user_id: string;
  company_id: string;
  form_report_id: string;
  is_enabled: boolean;
  permissions?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  form_report?: SystemFormReport;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
  company?: {
    id: string;
    name: string;
  };
}

export class FormReportAccessService {
  private static instance: FormReportAccessService;

  static getInstance(): FormReportAccessService {
    if (!FormReportAccessService.instance) {
      FormReportAccessService.instance = new FormReportAccessService();
    }
    return FormReportAccessService.instance;
  }

  // Get all system forms and reports
  async getAllFormsReports(): Promise<SystemFormReport[]> {
    try {
      const { data, error } = await (supabase
        .from('system_forms_reports' as any)
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true }) as any);

      if (error) throw error;
      return (data || []) as SystemFormReport[];
    } catch (error) {
      console.error('Error fetching forms/reports:', error);
      return [];
    }
  }

  // Get company's form/report access
  async getCompanyAccess(companyId: string): Promise<CompanyFormReportAccess[]> {
    try {
      const { data, error } = await (supabase
        .from('company_form_report_access' as any)
        .select(`
          *,
          form_report:system_forms_reports(*)
        `)
        .eq('company_id', companyId) as any);

      if (error) throw error;
      return (data || []) as CompanyFormReportAccess[];
    } catch (error) {
      console.error('Error fetching company access:', error);
      return [];
    }
  }

  // Get user's form/report access for a company
  async getUserAccess(userId: string, companyId: string): Promise<UserFormReportAccess[]> {
    try {
      const { data, error } = await (supabase
        .from('user_form_report_access' as any)
        .select(`
          *,
          form_report:system_forms_reports(*)
        `)
        .eq('user_id', userId)
        .eq('company_id', companyId) as any);

      if (error) throw error;
      return (data || []) as UserFormReportAccess[];
    } catch (error) {
      console.error('Error fetching user access:', error);
      return [];
    }
  }

  // Check if user has access to a form/report
  async hasAccess(
    userId: string,
    companyId: string,
    formReportId: string
  ): Promise<boolean> {
    try {
      // Use the database function for accurate checking
      const { data, error } = await supabase.rpc('user_has_form_report_access', {
        user_uuid: userId,
        company_uuid: companyId,
        form_report_uuid: formReportId,
      } as any);

      if (error) {
        console.error('Error checking access:', error);
        // Default to true on error for backward compatibility
        return true;
      }
      
      // The database function returns true/false
      // If it returns true, access is allowed
      // If it returns false, access is denied
      // If null/undefined, default to true (no explicit restriction)
      const hasAccess = data === true || (data === null || data === undefined);
      console.log(`  Access check for form/report ${formReportId}: ${hasAccess} (data: ${data})`);
      return hasAccess;
    } catch (error) {
      console.error('Error checking access:', error);
      // Default to true on error for backward compatibility
      return true;
    }
  }

  // Set company's form/report access
  async setCompanyAccess(
    companyId: string,
    formReportId: string,
    isEnabled: boolean,
    permissions?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { error } = await (supabase
        .from('company_form_report_access' as any)
        .upsert({
          company_id: companyId,
          form_report_id: formReportId,
          is_enabled: isEnabled,
          permissions: permissions || {},
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'company_id,form_report_id',
        }) as any);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error setting company access:', error);
      return false;
    }
  }

  // Set user's form/report access (overrides company-level)
  async setUserAccess(
    userId: string,
    companyId: string,
    formReportId: string,
    isEnabled: boolean,
    permissions?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { error } = await (supabase
        .from('user_form_report_access' as any)
        .upsert({
          user_id: userId,
          company_id: companyId,
          form_report_id: formReportId,
          is_enabled: isEnabled,
          permissions: permissions || {},
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,company_id,form_report_id',
        }) as any);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error setting user access:', error);
      return false;
    }
  }

  // Remove company's form/report access
  async removeCompanyAccess(companyId: string, formReportId: string): Promise<boolean> {
    try {
      const { error } = await (supabase
        .from('company_form_report_access' as any)
        .delete()
        .eq('company_id', companyId)
        .eq('form_report_id', formReportId) as any);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing company access:', error);
      return false;
    }
  }

  // Remove user's form/report access
  async removeUserAccess(
    userId: string,
    companyId: string,
    formReportId: string
  ): Promise<boolean> {
    try {
      const { error } = await (supabase
        .from('user_form_report_access' as any)
        .delete()
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .eq('form_report_id', formReportId) as any);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing user access:', error);
      return false;
    }
  }

  // Bulk update company access
  async bulkUpdateCompanyAccess(
    companyId: string,
    accesses: Array<{ formReportId: string; isEnabled: boolean; permissions?: Record<string, any> }>
  ): Promise<boolean> {
    try {
      const updates = accesses.map(access => ({
        company_id: companyId,
        form_report_id: access.formReportId,
        is_enabled: access.isEnabled,
        permissions: access.permissions || {},
        updated_at: new Date().toISOString(),
      }));

      const { error } = await (supabase
        .from('company_form_report_access' as any)
        .upsert(updates, {
          onConflict: 'company_id,form_report_id',
        }) as any);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error bulk updating company access:', error);
      return false;
    }
  }

  // Bulk update user access
  async bulkUpdateUserAccess(
    userId: string,
    companyId: string,
    accesses: Array<{ formReportId: string; isEnabled: boolean; permissions?: Record<string, any> }>
  ): Promise<boolean> {
    try {
      const updates = accesses.map(access => ({
        user_id: userId,
        company_id: companyId,
        form_report_id: access.formReportId,
        is_enabled: access.isEnabled,
        permissions: access.permissions || {},
        updated_at: new Date().toISOString(),
      }));

      const { error } = await (supabase
        .from('user_form_report_access' as any)
        .upsert(updates, {
          onConflict: 'user_id,company_id,form_report_id',
        }) as any);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error bulk updating user access:', error);
      return false;
    }
  }
}

export const formReportAccessService = FormReportAccessService.getInstance();

