import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { companyService, Company, CompanyUser } from '@/services/companyService';
import { formReportAccessService } from '@/services/formReportAccessService';

//#region Types & Interfaces
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  currentCompany: Company | null;
  userCompanies: CompanyUser[];
  companyLoading: boolean;
  setCurrentCompany: (companyId: string) => Promise<void>;
  refreshCompanies: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  isAdmin: () => boolean;
  isManager: () => boolean;
  hasPermission: (permission: string) => Promise<boolean>;
  isSuperAdmin: boolean;
  checkSuperAdmin: () => Promise<boolean>;
  hasFormReportAccess: (routePath: string) => Promise<boolean>;
  accessibleRoutes: string[];
}

interface AuthProviderProps {
  children: React.ReactNode;
}
//#endregion

//#region Context Creation
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
//#endregion

//#region AuthProvider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  //#region State
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentCompany, setCurrentCompanyState] = useState<Company | null>(null);
  const [userCompanies, setUserCompanies] = useState<CompanyUser[]>([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [accessibleRoutes, setAccessibleRoutes] = useState<string[]>([]);
  const [routeAccessCache, setRouteAccessCache] = useState<Map<string, boolean>>(new Map());
  //#endregion

  //#region Super Admin Methods
  const checkSuperAdmin = async (): Promise<boolean> => {
    if (!user) {
      setIsSuperAdmin(false);
      return false;
    }

    try {
      const isSuper = await companyService.isSuperAdmin();
      setIsSuperAdmin(isSuper);
      return isSuper;
    } catch (error) {
      console.error('Error checking super admin status:', error);
      setIsSuperAdmin(false);
      return false;
    }
  };
  //#endregion

  //#region Company Management
  const loadUserCompanies = async () => {
    if (!user) {
      setUserCompanies([]);
      setCurrentCompanyState(null);
      return;
    }

    try {
      setCompanyLoading(true);
      // IMPORTANT: compute super admin status locally to avoid state feedback loops
      // (isSuperAdmin state update can trigger effects that call loadUserCompanies again).
      const isSuper = await checkSuperAdmin();
      
      if (isSuper) {
        const allCompanies = await companyService.getAllCompanies();
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
        if (!currentCompany && allCompanies.length > 0) {
          setCurrentCompanyState(allCompanies[0]);
        }
      } else {
        const companies = await companyService.getUserCompanies();
        console.log('🏢 [AuthContext] Loaded user companies for', user.email, ':', companies.length);
        console.log('🏢 [AuthContext] Companies details:', companies.map(c => ({ 
          id: c.company_id, 
          name: c.company?.name, 
          slug: c.company?.slug, 
          is_primary: c.is_primary,
          company_full: c.company
        })));
        
        setUserCompanies(companies);
        
        // Priority: 1) Primary company, 2) Company with slug "zar" for zar@gmail.com, 3) First company (excluding "Default Company")
        let selectedCompany: Company | null = null;
        
        // First, try to find primary company (but skip if it's "Default Company" and we have other options)
        const primaryCompany = companies.find(cu => cu.is_primary);
        if (primaryCompany?.company) {
          const isDefaultCompany = primaryCompany.company.name?.toLowerCase() === 'default company';
          // Use primary company unless it's "Default Company" and we have other options
          if (!isDefaultCompany || companies.length === 1) {
            selectedCompany = primaryCompany.company;
            console.log('✅ Selected primary company:', selectedCompany.name, selectedCompany.slug);
          } else {
            console.log('⚠️ Primary company is "Default Company", looking for better match...');
          }
        }
        
        // If no primary selected, try to find zar company for zar@gmail.com
        if (!selectedCompany && user.email === 'zar@gmail.com') {
          const zarCompany = companies.find(cu => {
            const company = cu.company;
            if (!company) return false;
            return (
              company.slug === 'zar' || 
              company.name?.toLowerCase() === 'zarsolution' ||
              company.name?.toLowerCase() === 'zar' ||
              company.name?.toLowerCase() === 'zar solution'
            );
          });
          
          if (zarCompany?.company) {
            selectedCompany = zarCompany.company;
            console.log('✅ Selected zar company for zar@gmail.com:', selectedCompany.name, selectedCompany.slug);
            
            // Auto-set as primary if not already set
            if (!zarCompany.is_primary) {
              try {
                await companyService.setPrimaryCompany(zarCompany.company_id);
                console.log('✅ Auto-set zar company as primary');
                // Update the local state to reflect the change
                zarCompany.is_primary = true;
              } catch (error) {
                console.warn('⚠️ Could not auto-set zar company as primary:', error);
              }
            }
          } else {
            console.warn('⚠️ zar@gmail.com logged in but no zar company found in user companies');
          }
        }
        
        // Fallback: Select first company that's not "Default Company"
        if (!selectedCompany && companies.length > 0) {
          const nonDefaultCompany = companies.find(cu => 
            cu.company && cu.company.name?.toLowerCase() !== 'default company'
          );
          
          if (nonDefaultCompany?.company) {
            selectedCompany = nonDefaultCompany.company;
            console.log('✅ Selected first non-default company:', selectedCompany.name);
          } else {
            // Last resort: use first company even if it's "Default Company"
            selectedCompany = companies[0]?.company || null;
            console.log('⚠️ Selected first company (may be "Default Company"):', selectedCompany?.name);
          }
        }
        
        setCurrentCompanyState(selectedCompany);
        
        if (!selectedCompany) {
          console.error('❌ No company found for user:', user.email);
          console.error('❌ Available companies:', companies.map(c => ({
            id: c.company_id,
            name: c.company?.name,
            slug: c.company?.slug
          })));
        } else {
          console.log('✅ Final selected company:', {
            id: selectedCompany.id,
            name: selectedCompany.name,
            slug: selectedCompany.slug
          });
        }
      }
    } catch (error) {
      console.error('Error loading user companies:', error);
    } finally {
      setCompanyLoading(false);
    }
  };

  const setCurrentCompany = async (companyId: string) => {
    try {
      await companyService.setPrimaryCompany(companyId);
      await loadUserCompanies();
    } catch (error) {
      console.error('Error setting current company:', error);
      throw error;
    }
  };

  const refreshCompanies = async () => {
    await loadUserCompanies();
  };
  //#endregion

  //#region Authentication Methods
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
  //#endregion

  //#region Effects
  useEffect(() => {
    if (user && !loading) {
      // Super admin is checked as part of loadUserCompanies to avoid duplicated calls/loops.
    } else if (!user) {
      setIsSuperAdmin(false);
    }
  }, [user, loading]);

  useEffect(() => {
    if (user && !loading) {
      loadUserCompanies();
    } else if (!user) {
      setUserCompanies([]);
      setCurrentCompanyState(null);
    }
  }, [user, loading]);

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
      setAccessibleRoutes(['*']);
    }
  }, [user, currentCompany, isSuperAdmin]);
  //#endregion

  //#region Permission & Role Methods
  const isAdmin = (): boolean => {
    if (isSuperAdmin) return true;
    if (!currentCompany) return false;
    const companyUser = userCompanies.find(cu => cu.company_id === currentCompany.id);
    return companyUser?.role === 'admin';
  };

  const isManager = (): boolean => {
    if (isSuperAdmin) return true;
    if (!currentCompany) return false;
    const companyUser = userCompanies.find(cu => cu.company_id === currentCompany.id);
    return companyUser?.role === 'admin' || companyUser?.role === 'manager';
  };

  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!currentCompany) return false;
    return await companyService.hasPermission(currentCompany.id, permission);
  };

  const hasFormReportAccess = async (routePath: string): Promise<boolean> => {
    if (isSuperAdmin) return true;
    if (!user || !currentCompany) return false;

    const cacheKey = `${user.id}-${currentCompany.id}-${routePath}`;
    if (routeAccessCache.has(cacheKey)) {
      const cached = routeAccessCache.get(cacheKey);
      return cached !== undefined ? cached : true;
    }

    try {
      const allFormsReports = await formReportAccessService.getAllFormsReports();
      const formReport = allFormsReports.find(
        (fr) => fr.route_path === routePath || routePath.startsWith(fr.route_path)
      );

      if (!formReport) {
        setRouteAccessCache((prev) => new Map(prev).set(cacheKey, true));
        return true;
      }

      const hasAccess = await formReportAccessService.hasAccess(
        user.id,
        currentCompany.id,
        formReport.id
      );

      setRouteAccessCache((prev) => new Map(prev).set(cacheKey, hasAccess));
      return hasAccess;
    } catch (error) {
      console.error('Error checking form/report access:', error);
      setRouteAccessCache((prev) => new Map(prev).set(cacheKey, true));
      return true;
    }
  };
  //#endregion

  //#region Context Value
  const value = {
    user,
    session,
    loading,
    currentCompany,
    userCompanies,
    companyLoading,
    setCurrentCompany,
    refreshCompanies,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAdmin,
    isManager,
    hasPermission,
    isSuperAdmin,
    checkSuperAdmin,
    hasFormReportAccess,
    accessibleRoutes,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
//#endregion
