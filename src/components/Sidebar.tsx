import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { formReportAccessService } from "@/services/formReportAccessService";
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Shield,
  Users,
  BarChart3,
  Workflow,
  Zap,
  CheckCircle,
  Clock,
  DollarSign,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  Building,
  Activity,
  BookOpen,
  Database,
  Target,
  User,
  Phone,
  Mail,
  Calendar,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Filter,
  TrendingUp,
  TrendingDown,
  PieChart,
  LineChart,
  AreaChart,
  Globe,
  Lock,
  Unlock,
  Key,
  Scan,
  QrCode,
  Barcode,
  Hash,
  Percent,
  Calculator,
  Bell,
  MessageSquare,
  Paperclip,
  Camera,
  Video,
  MapPin,
  Star,
  Bookmark,
  History,
  HelpCircle,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Maximize2,
  Minimize2,
  Move,
  MoveHorizontal,
  MoveVertical,
  Move3D,
  Grid,
  Grid3X3,
  List,
  Layout,
  LayoutGrid,
  LayoutList,
  LayoutTemplate
} from "lucide-react";

interface SidebarProps {
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

export const Sidebar = ({ currentPage = "dashboard", onPageChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCustomerSetupOpen, setIsCustomerSetupOpen] = useState(false);
  const [isPatientsOpen, setIsPatientsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [routeAccessMap, setRouteAccessMap] = useState<Map<string, boolean>>(new Map());
  const isMobile = useMobile();
  const { isSuperAdmin, user, currentCompany, accessibleRoutes } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect ZarSolution limited access (manual restriction)
  // We treat either the ZarSolution company OR the zar@gmail.com user as limited.
  const isZarLimited =
    !isSuperAdmin &&
    (
      user?.email?.toLowerCase() === "zar@gmail.com" ||
      (currentCompany &&
        (currentCompany.slug === "zar" ||
          currentCompany.name?.toLowerCase() === "zarsolution"))
    );

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  // Load route access map
  useEffect(() => {
    const loadRouteAccess = async () => {
      if (isSuperAdmin || !user || !currentCompany) {
        // Super admins have access to everything
        setRouteAccessMap(new Map());
        return;
      }

      try {
        console.log('🔒 Loading route access for:', { 
          userId: user.id, 
          companyId: currentCompany.id, 
          companyName: currentCompany.name 
        });
        const allFormsReports = await formReportAccessService.getAllFormsReports();
        console.log(`📋 Found ${allFormsReports.length} forms/reports in system`);
        const accessMap = new Map<string, boolean>();

        // Check access for each form/report
        for (const fr of allFormsReports) {
          const hasAccess = await formReportAccessService.hasAccess(
            user.id,
            currentCompany.id,
            fr.id
          );
          accessMap.set(fr.route_path, hasAccess);
          console.log(`  ${hasAccess ? '✅' : '❌'} ${fr.name} (${fr.route_path}): ${hasAccess ? 'ALLOWED' : 'DENIED'}`);
        }

        console.log('🔒 Route access map loaded:', Array.from(accessMap.entries()).map(([route, access]) => `${route}: ${access ? 'ALLOW' : 'DENY'}`));
        setRouteAccessMap(accessMap);
      } catch (error) {
        console.error('❌ Error loading route access:', error);
        // On error, set empty map to allow all (for backward compatibility)
        setRouteAccessMap(new Map());
      }
    };

    loadRouteAccess();
  }, [user, currentCompany, isSuperAdmin]);

  // Helper to check if route is accessible
  const isRouteAccessible = useMemo(() => {
    return (routePath: string): boolean => {
      if (isSuperAdmin) return true;
      if (!routePath) return true;
      
      // If access map is empty, access check hasn't loaded yet - allow temporarily
      if (routeAccessMap.size === 0) {
        return true;
      }
      
      // Remove query parameters for matching
      const routeWithoutQuery = routePath.split('?')[0];
      
      // Check exact match first
      if (routeAccessMap.has(routePath)) {
        const access = routeAccessMap.get(routePath);
        return access === true;
      }
      
      // Check without query parameters
      if (routeAccessMap.has(routeWithoutQuery)) {
        const access = routeAccessMap.get(routeWithoutQuery);
        return access === true;
      }

      // Check if route starts with any accessible route (for nested routes)
      for (const [accessibleRoute, hasAccess] of routeAccessMap.entries()) {
        if (!hasAccess) continue; // Skip denied routes
        
        const accessibleRouteClean = accessibleRoute.split('?')[0];
        // Check if current route matches accessible route
        if (routePath === accessibleRoute || routePath === accessibleRouteClean ||
            routeWithoutQuery === accessibleRoute || routeWithoutQuery === accessibleRouteClean) {
          return true;
        }
        // Check if current route starts with accessible route
        if (routePath.startsWith(accessibleRoute) || routePath.startsWith(accessibleRouteClean) ||
            routeWithoutQuery.startsWith(accessibleRouteClean)) {
          return true;
        }
        // Check reverse - if accessible route starts with current route
        if (accessibleRoute.startsWith(routePath) || accessibleRouteClean.startsWith(routeWithoutQuery)) {
          return true;
        }
      }

      // Check if this route is in the system (has a form/report entry)
      // If it's in the system but not explicitly allowed, deny access
      const routeInSystem = Array.from(routeAccessMap.keys()).some(route => {
        const routeClean = route.split('?')[0];
        return route === routePath || route === routeWithoutQuery || 
               routeClean === routePath || routeClean === routeWithoutQuery ||
               routePath.startsWith(routeClean) || route.startsWith(routeWithoutQuery);
      });
      
      if (routeInSystem) {
        // Route is in system but not in access map or explicitly denied
        console.log(`🚫 Route ${routePath} is in system but not allowed - denying access`);
        return false;
      }
      
      // Route is not in the system - allow for backward compatibility
      return true;
    };
  }, [routeAccessMap, isSuperAdmin]);

  // Manual allow-lists for ZarSolution (limited company)
  const zarAllowedMainNavIds = new Set<string>([
    "dashboard",
    "eligibility-verification",
    "patients", // show Patients menu (with limited submenu)
  ]);
  const zarAllowedPatientSubmenuIds = new Set<string>(["prior-authorization"]);
  const zarAllowedCustomerSetupIds = new Set<string>([
    "providers",
    "facilities",
    "payers",
    "codes",
  ]);
  const zarAllowedWorkflowIds = new Set<string>(); // none
  const zarAllowedAnalyticsIds = new Set<string>(); // none

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "scheduling",
      label: "Scheduling",
      icon: Calendar,
      badge: null,
    },
    {
      id: "patients",
      label: "Patients",
      icon: Users,
      badge: null,
      hasSubmenu: true,
    },
    {
      id: "claims",
      label: "Claims",
      icon: FileText,
      badge: null,
    },
    {
      id: "billings",
      label: "Billings",
      icon: FileText,
      badge: null,
    },
    {
      id: "payments",
      label: "Payments",
      icon: DollarSign,
      badge: null,
    },
    // Items after payments
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "eligibility-verification",
      label: "Eligibility Verification",
      icon: Shield,
      badge: null,
    },
    {
      id: "code-validation",
      label: "Code Validation",
      icon: CheckCircle,
      badge: null,
    },
    {
      id: "authorization",
      label: "Authorization",
      icon: FileText,
      badge: null,
    },
    {
      id: "enhanced-claims",
      label: "Enhanced Claims",
      icon: FileText,
      badge: "AI",
    },
  ];

  const patientsSubmenuItems = [
    {
      id: "patients",
      label: "Patients",
      icon: Users,
      badge: null,
    },
    {
      id: "eligibility-verification",
      label: "Eligibility",
      icon: Shield,
      badge: null,
    },
    {
      id: "prior-authorization",
      label: "Prior Authorization",
      icon: FileText,
      badge: null,
    },
  ];

  const customerSetupItems = [
    {
      id: "practices",
      label: "Practices",
      icon: Building,
      badge: null,
    },
    {
      id: "providers",
      label: "Providers",
      icon: User,
      badge: null,
    },
    {
      id: "facilities",
      label: "Facilities",
      icon: Building,
      badge: null,
    },
    {
      id: "referring-providers",
      label: "Referring Providers",
      icon: User,
      badge: null,
    },
    {
      id: "payers",
      label: "Payers",
      icon: DollarSign,
      badge: null,
    },
    {
      id: "payer-agreements",
      label: "Payer Agreements",
      icon: Users,
      badge: null,
    },
    {
      id: "collection-agencies",
      label: "Collection Agencies",
      icon: FileText,
      badge: null,
    },
    {
      id: "codes",
      label: "Codes...",
      icon: Plus,
      badge: null,
    },
    {
      id: "alert-control",
      label: "Alert Control",
      icon: AlertTriangle,
      badge: null,
    },
    {
      id: "statements",
      label: "Statements",
      icon: FileText,
      badge: null,
    },
    {
      id: "superbills",
      label: "Superbills",
      icon: FileText,
      badge: null,
    },
    {
      id: "labels",
      label: "Labels",
      icon: Mail,
      badge: null,
    },
    {
      id: "customization",
      label: "Customization...",
      icon: Settings,
      badge: null,
    },
  ];

  const workflowItems = [
    {
      id: "billing-workflow",
      label: "Billing Workflow",
      icon: Workflow,
      badge: null,
    },
    {
      id: "quick-actions",
      label: "Quick Actions",
      icon: Zap,
      badge: null,
    },
    {
      id: "recent-activity",
      label: "Recent Activity",
      icon: Clock,
      badge: null,
    },
  ];

  const analyticsItems = [
    {
      id: "financial-reports",
      label: "Financial Reports",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "performance-metrics",
      label: "Performance Metrics",
      icon: TrendingUp,
      badge: null,
    },
    {
      id: "audit-trail",
      label: "Audit Trail",
      icon: History,
      badge: null,
    },
  ];

  // Route map for access checking (moved outside function for use in filter)
  const routeMap: Record<string, string> = {
      // Main Navigation
      dashboard: '/',
      scheduling: '/scheduling',
      patients: '/patients',
      claims: '/claims',
      billings: '/billings',
      payments: '/payments',
      reports: '/reports',
      'eligibility-verification': '/eligibility-verification',
      'code-validation': '/code-validation',
      authorization: '/authorization',
      'enhanced-claims': '/enhanced-claims',
      // Workflow
      'billing-workflow': '/billing-workflow',
      'quick-actions': '/quick-actions',
      'recent-activity': '/recent-activity',
      // Analytics
      'financial-reports': '/financial-reports',
      'performance-metrics': '/performance-metrics',
      'audit-trail': '/audit-trail',
      // Patient Submenu
      'prior-authorization': '/prior-authorization',
      // Super Admin
      'super-admin': '/super-admin',
      // Customer Setup Items
      practices: '/customer-setup?tab=practices',
      providers: '/customer-setup?tab=providers',
      facilities: '/customer-setup?tab=facilities',
      'referring-providers': '/customer-setup?tab=referring-providers',
      payers: '/customer-setup?tab=payers',
      'payer-agreements': '/customer-setup?tab=payer-agreements',
      'collection-agencies': '/customer-setup?tab=collection-agencies',
      codes: '/customer-setup?tab=codes',
      'alert-control': '/customer-setup?tab=alert-control',
      statements: '/customer-setup?tab=statements',
      superbills: '/customer-setup?tab=superbills',
      labels: '/customer-setup?tab=labels',
      customization: '/customer-setup?tab=customization',
      settings: '/customer-setup?tab=settings',
  };

  const handleItemClick = (itemId: string) => {
    const route = routeMap[itemId];
    if (route) {
      // Special handling for eligibility verification (force refresh if needed)
      if (itemId === 'eligibility-verification') {
        const currentPath = window.location.pathname;
        if (currentPath === '/eligibility-verification') {
          window.location.reload();
        } else {
          navigate(route);
        }
        return;
      }
      navigate(route);
    } else {
      // Default/fallback: Go to dashboard
      navigate('/');
    }

    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 sticky top-0 z-50",
        isCollapsed ? "w-16" : "w-64",
        isMobile && !isMobileMenuOpen && "hidden lg:flex",
        isMobile && isMobileMenuOpen && "fixed inset-y-0 left-0 z-50"
      )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">BillWise AI</h1>
              <p className="text-xs text-gray-500">Medical Billing</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-6">
          {/* Main Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {isCollapsed ? "" : "Navigation"}
            </h3>
            <div className="space-y-1">
              {navigationItems
                .filter((item) => {
                  // Super admin sees everything
                  if (isSuperAdmin) return true;

                  // Manual restriction for ZarSolution limited access
                  if (isZarLimited && !zarAllowedMainNavIds.has(item.id)) {
                    return false;
                  }

                  const route = routeMap[item.id];
                  if (!route) {
                    return true; // Allow if route not mapped
                  }
                  return isRouteAccessible(route);
                })
                .map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                const hasSubmenu = item.hasSubmenu;
                
                // Handle patients submenu
                if (hasSubmenu && item.id === "patients") {
                  return (
                    <div key={item.id}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3 h-10 min-w-0",
                          isActive && "bg-blue-600 text-white hover:bg-blue-700",
                          isCollapsed && "px-2"
                        )}
                        onClick={() => {
                          if (!isCollapsed) {
                            setIsPatientsOpen(!isPatientsOpen);
                          } else {
                            handleItemClick(item.id);
                          }
                        }}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left truncate">{item.label}</span>
                            <ChevronDown className={cn(
                              "h-4 w-4 transition-transform",
                              isPatientsOpen && "rotate-180"
                            )} />
                          </>
                        )}
                      </Button>
                      
                      {!isCollapsed && isPatientsOpen && (
                        <div className="mt-1 ml-6 space-y-1">
                          {patientsSubmenuItems
                            .filter((subItem) => {
                              if (isSuperAdmin) return true;
                              if (
                                isZarLimited &&
                                !zarAllowedPatientSubmenuIds.has(subItem.id)
                              ) {
                                return false;
                              }
                              return true;
                            })
                            .map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = currentPage === subItem.id;
                            
                            return (
                              <Button
                                key={subItem.id}
                                variant={isSubActive ? "default" : "ghost"}
                                className={cn(
                                  "w-full justify-start gap-3 h-8 min-w-0 text-sm",
                                  isSubActive && "bg-blue-600 text-white hover:bg-blue-700"
                                )}
                                onClick={() => handleItemClick(subItem.id)}
                              >
                                <SubIcon className="h-3 w-3 flex-shrink-0" />
                                <span className="flex-1 text-left truncate">{subItem.label}</span>
                                {subItem.badge && (
                                  <Badge variant="secondary" className="ml-auto flex-shrink-0 text-xs">
                                    {subItem.badge}
                                  </Badge>
                                )}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                
                // Regular menu items
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-10 min-w-0",
                      isActive && "bg-blue-600 text-white hover:bg-blue-700",
                      isCollapsed && "px-2"
                    )}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto flex-shrink-0">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Workflow & Analytics - hide completely for Zar limited user */}
          {!isZarLimited && (
            <>
              <Separator className="mx-4" />

              {/* Workflow */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {isCollapsed ? "" : "Workflow"}
                </h3>
                <div className="space-y-1">
                  {workflowItems
                    .filter((item) => {
                      if (isSuperAdmin) return true;

                      const route = routeMap[item.id];
                      if (!route) return true;
                      return isRouteAccessible(route);
                    })
                    .map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3 h-10 min-w-0",
                          isActive && "bg-blue-600 text-white hover:bg-blue-700",
                          isCollapsed && "px-2"
                        )}
                        onClick={() => handleItemClick(item.id)}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left truncate">{item.label}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto flex-shrink-0">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator className="mx-4" />

              {/* Analytics */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {isCollapsed ? "" : "Analytics"}
                </h3>
                <div className="space-y-1">
                  {analyticsItems
                    .filter((item) => {
                      if (isSuperAdmin) return true;

                      const route = routeMap[item.id];
                      if (!route) return true;
                      return isRouteAccessible(route);
                    })
                    .map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3 h-10 min-w-0",
                          isActive && "bg-blue-600 text-white hover:bg-blue-700",
                          isCollapsed && "px-2"
                        )}
                        onClick={() => handleItemClick(item.id)}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left truncate">{item.label}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto flex-shrink-0">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <Separator className="mx-4" />

          {/* Super Admin Section (only for super admins) */}
          {isSuperAdmin && (
            <>
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                  {isCollapsed ? "" : "Super Admin"}
                </h3>
                <div className="space-y-1 px-3">
                  <Button
                    variant={currentPage === "super-admin" ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-10 min-w-0",
                      currentPage === "super-admin" && "bg-purple-600 text-white hover:bg-purple-700",
                      isCollapsed && "px-2"
                    )}
                    onClick={() => handleItemClick("super-admin")}
                  >
                    <Shield className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span className="flex-1 text-left truncate">Super Admin</span>}
                  </Button>
                </div>
              </div>
              <Separator className="mx-4" />
            </>
          )}

          {/* Customer Setup */}
          <div className="px-3 py-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10 min-w-0"
              onClick={() => setIsCustomerSetupOpen(!isCustomerSetupOpen)}
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">Customer Setup</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    isCustomerSetupOpen && "rotate-180"
                  )} />
                </>
              )}
            </Button>
            
            {!isCollapsed && isCustomerSetupOpen && (
              <div className="mt-2 ml-6 space-y-1">
                {customerSetupItems
                  .filter((item) => {
                    if (isSuperAdmin) return true;
                    if (
                      isZarLimited &&
                      !zarAllowedCustomerSetupIds.has(item.id)
                    ) {
                      return false;
                    }
                    return true;
                  })
                  .map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-8 min-w-0 text-sm",
                        isActive && "bg-blue-600 text-white hover:bg-blue-700"
                      )}
                      onClick={() => handleItemClick(item.id)}
                    >
                      <Icon className="h-3 w-3 flex-shrink-0" />
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto flex-shrink-0 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10"
          onClick={() => handleItemClick("settings")}
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">Settings</span>
            </>
          )}
        </Button>
      </div>
      </div>
    </>
  );
};

