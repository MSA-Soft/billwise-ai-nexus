// EDI Service for BillWise AI Nexus
// Handles X12 EDI transactions for healthcare billing

import { supabase } from '@/integrations/supabase/client';

export interface EDITransaction {
  id: string;
  transactionType: '837' | '835' | '270' | '271' | '276' | '277';
  status: 'pending' | 'sent' | 'acknowledged' | 'rejected' | 'processed';
  payload: any;
  response?: any;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

export interface EligibilityRequest {
  patientId: string;
  subscriberId: string;
  payerId: string;
  serviceDate: string;
  serviceCodes: string[];
  diagnosisCodes: string[];
}

export interface EligibilityResponse {
  isEligible: boolean;
  coverage: {
    copay: number;
    deductible: number;
    coinsurance: number;
    outOfPocketMax: number;
  };
  benefits: {
    serviceType: string;
    coverageLevel: string;
    limitations: string[];
  }[];
  effectiveDate: string;
  terminationDate?: string;
}

export interface ClaimStatusRequest {
  claimId: string;
  patientId: string;
  payerId: string;
  serviceDate: string;
}

export interface ClaimStatusResponse {
  claimId: string;
  status: 'pending' | 'processing' | 'paid' | 'denied' | 'rejected';
  statusDate: string;
  amountPaid?: number;
  denialReason?: string;
  remittanceAdvice?: string;
}

export interface RemittanceAdvice {
  claimId: string;
  totalPaid: number;
  adjustments: {
    code: string;
    amount: number;
    reason: string;
  }[];
  patientResponsibility: number;
  paymentDate: string;
  checkNumber?: string;
}

export class EDIService {
  private static instance: EDIService;
  private baseUrl: string;
  private apiKey: string;

  private constructor() {
    this.baseUrl = import.meta.env.VITE_EDI_API_URL || 'https://api.edi-service.com';
    this.apiKey = import.meta.env.VITE_EDI_API_KEY || '';
  }

  public static getInstance(): EDIService {
    if (!EDIService.instance) {
      EDIService.instance = new EDIService();
    }
    return EDIService.instance;
  }

