import React from 'react';
import Layout from '@/components/Layout';
import BillingWorkflow from '@/components/BillingWorkflow';

const Dashboard: React.FC = () => {
  return (
    <Layout currentPage="dashboard">
      <BillingWorkflow />
    </Layout>
  );
};

export default Dashboard;

