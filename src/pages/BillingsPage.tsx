import React from 'react';
import Layout from '@/components/Layout';
import BillingModule from '@/components/BillingModule';

const BillingsPage: React.FC = () => {
  return (
    <Layout currentPage="billings">
      <BillingModule />
    </Layout>
  );
};

export default BillingsPage;

