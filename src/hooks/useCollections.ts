import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CollectionAccount {
  id: string;
  patient_name: string;
  patient_id: string | null;
  patient_email: string | null;
  patient_phone: string | null;
  original_balance: number;
  current_balance: number;
  days_overdue: number;
  collection_stage: string;
  collection_status: string;
  last_contact_date: string | null;
  next_action_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface CollectionActivity {
  id: string;
  collection_account_id: string;
  activity_type: string;
  contact_method: string | null;
  notes: string | null;
  outcome: string | null;
  amount_discussed: number | null;
  promise_to_pay_date: string | null;
  performed_by: string | null;
  created_at: string;
}

export const useCollections = () => {
  const [accounts, setAccounts] = useState<CollectionAccount[]>([]);
  const [activities, setActivities] = useState<CollectionActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('collections_accounts')
        .select('*')
        .order('days_overdue', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('collection_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createAccount = async (accountData: Partial<CollectionAccount>) => {
    try {
      const { data, error } = await supabase
        .from('collections_accounts')
        .insert([accountData])
        .select()
        .single();

      if (error) throw error;
      setAccounts(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateAccount = async (id: string, updates: Partial<CollectionAccount>) => {
    try {
      const { data, error } = await supabase
        .from('collections_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setAccounts(prev => prev.map(acc => acc.id === id ? data : acc));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('collections_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAccounts(prev => prev.filter(acc => acc.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const addActivity = async (activityData: Partial<CollectionActivity>) => {
    try {
      const { data, error } = await supabase
        .from('collection_activities')
        .insert([activityData])
        .select()
        .single();

      if (error) throw error;
      setActivities(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchActivities();
  }, []);

  return {
    accounts,
    activities,
    loading,
    error,
    fetchAccounts,
    fetchActivities,
    createAccount,
    updateAccount,
    deleteAccount,
    addActivity,
  };
};
