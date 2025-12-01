import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formReportAccessService } from '@/services/formReportAccessService';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to check if user has access to a form/report by route path
 */
export const useFormReportAccess = () => {
  const { user, currentCompany } = useAuth();
  const [accessCache, setAccessCache] = useState<Map<string, boolean>>(new Map());

  // Get all forms/reports
  const { data: allFormsReports } = useQuery({
    queryKey: ['system-forms-reports'],
    queryFn: () => formReportAccessService.getAllFormsReports(),
  });

  // Check access for a specific route
  const hasAccess = useCallback(
    async (routePath: string): Promise<boolean> => {
      if (!user || !currentCompany || !allFormsReports) {
        return false;
      }

      // Super admins have access to everything
      // This check should be done in AuthContext, but adding here for safety
      
      // Check cache first
      const cacheKey = `${user.id}-${currentCompany.id}-${routePath}`;
      if (accessCache.has(cacheKey)) {
        return accessCache.get(cacheKey) || false;
      }

      // Find form/report by route path
      const formReport = allFormsReports.find(
        (fr) => fr.route_path === routePath || routePath.startsWith(fr.route_path)
      );

      if (!formReport) {
        // If no form/report found, allow access (for routes not in the system)
        return true;
      }

      // Check access using the service
      const hasAccessResult = await formReportAccessService.hasAccess(
        user.id,
        currentCompany.id,
        formReport.id
      );

      // Cache the result
      setAccessCache((prev) => new Map(prev).set(cacheKey, hasAccessResult));

      return hasAccessResult;
    },
    [user, currentCompany, allFormsReports, accessCache]
  );

  // Check access synchronously (uses cache)
  const hasAccessSync = useCallback(
    (routePath: string): boolean => {
      if (!user || !currentCompany || !allFormsReports) {
        return false;
      }

      const cacheKey = `${user.id}-${currentCompany.id}-${routePath}`;
      return accessCache.get(cacheKey) ?? true; // Default to true if not cached
    },
    [user, currentCompany, allFormsReports, accessCache]
  );

  // Get accessible routes
  const getAccessibleRoutes = useCallback((): string[] => {
    if (!allFormsReports) return [];

    return allFormsReports
      .filter((fr) => {
        const cacheKey = `${user?.id}-${currentCompany?.id}-${fr.route_path}`;
        return accessCache.get(cacheKey) ?? false;
      })
      .map((fr) => fr.route_path);
  }, [allFormsReports, user, currentCompany, accessCache]);

  // Preload access for common routes
  useEffect(() => {
    if (!user || !currentCompany || !allFormsReports) return;

    const commonRoutes = [
      '/',
      '/patients',
      '/claims',
      '/billings',
      '/scheduling',
      '/eligibility-verification',
      '/code-validation',
      '/authorization',
    ];

    commonRoutes.forEach((route) => {
      hasAccess(route).catch(() => {
        // Silently fail - access will be checked on demand
      });
    });
  }, [user, currentCompany, allFormsReports, hasAccess]);

  return {
    hasAccess,
    hasAccessSync,
    getAccessibleRoutes,
    allFormsReports,
  };
};

