// Workflow Automation Service
// Rule-based automation, conditional workflows, and auto-assignment

import { supabase } from '@/integrations/supabase/client';

export interface WorkflowRule {
  id?: string;
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  isActive: boolean;
  priority: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'manual';
  event?: 'authorization_created' | 'authorization_status_changed' | 'task_created' | 'task_overdue' | 'claim_submitted';
  schedule?: string; // Cron expression
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface WorkflowAction {
  type: 'assign' | 'update_status' | 'send_notification' | 'create_task' | 'escalate' | 'update_field';
  target: string;
  parameters: Record<string, any>;
  delay?: number; // Delay in minutes
}

export interface WorkflowExecution {
  id: string;
  rule_id: string;
  rule_name: string;
  trigger_data: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  executed_actions: number;
  failed_actions: number;
  started_at: string;
  completed_at?: string;
  error?: string;
}

export class WorkflowService {
  private static instance: WorkflowService;

  static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  // Create workflow rule
  async createRule(rule: WorkflowRule, userId: string): Promise<WorkflowRule> {
    try {
      const { data, error } = await supabase
        .from('workflow_rules')
        .insert({
          name: rule.name,
          description: rule.description,
          trigger: rule.trigger,
          conditions: rule.conditions,
          actions: rule.actions,
          is_active: rule.isActive,
          priority: rule.priority,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data as WorkflowRule;
    } catch (error: any) {
      console.error('Error creating workflow rule:', error);
      throw new Error(error.message || 'Failed to create workflow rule');
    }
  }

  // Execute workflow for an event
  async executeWorkflow(
    triggerType: WorkflowTrigger['type'],
    eventType: string,
    eventData: any
  ): Promise<WorkflowExecution[]> {
    try {
      // Find matching rules
      const { data: rules, error } = await supabase
        .from('workflow_rules')
        .select('*')
        .eq('is_active', true)
        .eq('trigger->>type', triggerType)
        .eq('trigger->>event', eventType)
        .order('priority', { ascending: false });

      if (error) throw error;

      const executions: WorkflowExecution[] = [];

      for (const rule of rules || []) {
        // Check if conditions are met
        if (this.evaluateConditions(rule.conditions, eventData)) {
          const execution = await this.executeRule(rule, eventData);
          executions.push(execution);
        }
      }

      return executions;
    } catch (error: any) {
      console.error('Error executing workflow:', error);
      throw new Error(error.message || 'Failed to execute workflow');
    }
  }

  // Evaluate workflow conditions
  private evaluateConditions(conditions: WorkflowCondition[], data: any): boolean {
    if (conditions.length === 0) return true;

    let result = true;
    let lastOperator: 'AND' | 'OR' = 'AND';

    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      const fieldValue = this.getFieldValue(data, condition.field);
      const conditionResult = this.evaluateCondition(condition, fieldValue);

      if (i === 0) {
        result = conditionResult;
      } else {
        if (lastOperator === 'AND') {
          result = result && conditionResult;
        } else {
          result = result || conditionResult;
        }
      }

      lastOperator = condition.logicalOperator || 'AND';
    }

    return result;
  }

  // Evaluate single condition
  private evaluateCondition(condition: WorkflowCondition, fieldValue: any): boolean {
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      default:
        return false;
    }
  }

  // Get field value from nested object
  private getFieldValue(data: any, field: string): any {
    const parts = field.split('.');
    let value = data;
    for (const part of parts) {
      value = value?.[part];
    }
    return value;
  }

  // Execute a workflow rule
  private async executeRule(rule: WorkflowRule, eventData: any): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      rule_id: rule.id || '',
      rule_name: rule.name,
      trigger_data: eventData,
      status: 'running',
      executed_actions: 0,
      failed_actions: 0,
      started_at: new Date().toISOString(),
    };

