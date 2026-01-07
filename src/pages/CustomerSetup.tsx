import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import BillingWorkflow from '@/components/BillingWorkflow';
import QuickActions from '@/components/QuickActions';
import AuthorizationWorkflow from '@/components/AuthorizationWorkflow';
import AuthorizationTracking from '@/components/AuthorizationTracking';
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
import { PosTosConfiguration } from '@/components/PosTosConfiguration';
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
    // Render all components but show only the active one using CSS
    // This preserves component state when switching tabs (components stay mounted)
    return (
      <>
        <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
          <BillingWorkflow key="dashboard" />
        </div>
        <div style={{ display: activeTab === 'eligibility-verification' ? 'block' : 'none' }}>
          <EligibilityVerification key="eligibility-verification" />
        </div>
        <div style={{ display: activeTab === 'code-validation' ? 'block' : 'none' }}>
          <CodeValidation key="code-validation" />
        </div>
        <div style={{ display: activeTab === 'authorization' ? 'block' : 'none' }}>
          <AuthorizationTracking key="authorization" />
        </div>
        <div style={{ display: activeTab === 'claims' ? 'block' : 'none' }}>
          <Claims key="claims" />
        </div>
        <div style={{ display: activeTab === 'enhanced-claims' ? 'block' : 'none' }}>
          <EnhancedClaims key="enhanced-claims" />
        </div>
        <div style={{ display: activeTab === 'patients' ? 'block' : 'none' }}>
          <Patients key="patients" />
        </div>
        <div style={{ display: activeTab === 'schedule' ? 'block' : 'none' }}>
          <Schedule key="schedule" />
        </div>
        <div style={{ display: activeTab === 'reports' ? 'block' : 'none' }}>
          <div className="p-6" key="reports">
            <h2 className="text-2xl font-bold mb-4">Reports</h2>
            <p className="text-gray-600">Reports and analytics will be available here.</p>
          </div>
        </div>
        <div style={{ display: activeTab === 'billing-workflow' ? 'block' : 'none' }}>
          <BillingWorkflow key="billing-workflow" />
        </div>
        <div style={{ display: activeTab === 'quick-actions' ? 'block' : 'none' }}>
          <QuickActions key="quick-actions" />
        </div>
        <div style={{ display: activeTab === 'recent-activity' ? 'block' : 'none' }}>
          <div className="p-6" key="recent-activity">
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <p className="text-gray-600">Recent activity will be available here.</p>
          </div>
        </div>
        <div style={{ display: activeTab === 'financial-reports' ? 'block' : 'none' }}>
          <div className="p-6" key="financial-reports">
            <h2 className="text-2xl font-bold mb-4">Financial Reports</h2>
            <p className="text-gray-600">Financial reports will be available here.</p>
          </div>
        </div>
        <div style={{ display: activeTab === 'performance-metrics' ? 'block' : 'none' }}>
          <div className="p-6" key="performance-metrics">
            <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>
            <p className="text-gray-600">Performance metrics will be available here.</p>
          </div>
        </div>
        <div style={{ display: activeTab === 'audit-trail' ? 'block' : 'none' }}>
          <div className="p-6" key="audit-trail">
            <h2 className="text-2xl font-bold mb-4">Audit Trail</h2>
            <p className="text-gray-600">Audit trail will be available here.</p>
          </div>
        </div>
        <div style={{ display: activeTab === 'practices' ? 'block' : 'none' }}>
          <Practices key="practices" />
        </div>
        <div style={{ display: activeTab === 'providers' ? 'block' : 'none' }}>
          <Providers key="providers" />
        </div>
        <div style={{ display: activeTab === 'facilities' ? 'block' : 'none' }}>
          <Facilities key="facilities" />
        </div>
        <div style={{ display: activeTab === 'referring-providers' ? 'block' : 'none' }}>
          <ReferringProviders key="referring-providers" />
        </div>
        <div style={{ display: activeTab === 'payers' ? 'block' : 'none' }}>
          <Payers key="payers" />
        </div>
        <div style={{ display: activeTab === 'payer-agreements' ? 'block' : 'none' }}>
          <PayerAgreements key="payer-agreements" />
        </div>
        <div style={{ display: activeTab === 'collection-agencies' ? 'block' : 'none' }}>
          <CollectionAgencies key="collection-agencies" />
        </div>
        <div style={{ display: activeTab === 'alert-control' ? 'block' : 'none' }}>
          <AlertControl key="alert-control" />
        </div>
        <div style={{ display: activeTab === 'codes' ? 'block' : 'none' }}>
          <Codes key="codes" />
        </div>
        <div style={{ display: activeTab === 'pos-tos-config' ? 'block' : 'none' }}>
          <PosTosConfiguration key="pos-tos-config" />
        </div>
        <div style={{ display: activeTab === 'statements' ? 'block' : 'none' }}>
          <Statements key="statements" />
        </div>
        <div style={{ display: activeTab === 'superbills' ? 'block' : 'none' }}>
          <Superbills key="superbills" />
        </div>
        <div style={{ display: activeTab === 'labels' ? 'block' : 'none' }}>
          <Labels key="labels" />
        </div>
        <div style={{ display: activeTab === 'customization' ? 'block' : 'none' }}>
          <div className="p-6" key="customization">
            <h2 className="text-2xl font-bold mb-4">Customization</h2>
            <p className="text-gray-600">Customization settings will be available here.</p>
          </div>
        </div>
        <div style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
          <div className="p-6" key="settings">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-gray-600">Application settings will be available here.</p>
          </div>
        </div>
        {/* Default fallback */}
        {!activeTab && (
          <div>
            <BillingWorkflow key="default" />
          </div>
        )}
      </>
    );
  };

  return (
    <Layout currentPage={activeTab}>
      {renderContent()}
    </Layout>
  );
};

export default CustomerSetup;
