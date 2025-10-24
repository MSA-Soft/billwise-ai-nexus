import { useState, useEffect } from 'react';
import { databaseService } from '@/services/databaseService';

export interface BillingStatement {
  id: string;
  patient_id: string;
  patient_name: string;
  amount_due: number;
  statement_date: string;
  due_date: string | null;
  status: 'pending' | 'sent' | 'delivered' | 'viewed' | 'paid' | 'failed' | null;
  channel: 'email' | 'paper' | 'portal' | 'sms' | null;
  sent_at: string | null;
  delivered_at: string | null;
  viewed_at: string | null;
  paid_at: string | null;
  pdf_url: string | null;
  error_message: string | null;
  user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useBillingStatements = () => {
  const [statements, setStatements] = useState<BillingStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatements = async () => {
    try {
      setLoading(true);
      const data = await databaseService.getBillingStatements();
      setStatements(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createStatement = async (statementData: Partial<BillingStatement>) => {
    try {
      const data = await databaseService.createBillingStatement(statementData);
      setStatements(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateStatement = async (id: string, updates: Partial<BillingStatement>) => {
    try {
      const data = await databaseService.updateBillingStatement(id, updates);
      setStatements(prev => prev.map(stmt => stmt.id === id ? data : stmt));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteStatement = async (id: string) => {
    try {
      await databaseService.deleteBillingStatement(id);
      setStatements(prev => prev.filter(stmt => stmt.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const sendStatement = async (id: string, channel: 'email' | 'paper' | 'portal' | 'sms') => {
    try {
      const data = await databaseService.sendBillingStatement(id, channel);
      setStatements(prev => prev.map(stmt => stmt.id === id ? data : stmt));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchStatements();
  }, []);

  return {
    statements,
    loading,
    error,
    fetchStatements,
    createStatement,
    updateStatement,
    deleteStatement,
    sendStatement,
  };
};
