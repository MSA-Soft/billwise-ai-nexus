import React from 'react';
import Layout from '@/components/Layout';
import QuickActions from '@/components/QuickActions';

const QuickActionsPage: React.FC = () => {
  return (
    <Layout currentPage="quick-actions">
      <QuickActions />
    </Layout>
  );
};

export default QuickActionsPage;

