import React from 'react';
import Layout from '@/components/Layout';
import { EnhancedClaims } from '@/components/EnhancedClaims';

const EnhancedClaimsPage: React.FC = () => {
  return (
    <Layout currentPage="enhanced-claims">
      <EnhancedClaims />
    </Layout>
  );
};

export default EnhancedClaimsPage;

