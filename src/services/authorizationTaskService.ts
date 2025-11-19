// Authorization Task Management Service
// Professional task management for authorization forms with X12 278 compliance
// Based on industry best practices and X12 standards

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface AuthorizationTask {
  id: string;
  authorization_request_id: string;
  task_type: 'submit' | 'follow_up' | 'appeal' | 'documentation' | 'review' | 'resubmit';
  title: string;
  description?: string;
  assigned_to?: string;
  assigned_by?: string;
  assigned_at?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  urgency_level?: 'routine' | 'urgent' | 'stat';
  status: 'pending' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | 'overdue';
  completion_percentage: number;
  due_date?: string;
  start_date?: string;
  completed_at?: string;
  estimated_duration_minutes?: number;
  actual_duration_minutes?: number;
  x12_submission_status?: 'not_submitted' | 'submitted' | 'acknowledged' | 'response_received';
  x12_transaction_id?: string;
  x12_response_code?: string;
  x12_response_message?: string;
  x12_submitted_at?: string;
  x12_response_received_at?: string;
  depends_on_task_id?: string;
  blocks_task_id?: string;
  notes?: string;
  internal_notes?: string;
  attachments?: any[];
  reminder_sent_at?: string;
  reminder_count: number;
  last_notified_at?: string;
  escalated: boolean;
  escalated_at?: string;
  escalated_to?: string;
  escalation_reason?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  is_internal: boolean;
  attachments?: any[];
  created_at: string;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  action: string;
  old_value?: any;
  new_value?: any;
  changed_by?: string;
  notes?: string;
  created_at: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  task_type: string;
  priority: string;
  estimated_duration_minutes?: number;
  default_due_date_days?: number;
  required_fields?: any;
  workflow_steps?: any;
  payer_specific: boolean;
  payer_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskFilters {
  status?: string[];
  priority?: string[];
  task_type?: string[];
  assigned_to?: string;
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
  by_priority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
    critical: number;
  };
  by_type: Record<string, number>;
  average_completion_time_hours: number;
}

export class AuthorizationTaskService {
  private static instance: AuthorizationTaskService;

  static getInstance(): AuthorizationTaskService {
    if (!AuthorizationTaskService.instance) {
      AuthorizationTaskService.instance = new AuthorizationTaskService();
    }
    return AuthorizationTaskService.instance;
  }

