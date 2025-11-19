import React from 'react';
import Layout from '@/components/Layout';
import AuthorizationTracking from '@/components/AuthorizationTracking';

const AuthorizationPage: React.FC = () => {
  return (
    <Layout currentPage="authorization">
      <AuthorizationTracking />
    </Layout>
  );
};

export default AuthorizationPage;

