// EDI Service for BillWise AI Nexus
// Handles X12 EDI transactions for healthcare billing

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
  async checkEligibility(request: EligibilityRequest): Promise<EligibilityResponse> {
    try {
      // Mock implementation - simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock eligibility response
      const mockResponse = {
        transactionId: `270-${Date.now()}`,
        patientId: request.patientId,
        subscriberId: request.subscriberId,
        eligibilityStatus: Math.random() > 0.3 ? 'ACTIVE' : 'INACTIVE',
        coverageType: ['PPO', 'HMO', 'EPO'][Math.floor(Math.random() * 3)],
        effectiveDate: '2024-01-01',
        terminationDate: '2024-12-31',
        copay: Math.floor(Math.random() * 50) + 10,
        deductible: Math.floor(Math.random() * 2000) + 500,
        outOfPocketMax: Math.floor(Math.random() * 5000) + 2000,
        benefits: [
          { serviceCode: '99213', description: 'Office Visit', covered: true, copay: 25 },
          { serviceCode: '36415', description: 'Blood Draw', covered: true, copay: 15 },
          { serviceCode: '80053', description: 'Comprehensive Metabolic Panel', covered: true, copay: 0 }
        ],
        responseDate: new Date().toISOString(),
        status: 'SUCCESS'
      };

      return this.parseEligibilityResponse(mockResponse);
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
      isEligible: data.eligibilityStatus === 'active',
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
