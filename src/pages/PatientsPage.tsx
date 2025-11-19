import React from 'react';
import Layout from '@/components/Layout';
import { Patients } from '@/components/Patients';

const PatientsPage: React.FC = () => {
  return (
    <Layout currentPage="patients">
      <Patients />
    </Layout>
  );
};

export default PatientsPage;