  // 270/271 - Eligibility Verification
  // Fetches eligibility data from database instead of mock data
  async checkEligibility(request: EligibilityRequest, companyId?: string): Promise<EligibilityResponse> {
    try {
      console.log('🔍 Checking eligibility from database:', {
        patientId: request.patientId,
        subscriberId: request.subscriberId,
        payerId: request.payerId,
        serviceDate: request.serviceDate,
        companyId
      });

      // First, try to find patient UUID if patientId is not a UUID
      let patientUuid: string | null = null;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (request.patientId && uuidRegex.test(request.patientId)) {
        patientUuid = request.patientId;
      } else if (request.patientId) {
        // Look up patient UUID from patients table
        let patientQuery = supabase
          .from('patients' as any)
          .select('id')
          .eq('patient_id', request.patientId)
          .limit(1);
        
        if (companyId) {
          patientQuery = patientQuery.eq('company_id', companyId);
        }
        
        const { data: patientData } = await patientQuery.maybeSingle();
        if (patientData && (patientData as any)?.id) {
          patientUuid = (patientData as any).id;
        }
      }

      // Build query to find most recent eligibility verification
      let eligibilityQuery = supabase
        .from('eligibility_verifications' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      // Filter by patient (UUID or patient_id)
      if (patientUuid) {
        eligibilityQuery = eligibilityQuery.eq('patient_id', patientUuid);
      } else if (request.patientId) {
        // Fallback: try to match by insurance_id or subscriber_id
        eligibilityQuery = eligibilityQuery.or(`insurance_id.eq.${request.subscriberId},insurance_id.eq.${request.patientId}`);
      }

      // Filter by payer/insurance if provided
      if (request.payerId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(request.payerId)) {
          eligibilityQuery = eligibilityQuery.eq('primary_insurance_id', request.payerId);
        } else {
          eligibilityQuery = eligibilityQuery.ilike('primary_insurance_name', `%${request.payerId}%`);
        }
      }

      // Filter by service date if provided
      if (request.serviceDate) {
        eligibilityQuery = eligibilityQuery.or(`appointment_date.eq.${request.serviceDate},date_of_service.eq.${request.serviceDate}`);
      }

      // Filter by company if provided
      if (companyId) {
        eligibilityQuery = eligibilityQuery.eq('company_id', companyId);
      }

      const { data: eligibilityData, error: eligibilityError } = await eligibilityQuery.maybeSingle();

      if (eligibilityError && eligibilityError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (not an error, just no data)
        console.warn('⚠️ Error querying eligibility verification:', eligibilityError);
      }

      if (eligibilityData) {
        console.log('✅ Found eligibility verification in database:', eligibilityData.id);
        const elig = eligibilityData as any;
        
        // Convert database record to EligibilityResponse format
        return {
          isEligible: elig.is_eligible ?? false,
          coverage: {
            copay: elig.copay ?? 0,
            deductible: elig.deductible ?? 0,
            coinsurance: elig.coinsurance ?? 0,
            outOfPocketMax: elig.out_of_pocket_max ?? elig.out_of_pocket_remaining ?? 0,
          },
          benefits: elig.cpt_codes?.map((code: string) => ({
            serviceCode: code,
            description: '',
            covered: true,
            copay: elig.copay ?? 0
          })) || [],
          effectiveDate: elig.effective_date || elig.appointment_date || elig.date_of_service || new Date().toISOString().split('T')[0],
          terminationDate: elig.termination_date || undefined,
        };
      }

      // If no eligibility found in database, return default response indicating no eligibility data
      console.log('ℹ️ No eligibility verification found in database for this patient/insurance combination');
      return {
        isEligible: false,
        coverage: {
          copay: 0,
          deductible: 0,
          coinsurance: 0,
          outOfPocketMax: 0,
        },
        benefits: [],
        effectiveDate: request.serviceDate || new Date().toISOString().split('T')[0],
        terminationDate: undefined,
      };
    } catch (error) {
      console.error('Eligibility check error:', error);
      throw error;
    }
  }

  // 276/277 - Claim Status Inquiry
  async checkClaimStatus(request: ClaimStatusRequest): Promise<ClaimStatusResponse> {
    try {
      // Mock implementation - simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Generate mock claim status response
      const mockResponse = {
        transactionId: `276-${Date.now()}`,
        claimId: request.claimId,
        patientId: request.patientId,
        status: ['PENDING', 'PROCESSED', 'DENIED', 'PAID'][Math.floor(Math.random() * 4)],
        statusDate: new Date().toISOString(),
        adjudicationDate: Math.random() > 0.5 ? new Date().toISOString() : null,
        paymentAmount: Math.random() > 0.3 ? Math.floor(Math.random() * 2000) + 100 : 0,
        denialReason: Math.random() > 0.7 ? 'CO-50: Service not covered' : null,
        processingNotes: 'Claim processed successfully',
        responseDate: new Date().toISOString(),
        statusCode: 'SUCCESS'
      };

      return this.parseClaimStatusResponse(mockResponse);
    } catch (error) {
      console.error('Claim status check error:', error);
      throw error;
    }
  }

  // 837 - Submit Healthcare Claim
  async submitClaim(claimData: any): Promise<EDITransaction> {
    try {
      // Mock implementation - simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock claim submission response
      const mockResponse = {
        transactionId: `837-${Date.now()}`,
        claimId: `CLM-${Date.now().toString().slice(-6)}`,
        status: 'SUBMITTED',
        submissionDate: new Date().toISOString(),
        payerId: claimData.payerId || 'PAYER-001',
        patientId: claimData.patientId || 'PAT-001',
        totalAmount: claimData.totalAmount || Math.floor(Math.random() * 5000) + 500,
        acknowledgmentCode: 'AA', // Accepted
        processingNotes: 'Claim submitted successfully',
        responseDate: new Date().toISOString(),
        statusCode: 'SUCCESS'
      };

      return this.parseTransactionResponse(mockResponse);
    } catch (error) {
      console.error('Claim submission error:', error);
      throw error;
    }
  }

