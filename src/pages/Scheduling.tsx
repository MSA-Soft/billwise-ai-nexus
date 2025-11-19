import React from 'react';
import Layout from '@/components/Layout';
import { Schedule } from '@/components/Schedule';

const Scheduling: React.FC = () => {
  return (
    <Layout currentPage="scheduling">
      <Schedule />
    </Layout>
  );
};

export default Scheduling;

