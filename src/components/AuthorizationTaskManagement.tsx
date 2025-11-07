import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Plus,
  Filter,
  Search,
  Calendar,
  User,
  Flag,
  FileText,
  Send,
  MessageSquare,
  TrendingUp,
  BarChart3,
  Bell,
  ArrowRight,
  Edit,
  Eye,
  MoreVertical,
  CheckSquare,
  Square,
  Zap,
  Target,
  Activity,
  Shield,
  AlertCircle,
  Clock3,
  CalendarCheck,
  Users,
  PieChart,
  LineChart,
  List,
  Pause,
} from 'lucide-react';
import {
  authorizationTaskService,
  type AuthorizationTask,
  type TaskStats,
  type TaskFilters,
} from '@/services/authorizationTaskService';
import { AdvancedSearchFilter, type SearchFilter } from '@/components/filters/AdvancedSearchFilter';

const AuthorizationTaskManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<AuthorizationTask[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<AuthorizationTask | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'calendar'>('list');
  const [filters, setFilters] = useState<TaskFilters>({});

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [savedFilters, setSavedFilters] = useState<SearchFilter[]>([]);
  const [currentFilter, setCurrentFilter] = useState<SearchFilter | null>(null);

  // New task form
  const [newTask, setNewTask] = useState({
    authorization_request_id: '',
    task_type: 'submit' as AuthorizationTask['task_type'],
    title: '',
    description: '',
    priority: 'medium' as AuthorizationTask['priority'],
    due_date: '',
    assigned_to: '',
  });

  useEffect(() => {
    loadTasks();
    loadStats();
  }, [user, filters]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      // Use advanced filter if available, otherwise use simple filters
      const taskFilters: TaskFilters = currentFilter ? {
        search: currentFilter.searchTerm || undefined,
        status: currentFilter.statuses.length > 0 ? currentFilter.statuses : undefined,
        priority: currentFilter.priorities.length > 0 ? currentFilter.priorities : undefined,
        task_type: currentFilter.types.length > 0 ? currentFilter.types : undefined,
        assigned_to: currentFilter.assignedTo || user?.id,
        due_date_from: currentFilter.dateFrom,
        due_date_to: currentFilter.dateTo,
      } : {
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? [statusFilter] : undefined,
        priority: priorityFilter !== 'all' ? [priorityFilter] : undefined,
        task_type: typeFilter !== 'all' ? [typeFilter] : undefined,
        assigned_to: user?.id,
      };

      const data = await authorizationTaskService.getTasks(taskFilters, user?.id);
      setTasks(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await authorizationTaskService.getTaskStats(user?.id);
      setStats(data);
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateTask = async () => {
    try {
      if (!user?.id) {
        throw new Error('User must be logged in');
      }

      if (!newTask.authorization_request_id) {
        throw new Error('Authorization request is required');
      }

      await authorizationTaskService.createTaskFromAuthRequest(
        newTask.authorization_request_id,
        newTask.task_type,
        {
          assignedTo: newTask.assigned_to || user.id,
          priority: newTask.priority,
          dueDate: newTask.due_date,
          title: newTask.title,
          description: newTask.description,
          userId: user.id,
        }
      );

      toast({
        title: 'Task Created',
        description: 'Authorization task has been created successfully.',
      });

      setIsCreateTaskOpen(false);
      setNewTask({
        authorization_request_id: '',
        task_type: 'submit',
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        assigned_to: '',
      });

      loadTasks();
      loadStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (taskId: string, status: AuthorizationTask['status']) => {
    try {
      if (!user?.id) return;

      await authorizationTaskService.updateTaskStatus(taskId, status, user.id);
      toast({
        title: 'Status Updated',
        description: `Task status updated to ${status}`,
      });

      loadTasks();
      loadStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleViewTask = async (taskId: string) => {
    try {
      const task = await authorizationTaskService.getTaskById(taskId);
      setSelectedTask(task);
      setIsTaskDialogOpen(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load task details',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: AuthorizationTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <Clock3 className="h-5 w-5 text-yellow-600" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'on_hold':
        return <Pause className="h-5 w-5 text-orange-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: AuthorizationTask['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      on_hold: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: AuthorizationTask['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
      critical: 'bg-purple-100 text-purple-800',
    };

    return (
      <Badge className={colors[priority] || 'bg-gray-100 text-gray-800'}>
        <Flag className="h-3 w-3 mr-1" />
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const isOverdue = (task: AuthorizationTask) => {
    if (!task.due_date || task.status === 'completed' || task.status === 'cancelled') {
      return false;
    }
    return new Date(task.due_date) < new Date();
  };

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !task.title?.toLowerCase().includes(searchLower) &&
        !task.description?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    return true;
  });

  // Group tasks by status for board view
  const tasksByStatus = {
    pending: filteredTasks.filter(t => t.status === 'pending'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    on_hold: filteredTasks.filter(t => t.status === 'on_hold'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
    overdue: filteredTasks.filter(t => isOverdue(t)),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Authorization Task Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Professional task management for authorization requests with X12 278 compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'list' ? 'board' : 'list')}
          >
            {viewMode === 'list' ? <BarChart3 className="h-4 w-4 mr-2" /> : <List className="h-4 w-4 mr-2" />}
            {viewMode === 'list' ? 'Board View' : 'List View'}
          </Button>
          <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Authorization Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Authorization Request ID *</Label>
                  <Input
                    value={newTask.authorization_request_id}
                    onChange={(e) => setNewTask({ ...newTask, authorization_request_id: e.target.value })}
                    placeholder="Enter authorization request ID"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Task Type *</Label>
                    <Select
                      value={newTask.task_type}
                      onValueChange={(value) => setNewTask({ ...newTask, task_type: value as AuthorizationTask['task_type'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="submit">Submit</SelectItem>
                        <SelectItem value="follow_up">Follow Up</SelectItem>
                        <SelectItem value="appeal">Appeal</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="resubmit">Resubmit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority *</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value as AuthorizationTask['priority'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Task title (auto-generated if empty)"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Task description (auto-generated if empty)"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="datetime-local"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Assign To</Label>
                    <Input
                      value={newTask.assigned_to}
                      onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                      placeholder="User ID (leave empty for self)"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask}>
                    Create Task
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advanced Search & Filters */}
      <AdvancedSearchFilter
        onFilterChange={(filter) => {
          setCurrentFilter(filter);
          loadTasks();
        }}
        onSaveFilter={(filter) => {
          setSavedFilters([...savedFilters, { ...filter, id: Date.now().toString() }]);
          // In production, save to database
        }}
        savedFilters={savedFilters}
        initialFilter={currentFilter || undefined}
      />

      {/* Tasks List/Board */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
                <p className="text-muted-foreground">Create a new task to get started.</p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="font-semibold">{task.title}</h3>
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                        {isOverdue(task) && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            OVERDUE
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {task.due_date
                            ? (() => {
                                const days = getDaysUntilDue(task.due_date);
                                if (days === null) return 'No due date';
                                if (days < 0) return `${Math.abs(days)} days overdue`;
                                if (days === 0) return 'Due today';
                                return `${days} days remaining`;
                              })()
                            : 'No due date'}
                        </span>
                        {task.x12_submission_status && (
                          <span className="flex items-center gap-1">
                            <Send className="h-4 w-4" />
                            X12: {task.x12_submission_status}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {task.completion_percentage}% Complete
                        </span>
                      </div>
                      <div className="mt-2">
                        <Progress value={task.completion_percentage} className="h-2" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTask(task.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {task.status !== 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateStatus(task.id, 'completed')}
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        // Board View
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            <Card key={status} className="min-h-[400px]">
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="capitalize">{status.replace('_', ' ')}</span>
                  <Badge>{statusTasks.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {statusTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleViewTask(task.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">{task.title}</h4>
                        {getPriorityBadge(task.priority)}
                      </div>
                      {task.due_date && (
                        <div className="text-xs text-muted-foreground mb-2">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}
                      <Progress value={task.completion_percentage} className="h-1" />
                    </CardContent>
                  </Card>
                ))}
                {statusTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No tasks
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Task Details Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Task Details
            </DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6">
              {/* Task Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedTask.title}</h2>
                  <div className="flex items-center gap-2 mb-4">
                    {getStatusBadge(selectedTask.status)}
                    {getPriorityBadge(selectedTask.priority)}
                    {isOverdue(selectedTask) && (
                      <Badge variant="destructive">OVERDUE</Badge>
                    )}
                  </div>
                </div>
                {selectedTask.status !== 'completed' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedTask.id, 'completed')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                )}
              </div>

              {/* Task Information */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Task Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 font-medium">{selectedTask.task_type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className="ml-2 font-medium">{selectedTask.status}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Priority:</span>
                      <span className="ml-2 font-medium">{selectedTask.priority}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completion:</span>
                      <span className="ml-2 font-medium">{selectedTask.completion_percentage}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Dates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {selectedTask.due_date && (
                      <div>
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className="ml-2 font-medium">
                          {new Date(selectedTask.due_date).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedTask.start_date && (
                      <div>
                        <span className="text-muted-foreground">Start Date:</span>
                        <span className="ml-2 font-medium">
                          {new Date(selectedTask.start_date).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedTask.completed_at && (
                      <div>
                        <span className="text-muted-foreground">Completed:</span>
                        <span className="ml-2 font-medium">
                          {new Date(selectedTask.completed_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* X12 Status */}
              {selectedTask.x12_submission_status && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      X12 278 Submission Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className="ml-2 font-medium">{selectedTask.x12_submission_status}</span>
                    </div>
                    {selectedTask.x12_transaction_id && (
                      <div>
                        <span className="text-muted-foreground">Transaction ID:</span>
                        <span className="ml-2 font-medium">{selectedTask.x12_transaction_id}</span>
                      </div>
                    )}
                    {selectedTask.x12_response_code && (
                      <div>
                        <span className="text-muted-foreground">Response Code:</span>
                        <span className="ml-2 font-medium">{selectedTask.x12_response_code}</span>
                      </div>
                    )}
                    {selectedTask.x12_response_message && (
                      <div>
                        <span className="text-muted-foreground">Response:</span>
                        <span className="ml-2 font-medium">{selectedTask.x12_response_message}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              {selectedTask.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedTask.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {selectedTask.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedTask.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{selectedTask.completion_percentage}% Complete</span>
                  </div>
                  <Progress value={selectedTask.completion_percentage} className="h-3" />
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthorizationTaskManagement;

