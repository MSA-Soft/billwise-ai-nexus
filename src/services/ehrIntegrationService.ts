// EHR Integration Service
// Epic, Cerner, Allscripts integration via FHIR APIs

import { fhirService } from './fhirService';
import type { FHIRPriorAuthRequest, FHIRResource } from './fhirService';

export interface EHRConnection {
  id?: string;
  ehrSystem: 'epic' | 'cerner' | 'allscripts' | 'other';
  name: string;
  baseUrl: string;
  clientId: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  isActive: boolean;
  created_at?: string;
}

export interface EHRPatient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  identifiers: Array<{
    system: string;
    value: string;
  }>;
}

export interface EHREncounter {
  id: string;
  status: string;
  class: string;
  type: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  period: {
    start: string;
    end?: string;
  };
  diagnosis?: Array<{
    condition: {
      reference: string;
    };
  }>;
}

export class EHRIntegrationService {
  private static instance: EHRIntegrationService;

  static getInstance(): EHRIntegrationService {
    if (!EHRIntegrationService.instance) {
      EHRIntegrationService.instance = new EHRIntegrationService();
    }
    return EHRIntegrationService.instance;
  }

  // ============================================================================
  // EHR Connection Management
  // ============================================================================

  // Connect to EHR system
  async connectToEHR(connection: EHRConnection): Promise<EHRConnection> {
    try {
      // Authenticate with EHR system
      const token = await this.authenticateEHR(connection);

      // Store connection
      const { data, error } = await supabase
        .from('ehr_connections')
        .insert({
          ehr_system: connection.ehrSystem,
          name: connection.name,
          base_url: connection.baseUrl,
          client_id: connection.clientId,
          access_token: token.accessToken,
          refresh_token: token.refreshToken,
          token_expires_at: token.expiresAt,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        ehrSystem: data.ehr_system,
        name: data.name,
        baseUrl: data.base_url,
        clientId: data.client_id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiresAt: data.token_expires_at,
        isActive: data.is_active,
        created_at: data.created_at,
      };
    } catch (error: any) {
      console.error('Error connecting to EHR:', error);
      throw new Error(error.message || 'Failed to connect to EHR');
    }
  }

  // Authenticate with EHR (OAuth2/SMART on FHIR)
  private async authenticateEHR(connection: EHRConnection): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt: string;
  }> {
    // In production, implement OAuth2/SMART on FHIR flow
    // This is a placeholder
    const response = await fetch(`${connection.baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: connection.clientId,
        client_secret: connection.clientSecret || '',
        scope: 'user/Patient.read user/Encounter.read user/Observation.read',
      }),
    });

    if (!response.ok) {
      throw new Error('EHR authentication failed');
    }

    const tokenData = await response.json();

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    };
  }

  // ============================================================================
  // Epic Integration
  // ============================================================================

  // Get patient from Epic
  async getEpicPatient(connectionId: string, patientId: string): Promise<EHRPatient | null> {
    try {
      const connection = await this.getEHRConnection(connectionId);
      if (!connection || connection.ehrSystem !== 'epic') {
        throw new Error('Invalid Epic connection');
      }

      const response = await fetch(`${connection.baseUrl}/Patient/${patientId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${connection.accessToken}`,
          'Accept': 'application/fhir+json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const fhirPatient = await response.json();
      return this.mapFHIRPatientToEHR(fhirPatient);
    } catch (error: any) {
      console.error('Error getting Epic patient:', error);
      return null;
    }
  }

  // Get encounters from Epic
  async getEpicEncounters(connectionId: string, patientId: string): Promise<EHREncounter[]> {
    try {
      const connection = await this.getEHRConnection(connectionId);
      if (!connection || connection.ehrSystem !== 'epic') {
        throw new Error('Invalid Epic connection');
      }

      const response = await fetch(
        `${connection.baseUrl}/Encounter?patient=${patientId}&_sort=-date`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${connection.accessToken}`,
            'Accept': 'application/fhir+json',
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const bundle = await response.json();
      return (bundle.entry || []).map((entry: any) => this.mapFHIREncounterToEHR(entry.resource));
    } catch (error: any) {
      console.error('Error getting Epic encounters:', error);
      return [];
    }
  }

  // ============================================================================
  // Cerner Integration
  // ============================================================================

  // Get patient from Cerner
  async getCernerPatient(connectionId: string, patientId: string): Promise<EHRPatient | null> {
    try {
      const connection = await this.getEHRConnection(connectionId);
      if (!connection || connection.ehrSystem !== 'cerner') {
        throw new Error('Invalid Cerner connection');
      }

      // Cerner uses similar FHIR API
      return await this.getEpicPatient(connectionId, patientId);
    } catch (error: any) {
      console.error('Error getting Cerner patient:', error);
      return null;
    }
  }

  // ============================================================================
  // Allscripts Integration
  // ============================================================================

  // Get patient from Allscripts
  async getAllscriptsPatient(connectionId: string, patientId: string): Promise<EHRPatient | null> {
    try {
      const connection = await this.getEHRConnection(connectionId);
      if (!connection || connection.ehrSystem !== 'allscripts') {
        throw new Error('Invalid Allscripts connection');
      }

      // Allscripts may use different API structure
      const response = await fetch(`${connection.baseUrl}/api/patient/${patientId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${connection.accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const patient = await response.json();
      return this.mapAllscriptsPatientToEHR(patient);
    } catch (error: any) {
      console.error('Error getting Allscripts patient:', error);
      return null;
    }
  }

  // ============================================================================
  // Generic EHR Methods
  // ============================================================================

  // Get EHR connection
  private async getEHRConnection(connectionId: string): Promise<EHRConnection | null> {
    try {
      const { data, error } = await supabase
        .from('ehr_connections')
        .select('*')
        .eq('id', connectionId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      // Check if token is expired and refresh if needed
      if (data.token_expires_at && new Date(data.token_expires_at) < new Date()) {
        // Refresh token logic would go here
      }

      return {
        id: data.id,
        ehrSystem: data.ehr_system,
        name: data.name,
        baseUrl: data.base_url,
        clientId: data.client_id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiresAt: data.token_expires_at,
        isActive: data.is_active,
        created_at: data.created_at,
      };
    } catch (error) {
      return null;
    }
  }

  // Sync patient data from EHR
  async syncPatientFromEHR(connectionId: string, patientId: string): Promise<boolean> {
    try {
      const connection = await this.getEHRConnection(connectionId);
      if (!connection) {
        return false;
      }

      let ehrPatient: EHRPatient | null = null;

      switch (connection.ehrSystem) {
        case 'epic':
          ehrPatient = await this.getEpicPatient(connectionId, patientId);
          break;
        case 'cerner':
          ehrPatient = await this.getCernerPatient(connectionId, patientId);
          break;
        case 'allscripts':
          ehrPatient = await this.getAllscriptsPatient(connectionId, patientId);
          break;
      }

      if (!ehrPatient) {
        return false;
      }

      // Update local patient record
      await supabase
        .from('patients')
        .upsert({
          id: patientId,
          first_name: ehrPatient.name.split(' ')[0],
          last_name: ehrPatient.name.split(' ').slice(1).join(' '),
          date_of_birth: ehrPatient.dateOfBirth,
          gender: ehrPatient.gender,
          updated_at: new Date().toISOString(),
        });

      return true;
    } catch (error: any) {
      console.error('Error syncing patient from EHR:', error);
      return false;
    }
  }

  // Submit prior auth to EHR
  async submitPriorAuthToEHR(
    connectionId: string,
    fhirRequest: FHIRPriorAuthRequest
  ): Promise<boolean> {
    try {
      const connection = await this.getEHRConnection(connectionId);
      if (!connection) {
        return false;
      }

      const response = await fetch(`${connection.baseUrl}/Claim`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${connection.accessToken}`,
          'Content-Type': 'application/fhir+json',
          'Accept': 'application/fhir+json',
        },
        body: JSON.stringify(fhirRequest),
      });

      return response.ok;
    } catch (error: any) {
      console.error('Error submitting prior auth to EHR:', error);
      return false;
    }
  }

  // ============================================================================
  // Mapping Functions
  // ============================================================================

  // Map FHIR Patient to EHR Patient
  private mapFHIRPatientToEHR(fhirPatient: any): EHRPatient {
    const name = fhirPatient.name?.[0];
    const fullName = `${name?.given?.join(' ') || ''} ${name?.family || ''}`.trim();

    return {
      id: fhirPatient.id,
      name: fullName,
      dateOfBirth: fhirPatient.birthDate || '',
      gender: fhirPatient.gender || '',
      identifiers: (fhirPatient.identifier || []).map((id: any) => ({
        system: id.system,
        value: id.value,
      })),
    };
  }

  // Map FHIR Encounter to EHR Encounter
  private mapFHIREncounterToEHR(fhirEncounter: any): EHREncounter {
    return {
      id: fhirEncounter.id,
      status: fhirEncounter.status || '',
      class: fhirEncounter.class?.code || '',
      type: fhirEncounter.type || [],
      period: fhirEncounter.period || { start: '' },
      diagnosis: fhirEncounter.diagnosis || [],
    };
  }

  // Map Allscripts Patient to EHR Patient
  private mapAllscriptsPatientToEHR(patient: any): EHRPatient {
    return {
      id: patient.Id || patient.id,
      name: `${patient.FirstName || ''} ${patient.LastName || ''}`.trim(),
      dateOfBirth: patient.DateOfBirth || '',
      gender: patient.Gender || '',
      identifiers: [
        {
          system: 'http://allscripts.com/patient-id',
          value: patient.Id || patient.id,
        },
      ],
    };
  }
}

export const ehrIntegrationService = EHRIntegrationService.getInstance();

