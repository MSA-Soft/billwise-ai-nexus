import { useState, useEffect } from 'react';
import { databaseService } from '@/services/databaseService';

export interface AuthorizationRequest {
  id: string;
  patient_name: string;
  patient_dob: string | null;
  patient_member_id: string | null;
  payer_id: string | null;
  payer_name_custom: string | null;
  provider_name_custom: string | null;
  provider_npi_custom: string | null;
  service_type: string | null;
  service_start_date: string | null;
  service_end_date: string | null;
  procedure_codes: string[] | null;
  diagnosis_codes: string[] | null;
  clinical_indication: string | null;
  urgency_level: string | null;
  units_requested: number | null;
  status: string | null;
  review_status: string | null;
  auth_number: string | null;
  ack_status: string | null;
  submission_ref: string | null;
  pa_required: boolean | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useAuthorizationRequests = () => {
  const [requests, setRequests] = useState<AuthorizationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await databaseService.getAuthorizationRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (requestData: Partial<AuthorizationRequest>) => {
    try {
      const data = await databaseService.createAuthorizationRequest(requestData);
      setRequests(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateRequest = async (id: string, updates: Partial<AuthorizationRequest>) => {
    try {
      const data = await databaseService.updateAuthorizationRequest(id, updates);
      setRequests(prev => prev.map(req => req.id === id ? data : req));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getRequestById = async (id: string): Promise<AuthorizationRequest> => {
    try {
      const data = await databaseService.getAuthorizationRequests();
      const request = data.find(req => req.id === id);
      if (!request) {
        throw new Error('Authorization request not found');
      }
      return request;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getRequestsByStatus = (status: string): AuthorizationRequest[] => {
    return requests.filter(req => req.status === status);
  };

  const getRequestsByUrgency = (urgency: string): AuthorizationRequest[] => {
    return requests.filter(req => req.urgency_level === urgency);
  };

  const getPendingRequests = (): AuthorizationRequest[] => {
    return requests.filter(req => req.status === 'pending' || req.status === null);
  };

  const getApprovedRequests = (): AuthorizationRequest[] => {
    return requests.filter(req => req.status === 'approved');
  };

  const getDeniedRequests = (): AuthorizationRequest[] => {
    return requests.filter(req => req.status === 'denied');
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    loading,
    error,
    fetchRequests,
    createRequest,
    updateRequest,
    getRequestById,
    getRequestsByStatus,
    getRequestsByUrgency,
    getPendingRequests,
    getApprovedRequests,
    getDeniedRequests,
  };
};