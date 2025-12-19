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

  //#region ZarSolution Access Control
  const userEmail = user?.email?.toLowerCase()?.trim();
  const isZarEmail = userEmail === "zar@gmail.com";
  const isZarCompany = currentCompany && (
    currentCompany.slug === "zar" ||
    currentCompany.name?.toLowerCase()?.trim() === "zarsolution"
  );
  const isZarLimited = !isSuperAdmin && (isZarEmail || isZarCompany);
  //#endregion

  //#region Effects
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const loadRouteAccess = async () => {
      if (isSuperAdmin || !user || !currentCompany) {
        setRouteAccessMap(new Map());
        return;
      }

      try {
        const allFormsReports = await formReportAccessService.getAllFormsReports();
        const accessMap = new Map<string, boolean>();

        for (const fr of allFormsReports) {
          const hasAccess = await formReportAccessService.hasAccess(
            user.id,
            currentCompany.id,
            fr.id
          );
          accessMap.set(fr.route_path, hasAccess);
        }

        setRouteAccessMap(accessMap);
      } catch (error) {
        console.error('Error loading route access:', error);
        setRouteAccessMap(new Map());
      }
    };

    loadRouteAccess();
  }, [user, currentCompany, isSuperAdmin]);
  //#endregion

  //#region Route Access Helpers
  const isRouteAccessible = useMemo(() => {
    return (routePath: string): boolean => {
      if (isSuperAdmin) return true;
      if (!routePath) return true;
      if (routeAccessMap.size === 0) return true;
      
      const routeWithoutQuery = routePath.split('?')[0];
      
      if (routeAccessMap.has(routePath)) {
        return routeAccessMap.get(routePath) === true;
      }
      
      if (routeAccessMap.has(routeWithoutQuery)) {
        return routeAccessMap.get(routeWithoutQuery) === true;
      }

      for (const [accessibleRoute, hasAccess] of routeAccessMap.entries()) {
        if (!hasAccess) continue;
        
        const accessibleRouteClean = accessibleRoute.split('?')[0];
        if (routePath === accessibleRoute || routePath === accessibleRouteClean ||
            routeWithoutQuery === accessibleRoute || routeWithoutQuery === accessibleRouteClean) {
          return true;
        }
        if (routePath.startsWith(accessibleRoute) || routePath.startsWith(accessibleRouteClean) ||
            routeWithoutQuery.startsWith(accessibleRouteClean)) {
          return true;
        }
        if (accessibleRoute.startsWith(routePath) || accessibleRouteClean.startsWith(routeWithoutQuery)) {
          return true;
        }
      }

      const routeInSystem = Array.from(routeAccessMap.keys()).some(route => {
        const routeClean = route.split('?')[0];
        return route === routePath || route === routeWithoutQuery || 
               routeClean === routePath || routeClean === routeWithoutQuery ||
               routePath.startsWith(routeClean) || route.startsWith(routeWithoutQuery);
      });
      
      if (routeInSystem) {
        return false;
      }
      
      return true;
    };
  }, [routeAccessMap, isSuperAdmin]);
  //#endregion

  //#region Navigation Configuration
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
  const zarAllowedWorkflowIds = new Set<string>();
  const zarAllowedAnalyticsIds = new Set<string>();

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
  //#endregion

  //#region Event Handlers
  const handleItemClick = (itemId: string) => {
    const route = routeMap[itemId];
    if (route) {
      navigate(route);
    } else {
      // Default/fallback: Go to dashboard
      navigate('/');
    }

    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };
  //#endregion

  //#region Render
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
        "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 sticky top-0 left-0 z-50",
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
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar pr-2">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {isCollapsed ? "" : "Navigation"}
            </h3>
            <div className="space-y-1">
              {navigationItems
                .filter((item) => {
                  if (isSuperAdmin) return true;
                  if (isZarEmail) {
                    return zarAllowedMainNavIds.has(item.id);
                  }
                  if (isZarCompany && !isZarEmail) {
                    return zarAllowedMainNavIds.has(item.id);
                  }
                  const route = routeMap[item.id];
                  if (!route) return true;
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
                              if (isZarEmail) return zarAllowedPatientSubmenuIds.has(subItem.id);
                              if (isZarCompany) return zarAllowedPatientSubmenuIds.has(subItem.id);
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

          {!isZarLimited && (
            <>
              <Separator className="mx-4" />
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
          <div className="px-4 py-4">
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
                    if (isZarEmail) return zarAllowedCustomerSetupIds.has(item.id);
                    if (isZarCompany) return zarAllowedCustomerSetupIds.has(item.id);
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
      </div>
    </>
  );
};
//#endregion

