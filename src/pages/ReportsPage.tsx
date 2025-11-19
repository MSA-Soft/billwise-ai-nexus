import React from 'react';
import Layout from '@/components/Layout';
import ReportsAnalytics from '@/components/ReportsAnalytics';

const ReportsPage: React.FC = () => {
  return (
    <Layout currentPage="reports">
      <ReportsAnalytics />
    </Layout>
  );
};

export default ReportsPage;

