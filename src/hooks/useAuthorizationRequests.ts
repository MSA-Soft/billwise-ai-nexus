import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AuthorizationRequest {
  id: string;
  patient_name: string;
  patient_dob: string | null;
  patient_member_id: string | null;
  payer_id: string | null;
  payer_name_custom: string | null;
  provider_name_custom: string | null;
  provider_npi_custom: string | null;
  procedure_codes: string[] | null;
  diagnosis_codes: string[] | null;
  clinical_indication: string | null;
  service_start_date: string | null;
  service_end_date: string | null;
  urgency_level: string | null;
  status: string | null;
  auth_number: string | null;
  review_status: string | null;
  ack_status: string | null;
  submission_ref: string | null;
  pa_required: boolean | null;
  service_type: string | null;
  units_requested: number | null;
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
      const { data, error } = await supabase
        .from('authorization_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (requestData: Partial<AuthorizationRequest>) => {
    try {
      const { data, error } = await supabase
        .from('authorization_requests')
        .insert([requestData])
        .select()
        .single();

      if (error) throw error;
      setRequests(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateRequest = async (id: string, updates: Partial<AuthorizationRequest>) => {
    try {
      const { data, error } = await supabase
        .from('authorization_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setRequests(prev => prev.map(req => req.id === id ? data : req));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('authorization_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRequests(prev => prev.filter(req => req.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const submitRequest = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('authorization_requests')
        .update({
          status: 'submitted',
          submission_ref: `REF-${Date.now()}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setRequests(prev => prev.map(req => req.id === id ? data : req));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
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
    deleteRequest,
    submitRequest,
  };
};
