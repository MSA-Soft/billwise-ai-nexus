import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Clock, CheckCircle, AlertTriangle, Plus, Eye, Edit, Bell, RefreshCw, Calendar, TrendingUp, XCircle, FileText, Columns3, X, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import AuthorizationWorkflow from "@/components/AuthorizationWorkflow";
import AuthorizationRequestDialog from "@/components/AuthorizationRequestDialog";
import { supabase } from "@/integrations/supabase/client";
import { authorizationTaskService } from "@/services/authorizationTaskService";
import { expirationManagementService, type ExpiringAuthorization, type ExpirationAlert } from "@/services/expirationManagementService";
import { visitUsageService, type VisitUsageStats } from "@/services/visitUsageService";
import { authorizationAuditService } from "@/services/authorizationAuditService";
import { useAuth } from "@/contexts/AuthContext";

const AuthorizationTracking = () => {
  const { toast } = useToast();
  const { user, currentCompany, isSuperAdmin, isAdmin } = useAuth();

  const [selectedAuth, setSelectedAuth] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [showNewAuthForm, setShowNewAuthForm] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [statusNotes, setStatusNotes] = useState<string>("");
  const [authorizations, setAuthorizations] = useState<any[]>([]);
  const [expiringAuthorizations, setExpiringAuthorizations] = useState<ExpiringAuthorization[]>([]);
  const [expiredAuthorizations, setExpiredAuthorizations] = useState<ExpiringAuthorization[]>([]);
  const [expirationAlerts, setExpirationAlerts] = useState<ExpirationAlert[]>([]);
  const [expirationStats, setExpirationStats] = useState<any>(null);
  const [visitStats, setVisitStats] = useState<Record<string, VisitUsageStats>>({});
  const [loading, setLoading] = useState(false);
  const [justApproved, setJustApproved] = useState(false);

  // Date filter state (Year → Month → Time Period)
  const now = new Date();
  const defaultYear = now.getFullYear().toString();
  const defaultMonth = (now.getMonth() + 1).toString().padStart(2, "0");
  const defaultWeek = (Math.floor((now.getDate() - 1) / 7) + 1).toString();

  const [filterYear, setFilterYear] = useState<string>(defaultYear);
  // Default to a wide view so older authorizations don't "disappear" by default.
  const [filterMonth, setFilterMonth] = useState<string>(""); // all months
  const [filterTimePeriod, setFilterTimePeriod] = useState<string>(""); // whole period (no week/day restriction)
  const [filterWeek, setFilterWeek] = useState<string>("all"); // 1-4 when week is selected
  const [filterDay, setFilterDay] = useState<string>(""); // monday-sunday when week/day is selected

  // Status / scope filter for All Authorizations
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "pending" | "applied" | "in_process" | "approved" | "denied"
  >("all");

  // Dynamic column management for Active Authorizations table
  const ACTIVE_ALL_COLUMNS = useMemo(
    () => [
      "S.No",
      "Patient Name",
      "Scheduled Location",
      "Order Date",
      "Type of Visit",
      "Primary Insurance",
      "Secondary Insurance",
      "CPT Code",
      "Prior Auth Required",
      "Prior Authorization Status",
      "Remarks",
      "Comments & Notes",
      "Description",
      "Actions",
    ],
    [],
  );

  // Default: keep the view compact; users can add more via Columns button.
  const ACTIVE_DEFAULT_COLUMNS = useMemo(
    () => [
      "S.No",
      "Patient Name",
      "Scheduled Location",
      "Order Date",
      "Type of Visit",
      "Primary Insurance",
      "CPT Code",
      "Prior Authorization Status",
      "Actions",
    ],
    [],
  );

  const activeColumnsStorageKey = useMemo(() => {
    const uid = user?.id ?? "anon";
    const cid = currentCompany?.id ?? "no_company";
    return `bw_columns:authorization_tracking:active:${uid}:${cid}`;
  }, [user?.id, currentCompany?.id]);

  const normalizeActiveColumns = (cols: unknown): string[] => {
    const list = Array.isArray(cols) ? (cols.filter((c) => typeof c === "string") as string[]) : [];
    const filtered = list.filter((c) => ACTIVE_ALL_COLUMNS.includes(c));
    const unique = Array.from(new Set(filtered));
    // Always show S.No
    if (!unique.includes("S.No")) unique.unshift("S.No");
    // Always show Actions (critical controls)
    if (!unique.includes("Actions")) unique.push("Actions");
    return unique.length > 0 ? unique : ACTIVE_DEFAULT_COLUMNS;
  };

  const [activeVisibleColumns, setActiveVisibleColumns] = useState<string[]>(ACTIVE_DEFAULT_COLUMNS);
  const activeAvailableColumns = useMemo(
    () => ACTIVE_ALL_COLUMNS.filter((c) => !activeVisibleColumns.includes(c)),
    [ACTIVE_ALL_COLUMNS, activeVisibleColumns],
  );

  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);
  const arrayMove = <T,>(arr: T[], from: number, to: number) => {
    const next = arr.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(activeColumnsStorageKey);
      if (!raw) {
        setActiveVisibleColumns(ACTIVE_DEFAULT_COLUMNS);
        return;
      }
      setActiveVisibleColumns(normalizeActiveColumns(JSON.parse(raw)));
    } catch {
      setActiveVisibleColumns(ACTIVE_DEFAULT_COLUMNS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeColumnsStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(activeColumnsStorageKey, JSON.stringify(activeVisibleColumns));
    } catch {
      // ignore
    }
  }, [activeColumnsStorageKey, activeVisibleColumns]);
  const [showActiveColumnSelector, setShowActiveColumnSelector] = useState(false);

  const getActiveColumnHeader = (column: string) => column;

  const getActiveColumnValue = (auth: any, column: string) => {
    switch (column) {
      case "S.No":
        return auth.serialNo || auth.id?.substring(0, 8).toUpperCase() || "—";
      case "Scheduled Location":
        return auth.scheduledLocation || "—";
      case "Order Date":
        return auth.orderDate || "—";
      case "Type of Visit":
        return auth.typeOfVisit || "—";
      case "Patient Name":
        return auth.patientName || auth.patient || "—";
      case "Primary Insurance":
        return auth.primaryInsurance || auth.payer || "—";
      case "CPT Code":
        if (Array.isArray(auth.cptCodes) && auth.cptCodes.length > 0) {
          return auth.cptCodes.join(", ");
        }
        return auth.cptCode || (auth.cpt_codes?.[0] ?? "—");
      case "Description": // legacy support if still present in saved layouts
        return auth.description || "—";
      case "Prior Auth Required":
        return auth.priorAuthRequired
          ? "Yes"
          : "No";
      case "Prior Authorization Status":
        return auth.priorAuthorizationStatus || auth.status || "Pending";
      case "Remarks":
        return auth.remarks || "—";
      case "Secondary Insurance":
        return auth.secondaryInsurance || "—";
      case "Comments & Notes":
        return auth.comments || "—";
      default:
        return "";
    }
  };

  const handleViewDetails = (authId: string) => {
    const auth = authorizations.find(a => a.id === authId);
    if (auth) {
      setSelectedAuth(auth);
      setViewOpen(true);
    }
  };

  const handleUpdateStatus = (authId: string) => {
    const auth = authorizations.find(a => a.id === authId);
    if (auth) {
      setSelectedAuth(auth);
      setUpdateOpen(true);
    }
  };

  const handleUseVisit = async (authId: string) => {
    const auth = authorizations.find(a => a.id === authId);
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Authorization not found",
      });
      return;
    }

    // Check if expired
    if (auth.expired_at) {
      toast({
        variant: "destructive",
        title: "Cannot Use Visit",
        description: "This authorization has expired",
      });
      return;
    }

    // Check visits remaining
    const visitsAuthorized = auth.visits_authorized ?? auth.visits?.authorized ?? auth.units_requested ?? 0;
    const visitsUsed = auth.visits_used ?? auth.visits?.used ?? 0;
    const visitsRemaining = visitsAuthorized > 0 ? (visitsAuthorized - visitsUsed) : 999;
    
    if (visitsAuthorized > 0 && visitsRemaining <= 0) {
      toast({
        variant: "destructive",
        title: "Cannot Use Visit",
        description: "All authorized visits have been used",
      });
      return;
    }

    // Show warning if not approved (but allow it)
    if (auth.status?.toLowerCase() !== "approved") {
      toast({
        title: "Info",
        description: `Recording visit for authorization with status: ${auth.status}. ${visitsRemaining > 0 ? `${visitsRemaining} visits remaining.` : ''}`,
        variant: "default",
      });
    }

    try {
      // Use visitUsageService for validation and recording
      const validation = await visitUsageService.validateVisitUsage(
        authId,
        new Date(),
        auth.cptCode || auth.procedure_codes?.[0]
      );

      if (!validation.can_proceed) {
        toast({
          variant: "destructive",
          title: "Cannot Use Visit",
          description: validation.errors.map(e => e.message).join(', '),
        });
        return;
      }

      // Show warnings if any
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          toast({
            title: "Warning",
            description: warning.message,
            variant: "default",
          });
        });
      }

      // Record visit using service
      if (user?.id) {
        const visitDetails = {
          visit_date: new Date(),
          service_type: auth.procedure || auth.service_type,
          cpt_codes: auth.cptCode ? [auth.cptCode] : (auth.procedure_codes || []),
          status: 'completed' as const,
          notes: 'Manually recorded visit usage',
        };

        await visitUsageService.recordVisitUsage(
          authId,
          visitDetails,
          user.id
        );

        // Log visit usage action
        await authorizationAuditService.logUseVisit(
          authId,
          {
            ...visitDetails,
            visits_remaining: validation.visits_remaining,
            visits_used: auth.visits_used || 0,
            visits_authorized: auth.visits_authorized || 0,
          },
          'Manually recorded visit usage'
        );

        toast({
          title: "Visit Recorded",
          description: `Visit recorded successfully. ${validation.visits_remaining !== undefined ? `${validation.visits_remaining - 1} visits remaining.` : ''}`,
        });

        // Refresh data
        await fetchAuthorizations();
        await loadExpirationData();
        await loadVisitStats(authId);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User not authenticated",
        });
      }
    } catch (error: any) {
      console.error('Error recording visit:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to record visit",
      });
    }
  };

  // Fetch authorizations from database with new fields
  const fetchAuthorizations = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('authorization_requests' as any)
        .select('*');
      
      // Super admins should see everything (RLS permitting).
      if (isSuperAdmin) {
        console.log('👑 Super admin: loading authorizations without company filter');
      } else if (currentCompany?.id) {
        const adminForCompany = isAdmin();
        // For admins, also include legacy/unassigned records (company_id IS NULL) so "everything shows".
        // For non-admin users, keep strict company isolation.
        if (adminForCompany) {
          console.log('🏢 Admin: loading authorizations for company_id + NULL (legacy):', currentCompany.id);
          query = query.or(`company_id.eq.${currentCompany.id},company_id.is.null`);
        } else {
          console.log('🏢 Loading authorizations by company_id:', currentCompany.id);
        query = query.eq('company_id', currentCompany.id);
        }
      } else {
        console.warn('⚠️ No company selected; relying on RLS only for authorizations');
      }
      
      // Query without join to avoid relationship ambiguity
      const { data, error } = await query
        .order('created_at', { ascending: false });
      
      // If we need payer info, fetch it separately or use payer_name_custom field

      if (error) {
        console.error('Error fetching authorizations:', error);
        throw error;
      }

      // Fetch facilities to map facility IDs to names
      const facilityIds = [...new Set((data || []).map((a: any) => a.facility_id).filter(Boolean))];
      const facilityMap = new Map<string, string>();
      if (facilityIds.length > 0) {
        try {
          const { data: facilityData, error: facilityError } = await supabase
            .from('facilities' as any)
            .select('id, name')
            .in('id', facilityIds);
          
          if (!facilityError && facilityData) {
            facilityData.forEach((f: any) => {
              facilityMap.set(f.id, f.name);
            });
          }
        } catch (err) {
          console.warn('Could not fetch facility names:', err);
        }
      }

      // Transform data to match expected format with new fields
      const transformedData = (data || []).map((auth: any) => {
        // Get payer name from custom field or joined insurance_payers table
        const payerName = auth.payer_name_custom || 
                         (auth.insurance_payers?.name) || 
                         'Unknown';
        
        // Use new expiration date field, fallback to service_end_date
        const expirationDate = auth.authorization_expiration_date || auth.service_end_date || '';
        
        // Use new visit tracking fields
        const visitsAuthorized = auth.visits_authorized ?? auth.units_requested ?? 0;
        const visitsUsed = auth.visits_used ?? 0;
        const visitsRemaining = Math.max(0, visitsAuthorized - visitsUsed);
        
        // Get facility name from ID
        const facilityName = auth.facility_name || facilityMap.get(auth.facility_id || '') || '';
        
        return {
          id: auth.id,
          authorization_id: auth.id,
          serialNo: auth.id ? auth.id.substring(0, 8).toUpperCase() : `AUTH-${Date.now().toString().slice(-8)}`,
          scheduledLocation: facilityName || auth.facility_id || '',
          orderDate: auth.service_start_date || auth.created_at ? new Date(auth.service_start_date || auth.created_at).toISOString().split('T')[0] : '',
          typeOfVisit: auth.service_type || '',
          patient: auth.patient_name,
          patientName: auth.patient_name,
          primaryInsurance: payerName,
          description: auth.procedure_description || auth.service_type || '',
          priorAuthRequired: auth.status && auth.status !== 'draft' ? true : false,
          priorAuthorizationStatus: auth.status || 'pending',
          remarks: auth.internal_notes || auth.notes || '',
          secondaryInsurance: auth.secondary_payer_name || '',
          comments: auth.internal_notes || '',
          procedure: auth.service_type,
          cptCode: auth.procedure_codes?.[0] || '',
          payer: payerName,
          requestDate: auth.created_at ? new Date(auth.created_at).toISOString().split('T')[0] : '',
          expiryDate: expirationDate,
          authorization_expiration_date: auth.authorization_expiration_date,
          status: auth.status || 'pending',
          visits: { 
            used: visitsUsed, 
            authorized: visitsAuthorized,
            remaining: visitsRemaining
          },
          visits_authorized: visitsAuthorized,
          visits_used: visitsUsed,
          visits_remaining: visitsRemaining,
          priority: auth.urgency_level || 'Standard',
          expired_at: auth.expired_at,
          renewal_initiated: auth.renewal_initiated || false,
          ...auth
        };
      });

      setAuthorizations(transformedData);
      
      // Load visit stats for each authorization
      for (const auth of transformedData) {
        if (auth.status === 'approved') {
          await loadVisitStats(auth.id);
        }
      }
    } catch (error: any) {
      console.error('Error fetching authorizations:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load authorizations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load expiration data
  const loadExpirationData = async () => {
    try {
      const [expiring, expired, alerts, stats] = await Promise.all([
        expirationManagementService.getExpiringAuthorizations(90),
        expirationManagementService.getExpiredAuthorizations(),
        expirationManagementService.getExpirationAlerts(),
        expirationManagementService.getExpirationStats(),
      ]);

      setExpiringAuthorizations(expiring);
      setExpiredAuthorizations(expired);
      setExpirationAlerts(alerts);
      setExpirationStats(stats);
    } catch (error: any) {
      console.error('Error loading expiration data:', error);
    }
  };

  // Load visit stats for an authorization
  const loadVisitStats = async (authorizationId: string) => {
    try {
      const stats = await visitUsageService.getVisitUsageStats(authorizationId);
      setVisitStats(prev => ({
        ...prev,
        [authorizationId]: stats,
      }));
    } catch (error) {
      // Ignore errors - stats are optional
    }
  };

  // Initiate renewal
  const handleInitiateRenewal = async (authorizationId: string) => {
    if (!user?.id) return;

    try {
      const auth = authorizations.find(a => a.id === authorizationId);
      
      await expirationManagementService.initiateRenewal(authorizationId, {
        userId: user.id,
        notes: 'Renewal initiated from expiration alert',
      });

      // Log renewal action
      await authorizationAuditService.logRenewal(
        authorizationId,
        {
          patient_name: auth?.patient || auth?.patientName,
          expiration_date: auth?.authorization_expiration_date,
          days_until_expiry: auth ? (() => {
            if (!auth.authorization_expiration_date) return null;
            const expDate = new Date(auth.authorization_expiration_date);
            const today = new Date();
            return Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          })() : null,
        },
        'Renewal initiated from expiration alert'
      );

      toast({
        title: "Renewal Initiated",
        description: "Renewal request has been created.",
      });

      // Refresh data
      await fetchAuthorizations();
      await loadExpirationData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to initiate renewal",
      });
    }
  };

  // Fetch once per user/company scope (fixes "blank data" when company loads after initial mount)
  const lastScopeRef = React.useRef<string | null>(null);
  useEffect(() => {
    const scope = `${user?.id ?? 'anon'}:${currentCompany?.id ?? 'no_company'}`;
    if (lastScopeRef.current === scope) return;
    lastScopeRef.current = scope;

    // If user isn't ready yet, don't spam requests.
    if (!user?.id) return;

    fetchAuthorizations();
    loadExpirationData();
  }, [user?.id, currentCompany?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Under Review": return "bg-blue-100 text-blue-800";
      case "Exhausted": return "bg-gray-200 text-gray-800";
      case "Denied": return "bg-red-100 text-red-800";
      case "Expired": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "STAT": return "bg-red-100 text-red-800";
      case "Urgent": return "bg-orange-100 text-orange-800";
      case "Standard": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleNewAuthorization = () => {
    setShowNewAuthForm(true);
  };

  // Calculate expiring authorizations from service data (not expired yet)
  const expiringAuths = expiringAuthorizations.filter(auth => 
    auth.days_until_expiry <= 30 && 
    auth.days_until_expiry >= 0 && 
    !auth.expired_at
  );

  // Controls which view is shown below (Active, Pending, Expiring, Expired, Denied, Analytics)
  const [viewFilter, setViewFilter] = useState<'active' | 'pending' | 'expiring' | 'expired' | 'denied' | 'analytics'>('active');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Authorization Tracking</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Alerts ({expiringAuths.length})
          </Button>
          <Button onClick={handleNewAuthorization} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Authorization
          </Button>
        </div>
      </div>

      <Tabs
        value={viewFilter}
        onValueChange={(value) =>
          setViewFilter(
            value as "active" | "pending" | "expiring" | "expired" | "denied" | "analytics"
          )
        }
        className="space-y-6"
      >
        {/* Filters (Year → Month → Time Period) */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Time Period
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Year filter */}
              <Select
                value={filterYear || "all"}
                onValueChange={(value) => {
                  setFilterYear(value === "all" ? "" : value);
                  setFilterMonth("");
                  setFilterTimePeriod("");
                  setFilterWeek("");
                  setFilterDay("");
                }}
              >
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value={new Date().getFullYear().toString()}>
                    {new Date().getFullYear()}
                  </SelectItem>
                  <SelectItem value={(new Date().getFullYear() - 1).toString()}>
                    {new Date().getFullYear() - 1}
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Month filter (only when year selected) */}
              <Select
                value={filterMonth || "all"}
                onValueChange={(value) => {
                  setFilterMonth(value === "all" ? "" : value);
                  setFilterTimePeriod("");
                  setFilterWeek("");
                  setFilterDay("");
                }}
                disabled={!filterYear}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="01">January</SelectItem>
                  <SelectItem value="02">February</SelectItem>
                  <SelectItem value="03">March</SelectItem>
                  <SelectItem value="04">April</SelectItem>
                  <SelectItem value="05">May</SelectItem>
                  <SelectItem value="06">June</SelectItem>
                  <SelectItem value="07">July</SelectItem>
                  <SelectItem value="08">August</SelectItem>
                  <SelectItem value="09">September</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time period + week (Range) */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Range
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={filterTimePeriod || "all"}
                onValueChange={(value) => {
                  setFilterTimePeriod(value === "all" ? "" : value);
                  if (value !== "week") {
                    setFilterWeek("");
                    setFilterDay("");
                  }
                }}
                disabled={!filterYear || !filterMonth}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Whole Month</SelectItem>
                  <SelectItem value="last15">Last 15 Days</SelectItem>
                  <SelectItem value="week">Week in Month</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterWeek || "all"}
                onValueChange={(value) => setFilterWeek(value === "all" ? "" : value)}
                disabled={!filterYear || !filterMonth || filterTimePeriod !== "week"}
              >
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weeks</SelectItem>
                  <SelectItem value="1">Week 1</SelectItem>
                  <SelectItem value="2">Week 2</SelectItem>
                  <SelectItem value="3">Week 3</SelectItem>
                  <SelectItem value="4">Week 4</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterDay || "all"}
                onValueChange={(value) => setFilterDay(value === "all" ? "" : value)}
                disabled={!filterYear || !filterMonth || filterTimePeriod !== "week"}
              >
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Days</SelectItem>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card
            onClick={() => setViewFilter('active')}
            className={`cursor-pointer transition-shadow ${
              viewFilter === 'active' ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">All Authorizations</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {authorizations.length}
              </div>
              <p className="text-xs text-muted-foreground">Total authorizations</p>
            </CardContent>
          </Card>

          <Card
            onClick={() => setViewFilter('pending')}
            className={`cursor-pointer transition-shadow ${
              viewFilter === 'pending' ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {authorizations.filter(a => a.status === 'pending' || a.status === 'under-review').length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>

          <Card
            onClick={() => setViewFilter('expiring')}
            className={`cursor-pointer transition-shadow ${
              viewFilter === 'expiring' ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring This Month</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {expirationStats?.expiring_this_month || expiringAuths.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {expirationStats?.expiring_this_week || 0} expiring this week
              </p>
            </CardContent>
          </Card>

          <Card
            onClick={() => setViewFilter('expired')}
            className={`cursor-pointer transition-shadow ${
              viewFilter === 'expired' ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {expirationStats?.expired || expiredAuthorizations.length}
              </div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>

          <Card
            onClick={() => setViewFilter('denied')}
            className={`cursor-pointer transition-shadow ${
              viewFilter === 'denied' ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Denied</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {authorizations.filter(a => a.status?.toLowerCase() === 'denied').length}
              </div>
              <p className="text-xs text-muted-foreground">Appeals available</p>
            </CardContent>
          </Card>
        </div>

        {/* Expiration Alerts Banner */}
        {expirationAlerts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-orange-900">Expiration Alerts ({expirationAlerts.length})</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    // Mark alerts as sent
                    for (const alert of expirationAlerts) {
                      await expirationManagementService.markAlertTierSent(alert.authorization_id, alert.alert_tier);
                    }
                    await loadExpirationData();
                  }}
                >
                  Dismiss All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {expirationAlerts.slice(0, 5).map((alert) => {
                  const auth = authorizations.find(a => a.id === alert.authorization_id);
                  return (
                    <div key={alert.authorization_id} className="flex items-center justify-between p-2 bg-white rounded border border-orange-200">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{alert.patient_name}</div>
                        <div className="text-xs text-muted-foreground">{alert.action_required}</div>
                        <div className="text-xs text-muted-foreground">
                          Expires: {new Date(alert.expiration_date).toLocaleDateString()} ({alert.days_until_expiry} days)
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={
                            alert.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            alert.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                            alert.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }
                        >
                          {alert.priority.toUpperCase()}
                        </Badge>
                        {alert.days_until_expiry > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleInitiateRenewal(alert.authorization_id)}
                          >
                            Renew
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle>All Authorizations</CardTitle>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-2 gap-2">
                  <Input placeholder="Search authorizations..." className="w-full md:w-64" />
                  <Select
                    value={statusFilter}
                    onValueChange={(value) =>
                      setStatusFilter(
                        value as
                          | "all"
                          | "active"
                          | "pending"
                          | "applied"
                          | "in_process"
                          | "approved"
                          | "denied"
                      )
                    }
                  >
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Authorizations</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="in_process">In Process</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => setShowActiveColumnSelector(true)}
                    title="Select columns"
                  >
                    <Columns3 className="h-4 w-4" />
                    Columns
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading authorizations...</div>
                </div>
              ) : (
                <>
                  {authorizations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No authorizations found in database.</p>
                      <p className="text-sm mt-2">Create a new authorization to get started.</p>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {activeVisibleColumns.map((col) => (
                            <TableHead
                              key={col}
                              className={col === "S.No" ? "w-[80px]" : col === "Actions" ? "w-[150px]" : undefined}
                            >
                              {getActiveColumnHeader(col)}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {authorizations
                          .filter((auth) => {
                            // Status / scope filter
                            const rawStatus: string = auth.status || "";
                            const normalizedStatus = rawStatus
                              .toLowerCase()
                              .replace(/\s+/g, "_")
                              .replace(/-/g, "_");

                            const isExpired = !!auth.expired_at;

                            switch (statusFilter) {
                              case "active":
                                if (!(normalizedStatus === "approved" && !isExpired)) return false;
                                break;
                              case "pending":
                                if (
                                  !["pending", "under_review"].includes(normalizedStatus)
                                )
                                  return false;
                                break;
                              case "applied":
                                if (!["submitted"].includes(normalizedStatus)) return false;
                                break;
                              case "in_process":
                                if (
                                  ![
                                    "in_process",
                                    "processing",
                                    "under_review",
                                  ].includes(normalizedStatus)
                                )
                                  return false;
                                break;
                              case "approved":
                                if (normalizedStatus !== "approved") return false;
                                break;
                              case "denied":
                                if (normalizedStatus !== "denied") return false;
                                break;
                              case "all":
                              default:
                                break;
                            }

                            // Base date for filtering: orderDate if present, else created_at
                            const baseDateString = auth.orderDate || auth.created_at;
                            if (!baseDateString) return !filterYear && !filterMonth && !filterTimePeriod;
                            const d = new Date(baseDateString);
                            if (Number.isNaN(d.getTime())) return !filterYear && !filterMonth && !filterTimePeriod;

                            const year = d.getFullYear().toString();
                            const month = (d.getMonth() + 1).toString().padStart(2, "0");

                            // Year / month checks
                            if (filterYear && year !== filterYear) return false;
                            if (filterMonth && month !== filterMonth) return false;

                            if (!filterTimePeriod) return true; // whole month

                            const today = new Date();
                            const onlyDate = (date: Date) =>
                              new Date(date.getFullYear(), date.getMonth(), date.getDate());
                            const diffDays = Math.floor(
                              (onlyDate(today).getTime() - onlyDate(d).getTime()) / (1000 * 60 * 60 * 24)
                            );

                            switch (filterTimePeriod) {
                              case "last15":
                                return diffDays >= 0 && diffDays <= 15;
                              case "today":
                                return onlyDate(d).getTime() === onlyDate(today).getTime();
                              case "yesterday": {
                                const y = new Date(today);
                                y.setDate(y.getDate() - 1);
                                return onlyDate(d).getTime() === onlyDate(y).getTime();
                              }
                              case "tomorrow": {
                                const t = new Date(today);
                                t.setDate(t.getDate() + 1);
                                return onlyDate(d).getTime() === onlyDate(t).getTime();
                              }
                              case "week": {
                                // Week number within the month (1–4) based on day-of-month
                                const weekNumber = Math.floor((d.getDate() - 1) / 7) + 1;
                                if (filterWeek && filterWeek !== "all" && weekNumber.toString() !== filterWeek) {
                                  return false;
                                }
                                if (filterDay && filterDay !== "all") {
                                  const dayNames = [
                                    "sunday",
                                    "monday",
                                    "tuesday",
                                    "wednesday",
                                    "thursday",
                                    "friday",
                                    "saturday",
                                  ];
                                  const dayName = dayNames[d.getDay()];
                                  return dayName === filterDay;
                                }
                                return true;
                              }
                              default:
                                return true;
                            }
                          })
                          .map((auth, rowIndex) => (
                          <TableRow key={auth.id}>
                            {activeVisibleColumns.map((col) => {
                              if (col === "Actions") {
                                return (
                                  <TableCell key={`${auth.id}-${col}`}>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewDetails(auth.id)}
                                  title="View Details"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAuth(auth);
                                    setShowNewAuthForm(true);
                                  }}
                                  title="Edit"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleUseVisit(auth.id);
                                  }}
                                  disabled={(() => {
                                          const status = auth.status?.toLowerCase() || "";
                                    const isExpired = !!auth.expired_at;
                                          const visitsAuthorized =
                                            auth.visits_authorized ??
                                            auth.visits?.authorized ??
                                            auth.units_requested ??
                                            0;
                                          const visitsUsed =
                                            auth.visits_used ?? auth.visits?.used ?? 0;
                                          const visitsRemaining =
                                            visitsAuthorized > 0
                                              ? visitsAuthorized - visitsUsed
                                              : 999;
                                          const hasNoVisits =
                                            visitsAuthorized > 0 && visitsRemaining <= 0;
                                    return isExpired || hasNoVisits;
                                  })()}
                                  title="Use Visit"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                                );
                              }

                              if (col === "S.No") {
                                return (
                                  <TableCell key={`${auth.id}-${col}`} className="font-medium">
                                    {String(rowIndex + 1).padStart(3, "0")}
                            </TableCell>
                                );
                              }

                              const value = getActiveColumnValue(auth, col);

                              if (col === "Prior Auth Required") {
                                return (
                                  <TableCell key={`${auth.id}-${col}`}>
                                    {auth.priorAuthRequired ? (
                                      <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700"
                                      >
                                        Yes
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="bg-gray-50 text-gray-700"
                                      >
                                        No
                                      </Badge>
                                    )}
                                  </TableCell>
                                );
                              }

                              if (col === "Prior Authorization Status") {
                                return (
                                  <TableCell key={`${auth.id}-${col}`}>
                                    <Badge
                                      className={getStatusColor(
                                        auth.priorAuthorizationStatus || auth.status
                                      )}
                                    >
                                      {auth.priorAuthorizationStatus ||
                                        auth.status ||
                                        "Pending"}
                                    </Badge>
                                  </TableCell>
                                );
                              }

                              const isDescription = col === "Description" || col === "Comments & Notes" || col === "Remarks";
                              const title =
                                col === "Description"
                                  ? auth.description
                                  : col === "Comments & Notes"
                                  ? auth.comments
                                  : col === "Remarks"
                                  ? auth.remarks
                                  : undefined;

                              return (
                                <TableCell
                                  key={`${auth.id}-${col}`}
                                  className={
                                    isDescription ? "max-w-[200px] truncate" : undefined
                                  }
                                  title={isDescription ? title : undefined}
                                >
                                  {value}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          {/* Draft Authorizations - Need to be submitted */}
          {authorizations.filter(auth => {
            const status = auth.status?.toLowerCase() || '';
            return status === 'draft' && !auth.expired_at;
          }).length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <CardTitle>Draft Authorizations - Ready to Submit</CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-blue-100">
                    {authorizations.filter(a => a.status?.toLowerCase() === 'draft').length} Draft(s)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {authorizations.filter(auth => {
                    const status = auth.status?.toLowerCase() || '';
                    return status === 'draft' && !auth.expired_at;
                  }).map((auth) => (
                    <div key={auth.id} className="border rounded-lg p-4 bg-white border-blue-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <FileText className="h-8 w-8 text-blue-500" />
                          <div>
                            <div className="font-semibold">{auth.patient || auth.patientName}</div>
                            <div className="text-sm text-gray-600">{auth.procedure || auth.service_type}</div>
                            <div className="text-xs text-gray-500">Created: {auth.requestDate || auth.created_at ? new Date(auth.requestDate || auth.created_at).toLocaleDateString() : 'N/A'}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">DRAFT</Badge>
                          <Badge className={getPriorityColor(auth.priority)}>{auth.priority}</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-600">Payer</div>
                          <div className="font-medium">{auth.payer || 'Not specified'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">CPT Code</div>
                          <div className="font-medium">{auth.cptCode || auth.procedure_codes?.[0] || 'Not specified'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Service Date</div>
                          <div className="font-medium">{auth.requestDate || 'Not set'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Status</div>
                          <div className="font-medium text-blue-600">Ready to Submit</div>
                        </div>
                      </div>

                      <div className="flex space-x-2 flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(auth.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedAuth(auth);
                            setShowNewAuthForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={async () => {
                            try {
                              // Get old status for audit log
                              const oldStatus = auth.status || 'draft';

                              // Update status from draft to pending (submitted)
                              const { error } = await supabase
                                .from('authorization_requests' as any)
                                .update({
                                  status: 'pending',
                                  updated_at: new Date().toISOString(),
                                })
                                .eq('id', auth.id);

                              if (error) throw error;

                              // Log submission action
                              await authorizationAuditService.logSubmit(
                                auth.id,
                                oldStatus,
                                `Authorization submitted to payer for ${auth.patient || auth.patientName}`
                              );

                              toast({
                                title: "Authorization Submitted",
                                description: `Authorization request for ${auth.patient || auth.patientName} has been submitted to payer.`,
                              });

                              // Refresh data
                              await fetchAuthorizations();
                            } catch (error: any) {
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description: error.message || "Failed to submit authorization",
                              });
                            }
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Submit to Payer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending / Under Review Authorizations - Awaiting payer response */}
          {authorizations.filter(auth => {
            const status = auth.status?.toLowerCase() || '';
            return (status === 'pending' || status === 'under-review') && !auth.expired_at;
          }).length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <CardTitle>Pending Authorizations - Awaiting Payer Response</CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100">
                    {authorizations.filter(a => {
                      const status = a.status?.toLowerCase() || '';
                      return (status === 'pending' || status === 'under-review') && !a.expired_at;
                    }).length} Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {authorizations.filter(auth => {
                    const status = auth.status?.toLowerCase() || '';
                    return (status === 'pending' || status === 'under-review') && !auth.expired_at;
                  }).map((auth) => (
                    <div key={auth.id} className="border rounded-lg p-4 bg-white border-yellow-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <Clock className="h-8 w-8 text-yellow-500" />
                          <div>
                            <div className="font-semibold">{auth.patient || auth.patientName}</div>
                            <div className="text-sm text-gray-600">{auth.procedure || auth.service_type}</div>
                            <div className="text-xs text-gray-500">
                              Created: {auth.requestDate || auth.created_at ? new Date(auth.requestDate || auth.created_at).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                            {auth.status?.toUpperCase() || 'PENDING'}
                          </Badge>
                          <Badge className={getPriorityColor(auth.priority)}>{auth.priority}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-600">Payer</div>
                          <div className="font-medium">{auth.payer || auth.primaryInsurance || 'Not specified'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">CPT Code</div>
                          <div className="font-medium">
                            {auth.cptCode || auth.procedure_codes?.[0] || (Array.isArray(auth.cpt_codes) ? auth.cpt_codes[0] : '') || 'Not specified'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Service Date</div>
                          <div className="font-medium">
                            {auth.service_start_date || auth.requestDate || (auth.created_at ? new Date(auth.created_at).toLocaleDateString() : 'Not set')}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Status</div>
                          <div className="font-medium text-yellow-700">
                            {auth.status === 'under-review' ? 'Under Review' : 'Pending with Payer'}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(auth.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAuth(auth);
                            setShowNewAuthForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit / Update
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending/Under Review Authorizations */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Authorization Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {authorizations.filter(auth => {
                const status = auth.status?.toLowerCase() || '';
                return (status === 'pending' || status === 'under-review') && !auth.expired_at;
              }).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No pending authorization requests.</p>
                  <p className="text-sm mt-2">Submitted authorizations awaiting payer response will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">S.No</TableHead>
                        <TableHead>Scheduled Location</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Type of Visit</TableHead>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Primary Insurance</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Prior Auth Required</TableHead>
                        <TableHead>Prior Authorization Status</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead>Secondary Insurance</TableHead>
                        <TableHead>Comments & Notes</TableHead>
                        <TableHead className="w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {authorizations.filter(auth => {
                        // Pending: pending or under-review status AND not expired (exclude drafts)
                        const status = auth.status?.toLowerCase() || '';
                        return (status === 'pending' || status === 'under-review') && !auth.expired_at;
                      }).map((auth) => (
                        <TableRow key={auth.id}>
                          <TableCell className="font-medium">{auth.serialNo || auth.id?.substring(0, 8).toUpperCase() || '—'}</TableCell>
                          <TableCell>{auth.scheduledLocation || '—'}</TableCell>
                          <TableCell>{auth.orderDate || '—'}</TableCell>
                          <TableCell>{auth.typeOfVisit || '—'}</TableCell>
                          <TableCell className="font-medium">{auth.patientName || auth.patient || '—'}</TableCell>
                          <TableCell>{auth.primaryInsurance || auth.payer || '—'}</TableCell>
                          <TableCell className="max-w-[200px] truncate" title={auth.description}>{auth.description || '—'}</TableCell>
                          <TableCell>
                            {auth.priorAuthRequired ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700">Yes</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-700">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(auth.priorAuthorizationStatus || auth.status)}>
                              {auth.priorAuthorizationStatus || auth.status || 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate" title={auth.remarks}>{auth.remarks || '—'}</TableCell>
                          <TableCell>{auth.secondaryInsurance || '—'}</TableCell>
                          <TableCell className="max-w-[200px] truncate" title={auth.comments}>{auth.comments || '—'}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(auth.id)}
                                title="View Details"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedAuth(auth);
                                  setShowNewAuthForm(true);
                                }}
                                title="Edit"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expiring Soon */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <CardTitle>Expiring Soon (30 days)</CardTitle>
                  </div>
                  <Badge variant="outline">{expiringAuths.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {expiringAuths.length > 0 ? (
                  <div className="space-y-3">
                    {expiringAuths.map((auth) => {
                      const authData = authorizations.find(a => a.id === auth.id);
                      return (
                        <div key={auth.id} className="border rounded-lg p-3 bg-orange-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-sm">{auth.patient_name}</div>
                              <div className="text-xs text-gray-600">{auth.service_type}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant="outline" 
                                  className={
                                    auth.days_until_expiry <= 7 ? 'text-red-600 border-red-300' :
                                    auth.days_until_expiry <= 14 ? 'text-orange-600 border-orange-300' :
                                    'text-yellow-600 border-yellow-300'
                                  }
                                >
                                  {auth.days_until_expiry} days left
                                </Badge>
                                {auth.visits_remaining !== undefined && (
                                  <span className="text-xs text-muted-foreground">
                                    {auth.visits_remaining} visits remaining
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleInitiateRenewal(auth.id)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Renew
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No authorizations expiring in the next 30 days.</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="expired" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <CardTitle>Expired Authorizations</CardTitle>
                </div>
                <Badge variant="destructive">{expiredAuthorizations.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {expiredAuthorizations.length > 0 ? (
                <div className="space-y-3">
                  {expiredAuthorizations.map((auth) => {
                    const authData = authorizations.find(a => a.id === auth.id);
                    return (
                      <div key={auth.id} className="border rounded-lg p-3 bg-red-50 border-red-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{auth.patient_name}</div>
                            <div className="text-xs text-gray-600">{auth.service_type}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="destructive">EXPIRED</Badge>
                              <span className="text-xs text-muted-foreground">
                                Expired {Math.abs(auth.days_until_expiry)} days ago
                              </span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Create new authorization from expired one
                              const expiredAuth = authorizations.find(a => a.id === auth.id);
                              if (expiredAuth) {
                                setSelectedAuth(expiredAuth);
                                setShowNewAuthForm(true);
                              }
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            New Auth
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No expired authorizations.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="denied" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Denied Authorizations</CardTitle>
                <Badge variant="destructive">
                  {authorizations.filter(a => a.status?.toLowerCase() === 'denied').length} Denied
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {authorizations.filter(auth => {
                const status = auth.status?.toLowerCase() || '';
                return status === 'denied';
              }).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <XCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No denied authorizations found.</p>
                  <p className="text-sm mt-2">Denied authorizations will appear here for appeal management.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {authorizations.filter(auth => {
                    const status = auth.status?.toLowerCase() || '';
                    return status === 'denied';
                  }).map((auth) => (
                    <div key={auth.id} className="border rounded-lg p-4 bg-red-50 border-red-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <XCircle className="h-8 w-8 text-red-500" />
                          <div>
                            <div className="font-semibold">{auth.patient || auth.patientName}</div>
                            <div className="text-sm text-gray-600">{auth.procedure || auth.service_type}</div>
                            <div className="text-xs text-gray-500">Denied: {auth.requestDate || auth.created_at ? new Date(auth.requestDate || auth.created_at).toLocaleDateString() : 'N/A'}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="destructive">DENIED</Badge>
                          <Badge className={getPriorityColor(auth.priority)}>{auth.priority}</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-600">Payer</div>
                          <div className="font-medium">{auth.payer || 'Unknown'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">CPT Code</div>
                          <div className="font-medium">{auth.cptCode || auth.procedure_codes?.[0] || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Request Date</div>
                          <div className="font-medium">{auth.requestDate || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Denial Reason</div>
                          <div className="font-medium text-red-600">{auth.denial_reason || 'Not specified'}</div>
                        </div>
                      </div>

                      <div className="flex space-x-2 flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(auth.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedAuth(auth);
                            setShowNewAuthForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit & Resubmit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUpdateStatus(auth.id)}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Appeal
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authorization Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart showing authorization trends over time would be displayed here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Approval Rate by Payer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Medicare</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                      <span className="text-sm font-medium">95%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>BCBS</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                      <span className="text-sm font-medium">88%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Aetna</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                      <span className="text-sm font-medium">82%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cigna</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '79%' }}></div>
                      </div>
                      <span className="text-sm font-medium">79%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Active Authorizations Column Selector */}
      <Dialog open={showActiveColumnSelector} onOpenChange={setShowActiveColumnSelector}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Select Columns</DialogTitle>
            <DialogDescription>
              Choose which columns to display in the Active Authorizations table.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 py-4">
            {/* Available Columns */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Available Columns</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {activeAvailableColumns.length === 0 && (
                  <p className="text-sm text-muted-foreground">No more columns to add.</p>
                )}
                {activeAvailableColumns.map((column) => (
                  <div
                    key={column}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-gray-900">{getActiveColumnHeader(column)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        setActiveVisibleColumns([...activeVisibleColumns, column]);
                      }}
                    >
                      <Plus className="h-4 w-4 text-gray-600" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Visible Columns */}
            <div>
              <h3 className="text-lg font-semibold mb-1 text-gray-900">Visible Columns</h3>
              <p className="text-xs text-muted-foreground mb-2">Drag to reorder. “S.No” is always shown.</p>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {activeVisibleColumns.map((column, idx) => (
                  <div
                    key={column}
                    className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    draggable
                    onDragStart={(e) => {
                      setActiveDragIndex(idx);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(idx));
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = activeDragIndex ?? Number(e.dataTransfer.getData("text/plain"));
                      if (!Number.isFinite(from) || from === idx) return;
                      setActiveVisibleColumns((prev) => arrayMove(prev, from, idx));
                      setActiveDragIndex(null);
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-gray-900 truncate">{getActiveColumnHeader(column)}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                        disabled={idx === 0}
                        onClick={() => setActiveVisibleColumns((prev) => arrayMove(prev, idx, idx - 1))}
                        title="Move up"
                      >
                        <ChevronUp className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        disabled={idx === activeVisibleColumns.length - 1}
                        onClick={() => setActiveVisibleColumns((prev) => arrayMove(prev, idx, idx + 1))}
                        title="Move down"
                      >
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        disabled={column === "S.No" || column === "Actions"}
                      onClick={() => {
                          if (column === "S.No" || column === "Actions") return;
                        if (activeVisibleColumns.length === 1) return;
                          setActiveVisibleColumns(activeVisibleColumns.filter((c) => c !== column));
                        }}
                        title={
                          column === "S.No"
                            ? "S.No is always visible"
                            : column === "Actions"
                              ? "Actions is always visible"
                              : "Remove"
                        }
                    >
                      <X className="h-4 w-4 text-gray-600" />
                    </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={() => setShowActiveColumnSelector(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      {selectedAuth && viewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Authorization Details - Complete Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Information */}
              <div className="space-y-3 border-b pb-4">
                <h4 className="font-semibold text-blue-600">Patient Information</h4>
                <div><strong>Patient Name:</strong> {selectedAuth.patient || selectedAuth.patient_name || 'N/A'}</div>
                <div><strong>Patient ID:</strong> {selectedAuth.patient_id || 'N/A'}</div>
                <div><strong>Patient DOB:</strong> {selectedAuth.patient_dob ? new Date(selectedAuth.patient_dob).toLocaleDateString() : 'N/A'}</div>
                <div><strong>Patient Member ID:</strong> {selectedAuth.patient_member_id || 'N/A'}</div>
              </div>

              {/* Payer Information */}
              <div className="space-y-3 border-b pb-4">
                <h4 className="font-semibold text-blue-600">Insurance Information</h4>
                <div><strong>Primary Payer:</strong> {selectedAuth.payer || selectedAuth.payer_name_custom || 'N/A'}</div>
                <div><strong>Payer ID:</strong> {selectedAuth.payer_id || 'N/A'}</div>
                <div><strong>Secondary Payer:</strong> {selectedAuth.secondary_payer_name || selectedAuth.secondaryInsurance || 'N/A'}</div>
                <div><strong>Secondary Payer ID:</strong> {selectedAuth.secondary_payer_id || 'N/A'}</div>
              </div>

              {/* Service Information */}
              <div className="space-y-3 border-b pb-4">
                <h4 className="font-semibold text-blue-600">Service Information</h4>
                <div><strong>Service Type:</strong> {selectedAuth.service_type || selectedAuth.procedure || 'N/A'}</div>
                <div><strong>Type of Visit:</strong> {selectedAuth.type_of_visit || selectedAuth.service_type || 'N/A'}</div>
                <div><strong>Procedure Description:</strong> {selectedAuth.procedure_description || selectedAuth.description || 'N/A'}</div>
                <div><strong>CPT Codes:</strong> {selectedAuth.procedure_codes && Array.isArray(selectedAuth.procedure_codes) ? selectedAuth.procedure_codes.join(', ') : (selectedAuth.cptCode || 'N/A')}</div>
                <div><strong>Diagnosis Codes:</strong> {selectedAuth.diagnosis_codes && Array.isArray(selectedAuth.diagnosis_codes) ? selectedAuth.diagnosis_codes.join(', ') : 'N/A'}</div>
                <div><strong>Clinical Indication:</strong> {selectedAuth.clinical_indication || 'N/A'}</div>
                <div><strong>Service Start Date:</strong> {selectedAuth.service_start_date ? new Date(selectedAuth.service_start_date).toLocaleDateString() : (selectedAuth.orderDate || selectedAuth.requestDate || 'N/A')}</div>
                <div><strong>Service End Date:</strong> {selectedAuth.service_end_date ? new Date(selectedAuth.service_end_date).toLocaleDateString() : 'N/A'}</div>
              </div>

              {/* Authorization Details */}
              <div className="space-y-3 border-b pb-4">
                <h4 className="font-semibold text-blue-600">Authorization Details</h4>
                <div><strong>Authorization ID:</strong> {selectedAuth.id || selectedAuth.authorization_id || 'N/A'}</div>
                <div><strong>Serial Number:</strong> {selectedAuth.serialNo || selectedAuth.id?.substring(0, 8).toUpperCase() || 'N/A'}</div>
                <div><strong>Status:</strong> {selectedAuth.status || 'N/A'}</div>
                <div><strong>Review Status:</strong> {selectedAuth.review_status || 'N/A'}</div>
                <div><strong>Authorization Number:</strong> {selectedAuth.auth_number || selectedAuth.prior_auth_number || 'N/A'}</div>
                <div><strong>Authorization Type:</strong> {selectedAuth.authorization_type || 'prior'}</div>
                <div><strong>Urgency Level:</strong> {selectedAuth.urgency_level || selectedAuth.priority || 'Standard'}</div>
                <div><strong>Requested Date:</strong> {selectedAuth.requestDate || (selectedAuth.created_at ? new Date(selectedAuth.created_at).toLocaleDateString() : 'N/A')}</div>
                <div><strong>Expiration Date:</strong> {selectedAuth.expiryDate || (selectedAuth.authorization_expiration_date ? new Date(selectedAuth.authorization_expiration_date).toLocaleDateString() : 'Not set')}</div>
              {selectedAuth.expired_at && (
                <div className="text-red-600 font-medium">
                    <strong>Expired:</strong> {new Date(selectedAuth.expired_at).toLocaleDateString()}
                </div>
              )}
              </div>

              {/* Visit Information */}
              <div className="space-y-3 border-b pb-4">
                <h4 className="font-semibold text-blue-600">Visit Information</h4>
                {selectedAuth.visits && (
                  <>
                    <div><strong>Visits Authorized:</strong> {selectedAuth.visits.authorized || selectedAuth.visits_authorized || 0}</div>
                    <div><strong>Visits Used:</strong> {selectedAuth.visits.used || selectedAuth.visits_used || 0}</div>
                    <div><strong>Visits Remaining:</strong> {selectedAuth.visits.remaining || selectedAuth.visits_remaining || 0}</div>
                  </>
                )}
                <div><strong>Units Requested:</strong> {selectedAuth.units_requested || 'N/A'}</div>
              {visitStats[selectedAuth.id] && (
                <div className="mt-2">
                  <div className="text-sm font-medium mb-1">Visit Usage</div>
                  <Progress value={visitStats[selectedAuth.id].usage_percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {visitStats[selectedAuth.id].usage_percentage}% used
                  </div>
                </div>
              )}
              </div>

              {/* Facility & Provider Information */}
              <div className="space-y-3 border-b pb-4">
                <h4 className="font-semibold text-blue-600">Facility & Provider</h4>
                <div><strong>Facility:</strong> {selectedAuth.facility_name || selectedAuth.scheduledLocation || 'N/A'}</div>
                <div><strong>Facility ID:</strong> {selectedAuth.facility_id || 'N/A'}</div>
                <div><strong>Provider Name:</strong> {selectedAuth.provider_name_custom || 'N/A'}</div>
                <div><strong>Provider NPI:</strong> {selectedAuth.provider_npi_custom || 'N/A'}</div>
                <div><strong>Scheduled Location:</strong> {selectedAuth.scheduled_location || selectedAuth.scheduledLocation || 'N/A'}</div>
              </div>

              {/* Submission & Tracking */}
              <div className="space-y-3 border-b pb-4">
                <h4 className="font-semibold text-blue-600">Submission & Tracking</h4>
                <div><strong>Submission Reference:</strong> {selectedAuth.submission_ref || 'N/A'}</div>
                <div><strong>Acknowledgment Status:</strong> {selectedAuth.ack_status || 'N/A'}</div>
                <div><strong>Prior Auth Required:</strong> {selectedAuth.pa_required !== undefined ? (selectedAuth.pa_required ? 'Yes' : 'No') : (selectedAuth.priorAuthRequired ? 'Yes' : 'No')}</div>
                <div><strong>Renewal Initiated:</strong> {selectedAuth.renewal_initiated ? 'Yes' : 'No'}</div>
                <div><strong>Created At:</strong> {selectedAuth.created_at ? new Date(selectedAuth.created_at).toLocaleString() : 'N/A'}</div>
                <div><strong>Updated At:</strong> {selectedAuth.updated_at ? new Date(selectedAuth.updated_at).toLocaleString() : 'N/A'}</div>
              </div>

              {/* Notes & Remarks */}
              <div className="space-y-3 border-b pb-4 md:col-span-2">
                <h4 className="font-semibold text-blue-600">Notes & Remarks</h4>
                <div><strong>Internal Notes:</strong> {selectedAuth.internal_notes || selectedAuth.remarks || selectedAuth.comments || 'N/A'}</div>
                <div><strong>Order Date:</strong> {selectedAuth.orderDate || (selectedAuth.order_date ? new Date(selectedAuth.order_date).toLocaleDateString() : 'N/A')}</div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => {
                setViewOpen(false);
                setSelectedAuth(null);
              }}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Dialog */}
      {selectedAuth && updateOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Update Authorization Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Textarea 
                  placeholder="Add update notes for this patient..." 
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            {/* Show Use Visit button if status was just updated to approved */}
            {justApproved && selectedAuth && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-900 mb-3 font-medium">
                  ✓ Authorization is now approved. You can record a visit now.
                </p>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 w-full"
                  onClick={async () => {
                    const authId = selectedAuth.id || selectedAuth.authorization_id;
                    if (authId) {
                      await handleUseVisit(authId);
                      await fetchAuthorizations();
                      setJustApproved(false);
                      setUpdateOpen(false);
                      setSelectedAuth(null);
                    }
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Use Visit Now
                </Button>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
                setJustApproved(false);
                setUpdateOpen(false);
                setSelectedAuth(null);
                setNewStatus("");
                setStatusNotes("");
              }}>Cancel</Button>
              <Button onClick={async () => {
                if (!newStatus) {
                  toast({
                    title: "Error",
                    description: "Please select a status",
                    variant: "destructive",
                  });
                  return;
                }

                try {
                  // Update authorization status in database
                  const authId = selectedAuth.id || selectedAuth.authorization_id;
                  if (authId) {
                    const oldStatus = selectedAuth.status || 'unknown';

                    const { error: updateError } = await supabase
                      .from('authorization_requests' as any)
                      .update({
                        status: newStatus,
                        updated_at: new Date().toISOString(),
                      })
                      .eq('id', authId);

                    if (updateError) throw updateError;

                    // Log status change action
                    await authorizationAuditService.logStatusChange(
                      authId,
                      oldStatus,
                      newStatus,
                      `Status changed from ${oldStatus} to ${newStatus}`,
                      statusNotes || undefined,
                      {
                        patient_name: selectedAuth.patient || selectedAuth.patientName,
                        payer_name: selectedAuth.payer,
                        service_type: selectedAuth.procedure || selectedAuth.service_type,
                      }
                    );

                    // Create task for this status update
                    if (user?.id) {
                      const taskType = newStatus === 'approved' ? 'follow_up' : 
                                     newStatus === 'denied' ? 'appeal' : 
                                     newStatus === 'under-review' ? 'review' : 'follow_up';
                      
                      await authorizationTaskService.createTaskFromAuthRequest(
                        authId,
                        taskType,
                        {
                          userId: user.id,
                          priority: newStatus === 'denied' ? 'urgent' : 'medium',
                          title: `Authorization ${newStatus} - ${selectedAuth.patient || selectedAuth.patientName}`,
                          description: statusNotes || `Authorization status updated to ${newStatus} for patient ${selectedAuth.patient || selectedAuth.patientName}`,
                        }
                      );

                      // Add notes as a comment if provided
                      if (statusNotes) {
                        // Get the task we just created
                        const tasks = await authorizationTaskService.getTasks({}, user.id);
                        const latestTask = tasks.find(t => t.authorization_request_id === authId);
                        if (latestTask) {
                          await authorizationTaskService.addComment(
                            latestTask.id,
                            `Status Update Notes: ${statusNotes}`,
                            user.id,
                            false
                          );
                        }
                      }
                    }
                  }

                  // Update selectedAuth status to reflect the change
                  const updatedAuth = { ...selectedAuth, status: newStatus };
                  setSelectedAuth(updatedAuth);
                  
                  // Refresh authorizations list
                  await fetchAuthorizations();
                  
                  // Show success message
                  toast({
                    title: "Status Updated",
                    description: `Authorization status updated for ${selectedAuth.patient || selectedAuth.patientName}.`,
                  });
                  
                  // If status is approved, keep dialog open and show "Use Visit" button
                  if (newStatus === 'approved') {
                    // Clear the form but keep dialog open to show Use Visit button
                    setJustApproved(true);
                    setNewStatus("");
                    setStatusNotes("");
                  } else {
                    setJustApproved(false);
                    setUpdateOpen(false);
                    setSelectedAuth(null);
                    setNewStatus("");
                    setStatusNotes("");
                  }
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.message || "Failed to update status",
                    variant: "destructive",
                  });
                }
              }}>Update</Button>
            </div>
          </div>
        </div>
      )}

      {/* New/Edit Authorization Form */}
      <AuthorizationRequestDialog
        key={selectedAuth?.id || 'new'} // Force remount when authorizationId changes
        open={showNewAuthForm}
        authorizationId={selectedAuth?.id}
        onOpenChange={(open) => {
          setShowNewAuthForm(open);
          if (!open) {
            setSelectedAuth(null);
            fetchAuthorizations(); // Refresh when dialog closes
          }
        }}
        onSuccess={(newAuthId) => {
          // If a new authorization was created, set it as selected so user can see/edit it
          if (newAuthId && !selectedAuth?.id) {
            // Find the newly created authorization in the list
            fetchAuthorizations().then(() => {
              // The new auth will be in the list, user can edit it
            });
          } else {
            setSelectedAuth(null);
          }
          fetchAuthorizations(); // Refresh after successful creation/update
          loadExpirationData(); // Refresh expiration data
        }}
      />
    </div>
  );
};

export default AuthorizationTracking;
