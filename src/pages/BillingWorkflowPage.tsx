import React from 'react';
import Layout from '@/components/Layout';
import BillingWorkflow from '@/components/BillingWorkflow';

const BillingWorkflowPage: React.FC = () => {
  return (
    <Layout currentPage="billing-workflow">
      <BillingWorkflow />
    </Layout>
  );
};

export default BillingWorkflowPage;

