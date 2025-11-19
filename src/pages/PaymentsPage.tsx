import React from 'react';
import Layout from '@/components/Layout';
import PaymentProcessing from '@/components/PaymentProcessing';

const PaymentsPage: React.FC = () => {
  return (
    <Layout currentPage="payments">
      <PaymentProcessing />
    </Layout>
  );
};

export default PaymentsPage;

