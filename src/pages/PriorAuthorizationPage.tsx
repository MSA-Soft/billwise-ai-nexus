import React, { useMemo } from 'react';
import Layout from '@/components/Layout';
import AuthorizationTracking from '@/components/AuthorizationTracking';

// Cache the component instance outside the component to persist across re-renders
let cachedAuthorizationTracking: React.ReactElement | null = null;

const PriorAuthorizationPage: React.FC = () => {
  // Use useMemo to ensure the component instance persists across re-renders
  // This preserves state when navigating away and back
  const cachedComponent = useMemo(() => {
    if (!cachedAuthorizationTracking) {
      cachedAuthorizationTracking = <AuthorizationTracking key="prior-authorization-persistent" />;
    }
    return cachedAuthorizationTracking;
  }, []);

  return (
    <Layout currentPage="prior-authorization">
      {cachedComponent}
    </Layout>
  );
};

export default PriorAuthorizationPage;

