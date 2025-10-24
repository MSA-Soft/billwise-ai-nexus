import { useState, useEffect } from 'react';
import { databaseService } from '@/services/databaseService';

export interface CollectionAccount {
  id: string;
  patient_name: string;
  patient_id: string | null;
  patient_email: string | null;
  patient_phone: string | null;
  original_balance: number;
  current_balance: number;
  days_overdue: number;
  collection_stage: 'early_collection' | 'mid_collection' | 'late_collection' | 'pre_legal';
  collection_status: 'active' | 'closed' | 'payment_plan' | 'settled' | 'attorney_referral' | 'dispute';
  last_contact_date: string | null;
  next_action_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface CollectionActivity {
  id: string;
  collection_account_id: string;
  activity_type: 'phone_call' | 'email_sent' | 'letter_sent' | 'promise_to_pay' | 'partial_payment' | 'settlement_offer' | 'dispute_received' | 'note_added';
  contact_method: 'phone' | 'email' | 'mail' | 'sms' | 'in_person' | null;
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
      const data = await databaseService.getCollectionsAccounts();
      setAccounts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const data = await databaseService.getCollectionActivities();
      setActivities(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createAccount = async (accountData: Partial<CollectionAccount>) => {
    try {
      const data = await databaseService.createCollectionAccount(accountData);
      setAccounts(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateAccount = async (id: string, updates: Partial<CollectionAccount>) => {
    try {
      const data = await databaseService.updateCollectionAccount(id, updates);
      setAccounts(prev => prev.map(acc => acc.id === id ? data : acc));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      await databaseService.deleteCollectionAccount(id);
      setAccounts(prev => prev.filter(acc => acc.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const addActivity = async (activityData: Partial<CollectionActivity>) => {
    try {
      const data = await databaseService.createCollectionActivity(activityData);
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
