import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, FileText } from "lucide-react";
import AuthorizationRequestDialog from "./AuthorizationRequestDialog";

const PriorAuthDashboard = () => {
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
      const { data, error } = await supabase
        .from('authorization_requests' as any)
        .select(`
          *,
          insurance_payers(name, payer_id_code),
          ai_approval_suggestions(completeness_score, medical_necessity_score, approval_probability, analyzed_at)
        `)
        .order('created_at', { ascending: false });

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
          {authorizations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No authorizations yet</p>
                <p className="text-sm text-muted-foreground mb-4">Create your first authorization request to get started</p>
                <Button onClick={() => setShowNewDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Authorization
                </Button>
              </CardContent>
            </Card>
          ) : (
            authorizations.map((auth) => (
              <Card key={auth.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{auth.patient_name}</h3>
                        {getStatusBadge(auth.status)}
                        {auth.ai_approval_suggestions?.length > 0 && (
                          <Badge variant="outline" className="bg-blue-50">
                            AI Score: {auth.ai_approval_suggestions[0].approval_probability}%
                          </Badge>
                        )}
                        {auth.auth_number && (
                          <Badge variant="outline" className="bg-green-50">
                            Auth #: {auth.auth_number}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Service:</span> {auth.service_type}
                        </div>
                        <div>
                          <span className="font-medium">Payer:</span> {auth.insurance_payers?.name || auth.payer_name_custom || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Requested:</span> {auth.service_start_date ? new Date(auth.service_start_date).toLocaleDateString() : 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Urgency:</span> {auth.urgency_level?.toUpperCase() || 'ROUTINE'}
                        </div>
                        {auth.review_status && (
                          <div className="col-span-2">
                            <span className="font-medium">Review Status:</span> {auth.review_status}
                          </div>
                        )}
                        {auth.ai_approval_suggestions?.[0]?.missing_elements?.length > 0 && (
                          <div className="col-span-2">
                            <span className="font-medium">Missing Elements:</span> {auth.ai_approval_suggestions[0].missing_elements.slice(0,3).join(', ')}
                          </div>
                        )}
                        {auth.submission_ref && (
                          <div className="col-span-2">
                            <span className="font-medium">Submission Ref:</span> {auth.submission_ref}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {auth.status === 'draft' && (
                        <Button size="sm" onClick={() => handleAnalyze(auth.id)}>
                          AI Analysis
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedAuth(auth);
                        setViewOpen(true);
                      }}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
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

      <AuthorizationRequestDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={fetchAuthorizations}
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