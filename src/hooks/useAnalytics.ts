import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/utils/analytics';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/services/databaseService';
import { supabase } from '@/integrations/supabase/client';

export const useAnalytics = () => {
  const location = useLocation();
  const { user, currentCompany } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    billing: {
      totalStatements: 0,
      pending: 0,
      paid: 0,
      totalAmount: 0
    },
    collections: {
      totalAccounts: 0,
      totalBalance: 0,
      averageDaysOverdue: 0
    },
    authorizations: {
      totalRequests: 0,
      pending: 0,
      approved: 0,
      denied: 0
    },
    payments: {
      totalPlans: 0,
      activePlans: 0,
      totalAmount: 0
    }
  });

  // Track page views
  useEffect(() => {
    analytics.page(location.pathname, {
      referrer: document.referrer,
      timestamp: Date.now(),
    });
  }, [location.pathname]);

  // Track user identification
  useEffect(() => {
    if (user) {
      analytics.identify(user.id, {
        userId: user.id,
        email: user.email,
        role: 'user', // You might want to get this from user profile
        createdAt: new Date().toISOString(),
      });
    }
  }, [user]);

  // Get dashboard metrics
  const getDashboardMetrics = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch claims from both professional_claims and claims tables
      const professionalQuery = supabase
        .from('professional_claims' as any)
        .select('id, status, total_charges, company_id, created_at')
        .order('created_at', { ascending: false });
      
      const legacyQuery = supabase
        .from('claims' as any)
        .select('id, status, total_charges, created_at')
        .order('created_at', { ascending: false });

      // Apply company filter to professional_claims if company exists
      let finalProfessionalQuery = professionalQuery;
      if (currentCompany?.id) {
        finalProfessionalQuery = professionalQuery.or(`company_id.eq.${currentCompany.id},company_id.is.null`);
      }

      const [professionalResult, legacyResult] = await Promise.all([
        finalProfessionalQuery,
        legacyQuery
      ]);

      const { data: professionalClaims = [], error: professionalError } = professionalResult;
      const { data: legacyClaims = [], error: legacyError } = legacyResult;

      if (professionalError) console.error('Error fetching professional claims:', professionalError);
      if (legacyError) console.error('Error fetching legacy claims:', legacyError);

      // Combine all claims
      const allClaims = [...(professionalClaims || []), ...(legacyClaims || [])];
      
      // Calculate billing metrics from claims
      const totalStatements = allClaims.length;
      const pending = allClaims.filter((c: any) => 
        !c.status || c.status === 'draft' || c.status === 'pending' || c.status === 'submitted'
      ).length;
      const paid = allClaims.filter((c: any) => 
        c.status === 'paid' || c.status === 'approved'
      ).length;
      const totalAmount = allClaims.reduce((sum: number, c: any) => {
        const amount = parseFloat(c.total_charges || c.totalCharges || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      // Fetch collections accounts
      const collectionsAccounts = await databaseService.getCollectionsAccounts();
      const totalAccounts = collectionsAccounts.length;
      const totalBalance = collectionsAccounts.reduce((sum, a) => sum + (a.current_balance || 0), 0);
      const averageDaysOverdue = collectionsAccounts.length > 0 
        ? collectionsAccounts.reduce((sum, a) => sum + (a.days_overdue || 0), 0) / collectionsAccounts.length 
        : 0;

      // Fetch authorization requests
      const authRequests = await databaseService.getAuthorizationRequests();
      const totalRequests = authRequests.length;
      const authPending = authRequests.filter(a => a.status === 'pending' || a.status === 'submitted').length;
      const authApproved = authRequests.filter(a => a.status === 'approved').length;
      const authDenied = authRequests.filter(a => a.status === 'denied').length;

      // Fetch payment plans
      const paymentPlans = await databaseService.getPaymentPlans();
      const totalPlans = paymentPlans.length;
      const activePlans = paymentPlans.filter(p => p.status === 'active').length;
      const plansTotalAmount = paymentPlans.reduce((sum, p) => sum + (p.total_amount || 0), 0);

      const metrics = {
        billing: {
          totalStatements,
          pending,
          paid,
          totalAmount
        },
        collections: {
          totalAccounts,
          totalBalance,
          averageDaysOverdue: Math.round(averageDaysOverdue)
        },
        authorizations: {
          totalRequests,
          pending: authPending,
          approved: authApproved,
          denied: authDenied
        },
        payments: {
          totalPlans,
          activePlans,
          totalAmount: plansTotalAmount
        }
      };

      console.log('📊 Dashboard metrics calculated:', metrics);
      setDashboardMetrics(metrics);
      return metrics;
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      return dashboardMetrics;
    } finally {
      setLoading(false);
    }
  }, [currentCompany]);

  // Fetch dashboard metrics on mount
  useEffect(() => {
    getDashboardMetrics();
  }, [getDashboardMetrics]);

  // Track custom events
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    analytics.track(eventName, properties);
  }, []);

  // Track user actions
  const trackUserAction = useCallback((action: string, properties?: Record<string, any>) => {
    analytics.trackUserAction(action, properties);
  }, []);

  // Track errors
  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    analytics.trackError(error, context);
  }, []);

  // Track performance
  const trackPerformance = useCallback((metric: string, value: number, properties?: Record<string, any>) => {
    analytics.trackPerformance(metric, value, properties);
  }, []);

  // Track business events
  const trackPatientCreated = useCallback((patientId: string, properties?: Record<string, any>) => {
    analytics.trackPatientCreated(patientId, properties);
  }, []);

  const trackBillingStatementCreated = useCallback((statementId: string, amount: number, properties?: Record<string, any>) => {
    analytics.trackBillingStatementCreated(statementId, amount, properties);
  }, []);

  const trackCollectionActivity = useCallback((activityType: string, accountId: string, properties?: Record<string, any>) => {
    analytics.trackCollectionActivity(activityType, accountId, properties);
  }, []);

  const trackAuthorizationRequest = useCallback((requestId: string, status: string, properties?: Record<string, any>) => {
    analytics.trackAuthorizationRequest(requestId, status, properties);
  }, []);

  const trackPaymentPlanCreated = useCallback((planId: string, amount: number, properties?: Record<string, any>) => {
    analytics.trackPaymentPlanCreated(planId, amount, properties);
  }, []);

  return {
    loading,
    dashboardMetrics,
    getDashboardMetrics,
    trackEvent,
    trackUserAction,
    trackError,
    trackPerformance,
    trackPatientCreated,
    trackBillingStatementCreated,
    trackCollectionActivity,
    trackAuthorizationRequest,
    trackPaymentPlanCreated,
  };
};