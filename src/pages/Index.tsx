import React, { useState } from 'react';
import BillingWorkflow from '@/components/BillingWorkflow';
import QuickActions from '@/components/QuickActions';
import AuthorizationWorkflow from '@/components/AuthorizationWorkflow';
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

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('billing');

  const renderContent = () => {
    switch (activeTab) {
      case 'billing':
        return <BillingWorkflow />;
      case 'quick-actions':
        return <QuickActions />;
      case 'authorization':
        return <AuthorizationWorkflow />;
      case 'practices':
        return <Practices />;
      case 'providers':
        return <Providers />;
      case 'facilities':
        return <Facilities />;
      case 'referring-providers':
        return <ReferringProviders />;
      case 'payers':
        return <Payers />;
      case 'payer-agreements':
        return <PayerAgreements />;
      case 'collection-agencies':
        return <CollectionAgencies />;
      case 'alert-control':
        return <AlertControl />;
      case 'codes':
        return <Codes />;
      case 'statements':
        return <Statements />;
      case 'superbills':
        return <Superbills />;
      case 'labels':
        return <Labels />;
      default:
        return <BillingWorkflow />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default Index;