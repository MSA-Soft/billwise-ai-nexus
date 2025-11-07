// Patient Portal Service
// Authorization status tracking, document upload, secure messaging, payment processing

import { supabase } from '@/integrations/supabase/client';
import { notificationService } from './notificationService';

export interface PatientPortalAuth {
  patientId: string;
  email: string;
  password?: string;
  accessToken?: string;
}

export interface AuthorizationStatus {
  id: string;
  requestNumber: string;
  serviceType: string;
  status: 'pending' | 'approved' | 'denied' | 'expired' | 'cancelled';
  submittedDate: string;
  decisionDate?: string;
  expirationDate?: string;
  notes?: string;
  documents?: DocumentInfo[];
}

export interface DocumentInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  url?: string;
}

export interface PatientMessage {
  id?: string;
  patientId: string;
  subject: string;
  message: string;
  from: 'patient' | 'staff';
  status: 'unread' | 'read' | 'archived';
  attachments?: string[];
  created_at?: string;
  read_at?: string;
}

export interface PaymentInfo {
  id?: string;
  patientId: string;
  amount: number;
  description: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'check';
  transactionId?: string;
  paidAt?: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  insurance?: {
    primary?: {
      name: string;
      memberId: string;
      groupNumber?: string;
    };
    secondary?: {
      name: string;
      memberId: string;
    };
  };
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export class PatientPortalService {
  private static instance: PatientPortalService;

  static getInstance(): PatientPortalService {
    if (!PatientPortalService.instance) {
      PatientPortalService.instance = new PatientPortalService();
    }
    return PatientPortalService.instance;
  }

  // Patient authentication/login
  async authenticatePatient(email: string, password: string): Promise<{ success: boolean; patientId?: string; error?: string }> {
    try {
      // In production, would use Supabase Auth with patient role
      // For now, check if patient exists
      const { data: patient, error } = await supabase
        .from('patients')
        .select('id, email')
        .eq('email', email)
        .single();

      if (error || !patient) {
        return { success: false, error: 'Invalid email or password' };
      }

      // In production, would verify password hash
      return { success: true, patientId: patient.id };
    } catch (error: any) {
      return { success: false, error: error.message || 'Authentication failed' };
    }
  }

  // Get patient profile
  async getPatientProfile(patientId: string): Promise<PatientProfile | null> {
    try {
      const { data: patient, error } = await supabase
        .from('patients')
        .select('*, insurance_primary:primary_insurance_id(*), insurance_secondary:secondary_insurance_id(*)')
        .eq('id', patientId)
        .single();

      if (error || !patient) {
        return null;
      }

      return {
        id: patient.id,
        name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim(),
        email: patient.email || '',
        phone: patient.phone || '',
        dateOfBirth: patient.date_of_birth || '',
        address: {
          street: patient.address || '',
          city: patient.city || '',
          state: patient.state || '',
          zip: patient.zip_code || '',
        },
        insurance: {
          primary: patient.insurance_primary ? {
            name: patient.insurance_primary.name || '',
            memberId: patient.insurance_primary.member_id || '',
            groupNumber: patient.insurance_primary.group_number || '',
          } : undefined,
          secondary: patient.insurance_secondary ? {
            name: patient.insurance_secondary.name || '',
            memberId: patient.insurance_secondary.member_id || '',
          } : undefined,
        },
      };
    } catch (error: any) {
      console.error('Error getting patient profile:', error);
      return null;
    }
  }

  // Update patient profile
  async updatePatientProfile(patientId: string, updates: Partial<PatientProfile>): Promise<boolean> {
    try {
      const updateData: any = {};

      if (updates.phone) updateData.phone = updates.phone;
      if (updates.address) {
        updateData.address = updates.address.street;
        updateData.city = updates.address.city;
        updateData.state = updates.address.state;
        updateData.zip_code = updates.address.zip;
      }
      if (updates.notificationPreferences) {
        updateData.notification_preferences = updates.notificationPreferences;
      }

      const { error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', patientId);

      return !error;
    } catch (error) {
      console.error('Error updating patient profile:', error);
      return false;
    }
  }

  // Get authorization statuses for patient
  async getAuthorizationStatuses(patientId: string): Promise<AuthorizationStatus[]> {
    try {
      const { data: authorizations, error } = await supabase
        .from('authorization_requests')
        .select('*, authorization_documents(*)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (authorizations || []).map(auth => ({
        id: auth.id,
        requestNumber: auth.request_number || auth.id.substring(0, 8).toUpperCase(),
        serviceType: auth.service_type || 'Unknown',
        status: this.mapAuthStatus(auth.status),
        submittedDate: auth.created_at || new Date().toISOString(),
        decisionDate: auth.approved_at || auth.denied_at,
        expirationDate: auth.expiration_date,
        notes: auth.notes || auth.denial_reason,
        documents: (auth.authorization_documents || []).map((doc: any) => ({
          id: doc.id,
          name: doc.document_name || 'Document',
          type: doc.document_type || 'unknown',
          size: doc.file_size || 0,
          uploadedAt: doc.uploaded_at || doc.created_at,
          status: doc.status || 'pending',
          url: doc.file_url,
        })),
      }));
    } catch (error: any) {
      console.error('Error getting authorization statuses:', error);
      return [];
    }
  }

