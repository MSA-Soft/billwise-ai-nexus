// Payer API Connections Service
// Direct payer API integration for real-time status updates

import { supabase } from '@/integrations/supabase/client';
import { notificationService } from './notificationService';

export interface PayerAPIConnection {
  id?: string;
  payerId: string;
  payerName: string;
  apiType: 'x12' | 'rest' | 'soap' | 'fhir';
  baseUrl: string;
  credentials: {
    username?: string;
    password?: string;
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
  };
  capabilities: string[]; // 'status_check', 'eligibility', 'prior_auth', 'claim_submission'
  isActive: boolean;
  lastSyncAt?: string;
}

export interface ClaimStatusUpdate {
  claimId: string;
  status: string;
  statusCode?: string;
  statusMessage?: string;
  paidAmount?: number;
  patientResponsibility?: number;
  denialCode?: string;
  denialReason?: string;
  updatedAt: string;
}

export class PayerAPIService {
  private static instance: PayerAPIService;

  static getInstance(): PayerAPIService {
    if (!PayerAPIService.instance) {
      PayerAPIService.instance = new PayerAPIService();
    }
    return PayerAPIService.instance;
  }

  // Connect to payer API
  async connectToPayerAPI(connection: PayerAPIConnection): Promise<PayerAPIConnection> {
    try {
      const { data, error } = await supabase
        .from('payer_api_connections')
        .insert({
          payer_id: connection.payerId,
          payer_name: connection.payerName,
          api_type: connection.apiType,
          base_url: connection.baseUrl,
          credentials: connection.credentials, // Encrypt in production
          capabilities: connection.capabilities,
          is_active: connection.isActive,
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapToPayerAPIConnection(data);
    } catch (error: any) {
      console.error('Error connecting to payer API:', error);
      throw new Error(error.message || 'Failed to connect to payer API');
    }
  }

  // Check claim status via payer API
  async checkClaimStatus(connectionId: string, claimNumber: string): Promise<ClaimStatusUpdate | null> {
    try {
      const connection = await this.getPayerAPIConnection(connectionId);
      if (!connection || !connection.isActive) {
        throw new Error('Payer API connection not found or inactive');
      }

      // Call payer API based on type
      switch (connection.apiType) {
        case 'x12':
          return await this.checkStatusX12(connection, claimNumber);
        case 'rest':
          return await this.checkStatusREST(connection, claimNumber);
        case 'fhir':
          return await this.checkStatusFHIR(connection, claimNumber);
        default:
          throw new Error(`Unsupported API type: ${connection.apiType}`);
      }
    } catch (error: any) {
      console.error('Error checking claim status:', error);
      return null;
    }
  }

  // Check status via X12 276/277
  private async checkStatusX12(connection: PayerAPIConnection, claimNumber: string): Promise<ClaimStatusUpdate | null> {
    // In production, would send X12 276 request and parse 277 response
    // This is a placeholder
    return {
      claimId: claimNumber,
      status: 'processing',
      updatedAt: new Date().toISOString(),
    };
  }

  // Check status via REST API
  private async checkStatusREST(connection: PayerAPIConnection, claimNumber: string): Promise<ClaimStatusUpdate | null> {
    try {
      const response = await fetch(`${connection.baseUrl}/claims/${claimNumber}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${connection.credentials.apiKey}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        claimId: claimNumber,
        status: data.status || 'unknown',
        statusCode: data.statusCode,
        statusMessage: data.message,
        paidAmount: data.paidAmount,
        patientResponsibility: data.patientResponsibility,
        denialCode: data.denialCode,
        denialReason: data.denialReason,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return null;
    }
  }

  // Check status via FHIR
  private async checkStatusFHIR(connection: PayerAPIConnection, claimNumber: string): Promise<ClaimStatusUpdate | null> {
    try {
      const response = await fetch(`${connection.baseUrl}/ClaimResponse?request=${claimNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${connection.credentials.apiKey}`,
          'Accept': 'application/fhir+json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const bundle = await response.json();
      if (bundle.entry && bundle.entry.length > 0) {
        const claimResponse = bundle.entry[0].resource;
        return {
          claimId: claimNumber,
          status: this.mapFHIRStatus(claimResponse.outcome),
          statusMessage: claimResponse.disposition,
          updatedAt: claimResponse.meta?.lastUpdated || new Date().toISOString(),
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // Map FHIR outcome to status
  private mapFHIRStatus(outcome: string): string {
    const statusMap: Record<string, string> = {
      'queued': 'processing',
      'complete': 'paid',
      'error': 'denied',
      'partial': 'partial',
    };
    return statusMap[outcome] || 'unknown';
  }

  // Sync all pending claims with payer APIs
  async syncPendingClaims(): Promise<number> {
    try {
      const { data: pendingClaims } = await supabase
        .from('claims')
        .select('id, claim_number, primary_insurance_id, status')
        .in('status', ['submitted', 'processing'])
        .limit(100);

      if (!pendingClaims || pendingClaims.length === 0) {
        return 0;
      }

      let synced = 0;

      for (const claim of pendingClaims) {
        try {
          // Get payer API connection
          const { data: payer } = await supabase
            .from('insurance_payers')
            .select('id, name')
            .eq('id', claim.primary_insurance_id)
            .single();

          if (!payer) continue;

          const { data: connections } = await supabase
            .from('payer_api_connections')
            .select('*')
            .eq('payer_id', payer.id)
            .eq('is_active', true)
            .limit(1);

          if (!connections || connections.length === 0) continue;

          const connection = this.mapToPayerAPIConnection(connections[0]);
          const statusUpdate = await this.checkClaimStatus(connection.id!, claim.claim_number || '');

          if (statusUpdate) {
            // Update claim status
            await supabase
              .from('claims')
              .update({
                status: statusUpdate.status,
                updated_at: new Date().toISOString(),
              })
              .eq('id', claim.id);

            // Log status update
            await supabase.from('claim_status_history').insert({
              claim_id: claim.id,
              status: statusUpdate.status,
              notes: statusUpdate.statusMessage,
              changed_by: 'system',
            });

            synced++;
          }
        } catch (error) {
          console.error(`Error syncing claim ${claim.id}:`, error);
        }
      }

      return synced;
    } catch (error: any) {
      console.error('Error syncing pending claims:', error);
      return 0;
    }
  }

  // Get payer API connection
  private async getPayerAPIConnection(connectionId: string): Promise<PayerAPIConnection | null> {
    try {
      const { data, error } = await supabase
        .from('payer_api_connections')
        .select('*')
        .eq('id', connectionId)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapToPayerAPIConnection(data);
    } catch (error) {
      return null;
    }
  }

  // Map database record to PayerAPIConnection
  private mapToPayerAPIConnection(data: any): PayerAPIConnection {
    return {
      id: data.id,
      payerId: data.payer_id,
      payerName: data.payer_name,
      apiType: data.api_type,
      baseUrl: data.base_url,
      credentials: data.credentials || {},
      capabilities: data.capabilities || [],
      isActive: data.is_active,
      lastSyncAt: data.last_sync_at,
    };
  }
}

export const payerAPIService = PayerAPIService.getInstance();

