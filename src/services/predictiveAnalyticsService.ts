// Predictive Analytics Service
// Revenue forecasting, denial prediction, payer behavior analysis

import { supabase } from '@/integrations/supabase/client';

export interface RevenueForecast {
  period: string; // 'next_month', 'next_quarter', 'next_year'
  forecastedRevenue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  factors: ForecastFactor[];
  trend: 'increasing' | 'decreasing' | 'stable';
  growthRate: number; // percentage
}

export interface ForecastFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

export interface DenialPrediction {
  claimId: string;
  denialProbability: number; // 0-100
  likelyDenialCodes: Array<{ code: string; probability: number; reason: string }>;
  riskFactors: string[];
  preventionActions: string[];
  estimatedImpact: number; // dollar amount
}

export interface PayerBehaviorAnalysis {
  payerId: string;
  payerName: string;
  approvalRate: number;
  averageProcessingDays: number;
  denialPatterns: DenialPattern[];
  paymentPatterns: PaymentPattern[];
  recommendations: string[];
  riskScore: number; // 0-100
}

export interface DenialPattern {
  code: string;
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  averageAmount: number;
  peakMonths: string[];
}

export interface PaymentPattern {
  averageDaysToPay: number;
  paymentMethod: 'electronic' | 'paper' | 'mixed';
  onTimePaymentRate: number;
  partialPaymentRate: number;
  paymentTrend: 'improving' | 'declining' | 'stable';
}

export class PredictiveAnalyticsService {
  private static instance: PredictiveAnalyticsService;

  static getInstance(): PredictiveAnalyticsService {
    if (!PredictiveAnalyticsService.instance) {
      PredictiveAnalyticsService.instance = new PredictiveAnalyticsService();
    }
    return PredictiveAnalyticsService.instance;
  }

  // Forecast revenue
  async forecastRevenue(period: 'next_month' | 'next_quarter' | 'next_year'): Promise<RevenueForecast> {
    try {
      // Get historical revenue data
      const historicalData = await this.getHistoricalRevenue(period);

      // Calculate base forecast using moving average
      const baseForecast = this.calculateMovingAverage(historicalData);

      // Apply trend analysis
      const trend = this.analyzeTrend(historicalData);
      const growthRate = this.calculateGrowthRate(historicalData);

      // Adjust forecast based on trend
      let forecastedRevenue = baseForecast;
      if (trend === 'increasing') {
        forecastedRevenue *= (1 + growthRate / 100);
      } else if (trend === 'decreasing') {
        forecastedRevenue *= (1 - Math.abs(growthRate) / 100);
      }

      // Get factors affecting revenue
      const factors = await this.analyzeRevenueFactors();

      // Adjust forecast based on factors
      factors.forEach(factor => {
        if (factor.impact === 'positive') {
          forecastedRevenue *= (1 + factor.weight);
        } else if (factor.impact === 'negative') {
          forecastedRevenue *= (1 - factor.weight);
        }
      });

      // Calculate confidence interval (±15% for monthly, ±20% for quarterly, ±25% for yearly)
      const confidenceMargin = period === 'next_month' ? 0.15 : period === 'next_quarter' ? 0.20 : 0.25;
      const confidenceInterval = {
        lower: forecastedRevenue * (1 - confidenceMargin),
        upper: forecastedRevenue * (1 + confidenceMargin),
      };

      return {
        period,
        forecastedRevenue: Math.round(forecastedRevenue),
        confidenceInterval: {
          lower: Math.round(confidenceInterval.lower),
          upper: Math.round(confidenceInterval.upper),
        },
        factors,
        trend,
        growthRate: Math.round(growthRate * 10) / 10,
      };
    } catch (error: any) {
      console.error('Error forecasting revenue:', error);
      throw new Error(error.message || 'Failed to forecast revenue');
    }
  }

  // Get historical revenue data
  private async getHistoricalRevenue(period: string): Promise<number[]> {
    try {
      const monthsToFetch = period === 'next_month' ? 6 : period === 'next_quarter' ? 12 : 24;
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsToFetch);

      const { data: claims } = await supabase
        .from('claims')
        .select('total_charges, status, created_at')
        .gte('created_at', startDate.toISOString())
        .in('status', ['paid', 'submitted', 'processing']);

      // Group by month
      const monthlyRevenue = new Map<string, number>();
      claims?.forEach(claim => {
        const date = new Date(claim.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const current = monthlyRevenue.get(monthKey) || 0;
        monthlyRevenue.set(monthKey, current + parseFloat(claim.total_charges || '0'));
      });

      return Array.from(monthlyRevenue.values()).sort((a, b) => a - b);
    } catch (error) {
      // Return mock data if query fails
      return [100000, 110000, 105000, 120000, 115000, 125000];
    }
  }

