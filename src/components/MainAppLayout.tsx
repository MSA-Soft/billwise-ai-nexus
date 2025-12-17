import React, { memo } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import BillingWorkflow from '@/components/BillingWorkflow';
import QuickActions from '@/components/QuickActions';
import AuthorizationTracking from '@/components/AuthorizationTracking';
import EligibilityVerification from '@/components/EligibilityVerification';
import CodeValidation from '@/components/CodeValidation';
import { Patients } from '@/components/Patients';
import { Claims } from '@/components/Claims';
import { Schedule } from '@/components/Schedule';
import { EnhancedClaims } from '@/components/EnhancedClaims';
import { useAuth } from '@/contexts/AuthContext';

// Map route paths to component keys
const routeToKeyMap: Record<string, string> = {
  '/': 'dashboard',
  '/scheduling': 'schedule',
  '/patients': 'patients',
  '/claims': 'claims',
  '/eligibility-verification': 'eligibility-verification',
  '/code-validation': 'code-validation',
  '/authorization': 'authorization',
  '/enhanced-claims': 'enhanced-claims',
  '/billing-workflow': 'billing-workflow',
  '/quick-actions': 'quick-actions',
};

// Map route paths to page IDs for Layout
const routeToPageMap: Record<string, string> = {
  '/': 'dashboard',
  '/scheduling': 'scheduling',
  '/patients': 'patients',
  '/claims': 'claims',
  '/eligibility-verification': 'eligibility-verification',
  '/code-validation': 'code-validation',
  '/authorization': 'authorization',
  '/enhanced-claims': 'enhanced-claims',
  '/billing-workflow': 'billing-workflow',
  '/quick-actions': 'quick-actions',
};

interface MainAppLayoutProps {
  children?: React.ReactNode;
}

const MainAppLayout: React.FC<MainAppLayoutProps> = memo(({ children }) => {
  const location = useLocation();
  const { currentCompany } = useAuth();
  const currentKey = routeToKeyMap[location.pathname] || 'dashboard';
  const currentPage = routeToPageMap[location.pathname] || 'dashboard';
  const companyKey = currentCompany?.id ?? 'no-company';

  // Render all components but show only the active one
  // This preserves component state when switching routes (components stay mounted)
  // Using display: none keeps components in DOM and preserves their state
  return (
    <Layout currentPage={currentPage}>
      <div style={{ display: currentKey === 'dashboard' ? 'block' : 'none' }}>
        <BillingWorkflow key={`dashboard-${companyKey}`} />
      </div>
      <div style={{ display: currentKey === 'schedule' ? 'block' : 'none' }}>
        <Schedule key={`schedule-${companyKey}`} />
      </div>
      <div style={{ display: currentKey === 'patients' ? 'block' : 'none' }}>
        <Patients key={`patients-${companyKey}`} />
      </div>
      <div style={{ display: currentKey === 'claims' ? 'block' : 'none' }}>
        <Claims key={`claims-${companyKey}`} />
      </div>
      <div style={{ display: currentKey === 'eligibility-verification' ? 'block' : 'none' }}>
        <EligibilityVerification key={`eligibility-verification-${companyKey}`} />
      </div>
      <div style={{ display: currentKey === 'code-validation' ? 'block' : 'none' }}>
        <CodeValidation key={`code-validation-${companyKey}`} />
      </div>
      <div style={{ display: currentKey === 'authorization' ? 'block' : 'none' }}>
        <AuthorizationTracking key={`authorization-${companyKey}`} />
      </div>
      <div style={{ display: currentKey === 'enhanced-claims' ? 'block' : 'none' }}>
        <EnhancedClaims key={`enhanced-claims-${companyKey}`} />
      </div>
      <div style={{ display: currentKey === 'billing-workflow' ? 'block' : 'none' }}>
        <BillingWorkflow key={`billing-workflow-${companyKey}`} />
      </div>
      <div style={{ display: currentKey === 'quick-actions' ? 'block' : 'none' }}>
        <QuickActions key={`quick-actions-${companyKey}`} />
      </div>
      {children}
    </Layout>
  );
});

MainAppLayout.displayName = 'MainAppLayout';

export default MainAppLayout;

