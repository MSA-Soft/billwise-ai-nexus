// Notification Service
// Handles automated email notifications for authorization tasks and requests

import { supabase } from '@/integrations/supabase/client';

export interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  status_changes: boolean;
  due_date_reminders: boolean;
  overdue_alerts: boolean;
  approval_notifications: boolean;
  denial_notifications: boolean;
  task_assignment: boolean;
  reminder_days: number[]; // Days before due date to send reminders (e.g., [1, 3, 7])
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'status_change' | 'due_date_reminder' | 'overdue' | 'approval' | 'denial' | 'task_assignment';
  subject: string;
  message: string;
  email_sent: boolean;
  sms_sent: boolean;
  sent_at?: string;
  created_at: string;
}

export class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Send email notification (using Supabase Edge Function or external service)
  async sendEmailNotification(
    to: string,
    subject: string,
    htmlBody: string,
    textBody?: string
  ): Promise<boolean> {
    try {
      if (!to || !to.trim()) {
        console.warn('Email notification skipped (missing recipient).', { subject });
        return false;
      }
      // Option 1: Use Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          html: htmlBody,
          text: textBody || this.htmlToText(htmlBody),
        },
      });

      if (error) {
        console.error('Email notification error:', error);
        // Fallback: Log to database for manual sending
        await this.logNotification(to, subject, htmlBody, 'email', false);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Email notification error:', error);
      // Fallback: Log to database
      await this.logNotification(to, subject, htmlBody, 'email', false);
      return false;
    }
  }

  // Send SMS notification (using Supabase Edge Function or external service)
  async sendSMSNotification(
    to: string,
    message: string
  ): Promise<boolean> {
    try {
      if (!to || !to.trim()) {
        console.warn('SMS notification skipped (missing recipient).');
        return false;
      }
      // Option 1: Use Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to,
          message,
        },
      });

      if (error) {
        console.error('SMS notification error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('SMS notification error:', error);
      return false;
    }
  }

  // Notify on status change
  async notifyStatusChange(
    userId: string,
    entityType: 'authorization' | 'task' | 'claim',
    entityId: string,
    oldStatus: string,
    newStatus: string,
    entityName?: string
  ): Promise<void> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      if (!preferences.status_changes) return;

      // Get user email
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) return;

      const subject = `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Status Changed`;
      const htmlBody = this.generateStatusChangeEmail(
        entityType,
        entityName || entityId,
        oldStatus,
        newStatus
      );

      if (preferences.email_enabled) {
        await this.sendEmailNotification(user.user.email, subject, htmlBody);
      }

      // Log notification
      await this.logNotification(
        user.user.email,
        subject,
        htmlBody,
        'status_change',
        preferences.email_enabled
      );
    } catch (error) {
      console.error('Status change notification error:', error);
    }
  }

  // Notify on due date reminder
  async notifyDueDateReminder(
    userId: string,
    taskId: string,
    taskTitle: string,
    dueDate: string,
    daysUntilDue: number
  ): Promise<void> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      if (!preferences.due_date_reminders) return;
      
      // Check if reminder should be sent for this number of days
      if (!preferences.reminder_days.includes(daysUntilDue)) return;

      // Get user email
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) return;

      const subject = `Reminder: Task Due in ${daysUntilDue} Day${daysUntilDue !== 1 ? 's' : ''}`;
      const htmlBody = this.generateDueDateReminderEmail(taskTitle, dueDate, daysUntilDue);

      if (preferences.email_enabled) {
        await this.sendEmailNotification(user.user.email, subject, htmlBody);
      }

      // Log notification
      await this.logNotification(
        user.user.email,
        subject,
        htmlBody,
        'due_date_reminder',
        preferences.email_enabled
      );
    } catch (error) {
      console.error('Due date reminder error:', error);
    }
  }

  // Notify on overdue task
  async notifyOverdue(
    userId: string,
    taskId: string,
    taskTitle: string,
    dueDate: string,
    daysOverdue: number
  ): Promise<void> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      if (!preferences.overdue_alerts) return;

      // Get user email
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) return;

      const subject = `⚠️ Overdue Task: ${taskTitle}`;
      const htmlBody = this.generateOverdueEmail(taskTitle, dueDate, daysOverdue);

      if (preferences.email_enabled) {
        await this.sendEmailNotification(user.user.email, subject, htmlBody);
      }

      // Log notification
      await this.logNotification(
        user.user.email,
        subject,
        htmlBody,
        'overdue',
        preferences.email_enabled
      );
    } catch (error) {
      console.error('Overdue notification error:', error);
    }
  }

  // Notify on approval
  async notifyApproval(
    userId: string,
    authorizationId: string,
    authorizationTitle: string,
    approvalNumber?: string
  ): Promise<void> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      if (!preferences.approval_notifications) return;

      // Get user email
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) return;

      const subject = `✅ Authorization Approved: ${authorizationTitle}`;
      const htmlBody = this.generateApprovalEmail(authorizationTitle, approvalNumber);

      if (preferences.email_enabled) {
        await this.sendEmailNotification(user.user.email, subject, htmlBody);
      }

      // Log notification
      await this.logNotification(
        user.user.email,
        subject,
        htmlBody,
        'approval',
        preferences.email_enabled
      );
    } catch (error) {
      console.error('Approval notification error:', error);
    }
  }

  // Notify on denial
  async notifyDenial(
    userId: string,
    authorizationId: string,
    authorizationTitle: string,
    denialReason?: string
  ): Promise<void> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      if (!preferences.denial_notifications) return;

      // Get user email
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) return;

      const subject = `❌ Authorization Denied: ${authorizationTitle}`;
      const htmlBody = this.generateDenialEmail(authorizationTitle, denialReason);

      if (preferences.email_enabled) {
        await this.sendEmailNotification(user.user.email, subject, htmlBody);
      }

      // Log notification
      await this.logNotification(
        user.user.email,
        subject,
        htmlBody,
        'denial',
        preferences.email_enabled
      );
    } catch (error) {
      console.error('Denial notification error:', error);
    }
  }

  // Notify on task assignment
  async notifyTaskAssignment(
    userId: string,
    taskId: string,
    taskTitle: string,
    assignedBy?: string
  ): Promise<void> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      if (!preferences.task_assignment) return;

      // Get user email
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) return;

      const subject = `📋 New Task Assigned: ${taskTitle}`;
      const htmlBody = this.generateTaskAssignmentEmail(taskTitle, assignedBy);

      if (preferences.email_enabled) {
        await this.sendEmailNotification(user.user.email, subject, htmlBody);
      }

      // Log notification
      await this.logNotification(
        user.user.email,
        subject,
        htmlBody,
        'task_assignment',
        preferences.email_enabled
      );
    } catch (error) {
      console.error('Task assignment notification error:', error);
    }
  }

  // Check and send due date reminders
  async checkAndSendDueDateReminders(): Promise<void> {
    try {
      // Get all tasks with due dates in the next 7 days
      const now = new Date();
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const { data: tasks, error } = await supabase
        .from('authorization_tasks')
        .select('*')
        .not('due_date', 'is', null)
        .gte('due_date', now.toISOString())
        .lte('due_date', sevenDaysFromNow.toISOString())
        .not('status', 'in', '(completed,cancelled)');

      if (error) throw error;

      for (const task of tasks || []) {
        if (!task.assigned_to) continue;

        const dueDate = new Date(task.due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Check if reminder was already sent for this day
        const { data: existingReminder } = await supabase
          .from('notification_logs')
          .select('*')
          .eq('user_id', task.assigned_to)
          .eq('type', 'due_date_reminder')
          .eq('related_id', task.id)
          .gte('created_at', new Date(now.setHours(0, 0, 0, 0)).toISOString())
          .single();

        if (!existingReminder && daysUntilDue >= 0 && daysUntilDue <= 7) {
          await this.notifyDueDateReminder(
            task.assigned_to,
            task.id,
            task.title,
            task.due_date,
            daysUntilDue
          );
        }
      }
    } catch (error) {
      console.error('Error checking due date reminders:', error);
    }
  }

  // Check and send overdue alerts
  async checkAndSendOverdueAlerts(): Promise<void> {
    try {
      const now = new Date();

      const { data: tasks, error } = await supabase
        .from('authorization_tasks')
        .select('*')
        .not('due_date', 'is', null)
        .lt('due_date', now.toISOString())
        .not('status', 'in', '(completed,cancelled)');

      if (error) throw error;

      for (const task of tasks || []) {
        if (!task.assigned_to) continue;

        const dueDate = new Date(task.due_date);
        const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        // Send daily overdue alerts
        const { data: lastAlert } = await supabase
          .from('notification_logs')
          .select('*')
          .eq('user_id', task.assigned_to)
          .eq('type', 'overdue')
          .eq('related_id', task.id)
          .gte('created_at', new Date(now.setHours(0, 0, 0, 0)).toISOString())
          .single();

        if (!lastAlert) {
          await this.notifyOverdue(
            task.assigned_to,
            task.id,
            task.title,
            task.due_date,
            daysOverdue
          );
        }
      }
    } catch (error) {
      console.error('Error checking overdue alerts:', error);
    }
  }

  // Get user notification preferences
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Return default preferences
        return {
          email_enabled: true,
          sms_enabled: false,
          status_changes: true,
          due_date_reminders: true,
          overdue_alerts: true,
          approval_notifications: true,
          denial_notifications: true,
          task_assignment: true,
          reminder_days: [1, 3, 7],
        };
      }

      return data as NotificationPreferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      // Return defaults
      return {
        email_enabled: true,
        sms_enabled: false,
        status_changes: true,
        due_date_reminders: true,
        overdue_alerts: true,
        approval_notifications: true,
        denial_notifications: true,
        task_assignment: true,
        reminder_days: [1, 3, 7],
      };
    }
  }

  // Save user notification preferences
  async saveUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }

  // Log notification to database
  private async logNotification(
    recipient: string,
    subject: string,
    message: string,
    type: string,
    sent: boolean
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      await supabase.from('notification_logs').insert({
        user_id: user.user.id,
        recipient,
        subject,
        message,
        type,
        sent,
        sent_at: sent ? new Date().toISOString() : null,
      });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  // Email template generators
  private generateStatusChangeEmail(
    entityType: string,
    entityName: string,
    oldStatus: string,
    newStatus: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
            .status-badge { display: inline-block; padding: 5px 10px; border-radius: 3px; font-weight: bold; }
            .old-status { background: #fbbf24; color: #92400e; }
            .new-status { background: #10b981; color: #065f46; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Status Change Notification</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>The status of your ${entityType} <strong>${entityName}</strong> has been updated:</p>
              <p>
                <span class="status-badge old-status">${oldStatus}</span>
                →
                <span class="status-badge new-status">${newStatus}</span>
              </p>
              <p>Please log in to view more details.</p>
              <p>Best regards,<br>BillWise AI Nexus</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateDueDateReminderEmail(taskTitle: string, dueDate: string, daysUntilDue: number): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
            .urgent { background: #ef4444; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header ${daysUntilDue <= 1 ? 'urgent' : ''}">
              <h2>Task Reminder</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>This is a reminder that your task <strong>${taskTitle}</strong> is due in <strong>${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}</strong>.</p>
              <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
              <p>Please log in to view and complete the task.</p>
              <p>Best regards,<br>BillWise AI Nexus</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateOverdueEmail(taskTitle: string, dueDate: string, daysOverdue: number): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>⚠️ Overdue Task Alert</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your task <strong>${taskTitle}</strong> is <strong>${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue</strong>.</p>
              <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
              <p>Please complete this task as soon as possible.</p>
              <p>Best regards,<br>BillWise AI Nexus</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateApprovalEmail(authorizationTitle: string, approvalNumber?: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✅ Authorization Approved</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Great news! Your authorization request <strong>${authorizationTitle}</strong> has been <strong>approved</strong>.</p>
              ${approvalNumber ? `<p><strong>Approval Number:</strong> ${approvalNumber}</p>` : ''}
              <p>Please log in to view the full details.</p>
              <p>Best regards,<br>BillWise AI Nexus</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateDenialEmail(authorizationTitle: string, denialReason?: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>❌ Authorization Denied</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your authorization request <strong>${authorizationTitle}</strong> has been <strong>denied</strong>.</p>
              ${denialReason ? `<p><strong>Reason:</strong> ${denialReason}</p>` : ''}
              <p>Please log in to view details and consider filing an appeal if appropriate.</p>
              <p>Best regards,<br>BillWise AI Nexus</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateTaskAssignmentEmail(taskTitle: string, assignedBy?: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📋 New Task Assigned</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>A new task has been assigned to you: <strong>${taskTitle}</strong></p>
              ${assignedBy ? `<p><strong>Assigned by:</strong> ${assignedBy}</p>` : ''}
              <p>Please log in to view and start working on the task.</p>
              <p>Best regards,<br>BillWise AI Nexus</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Convert HTML to plain text
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }
}

export const notificationService = NotificationService.getInstance();

