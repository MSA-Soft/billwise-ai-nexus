// Payer Relationship Management Service
// Payer portal integration, performance tracking, communication tools

import { supabase } from '@/integrations/supabase/client';
import { predictiveAnalyticsService } from './predictiveAnalyticsService';

export interface PayerPerformance {
  payerId: string;
  payerName: string;
  metrics: PayerMetrics;
  trends: PayerTrends;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  lastUpdated: string;
}

export interface PayerMetrics {
  totalClaims: number;
  approvedClaims: number;
  deniedClaims: number;
  pendingClaims: number;
  approvalRate: number;
  denialRate: number;
  averageProcessingDays: number;
  averagePaymentDays: number;
  collectionRate: number;
  totalRevenue: number;
  outstandingAmount: number;
}

export interface PayerTrends {
  approvalRateTrend: 'improving' | 'declining' | 'stable';
  processingTimeTrend: 'improving' | 'declining' | 'stable';
  denialRateTrend: 'improving' | 'declining' | 'stable';
  revenueTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface PayerCommunication {
  id?: string;
  payerId: string;
  type: 'email' | 'phone' | 'portal' | 'fax' | 'mail';
  subject: string;
  message: string;
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'responded';
  sentAt?: string;
  respondedAt?: string;
  response?: string;
  created_by?: string;
  created_at?: string;
}

export interface PayerPortalIntegration {
  payerId: string;
  portalUrl?: string;
  apiEndpoint?: string;
  credentials?: {
    username?: string;
    apiKey?: string;
  };
  capabilities: string[]; // 'status_check', 'document_upload', 'real_time_updates'
  isActive: boolean;
  lastSync?: string;
}

export class PayerRelationshipService {
  private static instance: PayerRelationshipService;

  static getInstance(): PayerRelationshipService {
    if (!PayerRelationshipService.instance) {
      PayerRelationshipService.instance = new PayerRelationshipService();
    }
    return PayerRelationshipService.instance;
  }

