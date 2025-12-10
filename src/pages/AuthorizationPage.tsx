import React from 'react';
import Layout from '@/components/Layout';
import AuthorizationTracking from '@/components/AuthorizationTracking';
import { useComponentCache } from '@/contexts/ComponentCacheContext';

const AuthorizationPage: React.FC = () => {
  const { getCachedComponent } = useComponentCache();
  
  const cachedComponent = getCachedComponent(
    'authorization',
    () => <AuthorizationTracking key="authorization-persistent" />
  );

  return (
    <Layout currentPage="authorization">
      {cachedComponent}
    </Layout>
  );
};

export default AuthorizationPage;

