import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load heavy components
export const LazyBillingWorkflow = lazy(() => import('./BillingWorkflow'));
export const LazyCollectionsManagement = lazy(() => import('./CollectionsManagement'));
export const LazyReportsAnalytics = lazy(() => import('./ReportsAnalytics'));
export const LazyEDIDashboard = lazy(() => import('./EDIDashboard'));
export const LazyPriorAuthDashboard = lazy(() => import('./PriorAuthDashboard'));

// Loading fallback component
export const LoadingFallback: React.FC<{ message?: string }> = ({ 
  message = "Loading..." 
}) => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin mr-2" />
    <span className="text-muted-foreground">{message}</span>
  </div>
);

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  fallbackMessage?: string
) => {
  return (props: P) => (
    <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
      <Component {...props} />
    </Suspense>
  );
};
