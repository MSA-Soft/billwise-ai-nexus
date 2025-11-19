// X12 278 to FHIR Conversion Service
// Bidirectional conversion engine for interoperability

import { fhirService, type FHIRPriorAuthRequest } from './fhirService';

export interface X12278Request {
  ISA: {
    AuthorizationQualifier: string;
    AuthorizationInfo: string;
    SecurityQualifier: string;
    SecurityInfo: string;
    InterchangeIDQualifier: string;
    InterchangeSenderID: string;
    InterchangeIDQualifier2: string;
    InterchangeReceiverID: string;
    InterchangeDate: string;
    InterchangeTime: string;
    InterchangeControlStandards: string;
    InterchangeControlVersion: string;
    InterchangeControlNumber: string;
    AcknowledgementRequested: string;
    UsageIndicator: string;
    ComponentElementSeparator: string;
  };
  GS: {
    FunctionalIdentifierCode: string;
    ApplicationSendersCode: string;
    ApplicationReceiversCode: string;
    Date: string;
    Time: string;
    GroupControlNumber: string;
    ResponsibleAgencyCode: string;
    VersionReleaseIndustryID: string;
  };
  ST: {
    TransactionSetIdentifierCode: string;
    TransactionSetControlNumber: string;
  };
  BHT: {
    HierarchicalStructureCode: string;
    TransactionSetPurposeCode: string;
    ReferenceIdentification: string;
    Date: string;
    Time: string;
    TransactionTypeCode: string;
  };
  HL: Array<{
    HierarchicalIDNumber: string;
    HierarchicalParentIDNumber?: string;
    HierarchicalLevelCode: string;
    HierarchicalChildCode: string;
  }>;
  PRV?: Array<{
    ProviderCode: string;
    ReferenceIdentificationQualifier: string;
    ReferenceIdentification: string;
  }>;
  NM1?: Array<{
    EntityIdentifierCode: string;
    EntityTypeQualifier: string;
    NameLastOrOrganizationName: string;
    NameFirst?: string;
    NameMiddle?: string;
    IdentificationCodeQualifier?: string;
    IdentificationCode?: string;
  }>;
  REF?: Array<{
    ReferenceIdentificationQualifier: string;
    ReferenceIdentification: string;
  }>;
  DTP?: Array<{
    DateTimeQualifier: string;
    DateTimePeriodFormatQualifier: string;
    DateTimePeriod: string;
  }>;
  HI?: Array<{
    HealthCareCodeInformation: Array<{
      CodeListQualifierCode: string;
      IndustryCode: string;
    }>;
  }>;
  HCP?: Array<{
    PricingMethodology: string;
    MonetaryAmount?: string;
    RejectReasonCode?: string;
  }>;
  SE: {
    NumberOfIncludedSegments: string;
    TransactionSetControlNumber: string;
  };
  GE: {
    NumberOfTransactionSetsIncluded: string;
    GroupControlNumber: string;
  };
  IEA: {
    NumberOfIncludedFunctionalGroups: string;
    InterchangeControlNumber: string;
  };
}

export interface X12278Response {
  ISA: any;
  GS: any;
  ST: {
    TransactionSetIdentifierCode: string;
    TransactionSetControlNumber: string;
  };
  BHT: any;
  HL: Array<any>;
  AK1?: {
    FunctionalGroupAcknowledgmentCode: string;
    GroupControlNumber: string;
  };
  AK2?: {
    TransactionSetIdentifierCode: string;
    TransactionSetControlNumber: string;
  };
  AK3?: Array<{
    SegmentIDCode: string;
    SegmentPositionInTransactionSet: string;
    LoopIdentifierCode?: string;
    ImplementationSegmentSyntaxErrorCode: string;
  }>;
  AK4?: Array<{
    PositionInSegment: string;
    DataElementReferenceNumber: string;
    DataElementSyntaxErrorCode: string;
    CopyOfBadDataElements?: string;
  }>;
  AK5?: {
    TransactionSetAcknowledgmentCode: string;
    TransactionSetSyntaxErrorCode?: string;
  };
  AK9?: {
    FunctionalGroupAcknowledgeCode: string;
    NumberOfTransactionSetsIncluded: string;
    NumberOfReceivedTransactionSets: string;
    NumberOfAcceptedTransactionSets: string;
    FunctionalGroupSyntaxErrorCode?: string;
  };
  SE: any;
  GE: any;
  IEA: any;
}

export class X12ToFHIRService {
  private static instance: X12ToFHIRService;

