import React, { useMemo } from 'react';
import Layout from '@/components/Layout';
import EligibilityVerification from '@/components/EligibilityVerification';

// Cache the component instance outside the component to persist across re-renders
let cachedEligibilityVerification: React.ReactElement | null = null;

const EligibilityVerificationPage: React.FC = () => {
  // Use useMemo to ensure the component instance persists across re-renders
  // This preserves state when navigating away and back
  const cachedComponent = useMemo(() => {
    if (!cachedEligibilityVerification) {
      cachedEligibilityVerification = <EligibilityVerification key="eligibility-persistent" />;
    }
    return cachedEligibilityVerification;
  }, []);

  return (
    <Layout currentPage="eligibility-verification">
      {cachedComponent}
    </Layout>
  );
};

export default EligibilityVerificationPage;

