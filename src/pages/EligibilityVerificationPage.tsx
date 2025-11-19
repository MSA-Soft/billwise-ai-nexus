import React from 'react';
import Layout from '@/components/Layout';
import EligibilityVerification from '@/components/EligibilityVerification';

const EligibilityVerificationPage: React.FC = () => {
  return (
    <Layout currentPage="eligibility-verification">
      <EligibilityVerification />
    </Layout>
  );
};

export default EligibilityVerificationPage;

