// FHIR R4 Prior Authorization Support (PAS) API Service
// CMS mandate by 2027

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
  };
  [key: string]: any;
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  type: 'transaction' | 'batch' | 'searchset' | 'history' | 'document' | 'message' | 'collection';
  entry: Array<{
    fullUrl?: string;
    resource: FHIRResource;
    request?: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      url: string;
    };
  }>;
}

export interface FHIRPriorAuthRequest {
  resourceType: 'Claim';
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
  type: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  patient: {
    reference: string;
  };
  created: string;
  provider: {
    reference: string;
  };
  priority: {
    coding: Array<{
      system: string;
      code: string;
    }>;
  };
  diagnosis?: Array<{
    sequence: number;
    diagnosisCodeableConcept: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
  }>;
  item?: Array<{
    sequence: number;
    productOrService: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    quantity?: {
      value: number;
      unit: string;
    };
  }>;
  supportingInfo?: Array<{
    sequence: number;
    category: {
      coding: Array<{
        system: string;
        code: string;
      }>;
    };
    valueString?: string;
    valueReference?: {
      reference: string;
    };
  }>;
}

export interface FHIRPriorAuthResponse {
  resourceType: 'ClaimResponse';
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
  request: {
    reference: string;
  };
  outcome: 'queued' | 'complete' | 'error' | 'partial';
  disposition?: string;
  item?: Array<{
    itemSequence: number;
    adjudication: Array<{
      category: {
        coding: Array<{
          system: string;
          code: string;
        }>;
      };
      reason?: {
        coding: Array<{
          system: string;
          code: string;
          display: string;
        }>;
      };
      amount?: {
        value: number;
        currency: string;
      };
    }>;
  }>;
}

export class FHIRService {
  private static instance: FHIRService;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_FHIR_BASE_URL || '/fhir';
  }

  static getInstance(): FHIRService {
    if (!FHIRService.instance) {
      FHIRService.instance = new FHIRService();
    }
    return FHIRService.instance;
  }

  // Submit Prior Authorization Request (FHIR R4)
  async submitPriorAuthRequest(request: FHIRPriorAuthRequest): Promise<FHIRPriorAuthResponse> {
    try {
      const bundle: FHIRBundle = {
        resourceType: 'Bundle',
        type: 'transaction',
        entry: [
          {
            resource: request,
            request: {
              method: 'POST',
              url: 'Claim',
            },
          },
        ],
      };

      const response = await fetch(`${this.baseURL}/Claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json',
          'Accept': 'application/fhir+json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`FHIR API error: ${response.statusText}`);
      }

      const result = await response.json();
      return this.mapToPriorAuthResponse(result);
    } catch (error: any) {
      console.error('Error submitting FHIR prior auth request:', error);
      throw new Error(error.message || 'Failed to submit FHIR prior auth request');
    }
  }

  // Get Prior Authorization Status
  async getPriorAuthStatus(claimId: string): Promise<FHIRPriorAuthResponse | null> {
    try {
      const response = await fetch(`${this.baseURL}/ClaimResponse?request=${claimId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/fhir+json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const bundle = await response.json();
      if (bundle.entry && bundle.entry.length > 0) {
        return this.mapToPriorAuthResponse(bundle.entry[0].resource);
      }

      return null;
    } catch (error: any) {
      console.error('Error getting FHIR prior auth status:', error);
      return null;
    }
  }

  // Convert internal authorization request to FHIR
  convertToFHIR(authRequest: any): FHIRPriorAuthRequest {
    return {
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
        reference: `Patient/${authRequest.patient_id}`,
      },
      created: authRequest.created_at || new Date().toISOString(),
      provider: {
        reference: `Practitioner/${authRequest.provider_id}`,
      },
      priority: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/processpriority',
            code: authRequest.urgency_level || 'normal',
          },
        ],
      },
      diagnosis: authRequest.diagnosis_codes?.map((code: string, index: number) => ({
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
      item: authRequest.procedure_codes?.map((code: string, index: number) => ({
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
      supportingInfo: [
        {
          sequence: 1,
          category: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
                code: 'info',
              },
            ],
          },
          valueString: authRequest.clinical_indication,
        },
      ],
    };
  }

  // Map FHIR response to internal format
  private mapToPriorAuthResponse(fhirResource: any): FHIRPriorAuthResponse {
    return {
      resourceType: 'ClaimResponse',
      status: fhirResource.status || 'active',
      request: {
        reference: fhirResource.request?.reference || '',
      },
      outcome: fhirResource.outcome || 'queued',
      disposition: fhirResource.disposition,
      item: fhirResource.item?.map((item: any) => ({
        itemSequence: item.itemSequence,
        adjudication: item.adjudication || [],
      })),
    };
  }

  // Validate FHIR resource
  validateFHIRResource(resource: FHIRResource): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!resource.resourceType) {
      errors.push('Missing resourceType');
    }

    if (resource.resourceType === 'Claim') {
      if (!resource.patient) {
        errors.push('Claim missing patient reference');
      }
      if (!resource.provider) {
        errors.push('Claim missing provider reference');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Search FHIR resources
  async searchResources(
    resourceType: string,
    params: Record<string, any>
  ): Promise<FHIRBundle> {
    try {
      const queryString = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      ).toString();

      const response = await fetch(`${this.baseURL}/${resourceType}?${queryString}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/fhir+json',
        },
      });

      if (!response.ok) {
        throw new Error(`FHIR search error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error searching FHIR resources:', error);
      throw new Error(error.message || 'Failed to search FHIR resources');
    }
  }
}

export const fhirService = FHIRService.getInstance();

