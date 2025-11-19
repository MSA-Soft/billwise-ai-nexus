import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  PlayCircle,
  PauseCircle,
  Calendar,
  User,
  FileText,
  Shield,
  Activity,
  Filter,
  Search,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  Circle,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  List,
  Grid,
  Eye,
  Download,
  Upload
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

interface PatientFlowTask {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_dob?: string;
  flow_stage: 'registration' | 'appointment' | 'visit' | 'authorization' | 'claim' | 'payment' | 'completed';
  task_type: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  due_date?: string;
  completed_date?: string;
  assigned_to?: string;
  related_entity_id?: string; // ID of related appointment, authorization, claim, etc.
  related_entity_type?: 'appointment' | 'authorization' | 'claim' | 'visit';
  metadata?: any;
  created_at: string;
  updated_at: string;
}

interface PatientFlowSummary {
  patient_id: string;
  patient_name: string;
  patient_dob?: string;
  registration_date?: string;
  last_appointment?: string;
  next_appointment?: string;
  total_visits: number;
  pending_authorizations: number;
  pending_claims: number;
  overall_status: 'on_track' | 'at_risk' | 'delayed' | 'completed';
  completion_percentage: number;
  tasks: PatientFlowTask[];
}

export function TaskManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [patientFlows, setPatientFlows] = useState<PatientFlowSummary[]>([]);
  const [filteredFlows, setFilteredFlows] = useState<PatientFlowSummary[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<PatientFlowSummary | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'kanban'>('timeline');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showFlowDialog, setShowFlowDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PatientFlowTask | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    fetchPatientFlows();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [patientFlows, filterStatus, filterPriority, searchTerm]);

  const fetchPatientFlows = async () => {
    if (isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      setLoading(true);

      // Fetch all patients
      const { data: patients, error: patientsError } = await supabase
        .from('patients' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (patientsError) {
        console.error('Error fetching patients:', patientsError);
        toast({
          title: 'Error loading patients',
          description: patientsError.message,
          variant: 'destructive',
        });
        return;
      }

      // Fetch appointments
      const { data: appointments } = await supabase
        .from('appointments' as any)
        .select('*')
        .order('scheduled_date', { ascending: false });

      // Fetch authorization requests
      const { data: authorizations } = await supabase
        .from('authorization_requests' as any)
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch claims
      const { data: claims } = await supabase
        .from('claims' as any)
        .select('*')
        .order('created_at', { ascending: false });

      // Build patient flow summaries
      const flows: PatientFlowSummary[] = (patients || []).map((patient: any) => {
        const patientAppointments = (appointments || []).filter((apt: any) => 
          apt.patient_id === patient.id
        );
        const patientAuthorizations = (authorizations || []).filter((auth: any) => 
          auth.patient_id === patient.id || 
          auth.patient_name?.toLowerCase().includes(`${patient.first_name} ${patient.last_name}`.toLowerCase())
        );
        const patientClaims = (claims || []).filter((claim: any) => 
          claim.patient_id === patient.id
        );

        const tasks: PatientFlowTask[] = [];

        // Registration task
        tasks.push({
          id: `reg-${patient.id}`,
          patient_id: patient.id,
          patient_name: `${patient.first_name} ${patient.last_name}`,
          patient_dob: patient.date_of_birth,
          flow_stage: 'registration',
          task_type: 'patient_registration',
          title: 'Patient Registration',
          description: `Registered: ${new Date(patient.created_at).toLocaleDateString()}`,
          status: 'completed',
          priority: 'medium',
          completed_date: patient.created_at,
          created_at: patient.created_at,
          updated_at: patient.updated_at || patient.created_at,
        });

        // Appointment tasks
        patientAppointments.forEach((apt: any) => {
          const isPast = new Date(apt.scheduled_date) < new Date();
          const status = isPast 
            ? (apt.status === 'completed' ? 'completed' : 'overdue')
            : (apt.status === 'cancelled' ? 'cancelled' : 'pending');
          
          tasks.push({
            id: `apt-${apt.id}`,
            patient_id: patient.id,
            patient_name: `${patient.first_name} ${patient.last_name}`,
            flow_stage: 'appointment',
            task_type: 'appointment',
            title: `Appointment: ${apt.appointment_type || 'General'}`,
            description: `${new Date(apt.scheduled_date).toLocaleDateString()} at ${apt.scheduled_time}`,
            status: status as any,
            priority: apt.urgency_level === 'urgent' ? 'urgent' : 'medium',
            due_date: `${apt.scheduled_date}T${apt.scheduled_time}`,
            completed_date: apt.status === 'completed' ? apt.updated_at : undefined,
            related_entity_id: apt.id,
            related_entity_type: 'appointment',
            created_at: apt.created_at,
            updated_at: apt.updated_at || apt.created_at,
          });
        });

        // Authorization tasks
        patientAuthorizations.forEach((auth: any) => {
          const authStatus = auth.status || 'pending';
          let flowStatus: PatientFlowTask['status'] = 'pending';
          if (authStatus === 'approved') flowStatus = 'completed';
          else if (authStatus === 'denied') flowStatus = 'cancelled';
          else if (authStatus === 'pending') flowStatus = 'in_progress';

          tasks.push({
            id: `auth-${auth.id}`,
            patient_id: patient.id,
            patient_name: `${patient.first_name} ${patient.last_name}`,
            flow_stage: 'authorization',
            task_type: 'authorization_request',
            title: `Authorization: ${auth.service_type || 'Service Authorization'}`,
            description: auth.clinical_indication || `Procedure: ${auth.procedure_codes?.join(', ') || 'N/A'}`,
            status: flowStatus,
            priority: auth.urgency_level === 'urgent' ? 'urgent' : 
                     auth.urgency_level === 'stat' ? 'critical' : 'medium',
            due_date: auth.service_start_date ? `${auth.service_start_date}T00:00:00` : undefined,
            completed_date: authStatus === 'approved' ? auth.updated_at : undefined,
            related_entity_id: auth.id,
            related_entity_type: 'authorization',
            created_at: auth.created_at,
            updated_at: auth.updated_at || auth.created_at,
          });
        });

        // Claim tasks
        patientClaims.forEach((claim: any) => {
          const claimStatus = claim.status || 'draft';
          let flowStatus: PatientFlowTask['status'] = 'pending';
          if (claimStatus === 'paid') flowStatus = 'completed';
          else if (claimStatus === 'denied') flowStatus = 'cancelled';
          else if (claimStatus === 'submitted') flowStatus = 'in_progress';

          tasks.push({
            id: `claim-${claim.id}`,
            patient_id: patient.id,
            patient_name: `${patient.first_name} ${patient.last_name}`,
            flow_stage: 'claim',
            task_type: 'claim_submission',
            title: `Claim: ${claim.claim_number || claim.id.substring(0, 8)}`,
            description: `Amount: $${claim.total_charges || 0}`,
            status: flowStatus,
            priority: 'medium',
            due_date: claim.service_date_from ? `${claim.service_date_from}T00:00:00` : undefined,
            completed_date: claimStatus === 'paid' ? claim.updated_at : undefined,
            related_entity_id: claim.id,
            related_entity_type: 'claim',
            created_at: claim.created_at,
            updated_at: claim.updated_at || claim.created_at,
          });
        });

        // Sort tasks by date
        tasks.sort((a, b) => {
          const dateA = a.due_date || a.created_at;
          const dateB = b.due_date || b.created_at;
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        });

        // Calculate completion percentage
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const completionPercentage = tasks.length > 0 
          ? Math.round((completedTasks / tasks.length) * 100) 
          : 0;

        // Determine overall status
        const hasOverdue = tasks.some(t => t.status === 'overdue');
        const hasPending = tasks.some(t => t.status === 'pending' || t.status === 'in_progress');
        let overallStatus: PatientFlowSummary['overall_status'] = 'on_track';
        if (hasOverdue) overallStatus = 'delayed';
        else if (completionPercentage === 100) overallStatus = 'completed';
        else if (hasPending && completionPercentage < 50) overallStatus = 'at_risk';

        const nextAppt = patientAppointments
          .filter((apt: any) => new Date(apt.scheduled_date) >= new Date())
          .sort((a: any, b: any) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())[0];

        const lastAppt = patientAppointments
          .filter((apt: any) => new Date(apt.scheduled_date) < new Date())
          .sort((a: any, b: any) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime())[0];

        return {
          patient_id: patient.id,
          patient_name: `${patient.first_name} ${patient.last_name}`,
          patient_dob: patient.date_of_birth,
          registration_date: patient.created_at,
          last_appointment: lastAppt?.scheduled_date,
          next_appointment: nextAppt?.scheduled_date,
          total_visits: patientAppointments.filter((apt: any) => apt.status === 'completed').length,
          pending_authorizations: patientAuthorizations.filter((auth: any) => 
            !auth.status || auth.status === 'pending'
          ).length,
          pending_claims: patientClaims.filter((claim: any) => 
            claim.status !== 'paid' && claim.status !== 'denied'
          ).length,
          overall_status: overallStatus,
          completion_percentage: completionPercentage,
          tasks: tasks,
        };
      });

      setPatientFlows(flows);
      setFilteredFlows(flows);
    } catch (error: any) {
      console.error('Error fetching patient flows:', error);
      toast({
        title: 'Error loading task management data',
        description: error.message || 'Failed to load patient flows',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const applyFilters = () => {
    let filtered = [...patientFlows];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(flow =>
        flow.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flow.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(flow => flow.overall_status === filterStatus);
    }

    // Priority filter (applied to tasks within flows)
    if (filterPriority !== 'all') {
      filtered = filtered.map(flow => ({
        ...flow,
        tasks: flow.tasks.filter(task => task.priority === filterPriority)
      })).filter(flow => flow.tasks.length > 0);
    }

    setFilteredFlows(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'on_hold': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'urgent': return 'bg-orange-500 text-white';
      case 'high': return 'bg-yellow-500 text-white';
      case 'medium': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-400 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getFlowStageIcon = (stage: string) => {
    switch (stage) {
      case 'registration': return User;
      case 'appointment': return Calendar;
      case 'visit': return Activity;
      case 'authorization': return Shield;
      case 'claim': return FileText;
      case 'payment': return CheckCircle2;
      case 'completed': return CheckCircle;
      default: return Circle;
    }
  };

  const getFlowStageColor = (stage: string) => {
    switch (stage) {
      case 'registration': return 'bg-blue-500';
      case 'appointment': return 'bg-purple-500';
      case 'visit': return 'bg-green-500';
      case 'authorization': return 'bg-orange-500';
      case 'claim': return 'bg-indigo-500';
      case 'payment': return 'bg-emerald-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            Task Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete patient flow tracking from registration to payment - X12 278 compliant
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchPatientFlows} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timeline">Timeline</SelectItem>
              <SelectItem value="list">List</SelectItem>
              <SelectItem value="kanban">Kanban</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="on_track">On Track</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patient Flows */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading patient flows...</p>
          </CardContent>
        </Card>
      ) : filteredFlows.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patient flows found</h3>
            <p className="text-gray-600">No patients match your current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFlows.map((flow) => (
            <Card key={flow.patient_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{flow.patient_name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        ID: {flow.patient_id.substring(0, 8)}... | DOB: {formatDate(flow.patient_dob)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(flow.overall_status)}>
                      {flow.overall_status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFlow(flow);
                        setShowFlowDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">{flow.completion_percentage}%</span>
                  </div>
                  <Progress value={flow.completion_percentage} className="h-2" />
                </div>
              </CardHeader>
              <CardContent>
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{flow.total_visits}</p>
                    <p className="text-xs text-gray-600">Total Visits</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{flow.pending_authorizations}</p>
                    <p className="text-xs text-gray-600">Pending Auths</p>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">{flow.pending_claims}</p>
                    <p className="text-xs text-gray-600">Pending Claims</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{flow.tasks.filter(t => t.status === 'completed').length}</p>
                    <p className="text-xs text-gray-600">Completed Tasks</p>
                  </div>
                </div>

                {/* Timeline View */}
                {viewMode === 'timeline' && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm mb-3">Patient Flow Timeline</h4>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      {flow.tasks.map((task, index) => {
                        const StageIcon = getFlowStageIcon(task.flow_stage);
                        return (
                          <div key={task.id} className="relative flex items-start gap-4 mb-4">
                            <div className={`relative z-10 w-8 h-8 rounded-full ${getFlowStageColor(task.flow_stage)} flex items-center justify-center text-white`}>
                              <StageIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 bg-white rounded-lg border p-3 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-medium">{task.title}</h5>
                                    <Badge className={getStatusColor(task.status)} variant="outline">
                                      {task.status.replace('_', ' ')}
                                    </Badge>
                                    <Badge className={getPriorityColor(task.priority)}>
                                      {task.priority}
                                    </Badge>
                                  </div>
                                  {task.description && (
                                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    {task.due_date && (
                                      <span>Due: {formatDateTime(task.due_date)}</span>
                                    )}
                                    {task.completed_date && (
                                      <span className="text-green-600">Completed: {formatDate(task.completed_date)}</span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setShowTaskDialog(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm mb-3">Tasks List</h4>
                    <div className="space-y-2">
                      {flow.tasks.map((task) => {
                        const StageIcon = getFlowStageIcon(task.flow_stage);
                        return (
                          <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <StageIcon className={`h-5 w-5 ${getFlowStageColor(task.flow_stage).replace('bg-', 'text-')}`} />
                              <div>
                                <p className="font-medium text-sm">{task.title}</p>
                                <p className="text-xs text-gray-600">{task.flow_stage} • {formatDate(task.due_date || task.created_at)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(task.status)} variant="outline">
                                {task.status}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowTaskDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Future Visits */}
                {flow.next_appointment && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Next Appointment: {formatDate(flow.next_appointment)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Patient Flow Detail Dialog */}
      <Dialog open={showFlowDialog} onOpenChange={setShowFlowDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <User className="h-6 w-6 text-blue-600" />
              Patient Flow Details - {selectedFlow?.patient_name}
            </DialogTitle>
            <DialogDescription>
              Complete patient journey from registration to payment - X12 278 compliant workflow
            </DialogDescription>
          </DialogHeader>
          {selectedFlow && (
            <div className="space-y-6">
              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Patient Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Patient ID</Label>
                      <p className="font-medium">{selectedFlow.patient_id.substring(0, 8)}...</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Date of Birth</Label>
                      <p className="font-medium">{formatDate(selectedFlow.patient_dob)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Registration Date</Label>
                      <p className="font-medium">{formatDate(selectedFlow.registration_date)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Overall Status</Label>
                      <Badge className={getStatusColor(selectedFlow.overall_status)}>
                        {selectedFlow.overall_status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Flow Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">{selectedFlow.total_visits}</p>
                      <p className="text-sm text-gray-600 mt-1">Total Visits</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-3xl font-bold text-orange-600">{selectedFlow.pending_authorizations}</p>
                      <p className="text-sm text-gray-600 mt-1">Pending Authorizations</p>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <p className="text-3xl font-bold text-indigo-600">{selectedFlow.pending_claims}</p>
                      <p className="text-sm text-gray-600 mt-1">Pending Claims</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-green-600">{selectedFlow.completion_percentage}%</p>
                      <p className="text-sm text-gray-600 mt-1">Completion</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Overall Progress</Label>
                      <span className="text-sm text-gray-600">{selectedFlow.completion_percentage}% Complete</span>
                    </div>
                    <Progress value={selectedFlow.completion_percentage} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              {/* Appointment Information */}
              {(selectedFlow.last_appointment || selectedFlow.next_appointment) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Appointment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedFlow.last_appointment && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <Label className="text-xs text-gray-500">Last Appointment</Label>
                          <p className="font-medium">{formatDate(selectedFlow.last_appointment)}</p>
                        </div>
                      )}
                      {selectedFlow.next_appointment && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Label className="text-xs text-gray-500">Next Appointment</Label>
                          <p className="font-medium text-blue-600">{formatDate(selectedFlow.next_appointment)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Complete Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Complete Patient Flow Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500"></div>
                    <div className="space-y-6">
                      {selectedFlow.tasks.map((task, index) => {
                        const StageIcon = getFlowStageIcon(task.flow_stage);
                        const isCompleted = task.status === 'completed';
                        const isOverdue = task.status === 'overdue';
                        
                        return (
                          <div key={task.id} className="relative flex items-start gap-4">
                            <div className={`relative z-10 w-12 h-12 rounded-full ${isCompleted ? 'bg-green-500' : isOverdue ? 'bg-red-500' : getFlowStageColor(task.flow_stage)} flex items-center justify-center text-white shadow-lg`}>
                              <StageIcon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 bg-white rounded-lg border-2 p-4 hover:shadow-lg transition-all">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h5 className="font-semibold text-lg">{task.title}</h5>
                                    <Badge className={getStatusColor(task.status)} variant="outline">
                                      {task.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    <Badge className={getPriorityColor(task.priority)}>
                                      {task.priority.toUpperCase()}
                                    </Badge>
                                  </div>
                                  {task.description && (
                                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                  )}
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                    <div>
                                      <Label className="text-xs text-gray-500">Flow Stage</Label>
                                      <p className="font-medium capitalize">{task.flow_stage}</p>
                                    </div>
                                    {task.due_date && (
                                      <div>
                                        <Label className="text-xs text-gray-500">Due Date</Label>
                                        <p className="font-medium">{formatDateTime(task.due_date)}</p>
                                      </div>
                                    )}
                                    {task.completed_date && (
                                      <div>
                                        <Label className="text-xs text-gray-500">Completed</Label>
                                        <p className="font-medium text-green-600">{formatDate(task.completed_date)}</p>
                                      </div>
                                    )}
                                    {task.created_at && (
                                      <div>
                                        <Label className="text-xs text-gray-500">Created</Label>
                                        <p className="font-medium">{formatDate(task.created_at)}</p>
                                      </div>
                                    )}
                                  </div>
                                  {task.related_entity_type && task.related_entity_id && (
                                    <div className="mt-3 pt-3 border-t">
                                      <Label className="text-xs text-gray-500">Related Entity</Label>
                                      <p className="text-sm">
                                        {task.related_entity_type}: {task.related_entity_id.substring(0, 8)}...
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setShowTaskDialog(true);
                                    setShowFlowDialog(false);
                                  }}
                                  className="ml-2"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowFlowDialog(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  // Navigate to patient detail page if needed
                  window.location.href = `/customer-setup?tab=patients&patient=${selectedFlow.patient_id}`;
                }}>
                  View Patient Profile
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTask && (() => {
                const StageIcon = getFlowStageIcon(selectedTask.flow_stage);
                return <StageIcon className="h-5 w-5 text-blue-600" />;
              })()}
              {selectedTask?.title}
            </DialogTitle>
            <DialogDescription>
              Detailed task information and workflow status
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Status</Label>
                  <Badge className={getStatusColor(selectedTask.status)} variant="outline" className="text-base px-3 py-1">
                    {selectedTask.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Priority</Label>
                  <Badge className={getPriorityColor(selectedTask.priority)} className="text-base px-3 py-1">
                    {selectedTask.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Task Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Flow Stage</Label>
                  <p className="text-sm capitalize">{selectedTask.flow_stage}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Task Type</Label>
                  <p className="text-sm">{selectedTask.task_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Patient</Label>
                  <p className="text-sm">{selectedTask.patient_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Patient DOB</Label>
                  <p className="text-sm">{formatDate(selectedTask.patient_dob)}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                {selectedTask.due_date && (
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Due Date</Label>
                    <p className="text-sm">{formatDateTime(selectedTask.due_date)}</p>
                  </div>
                )}
                {selectedTask.completed_date && (
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Completed Date</Label>
                    <p className="text-sm text-green-600">{formatDateTime(selectedTask.completed_date)}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Created</Label>
                  <p className="text-sm">{formatDateTime(selectedTask.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Last Updated</Label>
                  <p className="text-sm">{formatDateTime(selectedTask.updated_at)}</p>
                </div>
              </div>

              {/* Description */}
              {selectedTask.description && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Description</Label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedTask.description}</p>
                </div>
              )}

              {/* Related Entity */}
              {selectedTask.related_entity_type && selectedTask.related_entity_id && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Related Entity</Label>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Type:</span> {selectedTask.related_entity_type}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">ID:</span> {selectedTask.related_entity_id}
                    </p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedTask.metadata && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Additional Information</Label>
                  <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto">
                    {JSON.stringify(selectedTask.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

