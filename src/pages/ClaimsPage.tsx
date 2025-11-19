import React from 'react';
import Layout from '@/components/Layout';
import { Claims } from '@/components/Claims';

const ClaimsPage: React.FC = () => {
  return (
    <Layout currentPage="claims">
      <Claims />
    </Layout>
  );
};

export default ClaimsPage;

