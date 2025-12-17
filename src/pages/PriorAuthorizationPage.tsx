import React, { useMemo } from 'react';
import Layout from '@/components/Layout';
import AuthorizationTracking from '@/components/AuthorizationTracking';
import { useAuth } from '@/contexts/AuthContext';

// Cache per user/company scope (prevents stale data after login/company switch)
const cachedAuthorizationTrackingByScope = new Map<string, React.ReactElement>();

const PriorAuthorizationPage: React.FC = () => {
  const { user, currentCompany } = useAuth();
  const scopeKey = `${user?.id ?? 'anon'}:${currentCompany?.id ?? 'no_company'}`;

  // Use useMemo to ensure the component instance persists across re-renders
  // This preserves state when navigating away and back
  const cachedComponent = useMemo(() => {
    const existing = cachedAuthorizationTrackingByScope.get(scopeKey);
    if (existing) return existing;

    const next = <AuthorizationTracking key={`prior-authorization:${scopeKey}`} />;
    cachedAuthorizationTrackingByScope.set(scopeKey, next);
    return next;
  }, [scopeKey]);

  return (
    <Layout currentPage="prior-authorization">
      {cachedComponent}
    </Layout>
  );
};

export default PriorAuthorizationPage;