  // Create task for next visit when appointment is completed
  async createNextVisitTask(
    patientId: string,
    patientName: string,
    completedAppointmentDate: string,
    nextVisitDate?: string,
    options: {
      assignedTo?: string;
      priority?: AuthorizationTask['priority'];
      userId: string;
      notes?: string;
    }
  ): Promise<AuthorizationTask | null> {
    try {
      // Find related authorization request for this patient
      const { data: authRequest, error: authError } = await supabase
        .from('authorization_requests')
        .select('id')
        .eq('patient_name', patientName)
        .or('status.eq.approved,status.eq.pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // If no authorization found, we can still create a visit task without auth request
      // For now, we'll create a standalone visit task
      const dueDate = nextVisitDate 
        ? new Date(nextVisitDate).toISOString()
        : this.calculateNextVisitDate(completedAppointmentDate);

      const title = `Schedule Next Visit - ${patientName}`;
      const description = options.notes || 
        `Patient ${patientName} completed visit on ${new Date(completedAppointmentDate).toLocaleDateString()}. Schedule next visit.`;

      // Create task directly (we'll need to handle this differently if no auth request)
      // For now, let's create it with a placeholder or make authorization_request_id nullable
      // Actually, we should check if we can create tasks without auth requests
      // Let me create a visit-specific task type
      
      if (!authRequest) {
        // Create a visit task without authorization request
        // We'll need to modify the table to allow null auth_request_id or create a separate table
        // For now, let's skip if no auth request exists
        console.warn('No authorization request found for patient, skipping visit task creation');
        return null;
      }

      return this.createTaskFromAuthRequest(
        authRequest.id,
        'follow_up',
        {
          assignedTo: options.assignedTo,
          priority: options.priority || 'medium',
          dueDate: dueDate,
          title,
          description,
          userId: options.userId,
        }
      );
    } catch (error: any) {
      console.error('Error creating next visit task:', error);
      // Don't throw - visit tasks are optional
      return null;
    }
  }

  private calculateNextVisitDate(completedDate: string): string {
    const date = new Date(completedDate);
    // Default: schedule next visit 30 days from completed visit
    date.setDate(date.getDate() + 30);
    return date.toISOString();
  }

  // Create task from authorization request
  async createTaskFromAuthRequest(
    authorizationRequestId: string,
    taskType: AuthorizationTask['task_type'],
    options: {
      assignedTo?: string;
      priority?: AuthorizationTask['priority'];
      dueDate?: string;
      title?: string;
      description?: string;
      userId: string;
    }
  ): Promise<AuthorizationTask> {
    try {
      // Get authorization request details
      const { data: authRequest, error: authError } = await supabase
        .from('authorization_requests')
        .select('*')
        .eq('id', authorizationRequestId)
        .single();

      if (authError) throw authError;
      if (!authRequest) throw new Error('Authorization request not found');

      // Determine priority based on urgency level
      const priority = options.priority || this.determinePriorityFromUrgency(authRequest.urgency_level);

      // Calculate due date based on task type and urgency
      const dueDate = options.dueDate || this.calculateDueDate(taskType, authRequest.urgency_level);

      // Generate title if not provided
      const title = options.title || this.generateTaskTitle(taskType, authRequest);

      // Generate description if not provided
      const description = options.description || this.generateTaskDescription(taskType, authRequest);

      // Create task
      const { data: task, error: taskError } = await supabase
        .from('authorization_tasks')
        .insert({
          authorization_request_id: authorizationRequestId,
          task_type: taskType,
          title,
          description,
          assigned_to: options.assignedTo,
          assigned_by: options.userId,
          assigned_at: options.assignedTo ? new Date().toISOString() : null,
          priority,
          urgency_level: authRequest.urgency_level,
          status: 'pending',
          completion_percentage: 0,
          due_date: dueDate,
          estimated_duration_minutes: this.getEstimatedDuration(taskType),
          created_by: options.userId,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      return task as AuthorizationTask;
    } catch (error: any) {
      console.error('Error creating task:', error);
      throw new Error(error.message || 'Failed to create task');
    }
  }

  // Get tasks with filters
  async getTasks(filters?: TaskFilters, userId?: string): Promise<AuthorizationTask[]> {
    try {
      let query = supabase
        .from('authorization_tasks')
        .select(`
          *,
          authorization_requests (
            id,
            patient_name,
            payer_name_custom,
            status,
            urgency_level
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters?.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority);
      }

      if (filters?.task_type && filters.task_type.length > 0) {
        query = query.in('task_type', filters.task_type);
      }

      // Only filter by assigned_to if explicitly provided
      // Otherwise, RLS will handle showing tasks user has access to
      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      // Removed the else clause that was filtering to only user's tasks
      // This allows RLS to show all tasks the user has access to

      if (filters?.due_date_from) {
        query = query.gte('due_date', filters.due_date_from);
      }

      if (filters?.due_date_to) {
        query = query.lte('due_date', filters.due_date_to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      // Apply search filter if provided
      let tasks = (data || []) as any[];
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        tasks = tasks.filter(task =>
          task.title?.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.authorization_requests?.patient_name?.toLowerCase().includes(searchLower)
        );
      }

      console.log('✅ Loaded tasks:', tasks.length);
      return tasks as AuthorizationTask[];
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      throw new Error(error.message || 'Failed to fetch tasks');
    }
  }

  // Get task by ID
  async getTaskById(taskId: string): Promise<AuthorizationTask> {
    try {
      const { data, error } = await supabase
        .from('authorization_tasks')
        .select(`
          *,
          authorization_requests (*),
          authorization_task_comments (*),
          authorization_task_history (*)
        `)
        .eq('id', taskId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Task not found');

      return data as AuthorizationTask;
    } catch (error: any) {
      console.error('Error fetching task:', error);
      throw new Error(error.message || 'Failed to fetch task');
    }
  }

  // Update task
  async updateTask(
    taskId: string,
    updates: Partial<AuthorizationTask>,
    userId: string
  ): Promise<AuthorizationTask> {
    try {
      const { data, error } = await supabase
        .from('authorization_tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      return data as AuthorizationTask;
    } catch (error: any) {
      console.error('Error updating task:', error);
      throw new Error(error.message || 'Failed to update task');
    }
  }

  // Assign task
  async assignTask(taskId: string, assignedTo: string, assignedBy: string): Promise<AuthorizationTask> {
    return this.updateTask(taskId, {
      assigned_to: assignedTo,
      assigned_by: assignedBy,
      assigned_at: new Date().toISOString(),
    }, assignedBy);
  }

  // Update task status
  async updateTaskStatus(
    taskId: string,
    status: AuthorizationTask['status'],
    userId: string,
    notes?: string
  ): Promise<AuthorizationTask> {
    const updates: Partial<AuthorizationTask> = {
      status,
    };

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
      updates.completion_percentage = 100;
    } else if (status === 'in_progress' && !updates.start_date) {
      updates.start_date = new Date().toISOString();
    }

    if (notes) {
      updates.notes = notes;
    }

    return this.updateTask(taskId, updates, userId);
  }

  // Add comment to task
  async addComment(
    taskId: string,
    comment: string,
    userId: string,
    isInternal: boolean = false
  ): Promise<TaskComment> {
    try {
      const { data, error } = await supabase
        .from('authorization_task_comments')
        .insert({
          task_id: taskId,
          user_id: userId,
          comment,
          is_internal: isInternal,
        })
        .select()
        .single();

      if (error) throw error;

      return data as TaskComment;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      throw new Error(error.message || 'Failed to add comment');
    }
  }

  // Get task statistics
  async getTaskStats(userId?: string): Promise<TaskStats> {
    try {
      let query = supabase.from('authorization_tasks').select('*');

      if (userId) {
        query = query.eq('assigned_to', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const tasks = (data || []) as AuthorizationTask[];

      const stats: TaskStats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        overdue: tasks.filter(t => {
          if (!t.due_date || t.status === 'completed' || t.status === 'cancelled') return false;
          return new Date(t.due_date) < new Date();
        }).length,
        by_priority: {
          low: tasks.filter(t => t.priority === 'low').length,
          medium: tasks.filter(t => t.priority === 'medium').length,
          high: tasks.filter(t => t.priority === 'high').length,
          urgent: tasks.filter(t => t.priority === 'urgent').length,
          critical: tasks.filter(t => t.priority === 'critical').length,
        },
        by_type: {},
        average_completion_time_hours: 0,
      };

      // Calculate by_type
      tasks.forEach(task => {
        stats.by_type[task.task_type] = (stats.by_type[task.task_type] || 0) + 1;
      });

      // Calculate average completion time
      const completedTasks = tasks.filter(t => t.status === 'completed' && t.completed_at && t.start_date);
      if (completedTasks.length > 0) {
        const totalHours = completedTasks.reduce((sum, task) => {
          const start = new Date(task.start_date!).getTime();
          const end = new Date(task.completed_at!).getTime();
          return sum + (end - start) / (1000 * 60 * 60);
        }, 0);
        stats.average_completion_time_hours = totalHours / completedTasks.length;
      }

      return stats;
    } catch (error: any) {
      console.error('Error fetching task stats:', error);
      throw new Error(error.message || 'Failed to fetch task stats');
    }
  }

  // Get overdue tasks
  async getOverdueTasks(userId?: string): Promise<AuthorizationTask[]> {
    try {
      let query = supabase
        .from('authorization_tasks')
        .select('*')
        .lt('due_date', new Date().toISOString())
        .not('status', 'in', '(completed,cancelled)')
        .order('due_date', { ascending: true });

      if (userId) {
        query = query.eq('assigned_to', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []) as AuthorizationTask[];
    } catch (error: any) {
      console.error('Error fetching overdue tasks:', error);
      throw new Error(error.message || 'Failed to fetch overdue tasks');
    }
  }

  // Escalate task
  async escalateTask(
    taskId: string,
    escalatedTo: string,
    reason: string,
    userId: string
  ): Promise<AuthorizationTask> {
    return this.updateTask(taskId, {
      escalated: true,
      escalated_at: new Date().toISOString(),
      escalated_to: escalatedTo,
      escalation_reason: reason,
      priority: 'urgent', // Auto-upgrade priority on escalation
    }, userId);
  }

  // Update X12 submission status
  async updateX12Status(
    taskId: string,
    status: AuthorizationTask['x12_submission_status'],
    transactionId?: string,
    responseCode?: string,
    responseMessage?: string
  ): Promise<AuthorizationTask> {
    const updates: Partial<AuthorizationTask> = {
      x12_submission_status: status,
    };

    if (status === 'submitted') {
      updates.x12_submitted_at = new Date().toISOString();
      if (transactionId) updates.x12_transaction_id = transactionId;
    } else if (status === 'response_received') {
      updates.x12_response_received_at = new Date().toISOString();
      if (responseCode) updates.x12_response_code = responseCode;
      if (responseMessage) updates.x12_response_message = responseMessage;
    }

    return this.updateTask(taskId, updates, 'system');
  }

  // Helper methods
  private determinePriorityFromUrgency(urgency?: string): AuthorizationTask['priority'] {
    switch (urgency) {
      case 'stat':
        return 'critical';
      case 'urgent':
        return 'urgent';
      case 'routine':
      default:
        return 'medium';
    }
  }

  private calculateDueDate(taskType: string, urgency?: string): string {
    const now = new Date();
    let daysToAdd = 3; // Default

    // Adjust based on task type
    switch (taskType) {
      case 'submit':
        daysToAdd = urgency === 'stat' ? 0 : urgency === 'urgent' ? 1 : 2;
        break;
      case 'follow_up':
        daysToAdd = 5;
        break;
      case 'appeal':
        daysToAdd = 7;
        break;
      case 'documentation':
        daysToAdd = 2;
        break;
      case 'review':
        daysToAdd = 1;
        break;
      case 'resubmit':
        daysToAdd = 3;
        break;
    }

    now.setDate(now.getDate() + daysToAdd);
    return now.toISOString();
  }

  private generateTaskTitle(taskType: string, authRequest: any): string {
    const patientName = authRequest.patient_name || 'Patient';
    const serviceType = authRequest.service_type || 'Service';

    switch (taskType) {
      case 'submit':
        return `Submit Authorization Request for ${patientName} - ${serviceType}`;
      case 'follow_up':
        return `Follow Up on Authorization for ${patientName}`;
      case 'appeal':
        return `Appeal Denied Authorization for ${patientName}`;
      case 'documentation':
        return `Gather Documentation for ${patientName} - ${serviceType}`;
      case 'review':
        return `Review Authorization Request for ${patientName}`;
      case 'resubmit':
        return `Resubmit Authorization for ${patientName} - ${serviceType}`;
      default:
        return `Authorization Task for ${patientName}`;
    }
  }

  private generateTaskDescription(taskType: string, authRequest: any): string {
    const baseDescription = `Authorization request for ${authRequest.patient_name || 'patient'}`;
    
    switch (taskType) {
      case 'submit':
        return `${baseDescription}. Submit via X12 278 transaction to ${authRequest.payer_name_custom || 'payer'}.`;
      case 'follow_up':
        return `${baseDescription}. Follow up on submission status and response.`;
      case 'appeal':
        return `${baseDescription}. Prepare and submit appeal for denied authorization.`;
      case 'documentation':
        return `${baseDescription}. Collect and organize required clinical documentation.`;
      case 'review':
        return `${baseDescription}. Review request completeness before submission.`;
      case 'resubmit':
        return `${baseDescription}. Resubmit with additional information or corrections.`;
      default:
        return baseDescription;
    }
  }

  private getEstimatedDuration(taskType: string): number {
    // Duration in minutes
    switch (taskType) {
      case 'submit':
        return 30;
      case 'follow_up':
        return 15;
      case 'appeal':
        return 120;
      case 'documentation':
        return 60;
      case 'review':
        return 20;
      case 'resubmit':
        return 45;
      default:
        return 30;
    }
  }
}

export const authorizationTaskService = AuthorizationTaskService.getInstance();

