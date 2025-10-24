import { useState, useEffect } from 'react';
import { databaseService } from '@/services/databaseService';

export interface PaymentPlan {
  id: string;
  statement_id: string | null;
  user_id: string;
  total_amount: number;
  monthly_payment: number;
  number_of_payments: number;
  payments_completed: number | null;
  remaining_balance: number;
  start_date: string;
  end_date: string;
  down_payment: number | null;
  auto_pay: boolean | null;
  status: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const usePaymentPlans = () => {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await databaseService.getPaymentPlans();
      setPlans(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData: Partial<PaymentPlan>) => {
    try {
      const data = await databaseService.createPaymentPlan(planData);
      setPlans(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updatePlan = async (id: string, updates: Partial<PaymentPlan>) => {
    try {
      const data = await databaseService.updatePaymentPlan(id, updates);
      setPlans(prev => prev.map(plan => plan.id === id ? data : plan));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getPlanById = async (id: string): Promise<PaymentPlan> => {
    try {
      const data = await databaseService.getPaymentPlans();
      const plan = data.find(p => p.id === id);
      if (!plan) {
        throw new Error('Payment plan not found');
      }
      return plan;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getPlansByStatus = (status: string): PaymentPlan[] => {
    return plans.filter(plan => plan.status === status);
  };

  const getActivePlans = (): PaymentPlan[] => {
    return plans.filter(plan => plan.status === 'active' || plan.status === null);
  };

  const getCompletedPlans = (): PaymentPlan[] => {
    return plans.filter(plan => plan.status === 'completed');
  };

  const getOverduePlans = (): PaymentPlan[] => {
    const today = new Date();
    return plans.filter(plan => {
      if (!plan.end_date) return false;
      const endDate = new Date(plan.end_date);
      return endDate < today && plan.status !== 'completed';
    });
  };

  const calculateRemainingPayments = (plan: PaymentPlan): number => {
    const completed = plan.payments_completed || 0;
    return plan.number_of_payments - completed;
  };

  const calculateProgressPercentage = (plan: PaymentPlan): number => {
    const completed = plan.payments_completed || 0;
    return (completed / plan.number_of_payments) * 100;
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    loading,
    error,
    fetchPlans,
    createPlan,
    updatePlan,
    getPlanById,
    getPlansByStatus,
    getActivePlans,
    getCompletedPlans,
    getOverduePlans,
    calculateRemainingPayments,
    calculateProgressPercentage,
  };
};
