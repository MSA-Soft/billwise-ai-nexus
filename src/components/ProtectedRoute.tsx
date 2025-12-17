import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock } from 'lucide-react';
import CompanySelectionPage from '@/pages/CompanySelectionPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'billing_staff' | 'patient';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  // Hooks must be called unconditionally - AuthProvider should always be available
  // If this throws, it means AuthProvider is not in the component tree (configuration error)
  const { user, loading, currentCompany, companyLoading, userCompanies, isSuperAdmin, hasFormReportAccess } = useAuth();
  const location = useLocation();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  // Check form/report access for the current route (must be called before any returns)
  useEffect(() => {
    const checkAccess = async () => {
      // Super admins always have access
      if (isSuperAdmin) {
        setHasAccess(true);
        return;
      }

      // If no user or company, can't check access yet
      if (!user || !currentCompany) {
        setHasAccess(true); // Default to allow access
        return;
      }

      // Check access for the current route
      const routePath = location.pathname;
      try {
        const access = await hasFormReportAccess(routePath);
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking access:', error);
        // Default to true on error for backward compatibility
        setHasAccess(true);
      }
    };

    checkAccess();
  }, [location.pathname, currentCompany, isSuperAdmin, hasFormReportAccess, user]);

  // Show loading while auth is initializing.
  // NOTE: Don't block the whole app just because companies are refreshing in the background
  // (e.g., after tab focus). Only block if we *still* don't have enough info to route.
  if (loading || (companyLoading && !isSuperAdmin && !currentCompany)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Loading...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Super admins don't need company selection - they can access everything
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Check if user has companies
  if (userCompanies.length === 0) {
    // User has no companies - show company selection page with no companies message
    return <CompanySelectionPage />;
  }

  // If user has companies but no current company selected, show selection page
  if (!currentCompany && userCompanies.length > 0) {
    return <CompanySelectionPage />;
  }

  // Show loading while checking access
  if (hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Checking access...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user doesn't have access, show unauthorized message
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <Lock className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You don't have access to this page. Please contact your administrator to request access.
            </p>
            <Navigate to="/" replace />
          </CardContent>
        </Card>
      </div>
    );
  }

  // TODO: Add role-based access control when user roles are implemented
  // if (requiredRole && userRole !== requiredRole) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  // User is authenticated, has a company selected, and has access - show the protected content
  return <>{children}</>;
};

export default ProtectedRoute;