  // Map authorization status
  private mapAuthStatus(status: string): AuthorizationStatus['status'] {
    const statusMap: Record<string, AuthorizationStatus['status']> = {
      'submitted': 'pending',
      'pending': 'pending',
      'approved': 'approved',
      'denied': 'denied',
      'expired': 'expired',
      'cancelled': 'cancelled',
    };
    return statusMap[status] || 'pending';
  }

  // Upload document
  async uploadDocument(
    patientId: string,
    authorizationId: string,
    file: File,
    documentType: string
  ): Promise<{ success: boolean; documentId?: string; error?: string }> {
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${patientId}/${authorizationId}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('patient-documents')
        .getPublicUrl(fileName);

      // Save document record
      const { data: docData, error: docError } = await supabase
        .from('authorization_documents')
        .insert({
          authorization_request_id: authorizationId,
          document_name: file.name,
          document_type: documentType,
          file_url: urlData.publicUrl,
          file_size: file.size,
          uploaded_by: patientId,
          status: 'pending',
        })
        .select()
        .single();

      if (docError) throw docError;

      // Notify staff
      await notificationService.sendEmailNotification(
        '', // Would get staff email
        'New Document Uploaded',
        `Patient ${patientId} uploaded a new document for authorization ${authorizationId}`
      );

      return { success: true, documentId: docData.id };
    } catch (error: any) {
      console.error('Error uploading document:', error);
      return { success: false, error: error.message || 'Failed to upload document' };
    }
  }

  // Send secure message
  async sendMessage(message: PatientMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('patient_messages')
        .insert({
          patient_id: message.patientId,
          subject: message.subject,
          message: message.message,
          message_from: message.from,
          status: 'unread',
          attachments: message.attachments || [],
        })
        .select()
        .single();

      if (error) throw error;

      // Notify recipient
      if (message.from === 'patient') {
        // Notify staff
        await notificationService.sendEmailNotification(
          '', // Would get staff email
          `New Message from Patient: ${message.subject}`,
          message.message
        );
      } else {
        // Notify patient
        const patient = await this.getPatientProfile(message.patientId);
        if (patient?.email) {
          await notificationService.sendEmailNotification(
            patient.email,
            `New Message: ${message.subject}`,
            message.message
          );
        }
      }

      return { success: true, messageId: data.id };
    } catch (error: any) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message || 'Failed to send message' };
    }
  }

  // Get messages
  async getMessages(patientId: string, limit: number = 50): Promise<PatientMessage[]> {
    try {
      const { data, error } = await supabase
        .from('patient_messages')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(msg => ({
        id: msg.id,
        patientId: msg.patient_id,
        subject: msg.subject,
        message: msg.message,
        from: msg.message_from || msg.from, // Support both field names
        status: msg.status,
        attachments: msg.attachments || [],
        created_at: msg.created_at,
        read_at: msg.read_at,
      }));
    } catch (error: any) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  // Mark message as read
  async markMessageAsRead(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('patient_messages')
        .update({
          status: 'read',
          read_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      return !error;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  // Get payment information
  async getPayments(patientId: string): Promise<PaymentInfo[]> {
    try {
      const { data: statements, error } = await supabase
        .from('billing_statements')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (statements || []).map(stmt => ({
        id: stmt.id,
        patientId: stmt.patient_id,
        amount: parseFloat(stmt.current_balance || '0'),
        description: `Statement ${stmt.statement_number || stmt.id.substring(0, 8)}`,
        dueDate: stmt.due_date || stmt.created_at,
        status: this.mapPaymentStatus(stmt.status, stmt.due_date),
      }));
    } catch (error: any) {
      console.error('Error getting payments:', error);
      return [];
    }
  }

  // Map payment status
  private mapPaymentStatus(status: string, dueDate?: string): PaymentInfo['status'] {
    if (status === 'paid') return 'paid';
    if (status === 'partial') return 'partial';
    
    if (dueDate) {
      const due = new Date(dueDate);
      const now = new Date();
      if (due < now) return 'overdue';
    }
    
    return 'pending';
  }

  // Process payment (mock - would integrate with payment processor)
  async processPayment(
    patientId: string,
    paymentId: string,
    amount: number,
    paymentMethod: PaymentInfo['paymentMethod']
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // In production, would integrate with Stripe, PayPal, or other payment processor
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Update statement
      await supabase
        .from('billing_statements')
        .update({
          status: amount >= parseFloat(paymentId) ? 'paid' : 'partial',
          paid_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      // Log payment
      await supabase
        .from('payments')
        .insert({
          patient_id: patientId,
          statement_id: paymentId,
          amount: amount,
          payment_method: paymentMethod,
          transaction_id: transactionId,
          status: 'completed',
        });

      // Notify patient
      const patient = await this.getPatientProfile(patientId);
      if (patient?.email) {
        await notificationService.sendEmailNotification(
          patient.email,
          'Payment Received',
          `Your payment of $${amount.toFixed(2)} has been received. Transaction ID: ${transactionId}`
        );
      }

      return { success: true, transactionId };
    } catch (error: any) {
      console.error('Error processing payment:', error);
      return { success: false, error: error.message || 'Payment processing failed' };
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(
    patientId: string,
    preferences: PatientProfile['notificationPreferences']
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          notification_preferences: preferences,
        })
        .eq('id', patientId);

      return !error;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }
}

export const patientPortalService = PatientPortalService.getInstance();

