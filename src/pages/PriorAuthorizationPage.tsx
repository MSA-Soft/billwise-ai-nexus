import React from 'react';
import Layout from '@/components/Layout';
import AuthorizationTracking from '@/components/AuthorizationTracking';

const PriorAuthorizationPage: React.FC = () => {
  return (
    <Layout currentPage="prior-authorization">
      <AuthorizationTracking />
    </Layout>
  );
};

export default PriorAuthorizationPage;