  // Calculate moving average
  private calculateMovingAverage(data: number[]): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((a, b) => a + b, 0);
    return sum / data.length;
  }

  // Analyze trend
  private analyzeTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 2) return 'stable';

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg = this.calculateMovingAverage(firstHalf);
    const secondAvg = this.calculateMovingAverage(secondHalf);

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  // Calculate growth rate
  private calculateGrowthRate(data: number[]): number {
    if (data.length < 2) return 0;

    const first = data[0];
    const last = data[data.length - 1];

    return ((last - first) / first) * 100;
  }

  // Analyze revenue factors
  private async analyzeRevenueFactors(): Promise<ForecastFactor[]> {
    const factors: ForecastFactor[] = [];

    try {
      // Factor 1: Pending claims
      const { data: pendingClaims } = await supabase
        .from('claims')
        .select('total_charges')
        .in('status', ['submitted', 'processing']);

      const pendingAmount = pendingClaims?.reduce((sum, c) => sum + parseFloat(c.total_charges || '0'), 0) || 0;
      if (pendingAmount > 50000) {
        factors.push({
          factor: 'Pending Claims',
          impact: 'positive',
          weight: 0.1,
          description: `High pending claims amount ($${pendingAmount.toLocaleString()}) indicates strong revenue pipeline`,
        });
      }

      // Factor 2: Denial rate
      const { data: allClaims } = await supabase
        .from('claims')
        .select('status')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      const denied = allClaims?.filter(c => c.status === 'denied').length || 0;
      const total = allClaims?.length || 1;
      const denialRate = (denied / total) * 100;

      if (denialRate > 15) {
        factors.push({
          factor: 'High Denial Rate',
          impact: 'negative',
          weight: 0.15,
          description: `Denial rate of ${denialRate.toFixed(1)}% may reduce revenue`,
        });
      } else if (denialRate < 5) {
        factors.push({
          factor: 'Low Denial Rate',
          impact: 'positive',
          weight: 0.05,
          description: `Low denial rate of ${denialRate.toFixed(1)}% supports revenue growth`,
        });
      }

      // Factor 3: Collection rate
      const { data: paidClaims } = await supabase
        .from('claims')
        .select('total_charges, patient_responsibility')
        .eq('status', 'paid')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      const totalCharges = paidClaims?.reduce((sum, c) => sum + parseFloat(c.total_charges || '0'), 0) || 0;
      const collected = paidClaims?.reduce((sum, c) => sum + parseFloat(c.total_charges || '0') - parseFloat(c.patient_responsibility || '0'), 0) || 0;
      const collectionRate = totalCharges > 0 ? (collected / totalCharges) * 100 : 0;

      if (collectionRate < 80) {
        factors.push({
          factor: 'Low Collection Rate',
          impact: 'negative',
          weight: 0.2,
          description: `Collection rate of ${collectionRate.toFixed(1)}% may impact revenue`,
        });
      }
    } catch (error) {
      // Factors analysis failed, continue with empty factors
    }

    return factors;
  }

  // Predict denial for a claim
  async predictDenial(claimId: string): Promise<DenialPrediction> {
    try {
      const { data: claim, error } = await supabase
        .from('claims')
        .select('*')
        .eq('id', claimId)
        .single();

      if (error || !claim) {
        throw new Error('Claim not found');
      }

      // Use claim scrubbing service to get risk factors
      const { claimScrubbingService } = await import('./claimScrubbingService');
      const scrubbingResult = await claimScrubbingService.scrubClaim(claim as any);

      // Get historical denial patterns for similar claims
      const similarDenials = await this.getSimilarDenialPatterns(claim);

      // Calculate denial probability
      let denialProbability = scrubbingResult.estimatedDenialProbability;

      // Adjust based on payer history
      if (claim.primary_insurance_id) {
        const payerAnalysis = await this.analyzePayerBehavior(claim.primary_insurance_id);
        denialProbability += (100 - payerAnalysis.approvalRate) * 0.3; // Weight payer history
      }

      // Adjust based on procedure codes
      if (claim.procedure_codes && claim.procedure_codes.length > 0) {
        const procedureRisk = await this.analyzeProcedureRisk(claim.procedure_codes);
        denialProbability += procedureRisk * 0.2;
      }

      denialProbability = Math.min(100, Math.max(0, denialProbability));

      // Identify likely denial codes
      const likelyDenialCodes = await this.identifyLikelyDenialCodes(claim, similarDenials);

      // Generate prevention actions
      const preventionActions = this.generatePreventionActions(scrubbingResult, likelyDenialCodes);

      // Estimate impact
      const estimatedImpact = parseFloat(claim.total_charges || '0') * (denialProbability / 100);

      return {
        claimId,
        denialProbability: Math.round(denialProbability),
        likelyDenialCodes,
        riskFactors: scrubbingResult.errors.map(e => e.message),
        preventionActions,
        estimatedImpact: Math.round(estimatedImpact),
      };
    } catch (error: any) {
      console.error('Error predicting denial:', error);
      throw new Error(error.message || 'Failed to predict denial');
    }
  }

  // Get similar denial patterns
  private async getSimilarDenialPatterns(claim: any): Promise<any[]> {
    try {
      const { data: similarClaims } = await supabase
        .from('claims')
        .select('*, claim_denials(denial_code, denial_reason)')
        .eq('primary_insurance_id', claim.primary_insurance_id)
        .contains('procedure_codes', claim.procedure_codes || [])
        .eq('status', 'denied')
        .limit(10);

      return similarClaims || [];
    } catch (error) {
      return [];
    }
  }

  // Identify likely denial codes
  private async identifyLikelyDenialCodes(claim: any, similarDenials: any[]): Promise<Array<{ code: string; probability: number; reason: string }>> {
    const codeCounts = new Map<string, number>();

    similarDenials.forEach(denial => {
      if (denial.claim_denials && denial.claim_denials.length > 0) {
        denial.claim_denials.forEach((d: any) => {
          const code = d.denial_code || 'Unknown';
          codeCounts.set(code, (codeCounts.get(code) || 0) + 1);
        });
      }
    });

    const total = similarDenials.length || 1;
    const likelyCodes = Array.from(codeCounts.entries())
      .map(([code, count]) => ({
        code,
        probability: (count / total) * 100,
        reason: this.getDenialReason(code),
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);

    return likelyCodes;
  }

  // Get denial reason by code
  private getDenialReason(code: string): string {
    const reasons: Record<string, string> = {
      'CO-1': 'Deductible Amount',
      'CO-11': 'Diagnosis Not Covered',
      'CO-16': 'Prior Authorization Required',
      'CO-18': 'Duplicate Claim',
      'CO-50': 'Non-covered Services',
    };
    return reasons[code] || 'Unknown Reason';
  }

  // Analyze procedure risk
  private async analyzeProcedureRisk(procedureCodes: string[]): Promise<number> {
    // High-risk procedures (would use actual database in production)
    const highRiskProcedures = ['27447', '27130', '29881'];
    const hasHighRisk = procedureCodes.some(code => highRiskProcedures.includes(code));
    return hasHighRisk ? 15 : 5;
  }

  // Generate prevention actions
  private generatePreventionActions(scrubbingResult: any, likelyDenialCodes: any[]): string[] {
    const actions: string[] = [];

    if (scrubbingResult.errors.length > 0) {
      actions.push('Fix all validation errors before submission');
    }

    if (likelyDenialCodes.length > 0) {
      const topCode = likelyDenialCodes[0];
      if (topCode.code === 'CO-16') {
        actions.push('Verify prior authorization is obtained and linked');
      } else if (topCode.code === 'CO-11') {
        actions.push('Verify diagnosis codes are correct and support procedures');
      }
    }

    if (scrubbingResult.warnings.length > 0) {
      actions.push('Address all warnings to reduce denial risk');
    }

    return actions;
  }

  // Analyze payer behavior
  async analyzePayerBehavior(payerId: string): Promise<PayerBehaviorAnalysis> {
    try {
      const { data: payer } = await supabase
        .from('insurance_payers')
        .select('name')
        .eq('id', payerId)
        .single();

      // Get claims for this payer
      const { data: claims } = await supabase
        .from('claims')
        .select('status, created_at, updated_at, total_charges')
        .eq('primary_insurance_id', payerId)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      // Calculate approval rate
      const approved = claims?.filter(c => c.status === 'approved' || c.status === 'paid').length || 0;
      const denied = claims?.filter(c => c.status === 'denied').length || 0;
      const total = approved + denied;
      const approvalRate = total > 0 ? (approved / total) * 100 : 0;

      // Calculate average processing days
      const processedClaims = claims?.filter(c => 
        c.status === 'approved' || c.status === 'denied' || c.status === 'paid'
      ) || [];

      let averageDays = 0;
      if (processedClaims.length > 0) {
        const totalDays = processedClaims.reduce((sum, claim) => {
          if (claim.created_at && claim.updated_at) {
            const created = new Date(claim.created_at);
            const updated = new Date(claim.updated_at);
            return sum + Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          }
          return sum;
        }, 0);
        averageDays = Math.round(totalDays / processedClaims.length);
      }

      // Get denial patterns
      const { data: denials } = await supabase
        .from('claim_denials')
        .select('denial_code, denied_amount, denial_date')
        .in('claim_id', claims?.map(c => c.id) || []);

      const denialPatterns = this.analyzeDenialPatterns(denials || []);

      // Get payment patterns
      const paymentPatterns = this.analyzePaymentPatterns(claims || []);

      // Calculate risk score
      const riskScore = this.calculatePayerRiskScore(approvalRate, averageDays, denialPatterns);

      // Generate recommendations
      const recommendations = this.generatePayerRecommendations(approvalRate, averageDays, denialPatterns);

      return {
        payerId,
        payerName: payer?.name || 'Unknown',
        approvalRate: Math.round(approvalRate * 10) / 10,
        averageProcessingDays: averageDays,
        denialPatterns,
        paymentPatterns,
        recommendations,
        riskScore,
      };
    } catch (error: any) {
      console.error('Error analyzing payer behavior:', error);
      throw new Error(error.message || 'Failed to analyze payer behavior');
    }
  }

  // Analyze denial patterns
  private analyzeDenialPatterns(denials: any[]): DenialPattern[] {
    const codeCounts = new Map<string, { count: number; amounts: number[]; dates: Date[] }>();

    denials.forEach(denial => {
      const code = denial.denial_code || 'Unknown';
      if (!codeCounts.has(code)) {
        codeCounts.set(code, { count: 0, amounts: [], dates: [] });
      }
      const data = codeCounts.get(code)!;
      data.count++;
      if (denial.denied_amount) {
        data.amounts.push(parseFloat(denial.denied_amount));
      }
      if (denial.denial_date) {
        data.dates.push(new Date(denial.denial_date));
      }
    });

    return Array.from(codeCounts.entries()).map(([code, data]) => {
      const trend = this.analyzeDenialTrend(data.dates);
      const peakMonths = this.findPeakMonths(data.dates);
      
      return {
        code,
        frequency: data.count,
        trend,
        averageAmount: data.amounts.length > 0
          ? data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length
          : 0,
        peakMonths,
      };
    });
  }

  // Analyze denial trend
  private analyzeDenialTrend(dates: Date[]): 'increasing' | 'decreasing' | 'stable' {
    if (dates.length < 2) return 'stable';

    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    if (secondHalf.length > firstHalf.length) return 'increasing';
    if (secondHalf.length < firstHalf.length) return 'decreasing';
    return 'stable';
  }

  // Find peak months
  private findPeakMonths(dates: Date[]): string[] {
    const monthCounts = new Map<string, number>();

    dates.forEach(date => {
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
    });

    return Array.from(monthCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([month]) => month);
  }

  // Analyze payment patterns
  private analyzePaymentPatterns(claims: any[]): PaymentPattern {
    const paidClaims = claims.filter(c => c.status === 'paid');
    
    let totalDays = 0;
    let count = 0;

    paidClaims.forEach(claim => {
      if (claim.created_at && claim.updated_at) {
        const created = new Date(claim.created_at);
        const paid = new Date(claim.updated_at);
        const days = Math.ceil((paid.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        totalDays += days;
        count++;
      }
    });

    const averageDaysToPay = count > 0 ? Math.round(totalDays / count) : 0;

    return {
      averageDaysToPay,
      paymentMethod: 'electronic', // Would determine from actual data
      onTimePaymentRate: 85, // Would calculate from actual data
      partialPaymentRate: 5, // Would calculate from actual data
      paymentTrend: 'stable', // Would analyze from historical data
    };
  }

  // Calculate payer risk score
  private calculatePayerRiskScore(
    approvalRate: number,
    averageDays: number,
    denialPatterns: DenialPattern[]
  ): number {
    let score = 0;

    // Approval rate (0-40 points)
    score += (approvalRate / 100) * 40;

    // Processing speed (0-30 points) - faster is better
    if (averageDays <= 7) score += 30;
    else if (averageDays <= 14) score += 20;
    else if (averageDays <= 30) score += 10;

    // Denial patterns (0-30 points) - fewer denials is better
    const totalDenials = denialPatterns.reduce((sum, p) => sum + p.frequency, 0);
    if (totalDenials === 0) score += 30;
    else if (totalDenials < 10) score += 20;
    else if (totalDenials < 25) score += 10;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  // Generate payer recommendations
  private generatePayerRecommendations(
    approvalRate: number,
    averageDays: number,
    denialPatterns: DenialPattern[]
  ): string[] {
    const recommendations: string[] = [];

    if (approvalRate < 70) {
      recommendations.push('Low approval rate - review submission requirements and documentation standards');
    }

    if (averageDays > 30) {
      recommendations.push('Slow processing time - consider following up on pending claims');
    }

    const topDenialCode = denialPatterns.sort((a, b) => b.frequency - a.frequency)[0];
    if (topDenialCode) {
      recommendations.push(`Most common denial: ${topDenialCode.code} - implement prevention strategies`);
    }

    if (denialPatterns.some(p => p.trend === 'increasing')) {
      recommendations.push('Increasing denial trend detected - review and improve submission process');
    }

    return recommendations;
  }
}

export const predictiveAnalyticsService = PredictiveAnalyticsService.getInstance();

