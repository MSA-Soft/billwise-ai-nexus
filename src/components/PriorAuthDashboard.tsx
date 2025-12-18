import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, FileText, Columns3, X, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AuthorizationRequestDialog from "./AuthorizationRequestDialog";

const PriorAuthDashboard = () => {
  const { user, currentCompany, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [authorizations, setAuthorizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [selectedAuth, setSelectedAuth] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    denied: 0,
    approvalRate: 0
  });
  const { toast } = useToast();

  // Dynamic column management for authorization list (order + visibility)
  const DEFAULT_COLUMNS = useMemo(
    () => ["S.No", "Patient", "Payer", "Service", "Requested Date", "Status", "AI Score", "Auth Number", "Actions"],
    [],
  );

  const ALL_COLUMNS = useMemo(
    () => [...DEFAULT_COLUMNS, "Urgency", "Review Status", "Submission Ref"],
    [DEFAULT_COLUMNS],
  );

  const storageKey = useMemo(() => {
    const uid = user?.id ?? "anon";
    const cid = currentCompany?.id ?? "no_company";
    return `bw_columns:prior_auth_dashboard:${uid}:${cid}`;
  }, [user?.id, currentCompany?.id]);

  const normalizeColumns = (cols: unknown): string[] => {
    const list = Array.isArray(cols) ? (cols.filter((c) => typeof c === "string") as string[]) : [];
    const filtered = list.filter((c) => ALL_COLUMNS.includes(c));
    const unique = Array.from(new Set(filtered));
    // Always show S.No
    if (!unique.includes("S.No")) unique.unshift("S.No");
    return unique.length > 0 ? unique : DEFAULT_COLUMNS;
  };

  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const availableColumns = useMemo(
    () => ALL_COLUMNS.filter((c) => !visibleColumns.includes(c)),
    [ALL_COLUMNS, visibleColumns],
  );

  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setVisibleColumns(DEFAULT_COLUMNS);
        return;
      }
      setVisibleColumns(normalizeColumns(JSON.parse(raw)));
    } catch {
      setVisibleColumns(DEFAULT_COLUMNS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(visibleColumns));
    } catch {
      // ignore
    }
  }, [storageKey, visibleColumns]);

  const arrayMove = <T,>(arr: T[], from: number, to: number) => {
    const next = arr.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  };

  const handleAIAnalysis = async () => {
    try {
      toast({
        title: "AI Analysis in Progress",
        description: "Analyzing authorization requests...",
      });

      // Import AI service
      const { aiService } = await import('@/services/aiService');
      
      // Analyze pending requests
      const pendingRequests = authorizations.filter(a => a.status === 'pending' || a.status === 'submitted');
      
      if (pendingRequests.length === 0) {
        toast({
          title: "No Pending Requests",
          description: "No authorization requests to analyze",
        });
        return;
      }

      // Analyze the first pending request as an example
      const request = pendingRequests[0];
      const analysis = await aiService.analyzeAuthorizationRequest({
        clinical_indication: request.clinical_indication,
        procedure_codes: request.procedure_codes,
        diagnosis_codes: request.diagnosis_codes,
        service_start_date: request.service_start_date,
        urgency_level: request.urgency_level
      });
      
      toast({
        title: "AI Analysis Complete",
        description: `Analysis score: ${analysis.score}/100. ${analysis.recommendations.length} recommendations generated.`,
      });
      
      // You could show the analysis in a dialog or update the UI
      console.log('AI Analysis:', analysis);
      
    } catch (error) {
      toast({
        title: "AI Analysis Failed",
        description: "Unable to perform analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchAuthorizations = async () => {
    try {
      let query = supabase
        .from('authorization_requests' as any)
        .select(`
          *,
          insurance_payers(name, payer_id_code),
          ai_approval_suggestions(completeness_score, medical_necessity_score, approval_probability, analyzed_at)
        `);

      // Keep behaviour consistent with AuthorizationTracking:
      // - Super admin: no company filter (RLS permitting)
      // - Otherwise: company + legacy NULL records
      if (!isSuperAdmin && currentCompany?.id) {
        query = query.or(`company_id.eq.${currentCompany.id},company_id.is.null`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const authData = (data || []) as any[];
      setAuthorizations(authData);

      // Calculate stats
      const total = authData.length;
      const pending = authData.filter(a => a.status === 'pending' || a.status === 'submitted').length;
      const approved = authData.filter(a => a.status === 'approved').length;
      const denied = authData.filter(a => a.status === 'denied').length;
      const approvalRate = total > 0 ? Math.round((approved / (approved + denied)) * 100) : 0;

      setStats({ total, pending, approved, denied, approvalRate });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthorizations();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('authorization-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'authorization_requests'
      }, () => {
        fetchAuthorizations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getColumnHeader = (column: string) => {
    switch (column) {
      case "S.No":
        return "S.No";
      case "Patient":
        return "Patient";
      case "Payer":
        return "Payer";
      case "Service":
        return "Service";
      case "Requested Date":
        return "Requested";
      case "Status":
        return "Status";
      case "AI Score":
        return "AI Score";
      case "Auth Number":
        return "Auth #";
      case "Urgency":
        return "Urgency";
      case "Review Status":
        return "Review Status";
      case "Submission Ref":
        return "Submission Ref";
      case "Actions":
        return "Actions";
      default:
        return column;
    }
  };

  const getColumnValue = (auth: any, column: string) => {
    switch (column) {
      case "S.No":
        // Rendered using row index
        return "";
      case "Patient":
        return auth.patient_name || "Unknown Patient";
      case "Payer":
        return auth.insurance_payers?.name || auth.payer_name_custom || auth.insurance_company || "N/A";
      case "Service":
        return auth.service_type || "N/A";
      case "Requested Date":
        return auth.requested_date
          ? new Date(auth.requested_date).toLocaleDateString()
          : auth.service_start_date
          ? new Date(auth.service_start_date).toLocaleDateString()
          : "N/A";
      case "Status":
        return auth.status ? auth.status.charAt(0).toUpperCase() + auth.status.slice(1) : "Draft";
      case "AI Score":
        return auth.ai_approval_suggestions?.[0]?.approval_probability != null
          ? `${auth.ai_approval_suggestions[0].approval_probability}%`
          : "—";
      case "Auth Number":
        return auth.auth_number || "—";
      case "Urgency":
        return auth.urgency_level ? auth.urgency_level.toUpperCase() : "ROUTINE";
      case "Review Status":
        return auth.review_status || "—";
      case "Submission Ref":
        return auth.submission_ref || "—";
      default:
        return "";
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { variant: "secondary", icon: FileText },
      submitted: { variant: "default", icon: Clock },
      pending: { variant: "default", icon: Clock },
      approved: { variant: "default", icon: CheckCircle, className: "bg-green-500" },
      denied: { variant: "destructive", icon: XCircle },
      expired: { variant: "secondary", icon: AlertCircle }
    };

    const config = variants[status] || variants.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleAnalyze = async (authId: string) => {
    try {
      toast({
        title: "Analyzing Authorization",
        description: "AI analysis in progress..."
      });

      // Mock AI analysis - simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock analysis results
      const mockAnalysis = {
        approval_probability: Math.floor(Math.random() * 40) + 60, // 60-100%
        risk_factors: [
          "Procedure requires prior authorization",
          "Patient has existing coverage",
          "Clinical indication is well-documented"
        ],
        recommendations: [
          "Submit additional clinical documentation",
          "Consider alternative treatment options",
          "Verify patient eligibility"
        ]
      };

      toast({
        title: "Analysis Complete",
        description: `Approval probability: ${mockAnalysis.approval_probability}%`
      });

      // Show detailed analysis in a dialog or alert
      const analysisDetails = `
AI Analysis Results:
• Approval Probability: ${mockAnalysis.approval_probability}%
• Risk Factors: ${mockAnalysis.risk_factors.length} identified
• Recommendations: ${mockAnalysis.recommendations.length} provided

This is a mock analysis for demonstration purposes.
      `;
      
      alert(analysisDetails);

      fetchAuthorizations();
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: "Unable to perform AI analysis at this time",
        variant: "destructive"
      });
    }
  };

  const handleRunWorkflow = async (authId: string) => {
    try {
      toast({
        title: "Running PA Workflow",
        description: "Checking rules, validating, and submitting...",
      });

      // Mock workflow processing - simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock workflow results
      const mockWorkflow = {
        review_status: ['VALIDATED', 'SUBMITTED', 'PENDING_REVIEW'][Math.floor(Math.random() * 3)],
        auth_number: `PA-${Date.now().toString().slice(-6)}`,
        submission_date: new Date().toISOString().split('T')[0],
        estimated_response: '5-7 business days'
      };

      const statusText = mockWorkflow.review_status;
      toast({
        title: "Workflow Complete",
        description: `Status: ${statusText} • Auth #: ${mockWorkflow.auth_number}`,
      });

      // Show workflow details
      const workflowDetails = `
PA Workflow Results:
• Status: ${mockWorkflow.review_status}
• Authorization Number: ${mockWorkflow.auth_number}
• Submission Date: ${mockWorkflow.submission_date}
• Estimated Response: ${mockWorkflow.estimated_response}

This is a mock workflow for demonstration purposes.
      `;
      
      alert(workflowDetails);

      fetchAuthorizations();
    } catch (error: any) {
      toast({
        title: "Workflow Failed",
        description: "Unable to run PA workflow at this time",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading authorizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prior Authorization Management</h1>
          <p className="text-muted-foreground">AI-powered authorization tracking and optimization</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleAIAnalysis}>
            <TrendingUp className="h-4 w-4 mr-2" />
            AI Analysis
          </Button>
          <Button onClick={() => setShowNewDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Authorization
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{stats.approvalRate}%</div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <Progress value={stats.approvalRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">All Authorizations</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-semibold">Authorizations</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Adjust the columns to match what your team cares about most.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowColumnSelector(true)}
                className="flex items-center gap-1"
              >
                <Columns3 className="h-4 w-4" />
                Columns
              </Button>
            </CardHeader>
            <CardContent>
              {authorizations.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">No authorizations yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first authorization request to get started.
                  </p>
                  <Button onClick={() => setShowNewDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Authorization
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {visibleColumns.map((col) => (
                          <TableHead key={col}>{getColumnHeader(col)}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {authorizations.map((auth, rowIndex) => (
                        <TableRow key={auth.id}>
                          {visibleColumns.map((col) => {
                            if (col === "Actions") {
                              return (
                                <TableCell key={`${auth.id}-${col}`}>
                                  <div className="flex items-center gap-2">
                                    {auth.status === "draft" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAnalyze(auth.id)}
                                      >
                                        AI Analysis
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedAuth(auth);
                                        setViewOpen(true);
                                      }}
                                    >
                                      View Details
                                    </Button>
                                  </div>
                                </TableCell>
                              );
                            }

                            const value = getColumnValue(auth, col);
                            return (
                              <TableCell key={`${auth.id}-${col}`}>
                                {col === "S.No" ? String(rowIndex + 1).padStart(3, "0") : value}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardContent className="py-6">
              {authorizations.filter(a => a.status === 'pending' || a.status === 'submitted').length === 0 ? (
                <p className="text-center text-muted-foreground">No pending authorizations</p>
              ) : (
                <div className="space-y-4">
                  {authorizations
                    .filter(a => a.status === 'pending' || a.status === 'submitted')
                    .map(auth => (
                      <div key={auth.id} className="border-l-4 border-yellow-500 pl-4">
                        <p className="font-medium">{auth.patient_name}</p>
                        <p className="text-sm text-muted-foreground">{auth.service_type}</p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring">
          <Card>
            <CardContent className="py-6">
              <p className="text-center text-muted-foreground">No expiring authorizations in the next 30 days</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Column Selector Dialog */}
      <Dialog open={showColumnSelector} onOpenChange={setShowColumnSelector}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Select Columns</DialogTitle>
            <DialogDescription>
              Choose which columns to display in the authorization table.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 py-4">
            {/* Available Columns */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Available Columns</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {availableColumns.length === 0 && (
                  <p className="text-sm text-muted-foreground">No more columns to add.</p>
                )}
                {availableColumns.map((column) => (
                  <div
                    key={column}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-gray-900">{getColumnHeader(column)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        setVisibleColumns([...visibleColumns, column]);
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
                {visibleColumns.map((column, idx) => (
                  <div
                    key={column}
                    className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    draggable
                    onDragStart={(e) => {
                      setDragIndex(idx);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(idx));
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = dragIndex ?? Number(e.dataTransfer.getData("text/plain"));
                      if (!Number.isFinite(from) || from === idx) return;
                      setVisibleColumns((prev) => arrayMove(prev, from, idx));
                      setDragIndex(null);
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-gray-900 truncate">{getColumnHeader(column)}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        disabled={idx === 0}
                        onClick={() => setVisibleColumns((prev) => arrayMove(prev, idx, idx - 1))}
                        title="Move up"
                      >
                        <ChevronUp className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        disabled={idx === visibleColumns.length - 1}
                        onClick={() => setVisibleColumns((prev) => arrayMove(prev, idx, idx + 1))}
                        title="Move down"
                      >
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                        disabled={column === "S.No"}
                      onClick={() => {
                          if (column === "S.No") return;
                        if (visibleColumns.length === 1) return;
                        setVisibleColumns(visibleColumns.filter((c) => c !== column));
                      }}
                        title={column === "S.No" ? "S.No is always visible" : "Remove"}
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
              onClick={() => setShowColumnSelector(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AuthorizationRequestDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={(newAuthId) => {
          fetchAuthorizations();
          // If a new authorization was created, you could optionally set it as selected here
        }}
      />

      {/* View Details Dialog */}
      {selectedAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Authorization Details</h3>
            <div className="space-y-3">
              <div><strong>Patient:</strong> {selectedAuth.patient_name}</div>
              <div><strong>Service:</strong> {selectedAuth.service_type}</div>
              <div><strong>Status:</strong> {selectedAuth.status}</div>
              <div><strong>Requested Date:</strong> {selectedAuth.requested_date}</div>
              <div><strong>Provider:</strong> {selectedAuth.provider_name}</div>
              <div><strong>Insurance:</strong> {selectedAuth.insurance_company}</div>
              <div><strong>Policy Number:</strong> {selectedAuth.policy_number}</div>
              <div><strong>Prior Auth Number:</strong> {selectedAuth.prior_auth_number}</div>
              <div><strong>Notes:</strong> {selectedAuth.notes}</div>
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
    </div>
  );
};

export default PriorAuthDashboard;