  // Get comprehensive payer performance
  async getPayerPerformance(payerId: string): Promise<PayerPerformance> {
    try {
      const { data: payer } = await supabase
        .from('insurance_payers')
        .select('*')
        .eq('id', payerId)
        .single();

      if (!payer) {
        throw new Error('Payer not found');
      }

      // Get metrics
      const metrics = await this.calculatePayerMetrics(payerId);

      // Get trends
      const trends = await this.calculatePayerTrends(payerId);

      // Calculate risk level
      const riskLevel = this.calculateRiskLevel(metrics, trends);

      // Get recommendations
      const recommendations = await this.generateRecommendations(payerId, metrics, trends);

      // Get payer behavior analysis
      const behaviorAnalysis = await predictiveAnalyticsService.analyzePayerBehavior(payerId);

      return {
        payerId,
        payerName: payer.name || 'Unknown',
        metrics,
        trends,
        riskLevel,
        recommendations: [...recommendations, ...behaviorAnalysis.recommendations],
        lastUpdated: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Error getting payer performance:', error);
      throw new Error(error.message || 'Failed to get payer performance');
    }
  }

  // Calculate payer metrics
  private async calculatePayerMetrics(payerId: string): Promise<PayerMetrics> {
    try {
      const { data: claims } = await supabase
        .from('claims')
        .select('status, total_charges, created_at, updated_at, patient_responsibility')
        .eq('primary_insurance_id', payerId)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      const totalClaims = claims?.length || 0;
      const approvedClaims = claims?.filter(c => c.status === 'approved' || c.status === 'paid').length || 0;
      const deniedClaims = claims?.filter(c => c.status === 'denied').length || 0;
      const pendingClaims = claims?.filter(c => c.status === 'submitted' || c.status === 'processing').length || 0;

      const approvalRate = totalClaims > 0 ? (approvedClaims / (approvedClaims + deniedClaims)) * 100 : 0;
      const denialRate = totalClaims > 0 ? (deniedClaims / totalClaims) * 100 : 0;

      // Calculate average processing days
      const processedClaims = claims?.filter(c =>
        c.status === 'approved' || c.status === 'denied' || c.status === 'paid'
      ) || [];

      let averageProcessingDays = 0;
      if (processedClaims.length > 0) {
        const totalDays = processedClaims.reduce((sum, claim) => {
          if (claim.created_at && claim.updated_at) {
            const created = new Date(claim.created_at);
            const updated = new Date(claim.updated_at);
            return sum + Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          }
          return sum;
        }, 0);
        averageProcessingDays = Math.round(totalDays / processedClaims.length);
      }

      // Calculate average payment days (for paid claims)
      const paidClaims = claims?.filter(c => c.status === 'paid') || [];
      let averagePaymentDays = 0;
      if (paidClaims.length > 0) {
        const totalDays = paidClaims.reduce((sum, claim) => {
          if (claim.created_at && claim.updated_at) {
            const created = new Date(claim.created_at);
            const paid = new Date(claim.updated_at);
            return sum + Math.ceil((paid.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          }
          return sum;
        }, 0);
        averagePaymentDays = Math.round(totalDays / paidClaims.length);
      }

      // Calculate revenue metrics
      const totalRevenue = claims?.reduce((sum, c) => sum + parseFloat(c.total_charges || '0'), 0) || 0;
      const collectedRevenue = paidClaims.reduce((sum, c) => {
        const charge = parseFloat(c.total_charges || '0');
        const responsibility = parseFloat(c.patient_responsibility || '0');
        return sum + (charge - responsibility);
      }, 0);
      const collectionRate = totalRevenue > 0 ? (collectedRevenue / totalRevenue) * 100 : 0;
      const outstandingAmount = totalRevenue - collectedRevenue;

      return {
        totalClaims,
        approvedClaims,
        deniedClaims,
        pendingClaims,
        approvalRate: Math.round(approvalRate * 10) / 10,
        denialRate: Math.round(denialRate * 10) / 10,
        averageProcessingDays,
        averagePaymentDays,
        collectionRate: Math.round(collectionRate * 10) / 10,
        totalRevenue,
        outstandingAmount,
      };
    } catch (error) {
      // Return default metrics if calculation fails
      return {
        totalClaims: 0,
        approvedClaims: 0,
        deniedClaims: 0,
        pendingClaims: 0,
        approvalRate: 0,
        denialRate: 0,
        averageProcessingDays: 0,
        averagePaymentDays: 0,
        collectionRate: 0,
        totalRevenue: 0,
        outstandingAmount: 0,
      };
    }
  }

  // Calculate payer trends
  private async calculatePayerTrends(payerId: string): Promise<PayerTrends> {
    try {
      // Get recent data (last 90 days)
      const recentStart = new Date();
      recentStart.setDate(recentStart.getDate() - 90);
      
      // Get older data (90-180 days ago)
      const olderStart = new Date();
      olderStart.setDate(olderStart.getDate() - 180);
      const olderEnd = new Date();
      olderEnd.setDate(olderEnd.getDate() - 90);

      const { data: recentClaims } = await supabase
        .from('claims')
        .select('status, created_at, updated_at')
        .eq('primary_insurance_id', payerId)
        .gte('created_at', recentStart.toISOString());

      const { data: olderClaims } = await supabase
        .from('claims')
        .select('status, created_at, updated_at')
        .eq('primary_insurance_id', payerId)
        .gte('created_at', olderStart.toISOString())
        .lt('created_at', olderEnd.toISOString());

      // Calculate approval rate trends
      const recentApproved = recentClaims?.filter(c => c.status === 'approved' || c.status === 'paid').length || 0;
      const recentDenied = recentClaims?.filter(c => c.status === 'denied').length || 0;
      const recentTotal = recentApproved + recentDenied;
      const recentApprovalRate = recentTotal > 0 ? (recentApproved / recentTotal) * 100 : 0;

      const olderApproved = olderClaims?.filter(c => c.status === 'approved' || c.status === 'paid').length || 0;
      const olderDenied = olderClaims?.filter(c => c.status === 'denied').length || 0;
      const olderTotal = olderApproved + olderDenied;
      const olderApprovalRate = olderTotal > 0 ? (olderApproved / olderTotal) * 100 : 0;

      const approvalRateTrend = this.determineTrend(recentApprovalRate, olderApprovalRate);

      // Calculate processing time trends
      const recentProcessingDays = this.calculateAverageProcessingDays(recentClaims || []);
      const olderProcessingDays = this.calculateAverageProcessingDays(olderClaims || []);

      const processingTimeTrend = recentProcessingDays < olderProcessingDays ? 'improving' :
        recentProcessingDays > olderProcessingDays ? 'declining' : 'stable';

      // Calculate denial rate trends
      const recentDenialRate = recentTotal > 0 ? (recentDenied / recentTotal) * 100 : 0;
      const olderDenialRate = olderTotal > 0 ? (olderDenied / olderTotal) * 100 : 0;

      const denialRateTrend = this.determineTrend(olderDenialRate, recentDenialRate); // Inverted (lower is better)

      // Calculate revenue trends
      const recentRevenue = recentClaims?.reduce((sum, c) => sum + parseFloat(c.total_charges || '0'), 0) || 0;
      const olderRevenue = olderClaims?.reduce((sum, c) => sum + parseFloat(c.total_charges || '0'), 0) || 0;

      const revenueTrend = recentRevenue > olderRevenue ? 'increasing' :
        recentRevenue < olderRevenue ? 'decreasing' : 'stable';

      return {
        approvalRateTrend,
        processingTimeTrend,
        denialRateTrend,
        revenueTrend,
      };
    } catch (error) {
      // Return stable trends if calculation fails
      return {
        approvalRateTrend: 'stable',
        processingTimeTrend: 'stable',
        denialRateTrend: 'stable',
        revenueTrend: 'stable',
      };
    }
  }

  // Helper: Calculate average processing days
  private calculateAverageProcessingDays(claims: any[]): number {
    const processed = claims.filter(c =>
      c.status === 'approved' || c.status === 'denied' || c.status === 'paid'
    );

    if (processed.length === 0) return 0;

    const totalDays = processed.reduce((sum, claim) => {
      if (claim.created_at && claim.updated_at) {
        const created = new Date(claim.created_at);
        const updated = new Date(claim.updated_at);
        return sum + Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      }
      return sum;
    }, 0);

    return Math.round(totalDays / processed.length);
  }

  // Helper: Determine trend
  private determineTrend(recent: number, older: number): 'improving' | 'declining' | 'stable' {
    const change = recent - older;
    if (Math.abs(change) < 2) return 'stable';
    return change > 0 ? 'improving' : 'declining';
  }

  // Calculate risk level
  private calculateRiskLevel(metrics: PayerMetrics, trends: PayerTrends): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0;

    // Approval rate (lower is riskier)
    if (metrics.approvalRate < 60) riskScore += 30;
    else if (metrics.approvalRate < 75) riskScore += 15;
    else if (metrics.approvalRate < 85) riskScore += 5;

    // Denial rate (higher is riskier)
    if (metrics.denialRate > 20) riskScore += 25;
    else if (metrics.denialRate > 15) riskScore += 15;
    else if (metrics.denialRate > 10) riskScore += 5;

    // Processing time (longer is riskier)
    if (metrics.averageProcessingDays > 45) riskScore += 15;
    else if (metrics.averageProcessingDays > 30) riskScore += 10;
    else if (metrics.averageProcessingDays > 14) riskScore += 5;

    // Collection rate (lower is riskier)
    if (metrics.collectionRate < 70) riskScore += 20;
    else if (metrics.collectionRate < 80) riskScore += 10;
    else if (metrics.collectionRate < 90) riskScore += 5;

    // Trends (declining is riskier)
    if (trends.approvalRateTrend === 'declining') riskScore += 10;
    if (trends.denialRateTrend === 'declining') riskScore += 10;
    if (trends.processingTimeTrend === 'declining') riskScore += 5;

    if (riskScore >= 60) return 'critical';
    if (riskScore >= 40) return 'high';
    if (riskScore >= 20) return 'medium';
    return 'low';
  }

  // Generate recommendations
  private async generateRecommendations(
    payerId: string,
    metrics: PayerMetrics,
    trends: PayerTrends
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (metrics.approvalRate < 75) {
      recommendations.push(`Low approval rate (${metrics.approvalRate}%) - Review submission requirements and improve documentation`);
    }

    if (metrics.denialRate > 15) {
      recommendations.push(`High denial rate (${metrics.denialRate}%) - Implement denial prevention strategies`);
    }

    if (metrics.averageProcessingDays > 30) {
      recommendations.push(`Slow processing (${metrics.averageProcessingDays} days) - Consider following up on pending claims`);
    }

    if (metrics.collectionRate < 85) {
      recommendations.push(`Low collection rate (${metrics.collectionRate}%) - Review payment posting and follow-up processes`);
    }

    if (trends.approvalRateTrend === 'declining') {
      recommendations.push('Declining approval rate trend - Investigate root causes and implement corrective actions');
    }

    if (trends.denialRateTrend === 'declining') {
      recommendations.push('Increasing denial rate trend - Review and improve claim submission process');
    }

    if (metrics.outstandingAmount > 50000) {
      recommendations.push(`High outstanding amount ($${metrics.outstandingAmount.toLocaleString()}) - Prioritize collection efforts`);
    }

    return recommendations;
  }

  // Get all payer performances
  async getAllPayerPerformances(): Promise<PayerPerformance[]> {
    try {
      const { data: payers } = await supabase
        .from('insurance_payers')
        .select('id, name')
        .eq('status', 'active');

      if (!payers || payers.length === 0) {
        return [];
      }

      const performances = await Promise.all(
        payers.map(payer => this.getPayerPerformance(payer.id))
      );

      return performances;
    } catch (error: any) {
      console.error('Error getting all payer performances:', error);
      throw new Error(error.message || 'Failed to get payer performances');
    }
  }

  // Log communication with payer
  async logCommunication(communication: PayerCommunication, userId: string): Promise<PayerCommunication> {
    try {
      const { data, error } = await supabase
        .from('payer_communications')
        .insert({
          payer_id: communication.payerId,
          type: communication.type,
          subject: communication.subject,
          message: communication.message,
          status: communication.status,
          sent_at: communication.sentAt,
          responded_at: communication.respondedAt,
          response: communication.response,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PayerCommunication;
    } catch (error: any) {
      console.error('Error logging communication:', error);
      throw new Error(error.message || 'Failed to log communication');
    }
  }

  // Get communication history
  async getCommunicationHistory(payerId: string, limit: number = 50): Promise<PayerCommunication[]> {
    try {
      const { data, error } = await supabase
        .from('payer_communications')
        .select('*')
        .eq('payer_id', payerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as PayerCommunication[];
    } catch (error: any) {
      console.error('Error getting communication history:', error);
      throw new Error(error.message || 'Failed to get communication history');
    }
  }

  // Configure payer portal integration
  async configurePortalIntegration(integration: PayerPortalIntegration, userId: string): Promise<PayerPortalIntegration> {
    try {
      const { data, error } = await supabase
        .from('payer_portal_integrations')
        .upsert({
          payer_id: integration.payerId,
          portal_url: integration.portalUrl,
          api_endpoint: integration.apiEndpoint,
          capabilities: integration.capabilities,
          is_active: integration.isActive,
          last_sync: integration.lastSync,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return {
        payerId: data.payer_id,
        portalUrl: data.portal_url,
        apiEndpoint: data.api_endpoint,
        capabilities: data.capabilities,
        isActive: data.is_active,
        lastSync: data.last_sync,
      };
    } catch (error: any) {
      console.error('Error configuring portal integration:', error);
      throw new Error(error.message || 'Failed to configure portal integration');
    }
  }

  // Get payer portal integration
  async getPortalIntegration(payerId: string): Promise<PayerPortalIntegration | null> {
    try {
      const { data, error } = await supabase
        .from('payer_portal_integrations')
        .select('*')
        .eq('payer_id', payerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      if (!data) return null;

      return {
        payerId: data.payer_id,
        portalUrl: data.portal_url,
        apiEndpoint: data.api_endpoint,
        capabilities: data.capabilities,
        isActive: data.is_active,
        lastSync: data.last_sync,
      };
    } catch (error: any) {
      console.error('Error getting portal integration:', error);
      return null;
    }
  }

  // Sync with payer portal (mock implementation)
  async syncWithPayerPortal(payerId: string): Promise<{ success: boolean; updated: number; errors: string[] }> {
    try {
      const integration = await this.getPortalIntegration(payerId);
      
      if (!integration || !integration.isActive) {
        throw new Error('Payer portal integration not configured or inactive');
      }

      // In production, would call actual payer portal API
      // For now, return mock success
      const updated = 0; // Would be actual count of updated claims

      // Update last sync time
      await supabase
        .from('payer_portal_integrations')
        .update({
          last_sync: new Date().toISOString(),
        })
        .eq('payer_id', payerId);

      return {
        success: true,
        updated,
        errors: [],
      };
    } catch (error: any) {
      console.error('Error syncing with payer portal:', error);
      return {
        success: false,
        updated: 0,
        errors: [error.message || 'Sync failed'],
      };
    }
  }
}

export const payerRelationshipService = PayerRelationshipService.getInstance();

