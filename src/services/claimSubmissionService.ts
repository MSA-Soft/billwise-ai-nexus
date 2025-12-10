/**
 * Claim Submission Service
 * Handles claim submission logic, validation, and database operations
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

//#region Types
export interface ClaimSubmissionData {
  claim_number?: string;
  form_type: 'HCFA' | 'CMS1500' | 'UB04' | 'ADA';
  cms_form_version?: string;
  patient_id: string;
  provider_id: string;
  appointment_id?: string;
  service_date_from: string;
  service_date_to?: string;
  place_of_service_code: string;
  facility_id?: string;
  primary_insurance_id: string;
  secondary_insurance_id?: string;
  insurance_type: 'EDI' | 'Paper';
  total_charges: number;
  patient_responsibility?: number;
  insurance_amount?: number;
  copay_amount?: number;
  deductible_amount?: number;
  prior_auth_number?: string;
  referral_number?: string;
  treatment_auth_code?: string;
  procedures: Array<{
    cpt_code: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    modifier?: string;
    diagnosis_pointer?: string;
  }>;
  diagnoses: Array<{
    icd_code: string;
    description: string;
    is_primary: boolean;
  }>;
  status?: 'draft' | 'submitted' | 'processing' | 'paid' | 'denied';
  submission_method?: 'EDI' | 'Paper';
  is_secondary_claim?: boolean;
  notes?: string;
}

export interface ClaimValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requirements: string[];
  canSubmit: boolean;
}

export interface TimelyFilingInfo {
  deadline: Date;
  daysRemaining: number;
  isPastDeadline: boolean;
  warningLevel: 'none' | 'warning' | 'critical' | 'expired';
}
//#endregion

//#region ClaimSubmissionService Class
export class ClaimSubmissionService {
  private static instance: ClaimSubmissionService;

  static getInstance(): ClaimSubmissionService {
    if (!ClaimSubmissionService.instance) {
      ClaimSubmissionService.instance = new ClaimSubmissionService();
    }
    return ClaimSubmissionService.instance;
  }
  //#endregion

  //#region Claim Number Generation
  generateClaimNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CLM-${year}${month}${day}-${random}`;
  }
  //#endregion

  //#region Claim Validation

  // Comprehensive pre-submission validation
  async validateClaimSubmission(claimData: ClaimSubmissionData): Promise<ClaimValidationResult> {
    const result: ClaimValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      requirements: [],
      canSubmit: true,
    };

    if (!claimData.patient_id) {
      result.errors.push('Patient is required');
      result.isValid = false;
    }

    if (!claimData.provider_id) {
      result.errors.push('Provider is required');
      result.isValid = false;
    }

    if (!claimData.service_date_from) {
      result.errors.push('Service date is required');
      result.isValid = false;
    } else {
      const serviceDate = new Date(claimData.service_date_from);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (serviceDate > today) {
        result.errors.push('Service date cannot be in the future');
        result.isValid = false;
      }
    }

    if (!claimData.procedures || claimData.procedures.length === 0) {
      result.errors.push('At least one procedure is required');
      result.isValid = false;
    } else {
      claimData.procedures.forEach((proc, index) => {
        if (!proc.cpt_code) {
          result.errors.push(`Procedure ${index + 1}: CPT code is required`);
          result.isValid = false;
        }
        if (!proc.description) {
          result.warnings.push(`Procedure ${index + 1}: Description is missing`);
        }
        if (proc.quantity <= 0) {
          result.errors.push(`Procedure ${index + 1}: Quantity must be greater than 0`);
          result.isValid = false;
        }
        if (proc.unit_price < 0) {
          result.errors.push(`Procedure ${index + 1}: Unit price cannot be negative`);
          result.isValid = false;
        }
      });
    }

    // 5. Diagnoses Validation
    if (!claimData.diagnoses || claimData.diagnoses.length === 0) {
      result.errors.push('At least one diagnosis is required');
      result.isValid = false;
    } else {
      const primaryDiagnosis = claimData.diagnoses.find(d => d.is_primary);
      if (!primaryDiagnosis) {
        result.errors.push('Primary diagnosis is required');
        result.isValid = false;
      }

      claimData.diagnoses.forEach((diag, index) => {
        if (!diag.icd_code) {
          result.errors.push(`Diagnosis ${index + 1}: ICD code is required`);
          result.isValid = false;
        }
        // Basic ICD-10 format validation (starts with letter, then numbers)
        if (diag.icd_code && !/^[A-Z]\d{2,3}(\.\d{1,4})?$/.test(diag.icd_code)) {
          result.warnings.push(`Diagnosis ${index + 1}: ICD code format may be invalid`);
        }
      });
    }

    // 6. Insurance Validation
    if (!claimData.primary_insurance_id) {
      result.errors.push('Primary insurance is required');
      result.isValid = false;
    }

    // 7. Place of Service Validation
    if (!claimData.place_of_service_code) {
      result.errors.push('Place of service code is required');
      result.isValid = false;
    }

    // 8. Financial Validation
    if (claimData.total_charges <= 0) {
      result.errors.push('Total charges must be greater than 0');
      result.isValid = false;
    }

    // 9. Code Format Validation
    claimData.procedures.forEach((proc, index) => {
      // Basic CPT format (5 digits)
      if (proc.cpt_code && !/^\d{5}$/.test(proc.cpt_code)) {
        result.warnings.push(`Procedure ${index + 1}: CPT code format may be invalid (should be 5 digits)`);
      }
    });

    // 10. Timely Filing Check
    const timelyFiling = await this.checkTimelyFiling(claimData.service_date_from, claimData.primary_insurance_id);
    if (timelyFiling.isPastDeadline) {
      result.errors.push(`Claim is past timely filing deadline (${timelyFiling.deadline.toLocaleDateString()})`);
      result.isValid = false;
      result.canSubmit = false;
    } else if (timelyFiling.warningLevel === 'critical') {
      result.warnings.push(`Timely filing deadline approaching: ${timelyFiling.daysRemaining} days remaining`);
    }

    // 11. Prior Authorization Check (if required)
    // This would check if procedures require authorization
    // For now, we'll add a warning if high-cost procedures don't have auth
    const highCostProcedures = claimData.procedures.filter(p => p.total_price > 1000);
    if (highCostProcedures.length > 0 && !claimData.prior_auth_number) {
      result.warnings.push('High-cost procedures detected. Prior authorization may be required.');
    }

    result.canSubmit = result.isValid && !timelyFiling.isPastDeadline;
    return result;
  }

  async checkTimelyFiling(serviceDate: string, payerId: string): Promise<TimelyFilingInfo> {
    const service = new Date(serviceDate);
    const today = new Date();
    let daysAllowed = 365;
    
    try {
      const { data: payer, error } = await supabase
        .from('insurance_payers' as any)
        .select('name, timely_filing_days')
        .eq('id', payerId)
        .single();
      
      if (!error && payer) {
        const payerRecord = payer as any;
        if (payerRecord && payerRecord.timely_filing_days) {
          daysAllowed = payerRecord.timely_filing_days;
        }
      }
    } catch (error) {
      console.log('Using default timely filing deadline');
    }

    const deadline = new Date(service);
    deadline.setDate(deadline.getDate() + daysAllowed);
    
    const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isPastDeadline = daysRemaining < 0;

    let warningLevel: 'none' | 'warning' | 'critical' | 'expired' = 'none';
    if (isPastDeadline) {
      warningLevel = 'expired';
    } else if (daysRemaining <= 7) {
      warningLevel = 'critical';
    } else if (daysRemaining <= 30) {
      warningLevel = 'warning';
    }

    return {
      deadline,
      daysRemaining,
      isPastDeadline,
      warningLevel,
    };
  }
  //#endregion

  //#region Claim Submission
  async submitClaim(claimData: ClaimSubmissionData, userId: string, companyId?: string | null): Promise<any> {
    try {
      const validation = await this.validateClaimSubmission(claimData);
      if (!validation.canSubmit) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const claimNumber = claimData.claim_number || this.generateClaimNumber();
      const { data: claim, error: claimError } = await supabase
        .from('claims' as any)
        .insert({
          user_id: userId,
          company_id: companyId || null,
          claim_number: claimNumber,
          form_type: claimData.form_type,
          cms_form_version: claimData.cms_form_version || '02/12',
          patient_id: claimData.patient_id,
          provider_id: claimData.provider_id,
          appointment_id: claimData.appointment_id,
          service_date_from: claimData.service_date_from,
          service_date_to: claimData.service_date_to || claimData.service_date_from,
          place_of_service_code: claimData.place_of_service_code,
          facility_id: claimData.facility_id,
          primary_insurance_id: claimData.primary_insurance_id,
          secondary_insurance_id: claimData.secondary_insurance_id,
          insurance_type: claimData.insurance_type || 'EDI',
          total_charges: claimData.total_charges,
          patient_responsibility: claimData.patient_responsibility || 0,
          insurance_amount: claimData.insurance_amount || 0,
          copay_amount: claimData.copay_amount || 0,
          deductible_amount: claimData.deductible_amount || 0,
          prior_auth_number: claimData.prior_auth_number,
          referral_number: claimData.referral_number,
          treatment_auth_code: claimData.treatment_auth_code,
          status: claimData.status || 'submitted',
          submission_method: claimData.submission_method || 'EDI',
          is_secondary_claim: claimData.is_secondary_claim || false,
          submission_date: new Date().toISOString().split('T')[0],
          notes: claimData.notes,
        })
        .select()
        .single();

      if (claimError) {
        console.error('❌ Claim insert error:', claimError);
        console.error('❌ Claim error details:', {
          message: claimError.message,
          code: claimError.code,
          details: claimError.details,
          hint: claimError.hint
        });
        throw claimError;
      }

      if (!claim) {
        console.error('❌ Claim insert returned no data');
        throw new Error('Claim was not created. Please check RLS policies and database permissions.');
      }

      const claimRecord = claim as any;
      console.log('✅ Claim created successfully:', claimRecord.id);

      if (claimData.procedures && claimData.procedures.length > 0) {
        const procedures = claimData.procedures.map(proc => ({
          claim_id: claimRecord.id,
          cpt_code: proc.cpt_code,
          description: proc.description,
          quantity: proc.quantity,
          unit_price: proc.unit_price,
          total_price: proc.total_price,
          modifier: proc.modifier,
          diagnosis_pointer: proc.diagnosis_pointer,
        }));

        const { error: procError } = await supabase
          .from('claim_procedures' as any)
          .insert(procedures);

        if (procError) throw procError;
      }

      if (claimData.diagnoses && claimData.diagnoses.length > 0) {
        const diagnoses = claimData.diagnoses.map((diag, index) => ({
          claim_id: claimRecord.id,
          icd_code: diag.icd_code,
          description: diag.description,
          is_primary: diag.is_primary,
          sequence_number: index + 1,
        }));

        const { error: diagError } = await supabase
          .from('claim_diagnoses' as any)
          .insert(diagnoses);

        if (diagError) throw diagError;
      }

      await supabase
        .from('claim_status_history' as any)
        .insert({
          claim_id: claimRecord.id,
          status: claimRecord.status || 'submitted',
          changed_by: userId,
          notes: 'Claim submitted',
        });

      return {
        success: true,
        claim: claimRecord,
        validation,
      };
    } catch (error: any) {
      console.error('Claim submission error:', error);
      throw new Error(error.message || 'Failed to submit claim');
    }
  }

  async saveDraft(claimData: ClaimSubmissionData, userId: string, companyId?: string | null): Promise<any> {
    try {
      const claimNumber = claimData.claim_number || this.generateClaimNumber();

      const { data: claim, error } = await supabase
        .from('claims' as any)
        .insert({
          user_id: userId,
          company_id: companyId || null,
          claim_number: claimNumber,
          form_type: claimData.form_type,
          cms_form_version: claimData.cms_form_version || '02/12',
          patient_id: claimData.patient_id,
          provider_id: claimData.provider_id,
          appointment_id: claimData.appointment_id,
          service_date_from: claimData.service_date_from,
          service_date_to: claimData.service_date_to || claimData.service_date_from,
          place_of_service_code: claimData.place_of_service_code,
          facility_id: claimData.facility_id,
          primary_insurance_id: claimData.primary_insurance_id,
          secondary_insurance_id: claimData.secondary_insurance_id,
          insurance_type: claimData.insurance_type || 'EDI',
          total_charges: claimData.total_charges,
          patient_responsibility: claimData.patient_responsibility || 0,
          insurance_amount: claimData.insurance_amount || 0,
          copay_amount: claimData.copay_amount || 0,
          deductible_amount: claimData.deductible_amount || 0,
          prior_auth_number: claimData.prior_auth_number,
          referral_number: claimData.referral_number,
          treatment_auth_code: claimData.treatment_auth_code,
          status: 'draft',
          submission_method: claimData.submission_method || 'EDI',
          is_secondary_claim: claimData.is_secondary_claim || false,
          notes: claimData.notes,
        })
        .select()
        .single();

      if (error) throw error;

      const claimRecord = claim as any;
      if (claimData.procedures?.length > 0) {
        await supabase.from('claim_procedures' as any).insert(
          claimData.procedures.map(proc => ({
            claim_id: claimRecord.id,
            ...proc,
          }))
        );
      }

      if (claimData.diagnoses?.length > 0) {
        await supabase.from('claim_diagnoses' as any).insert(
          claimData.diagnoses.map((diag, idx) => ({
            claim_id: claimRecord.id,
            icd_code: diag.icd_code,
            description: diag.description,
            is_primary: diag.is_primary,
            sequence_number: idx + 1,
          }))
        );
      }

      return { success: true, claim };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to save draft');
    }
  }
  //#endregion

  //#region Claim Retrieval & Updates
  async getClaim(claimId: string): Promise<any> {
    try {
      const { data: claim, error } = await supabase
        .from('claims' as any)
        .select(`
          *,
          claim_procedures (*),
          claim_diagnoses (*),
          patients (*),
          providers (*),
          insurance_payers!primary_insurance_id (*)
        `)
        .eq('id', claimId)
        .single();

      if (error) throw error;
      return claim;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch claim');
    }
  }

  async updateClaimStatus(claimId: string, status: string, userId: string, notes?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('claims' as any)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', claimId);

      if (error) throw error;

      await supabase.from('claim_status_history' as any).insert({
        claim_id: claimId,
        status,
        changed_by: userId,
        notes: notes || `Status changed to ${status}`,
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update claim status');
    }
  }
  //#endregion
}

export const claimSubmissionService = ClaimSubmissionService.getInstance();
//#endregion

