import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { companyService, Company, CompanyUser } from '@/services/companyService';
import { formReportAccessService } from '@/services/formReportAccessService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  // Company context
  currentCompany: Company | null;
  userCompanies: CompanyUser[];
  companyLoading: boolean;
  setCurrentCompany: (companyId: string) => Promise<void>;
  refreshCompanies: () => Promise<void>;
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  // Role helpers
  isAdmin: () => boolean;
  isManager: () => boolean;
  hasPermission: (permission: string) => Promise<boolean>;
  // Super admin
  isSuperAdmin: boolean;
  checkSuperAdmin: () => Promise<void>;
  // Form/Report access
  hasFormReportAccess: (routePath: string) => Promise<boolean>;
  accessibleRoutes: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentCompany, setCurrentCompanyState] = useState<Company | null>(null);
  const [userCompanies, setUserCompanies] = useState<CompanyUser[]>([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [accessibleRoutes, setAccessibleRoutes] = useState<string[]>([]);
  const [routeAccessCache, setRouteAccessCache] = useState<Map<string, boolean>>(new Map());

  // Check if user is super admin
  const checkSuperAdmin = async () => {
    if (!user) {
      setIsSuperAdmin(false);
      return;
    }

    try {
      const isSuper = await companyService.isSuperAdmin();
      setIsSuperAdmin(isSuper);
    } catch (error) {
      console.error('Error checking super admin status:', error);
      setIsSuperAdmin(false);
    }
  };

  // Load user companies when user changes
  const loadUserCompanies = async () => {
    if (!user) {
      setUserCompanies([]);
      setCurrentCompanyState(null);
      return;
    }

    try {
      setCompanyLoading(true);
      
      // Check super admin status first
      await checkSuperAdmin();
      
      // If super admin, get all companies
      if (isSuperAdmin) {
        const allCompanies = await companyService.getAllCompanies();
        // Convert to CompanyUser format for consistency
        const superAdminCompanies: CompanyUser[] = allCompanies.map(company => ({
          id: `super-${company.id}`,
          company_id: company.id,
          user_id: user.id,
          role: 'admin' as const,
          is_primary: false,
          is_active: true,
          company,
        }));
        setUserCompanies(superAdminCompanies);
        // Set first company as current if none selected
        if (!currentCompany && allCompanies.length > 0) {
          setCurrentCompanyState(allCompanies[0]);
        }
      } else {
        // Regular user - get their companies
        const companies = await companyService.getUserCompanies();
        setUserCompanies(companies);

        // Set current company (primary or first)
        const primaryCompany = companies.find(cu => cu.is_primary);
        const company = primaryCompany?.company || companies[0]?.company || null;
        setCurrentCompanyState(company);
      }
    } catch (error) {
      console.error('Error loading user companies:', error);
    } finally {
      setCompanyLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check super admin status when user changes
  useEffect(() => {
    if (user && !loading) {
      checkSuperAdmin();
    } else if (!user) {
      setIsSuperAdmin(false);
    }
  }, [user, loading]);

  // Load companies when user is available
  useEffect(() => {
    if (user && !loading) {
      loadUserCompanies();
    } else if (!user) {
      setUserCompanies([]);
      setCurrentCompanyState(null);
    }
  }, [user, loading, isSuperAdmin]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (data.user && !error) {
      // Create user profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserCompanies([]);
    setCurrentCompanyState(null);
    setIsSuperAdmin(false);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  };

  // Set current company
  const setCurrentCompany = async (companyId: string) => {
    try {
      await companyService.setPrimaryCompany(companyId);
      await loadUserCompanies();
    } catch (error) {
      console.error('Error setting current company:', error);
      throw error;
    }
  };

  // Refresh companies list
  const refreshCompanies = async () => {
    await loadUserCompanies();
  };

  // Check if user is admin in current company
  const isAdmin = (): boolean => {
    // Super admins are always admins
    if (isSuperAdmin) return true;
    if (!currentCompany) return false;
    const companyUser = userCompanies.find(cu => cu.company_id === currentCompany.id);
    return companyUser?.role === 'admin';
  };

  // Check if user is manager in current company
  const isManager = (): boolean => {
    // Super admins are always managers
    if (isSuperAdmin) return true;
    if (!currentCompany) return false;
    const companyUser = userCompanies.find(cu => cu.company_id === currentCompany.id);
    return companyUser?.role === 'admin' || companyUser?.role === 'manager';
  };

  // Check if user has specific permission
  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!currentCompany) return false;
    return await companyService.hasPermission(currentCompany.id, permission);
  };

  // Check if user has access to a form/report by route path
  const hasFormReportAccess = async (routePath: string): Promise<boolean> => {
    // Super admins have access to everything
    if (isSuperAdmin) return true;
    
    if (!user || !currentCompany) return false;

    // Check cache first
    const cacheKey = `${user.id}-${currentCompany.id}-${routePath}`;
    if (routeAccessCache.has(cacheKey)) {
      const cached = routeAccessCache.get(cacheKey);
      return cached !== undefined ? cached : true; // Default to true if cached as undefined
    }

    try {
      // Get all forms/reports
      const allFormsReports = await formReportAccessService.getAllFormsReports();
      
      // Find form/report by route path
      const formReport = allFormsReports.find(
        (fr) => fr.route_path === routePath || routePath.startsWith(fr.route_path)
      );

      if (!formReport) {
        // If no form/report found, allow access (for routes not in the system)
        setRouteAccessCache((prev) => new Map(prev).set(cacheKey, true));
        return true;
      }

      // Check access using the service
      const hasAccess = await formReportAccessService.hasAccess(
        user.id,
        currentCompany.id,
        formReport.id
      );

      // Cache the result
      setRouteAccessCache((prev) => new Map(prev).set(cacheKey, hasAccess));
      return hasAccess;
    } catch (error) {
      console.error('Error checking form/report access:', error);
      // Default to true on error for backward compatibility
      setRouteAccessCache((prev) => new Map(prev).set(cacheKey, true));
      return true;
    }
  };

  // Load accessible routes when company changes
  useEffect(() => {
    const loadAccessibleRoutes = async () => {
      if (!user || !currentCompany || isSuperAdmin) {
        setAccessibleRoutes([]);
        return;
      }

      try {
        const allFormsReports = await formReportAccessService.getAllFormsReports();
        const accessible: string[] = [];

        for (const fr of allFormsReports) {
          const hasAccess = await formReportAccessService.hasAccess(
            user.id,
            currentCompany.id,
            fr.id
          );
          if (hasAccess) {
            accessible.push(fr.route_path);
          }
        }

        setAccessibleRoutes(accessible);
      } catch (error) {
        console.error('Error loading accessible routes:', error);
        setAccessibleRoutes([]);
      }
    };

    if (user && currentCompany && !isSuperAdmin) {
      loadAccessibleRoutes();
    } else if (isSuperAdmin) {
      // Super admins have access to all routes
      setAccessibleRoutes(['*']); // '*' means all routes
    }
  }, [user, currentCompany, isSuperAdmin]);

  const value = {
    user,
    session,
    loading,
    // Company context
    currentCompany,
    userCompanies,
    companyLoading,
    setCurrentCompany,
    refreshCompanies,
    // Auth methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    // Role helpers
    isAdmin,
    isManager,
    hasPermission,
    // Super admin
    isSuperAdmin,
    checkSuperAdmin,
    // Form/Report access
    hasFormReportAccess,
    accessibleRoutes,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
