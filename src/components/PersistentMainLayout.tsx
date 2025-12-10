import React, { useEffect, useState } from 'react';
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

// Single persistent instance that wraps all routes
export const PersistentMainLayout: React.FC = () => {
  const location = useLocation();
  const currentKey = routeToKeyMap[location.pathname] || 'dashboard';
  const currentPage = routeToPageMap[location.pathname] || 'dashboard';

  // Render all components but show only the active one
  // Components stay mounted across route changes, preserving state
  return (
    <Layout currentPage={currentPage}>
      <div style={{ display: currentKey === 'dashboard' ? 'block' : 'none' }}>
        <BillingWorkflow key="dashboard-persistent" />
      </div>
      <div style={{ display: currentKey === 'schedule' ? 'block' : 'none' }}>
        <Schedule key="schedule-persistent" />
      </div>
      <div style={{ display: currentKey === 'patients' ? 'block' : 'none' }}>
        <Patients key="patients-persistent" />
      </div>
      <div style={{ display: currentKey === 'claims' ? 'block' : 'none' }}>
        <Claims key="claims-persistent" />
      </div>
      <div style={{ display: currentKey === 'eligibility-verification' ? 'block' : 'none' }}>
        <EligibilityVerification key="eligibility-verification-persistent" />
      </div>
      <div style={{ display: currentKey === 'code-validation' ? 'block' : 'none' }}>
        <CodeValidation key="code-validation-persistent" />
      </div>
      <div style={{ display: currentKey === 'authorization' ? 'block' : 'none' }}>
        <AuthorizationTracking key="authorization-persistent" />
      </div>
      <div style={{ display: currentKey === 'enhanced-claims' ? 'block' : 'none' }}>
        <EnhancedClaims key="enhanced-claims-persistent" />
      </div>
      <div style={{ display: currentKey === 'billing-workflow' ? 'block' : 'none' }}>
        <BillingWorkflow key="billing-workflow-persistent" />
      </div>
      <div style={{ display: currentKey === 'quick-actions' ? 'block' : 'none' }}>
        <QuickActions key="quick-actions-persistent" />
      </div>
    </Layout>
  );
};

