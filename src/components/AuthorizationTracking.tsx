
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Shield, Clock, CheckCircle, AlertTriangle, Plus, Eye, Edit, Bell, RefreshCw, Calendar, TrendingUp, XCircle, FileText } from "lucide-react";
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
  const { user } = useAuth();

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
      const { data, error } = await supabase
        .from('authorization_requests' as any)
        .select(`
          *,
          insurance_payers (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching authorizations:', error);
        throw error;
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
        
        return {
          id: auth.id,
          authorization_id: auth.id,
          patient: auth.patient_name,
          patientName: auth.patient_name,
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

  useEffect(() => {
    fetchAuthorizations();
    loadExpirationData();
  }, []);

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

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="active">Active Authorizations</TabsTrigger>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          <TabsTrigger value="denied">Denied</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Authorizations</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {authorizations.filter(a => a.status === 'approved' && !a.expired_at).length}
              </div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
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

          <Card>
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

          <Card>
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

          <Card>
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
              <div className="flex items-center justify-between">
                <CardTitle>Active Authorizations</CardTitle>
                <div className="flex space-x-2">
                  <Input placeholder="Search authorizations..." className="w-64" />
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under-review">Under Review</SelectItem>
                    </SelectContent>
                  </Select>
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
                  {/* Debug info - remove in production */}
                  {authorizations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No authorizations found in database.</p>
                      <p className="text-sm mt-2">Create a new authorization to get started.</p>
                    </div>
                  )}
                  {authorizations.length > 0 && authorizations.filter(auth => {
                    const status = auth.status?.toLowerCase() || '';
                    const isApproved = status === 'approved';
                    const isNotExpired = !auth.expired_at;
                    return isApproved && isNotExpired;
                  }).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No active authorizations found.</p>
                      <p className="text-sm mt-2">
                        Found {authorizations.length} authorization(s) with statuses: {[...new Set(authorizations.map(a => a.status || 'null'))].join(', ')}
                      </p>
                      <p className="text-sm mt-1">
                        Active authorizations require: status = "approved" AND expired_at = null
                      </p>
                      {/* Debug: Show approved authorizations that might be filtered out */}
                      {authorizations.filter(a => {
                        const status = a.status?.toLowerCase() || '';
                        return status === 'approved';
                      }).length > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-left">
                          <p className="text-xs font-semibold text-yellow-900 mb-2">Debug Info:</p>
                          <p className="text-xs text-yellow-800">
                            Found {authorizations.filter(a => {
                              const status = a.status?.toLowerCase() || '';
                              return status === 'approved';
                            }).length} approved authorization(s), but they may have expired_at set:
                          </p>
                          <ul className="text-xs text-yellow-700 mt-1 list-disc list-inside">
                            {authorizations.filter(a => {
                              const status = a.status?.toLowerCase() || '';
                              return status === 'approved';
                            }).map(auth => (
                              <li key={auth.id}>
                                {auth.patient || auth.patientName}: expired_at = {auth.expired_at ? new Date(auth.expired_at).toLocaleDateString() : 'null'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="space-y-4">
                    {authorizations.filter(auth => {
                      // Active: approved status AND not expired
                      const status = auth.status?.toLowerCase() || '';
                      return status === 'approved' && !auth.expired_at;
                    }).map((auth) => (
                  <div key={auth.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <Shield className="h-8 w-8 text-blue-500" />
                        <div>
                          <div className="font-semibold">{auth.id}</div>
                          <div className="text-sm text-gray-600">{auth.patient}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(auth.priority)}>{auth.priority}</Badge>
                        <Badge className={getStatusColor(auth.status)}>{auth.status}</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Procedure</div>
                        <div className="font-medium">{auth.procedure}</div>
                        <div className="text-xs text-gray-500">{auth.cptCode}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Payer</div>
                        <div className="font-medium">{auth.payer}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Visits Used</div>
                        <div className="font-medium">{auth.visits.used} / {auth.visits.authorized}</div>
                        {visitStats[auth.id] && (
                          <div className="mt-1">
                            <Progress 
                              value={visitStats[auth.id].usage_percentage} 
                              className="h-2"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {visitStats[auth.id].visits_remaining} remaining
                            </div>
                          </div>
                        )}
                        {auth.visits.remaining !== undefined && auth.visits.remaining <= 3 && auth.visits.remaining > 0 && (
                          <Badge variant="outline" className="mt-1 text-orange-600 border-orange-300">
                            Low visits
                          </Badge>
                        )}
                        {auth.visits.remaining === 0 && (
                          <Badge variant="destructive" className="mt-1">
                            Exhausted
                          </Badge>
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Request Date</div>
                        <div className="font-medium">{auth.requestDate}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Expiry Date</div>
                        <div className="font-medium">{auth.expiryDate || 'Not set'}</div>
                        {auth.expiryDate && (() => {
                          const expiryDate = new Date(auth.expiryDate);
                          const today = new Date();
                          const daysUntil = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          if (daysUntil < 0) {
                            return <Badge variant="destructive" className="mt-1">Expired</Badge>;
                          } else if (daysUntil <= 7) {
                            return <Badge variant="destructive" className="mt-1">{daysUntil} days left</Badge>;
                          } else if (daysUntil <= 30) {
                            return <Badge variant="outline" className="mt-1 text-orange-600 border-orange-300">{daysUntil} days left</Badge>;
                          }
                          return null;
                        })()}
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
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateStatus(auth.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Update Status
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Use Visit button clicked for auth:', auth.id, 'Status:', auth.status, 'Auth object:', auth);
                          handleUseVisit(auth.id);
                        }}
                        disabled={(() => {
                          const status = auth.status?.toLowerCase() || '';
                          const isApproved = status === "approved";
                          const isExpired = !!auth.expired_at;
                          // Calculate visits remaining - if visits_authorized is 0, allow unlimited visits
                          const visitsAuthorized = auth.visits_authorized ?? auth.visits?.authorized ?? auth.units_requested ?? 0;
                          const visitsUsed = auth.visits_used ?? auth.visits?.used ?? 0;
                          const visitsRemaining = visitsAuthorized > 0 ? (visitsAuthorized - visitsUsed) : 999; // If no limit set, allow visits
                          const hasNoVisits = visitsAuthorized > 0 && visitsRemaining <= 0;
                          
                          // Only disable if expired or no visits remaining (allow even if not approved)
                          const shouldDisable = isExpired || hasNoVisits;
                          
                          return shouldDisable;
                        })()}
                        title={
                          auth.expired_at 
                            ? "Authorization has expired"
                            : (auth.visits?.remaining ?? auth.visits_remaining ?? ((auth.visits_authorized ?? 0) - (auth.visits_used ?? 0))) <= 0
                            ? "All visits have been used"
                            : auth.status?.toLowerCase() !== "approved"
                            ? `Record a visit (Status: ${auth.status} - ${auth.visits?.remaining ?? auth.visits_remaining ?? ((auth.visits_authorized ?? 0) - (auth.visits_used ?? 0))} visits remaining)`
                            : `Record a visit (${auth.visits?.remaining ?? auth.visits_remaining ?? ((auth.visits_authorized ?? 0) - (auth.visits_used ?? 0))} visits remaining)`
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Use Visit
                      </Button>
                      {auth.expired_at && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleInitiateRenewal(auth.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Renew
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
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
                <div className="space-y-4">
                  {authorizations.filter(auth => {
                    // Pending: pending or under-review status AND not expired (exclude drafts)
                    const status = auth.status?.toLowerCase() || '';
                    return (status === 'pending' || status === 'under-review') && !auth.expired_at;
                  }).map((auth) => (
                    <div key={auth.id} className="border rounded-lg p-4 bg-yellow-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Clock className="h-8 w-8 text-yellow-500" />
                          <div>
                            <div className="font-semibold">{auth.patient || auth.patientName}</div>
                            <div className="text-sm text-gray-600">{auth.procedure || auth.service_type}</div>
                            <div className="text-xs text-gray-500">Submitted: {auth.requestDate || auth.created_at ? new Date(auth.requestDate || auth.created_at).toLocaleDateString() : 'N/A'}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(auth.priority)}>{auth.priority}</Badge>
                          <Badge className={getStatusColor(auth.status)}>{auth.status}</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDetails(auth.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
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

            {/* Expired */}
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
          </div>
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

      {/* View Details Dialog */}
      {selectedAuth && viewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Authorization Details</h3>
            <div className="space-y-3">
              <div><strong>Patient:</strong> {selectedAuth.patient}</div>
              <div><strong>Procedure:</strong> {selectedAuth.procedure} ({selectedAuth.cptCode})</div>
              <div><strong>Status:</strong> {selectedAuth.status}</div>
              <div><strong>Requested Date:</strong> {selectedAuth.requestDate}</div>
              <div><strong>Expires:</strong> {selectedAuth.expiryDate || 'Not set'}</div>
              <div><strong>Payer:</strong> {selectedAuth.payer}</div>
              {selectedAuth.visits && (
                <>
                  <div><strong>Visits:</strong> {selectedAuth.visits.used} / {selectedAuth.visits.authorized} used</div>
                  <div><strong>Remaining:</strong> {selectedAuth.visits.remaining || 0} visits</div>
                </>
              )}
              {selectedAuth.expired_at && (
                <div className="text-red-600 font-medium">
                  <strong>Status:</strong> EXPIRED on {new Date(selectedAuth.expired_at).toLocaleDateString()}
                </div>
              )}
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
        open={showNewAuthForm}
        authorizationId={selectedAuth?.id}
        onOpenChange={(open) => {
          setShowNewAuthForm(open);
          if (!open) {
            setSelectedAuth(null);
            fetchAuthorizations(); // Refresh when dialog closes
          }
        }}
        onSuccess={() => {
          setSelectedAuth(null);
          fetchAuthorizations(); // Refresh after successful creation/update
          loadExpirationData(); // Refresh expiration data
        }}
      />
    </div>
  );
};

export default AuthorizationTracking;
