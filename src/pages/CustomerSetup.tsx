import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import BillingWorkflow from '@/components/BillingWorkflow';
import QuickActions from '@/components/QuickActions';
import AuthorizationWorkflow from '@/components/AuthorizationWorkflow';
import EligibilityVerification from '@/components/EligibilityVerification';
import CodeValidation from '@/components/CodeValidation';
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
import { Patients } from '@/components/Patients';
import { Claims } from '@/components/Claims';
import { Schedule } from '@/components/Schedule';
import { EnhancedClaims } from '@/components/EnhancedClaims';

const CustomerSetup: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Initialize activeTab from URL parameters
  const initialTab = searchParams.get('tab') || 'practices';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Handle URL parameters to set the correct tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const renderContent = () => {
    switch (activeTab) {
      // Main Navigation Items
      case 'dashboard':
        return <BillingWorkflow />;
      case 'eligibility-verification':
        return <EligibilityVerification />;
      case 'code-validation':
        return <CodeValidation />;
      case 'authorization':
        return <AuthorizationWorkflow />;
            case 'claims':
              return <Claims />;
            case 'enhanced-claims':
              return <EnhancedClaims />;
            case 'patients':
              return <Patients />;
            case 'schedule':
              return <Schedule />;
            case 'reports':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Reports</h2>
            <p className="text-gray-600">Reports and analytics will be available here.</p>
          </div>
        );
      
      // Workflow Items
      case 'billing-workflow':
        return <BillingWorkflow />;
      case 'quick-actions':
        return <QuickActions />;
      case 'recent-activity':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <p className="text-gray-600">Recent activity will be available here.</p>
          </div>
        );
      
      // Analytics Items
      case 'financial-reports':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Financial Reports</h2>
            <p className="text-gray-600">Financial reports will be available here.</p>
          </div>
        );
      case 'performance-metrics':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>
            <p className="text-gray-600">Performance metrics will be available here.</p>
          </div>
        );
      case 'audit-trail':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Audit Trail</h2>
            <p className="text-gray-600">Audit trail will be available here.</p>
          </div>
        );
      
      // Customer Setup Items
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
      case 'customization':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Customization</h2>
            <p className="text-gray-600">Customization settings will be available here.</p>
          </div>
        );
      
      // Settings
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-gray-600">Application settings will be available here.</p>
          </div>
        );
      
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

export default CustomerSetup;