  // 835 - Process Remittance Advice
  async processRemittance(remittanceData: any): Promise<RemittanceAdvice> {
    try {
      // Mock implementation - simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Generate mock remittance advice response
      const mockResponse = {
        transactionId: `835-${Date.now()}`,
        remittanceId: `REM-${Date.now().toString().slice(-6)}`,
        payerId: remittanceData.payerId || 'PAYER-001',
        paymentDate: new Date().toISOString(),
        totalPaymentAmount: Math.floor(Math.random() * 10000) + 1000,
        paymentMethod: 'ACH',
        claims: [
          {
            claimId: `CLM-${Math.floor(Math.random() * 1000)}`,
            status: 'PAID',
            paidAmount: Math.floor(Math.random() * 2000) + 500,
            adjustmentAmount: Math.floor(Math.random() * 100),
            denialReason: null
          },
          {
            claimId: `CLM-${Math.floor(Math.random() * 1000)}`,
            status: 'PARTIAL',
            paidAmount: Math.floor(Math.random() * 1500) + 300,
            adjustmentAmount: Math.floor(Math.random() * 200),
            denialReason: 'CO-50: Service not covered'
          }
        ],
        processingDate: new Date().toISOString(),
        statusCode: 'SUCCESS'
      };

      return this.parseRemittanceResponse(mockResponse);
    } catch (error) {
      console.error('Remittance processing error:', error);
      throw error;
    }
  }

  // Generate X12 EDI Format
  generateX12Format(transactionType: string, data: any): string {
    const segments = [];
    
    // ISA - Interchange Control Header
    segments.push(`ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *${new Date().toISOString().slice(0,8).replace(/-/g, '')}*${new Date().toTimeString().slice(0,6).replace(/:/g, '')}*^*00501*000000001*0*P*:~`);
    
    // GS - Functional Group Header
    segments.push(`GS*HC*SENDER*RECEIVER*${new Date().toISOString().slice(0,8).replace(/-/g, '')}*${new Date().toTimeString().slice(0,6).replace(/:/g, '')}*1*X*005010X222A1~`);
    
    // ST - Transaction Set Header
    segments.push(`ST*${transactionType}*0001*005010X222A1~`);
    
    // Add transaction-specific segments
    if (transactionType === '270') {
      segments.push(this.generateEligibilitySegments(data));
    } else if (transactionType === '837') {
      segments.push(this.generateClaimSegments(data));
    }
    
    // SE - Transaction Set Trailer
    segments.push(`SE*${segments.length}*0001~`);
    
    // GE - Functional Group Trailer
    segments.push(`GE*1*1~`);
    
    // IEA - Interchange Control Trailer
    segments.push(`IEA*1*000000001~`);
    
    return segments.join('');
  }

  private generateEligibilitySegments(data: any): string {
    const segments = [];
    
    // BHT - Beginning of Hierarchical Transaction
    segments.push(`BHT*0022*13*${data.transactionId}*${new Date().toISOString().slice(0,8).replace(/-/g, '')}*${new Date().toTimeString().slice(0,6).replace(/:/g, '')}~`);
    
    // NM1 - Submitter Name
    segments.push(`NM1*41*2*BILLWISE AI NEXUS*****46*${data.submitterId}~`);
    
    // NM1 - Receiver Name
    segments.push(`NM1*40*2*${data.payerName}*****46*${data.payerId}~`);
    
    // HL - Hierarchical Level
    segments.push(`HL*1**20*1~`);
    
    // NM1 - Patient Name
    segments.push(`NM1*QC*1*${data.patientLastName}*${data.patientFirstName}****MI*${data.patientId}~`);
    
    // DMG - Demographic Information
    segments.push(`DMG*D8*${data.patientDOB}*${data.patientGender}~`);
    
    // EQ - Eligibility Inquiry
    segments.push(`EQ*30~`);
    
    return segments.join('');
  }