  static getInstance(): X12ToFHIRService {
    if (!X12ToFHIRService.instance) {
      X12ToFHIRService.instance = new X12ToFHIRService();
    }
    return X12ToFHIRService.instance;
  }

  // Convert X12 278 to FHIR
  async convertX12ToFHIR(x12Request: X12278Request): Promise<FHIRPriorAuthRequest> {
    try {
      // Extract patient information
      const patientNM1 = x12Request.NM1?.find(nm1 => nm1.EntityIdentifierCode === 'QC');
      const patientId = patientNM1?.IdentificationCode || '';

      // Extract provider information
      const providerNM1 = x12Request.NM1?.find(nm1 => nm1.EntityIdentifierCode === '1P');
      const providerId = providerNM1?.IdentificationCode || '';

      // Extract diagnosis codes
      const diagnosisCodes: string[] = [];
      if (x12Request.HI) {
        x12Request.HI.forEach(hi => {
          hi.HealthCareCodeInformation?.forEach(codeInfo => {
            if (codeInfo.CodeListQualifierCode === 'ABF') {
              // ICD-10 diagnosis code
              diagnosisCodes.push(codeInfo.IndustryCode);
            }
          });
        });
      }

      // Extract procedure codes
      const procedureCodes: string[] = [];
      // Would extract from HCP or other segments

      // Extract dates
      const serviceDate = x12Request.DTP?.find(dtp => dtp.DateTimeQualifier === '472')?.DateTimePeriod || '';

      // Build FHIR request
      const fhirRequest: FHIRPriorAuthRequest = {
        resourceType: 'Claim',
        status: 'active',
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/claim-type',
              code: 'professional',
              display: 'Professional',
            },
          ],
        },
        patient: {
          reference: `Patient/${patientId}`,
        },
        created: new Date().toISOString(),
        provider: {
          reference: `Practitioner/${providerId}`,
        },
        priority: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/processpriority',
              code: 'normal',
            },
          ],
        },
        diagnosis: diagnosisCodes.map((code, index) => ({
          sequence: index + 1,
          diagnosisCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/sid/icd-10-cm',
                code: code,
                display: code,
              },
            ],
          },
        })),
        item: procedureCodes.map((code, index) => ({
          sequence: index + 1,
          productOrService: {
            coding: [
              {
                system: 'http://www.ama-assn.org/go/cpt',
                code: code,
                display: code,
              },
            ],
          },
        })),
      };

      return fhirRequest;
    } catch (error: any) {
      console.error('Error converting X12 to FHIR:', error);
      throw new Error(error.message || 'Failed to convert X12 to FHIR');
    }
  }

  // Convert FHIR to X12 278
  async convertFHIRToX12(fhirResponse: any): Promise<X12278Response> {
    try {
      const x12Response: X12278Response = {
        ISA: {
          AuthorizationQualifier: '00',
          AuthorizationInfo: '',
          SecurityQualifier: '00',
          SecurityInfo: '',
          InterchangeIDQualifier: 'ZZ',
          InterchangeSenderID: 'BILLWISE',
          InterchangeIDQualifier2: 'ZZ',
          InterchangeReceiverID: 'PAYER',
          InterchangeDate: new Date().toISOString().split('T')[0].replace(/-/g, ''),
          InterchangeTime: new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, ''),
          InterchangeControlStandards: '^',
          InterchangeControlVersion: '00501',
          InterchangeControlNumber: this.generateControlNumber(),
          AcknowledgementRequested: '0',
          UsageIndicator: 'P',
          ComponentElementSeparator: ':',
        },
        GS: {
          FunctionalIdentifierCode: 'HI',
          ApplicationSendersCode: 'BILLWISE',
          ApplicationReceiversCode: 'PAYER',
          Date: new Date().toISOString().split('T')[0].replace(/-/g, ''),
          Time: new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, ''),
          GroupControlNumber: this.generateControlNumber(),
          ResponsibleAgencyCode: 'X',
          VersionReleaseIndustryID: '005010X217',
        },
        ST: {
          TransactionSetIdentifierCode: '278',
          TransactionSetControlNumber: this.generateControlNumber(),
        },
        BHT: {
          HierarchicalStructureCode: '0022',
          TransactionSetPurposeCode: '00',
          ReferenceIdentification: fhirResponse.id || '',
          Date: new Date().toISOString().split('T')[0].replace(/-/g, ''),
          Time: new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, ''),
          TransactionTypeCode: 'RP',
        },
        HL: [
          {
            HierarchicalIDNumber: '1',
            HierarchicalLevelCode: '20',
            HierarchicalChildCode: '1',
          },
        ],
        AK1: {
          FunctionalGroupAcknowledgmentCode: fhirResponse.outcome === 'complete' ? 'A' : 'E',
          GroupControlNumber: this.generateControlNumber(),
        },
        AK2: {
          TransactionSetIdentifierCode: '278',
          TransactionSetControlNumber: this.generateControlNumber(),
        },
        AK5: {
          TransactionSetAcknowledgmentCode: fhirResponse.outcome === 'complete' ? 'A' : 'E',
        },
        SE: {
          NumberOfIncludedSegments: '10',
          TransactionSetControlNumber: this.generateControlNumber(),
        },
        GE: {
          NumberOfTransactionSetsIncluded: '1',
          GroupControlNumber: this.generateControlNumber(),
        },
        IEA: {
          NumberOfIncludedFunctionalGroups: '1',
          InterchangeControlNumber: this.generateControlNumber(),
        },
      };

      return x12Response;
    } catch (error: any) {
      console.error('Error converting FHIR to X12:', error);
      throw new Error(error.message || 'Failed to convert FHIR to X12');
    }
  }

  // Generate control number
  private generateControlNumber(): string {
    return Math.random().toString().substring(2, 10).padStart(9, '0');
  }

  // Parse X12 278 string
  parseX12String(x12String: string): X12278Request {
    // In production, use a proper X12 parser library
    // This is a simplified version
    const segments = x12String.split('~');
    const parsed: any = {};

    segments.forEach(segment => {
      const elements = segment.split('*');
      const segmentId = elements[0];

      switch (segmentId) {
        case 'ISA':
          parsed.ISA = this.parseISASegment(elements);
          break;
        case 'GS':
          parsed.GS = this.parseGSSegment(elements);
          break;
        case 'ST':
          parsed.ST = this.parseSTSegment(elements);
          break;
        // Add more segment parsers as needed
      }
    });

    return parsed as X12278Request;
  }

  // Format X12 278 to string
  formatX12String(x12Response: X12278Response): string {
    const segments: string[] = [];

    // Format ISA
    if (x12Response.ISA) {
      segments.push(`ISA*${Object.values(x12Response.ISA).join('*')}~`);
    }

    // Format GS
    if (x12Response.GS) {
      segments.push(`GS*${Object.values(x12Response.GS).join('*')}~`);
    }

    // Format ST
    if (x12Response.ST) {
      segments.push(`ST*${x12Response.ST.TransactionSetIdentifierCode}*${x12Response.ST.TransactionSetControlNumber}~`);
    }

    // Format other segments...

    // Format SE
    if (x12Response.SE) {
      segments.push(`SE*${Object.values(x12Response.SE).join('*')}~`);
    }

    // Format GE
    if (x12Response.GE) {
      segments.push(`GE*${Object.values(x12Response.GE).join('*')}~`);
    }

    // Format IEA
    if (x12Response.IEA) {
      segments.push(`IEA*${Object.values(x12Response.IEA).join('*')}~`);
    }

    return segments.join('');
  }

  // Parse ISA segment
  private parseISASegment(elements: string[]): any {
    return {
      AuthorizationQualifier: elements[1],
      AuthorizationInfo: elements[2],
      SecurityQualifier: elements[3],
      SecurityInfo: elements[4],
      InterchangeIDQualifier: elements[5],
      InterchangeSenderID: elements[6],
      InterchangeIDQualifier2: elements[7],
      InterchangeReceiverID: elements[8],
      InterchangeDate: elements[9],
      InterchangeTime: elements[10],
      InterchangeControlStandards: elements[11],
      InterchangeControlVersion: elements[12],
      InterchangeControlNumber: elements[13],
      AcknowledgementRequested: elements[14],
      UsageIndicator: elements[15],
      ComponentElementSeparator: elements[16],
    };
  }

  // Parse GS segment
  private parseGSSegment(elements: string[]): any {
    return {
      FunctionalIdentifierCode: elements[1],
      ApplicationSendersCode: elements[2],
      ApplicationReceiversCode: elements[3],
      Date: elements[4],
      Time: elements[5],
      GroupControlNumber: elements[6],
      ResponsibleAgencyCode: elements[7],
      VersionReleaseIndustryID: elements[8],
    };
  }

  // Parse ST segment
  private parseSTSegment(elements: string[]): any {
    return {
      TransactionSetIdentifierCode: elements[1],
      TransactionSetControlNumber: elements[2],
    };
  }
}

export const x12ToFhirService = X12ToFHIRService.getInstance();