    try {
      for (const action of rule.actions) {
        try {
          // Apply delay if specified
          if (action.delay) {
            await new Promise(resolve => setTimeout(resolve, action.delay * 60 * 1000));
          }

          await this.executeAction(action, eventData);
          execution.executed_actions++;
        } catch (error: any) {
          execution.failed_actions++;
          console.error(`Action failed: ${action.type}`, error);
        }
      }

      execution.status = 'completed';
      execution.completed_at = new Date().toISOString();
    } catch (error: any) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.completed_at = new Date().toISOString();
    }

    // Log execution
    await this.logExecution(execution);

    return execution;
  }

  // Execute a workflow action
  private async executeAction(action: WorkflowAction, eventData: any): Promise<void> {
    switch (action.type) {
      case 'assign':
        await this.actionAssign(action, eventData);
        break;
      case 'update_status':
        await this.actionUpdateStatus(action, eventData);
        break;
      case 'send_notification':
        await this.actionSendNotification(action, eventData);
        break;
      case 'create_task':
        await this.actionCreateTask(action, eventData);
        break;
      case 'escalate':
        await this.actionEscalate(action, eventData);
        break;
      case 'update_field':
        await this.actionUpdateField(action, eventData);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Action: Assign
  private async actionAssign(action: WorkflowAction, eventData: any): Promise<void> {
    const targetId = this.resolveTarget(action.target, eventData);
    const assignedTo = action.parameters.assigned_to || action.parameters.user_id;

    if (!targetId || !assignedTo) {
      throw new Error('Missing required parameters for assign action');
    }

    const tableName = this.getTableName(action.target);
    await supabase
      .from(tableName as any)
      .update({
        assigned_to: assignedTo,
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetId);
  }

  // Action: Update Status
  private async actionUpdateStatus(action: WorkflowAction, eventData: any): Promise<void> {
    const targetId = this.resolveTarget(action.target, eventData);
    const newStatus = action.parameters.status;

    if (!targetId || !newStatus) {
      throw new Error('Missing required parameters for update_status action');
    }

    const tableName = this.getTableName(action.target);
    await supabase
      .from(tableName as any)
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetId);
  }

  // Action: Send Notification
  private async actionSendNotification(action: WorkflowAction, eventData: any): Promise<void> {
    const { notificationService } = await import('./notificationService');
    const userId = action.parameters.user_id || eventData.user_id;
    const type = action.parameters.notification_type || 'status_change';
    const message = action.parameters.message;

    if (!userId) {
      throw new Error('Missing user_id for notification');
    }

    // Use notification service
    switch (type) {
      case 'status_change':
        await notificationService.notifyStatusChange(
          userId,
          action.target,
          eventData.id,
          eventData.old_status,
          eventData.new_status
        );
        break;
      // Add other notification types as needed
    }
  }

  // Action: Create Task
  private async actionCreateTask(action: WorkflowAction, eventData: any): Promise<void> {
    const { authorizationTaskService } = await import('./authorizationTaskService');
    const authorizationRequestId = eventData.authorization_request_id || eventData.id;
    const taskType = action.parameters.task_type || 'follow_up';
    const assignedTo = action.parameters.assigned_to;
    const userId = eventData.user_id || 'system';

    if (!authorizationRequestId) {
      throw new Error('Missing authorization_request_id for task creation');
    }

    await authorizationTaskService.createTaskFromAuthRequest(
      authorizationRequestId,
      taskType,
      {
        assignedTo,
        priority: action.parameters.priority || 'medium',
        dueDate: action.parameters.due_date,
        userId,
      }
    );
  }

  // Action: Escalate
  private async actionEscalate(action: WorkflowAction, eventData: any): Promise<void> {
    const targetId = this.resolveTarget(action.target, eventData);
    const escalatedTo = action.parameters.escalated_to;
    const reason = action.parameters.reason || 'Automated escalation';

    if (!targetId || !escalatedTo) {
      throw new Error('Missing required parameters for escalate action');
    }

    const tableName = this.getTableName(action.target);
    await supabase
      .from(tableName as any)
      .update({
        escalated: true,
        escalated_at: new Date().toISOString(),
        escalated_to: escalatedTo,
        escalation_reason: reason,
        priority: 'urgent',
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetId);
  }

  // Action: Update Field
  private async actionUpdateField(action: WorkflowAction, eventData: any): Promise<void> {
    const targetId = this.resolveTarget(action.target, eventData);
    const field = action.parameters.field;
    const value = action.parameters.value;

    if (!targetId || !field) {
      throw new Error('Missing required parameters for update_field action');
    }

    const tableName = this.getTableName(action.target);
    await supabase
      .from(tableName as any)
      .update({
        [field]: value,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetId);
  }

  // Helper methods
  private resolveTarget(target: string, eventData: any): string | null {
    if (target.startsWith('$')) {
      // Reference to event data field
      const field = target.substring(1);
      return this.getFieldValue(eventData, field);
    }
    return target;
  }

  private getTableName(target: string): string {
    if (target.includes('task')) return 'authorization_tasks';
    if (target.includes('claim')) return 'claims';
    if (target.includes('authorization')) return 'authorization_requests';
    return 'authorization_tasks'; // Default
  }

  // Log workflow execution
  private async logExecution(execution: WorkflowExecution): Promise<void> {
    try {
      await supabase.from('workflow_executions').insert({
        rule_id: execution.rule_id,
        rule_name: execution.rule_name,
        trigger_data: execution.trigger_data,
        status: execution.status,
        executed_actions: execution.executed_actions,
        failed_actions: execution.failed_actions,
        started_at: execution.started_at,
        completed_at: execution.completed_at,
        error: execution.error,
      });
    } catch (error) {
      console.error('Error logging workflow execution:', error);
    }
  }

  // Get workflow rules
  async getRules(isActive?: boolean): Promise<WorkflowRule[]> {
    try {
      let query = supabase.from('workflow_rules').select('*').order('priority', { ascending: false });

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as WorkflowRule[];
    } catch (error: any) {
      console.error('Error fetching workflow rules:', error);
      throw new Error(error.message || 'Failed to fetch workflow rules');
    }
  }

  // Update workflow rule
  async updateRule(ruleId: string, updates: Partial<WorkflowRule>): Promise<WorkflowRule> {
    try {
      const { data, error } = await supabase
        .from('workflow_rules')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ruleId)
        .select()
        .single();

      if (error) throw error;
      return data as WorkflowRule;
    } catch (error: any) {
      console.error('Error updating workflow rule:', error);
      throw new Error(error.message || 'Failed to update workflow rule');
    }
  }

  // Delete workflow rule
  async deleteRule(ruleId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting workflow rule:', error);
      throw new Error(error.message || 'Failed to delete workflow rule');
    }
  }
}

export const workflowService = WorkflowService.getInstance();