  private generateClaimSegments(data: any): string {
    const segments = [];
    
    // BHT - Beginning of Hierarchical Transaction
    segments.push(`BHT*0019*00*${data.transactionId}*${new Date().toISOString().slice(0,8).replace(/-/g, '')}*${new Date().toTimeString().slice(0,6).replace(/:/g, '')}~`);
    
    // NM1 - Submitter Name
    segments.push(`NM1*41*2*BILLWISE AI NEXUS*****46*${data.submitterId}~`);
    
    // NM1 - Receiver Name
    segments.push(`NM1*40*2*${data.payerName}*****46*${data.payerId}~`);
    
    // HL - Hierarchical Level
    segments.push(`HL*1**20*1~`);
    
    // PRV - Provider Information
    segments.push(`PRV*BI*PXC*${data.providerTaxonomy}~`);
    
    // NM1 - Billing Provider
    segments.push(`NM1*85*2*${data.providerName}*****XX*${data.providerNPI}~`);
    
    // N3 - Provider Address
    segments.push(`N3*${data.providerAddress}~`);
    
    // N4 - Provider City/State/ZIP
    segments.push(`N4*${data.providerCity}*${data.providerState}*${data.providerZIP}~`);
    
    // HL - Patient Level
    segments.push(`HL*2*1*22*0~`);
    
    // NM1 - Patient Name
    segments.push(`NM1*QC*1*${data.patientLastName}*${data.patientFirstName}****MI*${data.patientId}~`);
    
    // DMG - Demographic Information
    segments.push(`DMG*D8*${data.patientDOB}*${data.patientGender}~`);
    
    // CLM - Claim Information
    segments.push(`CLM*${data.claimId}*${data.claimAmount}***11:B:1*Y*A*Y*I~`);
    
    // DTP - Service Date
    segments.push(`DTP*434*D8*${data.serviceDate}~`);
    
    // HI - Health Care Diagnosis Code
    segments.push(`HI*BK:${data.primaryDiagnosis}~`);
    
    // LX - Service Line Number
    segments.push(`LX*1~`);
    
    // SV2 - Professional Service
    segments.push(`SV2*${data.serviceCode}*${data.serviceAmount}*UN*1~`);
    
    return segments.join('');
  }

  private parseEligibilityResponse(data: any): EligibilityResponse {
    return {
      isEligible: typeof data.eligibilityStatus === 'string'
        ? data.eligibilityStatus.toString().toUpperCase() === 'ACTIVE'
        : false,
      coverage: {
        copay: data.copay || 0,
        deductible: data.deductible || 0,
        coinsurance: data.coinsurance || 0,
        outOfPocketMax: data.outOfPocketMax || 0,
      },
      benefits: data.benefits || [],
      effectiveDate: data.effectiveDate,
      terminationDate: data.terminationDate,
    };
  }

  private parseClaimStatusResponse(data: any): ClaimStatusResponse {
    return {
      claimId: data.claimId,
      status: data.status,
      statusDate: data.statusDate,
      amountPaid: data.amountPaid,
      denialReason: data.denialReason,
      remittanceAdvice: data.remittanceAdvice,
    };
  }

  private parseTransactionResponse(data: any): EDITransaction {
    return {
      id: data.transactionId,
      transactionType: data.transactionType,
      status: data.status,
      payload: data.payload,
      response: data.response,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      errorMessage: data.errorMessage,
    };
  }

  private parseRemittanceResponse(data: any): RemittanceAdvice {
    return {
      claimId: data.claimId,
      totalPaid: data.totalPaid,
      adjustments: data.adjustments || [],
      patientResponsibility: data.patientResponsibility,
      paymentDate: data.paymentDate,
      checkNumber: data.checkNumber,
    };
  }
}

// Lazy-loaded service to avoid initialization errors
export const getEDIService = () => EDIService.getInstance();
