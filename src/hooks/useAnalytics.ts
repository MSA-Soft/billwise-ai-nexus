import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/utils/analytics';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/services/databaseService';

export const useAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();
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
      // Fetch billing statements
      const statements = await databaseService.getBillingStatements();
      const totalStatements = statements.length;
      const pending = statements.filter(s => s.status === 'pending').length;
      const paid = statements.filter(s => s.status === 'paid').length;
      const totalAmount = statements.reduce((sum, s) => sum + (s.amount_due || 0), 0);

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
      const authPending = authRequests.filter(a => a.status === 'pending').length;
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

      setDashboardMetrics(metrics);
      return metrics;
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      return dashboardMetrics;
    } finally {
      setLoading(false);
    }
  }, [dashboardMetrics]);

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