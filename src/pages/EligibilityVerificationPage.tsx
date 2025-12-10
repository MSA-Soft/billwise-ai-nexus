import React from 'react';
import Layout from '@/components/Layout';
import EligibilityVerification from '@/components/EligibilityVerification';
import { useComponentCache } from '@/contexts/ComponentCacheContext';

const EligibilityVerificationPage: React.FC = () => {
  const { getCachedComponent } = useComponentCache();
  
  const cachedComponent = getCachedComponent(
    'eligibility-verification',
    () => <EligibilityVerification key="eligibility-persistent" />
  );

  return (
    <Layout currentPage="eligibility-verification">
      {cachedComponent}
    </Layout>
  );
};

export default EligibilityVerificationPage;

