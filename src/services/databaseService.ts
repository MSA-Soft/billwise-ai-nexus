import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type definitions for better type safety
type Tables = Database['public']['Tables'];
type CollectionAccount = Tables['collections_accounts']['Row'];
type CollectionActivity = Tables['collection_activities']['Row'];
type BillingStatement = Tables['billing_statements']['Row'];
type AuthorizationRequest = Tables['authorization_requests']['Row'];
type PaymentPlan = Tables['payment_plans']['Row'];

export interface DatabaseError {
  message: string;
  code?: string;
  details?: string;
}

export class DatabaseService {
  private static instance: DatabaseService;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Generic error handler
  private handleError(error: any): DatabaseError {
    console.error('Database error:', error);
    return {
      message: error.message || 'An unexpected error occurred',
      code: error.code,
      details: error.details
    };
  }

  // COLLECTIONS ACCOUNTS CRUD
  async getCollectionsAccounts(): Promise<CollectionAccount[]> {
    try {
      const { data, error } = await supabase
        .from('collections_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCollectionAccount(id: string): Promise<CollectionAccount> {
    try {
      const { data, error } = await supabase
        .from('collections_accounts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createCollectionAccount(accountData: Partial<CollectionAccount>): Promise<CollectionAccount> {
    try {
      const { data, error } = await supabase
        .from('collections_accounts')
        .insert([{
          ...accountData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCollectionAccount(id: string, updates: Partial<CollectionAccount>): Promise<CollectionAccount> {
    try {
      const { data, error } = await supabase
        .from('collections_accounts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteCollectionAccount(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('collections_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // COLLECTION ACTIVITIES CRUD
  async getCollectionActivities(accountId?: string): Promise<CollectionActivity[]> {
    try {
      let query = supabase
        .from('collection_activities')
        .select(`
          *,
          collections_accounts (
            patient_name,
            current_balance
          )
        `)
        .order('created_at', { ascending: false });

      if (accountId) {
        query = query.eq('collection_account_id', accountId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createCollectionActivity(activityData: Partial<CollectionActivity>): Promise<CollectionActivity> {
    try {
      const { data, error } = await supabase
        .from('collection_activities')
        .insert([{
          ...activityData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCollectionActivity(id: string, updates: Partial<CollectionActivity>): Promise<CollectionActivity> {
    try {
      const { data, error } = await supabase
        .from('collection_activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteCollectionActivity(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('collection_activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // BILLING STATEMENTS CRUD
  async getBillingStatements(): Promise<BillingStatement[]> {
    try {
      const { data, error } = await supabase
        .from('billing_statements')
        .select('*')
        .order('statement_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBillingStatement(id: string): Promise<BillingStatement> {
    try {
      const { data, error } = await supabase
        .from('billing_statements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createBillingStatement(statementData: Partial<BillingStatement>): Promise<BillingStatement> {
    try {
      const { data, error } = await supabase
        .from('billing_statements')
        .insert([{
          ...statementData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBillingStatement(id: string, updates: Partial<BillingStatement>): Promise<BillingStatement> {
    try {
      const { data, error } = await supabase
        .from('billing_statements')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteBillingStatement(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('billing_statements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendBillingStatement(id: string, channel: string): Promise<BillingStatement> {
    try {
      const { data, error } = await supabase
        .from('billing_statements')
        .update({
          status: 'sent',
          channel,
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // AUTHORIZATION REQUESTS CRUD
  async getAuthorizationRequests(): Promise<AuthorizationRequest[]> {
    try {
      const { data, error } = await supabase
        .from('authorization_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createAuthorizationRequest(requestData: Partial<AuthorizationRequest>): Promise<AuthorizationRequest> {
    try {
      const { data, error } = await supabase
        .from('authorization_requests')
        .insert([{
          ...requestData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateAuthorizationRequest(id: string, updates: Partial<AuthorizationRequest>): Promise<AuthorizationRequest> {
    try {
      const { data, error } = await supabase
        .from('authorization_requests')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PAYMENT PLANS CRUD
  async getPaymentPlans(): Promise<PaymentPlan[]> {
    try {
      const { data, error } = await supabase
        .from('payment_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createPaymentPlan(planData: Partial<PaymentPlan>): Promise<PaymentPlan> {
    try {
      const { data, error } = await supabase
        .from('payment_plans')
        .insert([{
          ...planData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePaymentPlan(id: string, updates: Partial<PaymentPlan>): Promise<PaymentPlan> {
    try {
      const { data, error } = await supabase
        .from('payment_plans')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ANALYTICS AND REPORTING
  async getCollectionsAnalytics() {
    try {
      const { data, error } = await supabase
        .from('collections_accounts')
        .select('collection_stage, collection_status, current_balance');

      if (error) throw error;

      const analytics = {
        totalAccounts: data?.length || 0,
        totalBalance: data?.reduce((sum, acc) => sum + (acc.current_balance || 0), 0) || 0,
        byStage: data?.reduce((acc, item) => {
          acc[item.collection_stage] = (acc[item.collection_stage] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {},
        byStatus: data?.reduce((acc, item) => {
          acc[item.collection_status] = (acc[item.collection_status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {}
      };

      return analytics;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBillingAnalytics() {
    try {
      const { data, error } = await supabase
        .from('billing_statements')
        .select('amount_due, status, statement_date');

      if (error) throw error;

      const analytics = {
        totalStatements: data?.length || 0,
        totalAmount: data?.reduce((sum, stmt) => sum + (stmt.amount_due || 0), 0) || 0,
        byStatus: data?.reduce((acc, item) => {
          acc[item.status || 'unknown'] = (acc[item.status || 'unknown'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {},
        recentStatements: data?.slice(0, 10) || []
      };

      return analytics;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export const databaseService = DatabaseService.getInstance();
