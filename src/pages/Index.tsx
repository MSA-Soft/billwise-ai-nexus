import React, { useState, useEffect } from 'react';
import BillingWorkflow from '@/components/BillingWorkflow';
import QuickActions from '@/components/QuickActions';
import AuthorizationWorkflow from '@/components/AuthorizationWorkflow';
import AuthorizationTracking from '@/components/AuthorizationTracking';
import Practices from '@/components/Practices';
import { Providers } from '@/components/Providers';
import { Facilities } from '@/components/Facilities';
import { ReferringProviders } from '@/components/ReferringProviders';
import { Payers } from '@/components/Payers';
import { PayerAgreements } from '@/components/PayerAgreements';
import { CollectionAgencies } from '@/components/CollectionAgencies';
import { AlertControl } from '@/components/AlertControl';
import { Codes } from '@/components/Codes';
import { Statements } from '@/components/Statements';
import { Superbills } from '@/components/Superbills';
import { Labels } from '@/components/Labels';
import Layout from '@/components/Layout';
import { runAllTests } from '@/utils/testConnection';

const Index: React.FC = () => {
  return (
    <Layout currentPage="dashboard">
      <BillingWorkflow />
    </Layout>
  );
};

export default Index;