// Intelligent Claim Scrubbing Service
// Real-time validation and pre-submission error detection

import { supabase } from '@/integrations/supabase/client';
import { codeValidationService } from './codeValidationService';
import { payerRulesService } from './payerRulesService';
import type { ClaimSubmissionData } from './claimSubmissionService';

export interface ScrubbingResult {
  isValid: boolean;
  canSubmit: boolean;
  errors: ScrubbingError[];
  warnings: ScrubbingWarning[];
  suggestions: ScrubbingSuggestion[];
  score: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedDenialProbability: number; // 0-100
  duplicateClaimDetected: boolean;
  duplicateClaimId?: string;
}

export interface ScrubbingError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'critical';
  fixable: boolean;
  suggestedFix?: string;
}

export interface ScrubbingWarning {
  field: string;
  code: string;
  message: string;
  impact: 'low' | 'medium' | 'high';
  recommendation?: string;
}

export interface ScrubbingSuggestion {
  field: string;
  message: string;
  benefit: string;
  priority: 'low' | 'medium' | 'high';
}

export class ClaimScrubbingService {
  private static instance: ClaimScrubbingService;

  static getInstance(): ClaimScrubbingService {
    if (!ClaimScrubbingService.instance) {
      ClaimScrubbingService.instance = new ClaimScrubbingService();
    }
    return ClaimScrubbingService.instance;
  }

  // Comprehensive claim scrubbing
  async scrubClaim(claimData: ClaimSubmissionData): Promise<ScrubbingResult> {
    const result: ScrubbingResult = {
      isValid: true,
      canSubmit: true,
      errors: [],
      warnings: [],
      suggestions: [],
      score: 100,
      riskLevel: 'low',
      estimatedDenialProbability: 0,
      duplicateClaimDetected: false,
    };

    // Run all scrubbing checks
    await Promise.all([
      this.checkRequiredFields(claimData, result),
      this.validateCodes(claimData, result),
      this.checkDates(claimData, result),
      this.validateFinancials(claimData, result),
      this.checkAuthorization(claimData, result),
      this.checkEligibility(claimData, result),
      this.checkDuplicateClaims(claimData, result),
      this.validatePayerRules(claimData, result),
      this.checkCodeCompatibility(claimData, result),
      this.validateModifiers(claimData, result),
    ]);

    // Calculate final score
    result.score = this.calculateScore(result);
    result.riskLevel = this.calculateRiskLevel(result);
    result.estimatedDenialProbability = this.estimateDenialProbability(result);
    result.canSubmit = result.errors.filter(e => e.severity === 'critical').length === 0;

    return result;
  }

  // Check required fields
  private async checkRequiredFields(
    claimData: ClaimSubmissionData,
    result: ScrubbingResult
  ): Promise<void> {
    // Patient
    if (!claimData.patient_id) {
      result.errors.push({
        field: 'patient_id',
        code: 'REQ-001',
        message: 'Patient is required',
        severity: 'critical',
        fixable: true,
        suggestedFix: 'Select a patient from the patient list',
      });
    }

    // Provider
    if (!claimData.provider_id) {
      result.errors.push({
        field: 'provider_id',
        code: 'REQ-002',
        message: 'Provider is required',
        severity: 'critical',
        fixable: true,
        suggestedFix: 'Select a provider',
      });
    }

    // Service date
    if (!claimData.service_date_from) {
      result.errors.push({
        field: 'service_date_from',
        code: 'REQ-003',
        message: 'Service date is required',
        severity: 'critical',
        fixable: true,
        suggestedFix: 'Enter the service date',
      });
    }

    // Primary insurance
    if (!claimData.primary_insurance_id) {
      result.errors.push({
        field: 'primary_insurance_id',
        code: 'REQ-004',
        message: 'Primary insurance is required',
        severity: 'critical',
        fixable: true,
        suggestedFix: 'Select primary insurance',
      });
    }

    // Procedures
    if (!claimData.procedures || claimData.procedures.length === 0) {
      result.errors.push({
        field: 'procedures',
        code: 'REQ-005',
        message: 'At least one procedure is required',
        severity: 'critical',
        fixable: true,
        suggestedFix: 'Add at least one procedure',
      });
    }

    // Diagnoses
    if (!claimData.diagnoses || claimData.diagnoses.length === 0) {
      result.errors.push({
        field: 'diagnoses',
        code: 'REQ-006',
        message: 'At least one diagnosis is required',
        severity: 'critical',
        fixable: true,
        suggestedFix: 'Add at least one diagnosis',
      });
    } else {
      // Check for primary diagnosis
      const hasPrimary = claimData.diagnoses.some(d => d.is_primary);
      if (!hasPrimary) {
        result.errors.push({
          field: 'diagnoses',
          code: 'REQ-007',
          message: 'Primary diagnosis is required',
          severity: 'critical',
          fixable: true,
          suggestedFix: 'Mark one diagnosis as primary',
        });
      }
    }

    // Place of service
    if (!claimData.place_of_service_code) {
      result.errors.push({
        field: 'place_of_service_code',
        code: 'REQ-008',
        message: 'Place of service code is required',
        severity: 'critical',
        fixable: true,
        suggestedFix: 'Select place of service',
      });
    }
  }

  // Validate codes (CPT, ICD-10)
  private async validateCodes(
    claimData: ClaimSubmissionData,
    result: ScrubbingResult
  ): Promise<void> {
    // Validate CPT codes
    if (claimData.procedures) {
      for (const proc of claimData.procedures) {
        if (!proc.cpt_code) {
          result.errors.push({
            field: 'procedures',
            code: 'CODE-001',
            message: `Procedure missing CPT code`,
            severity: 'critical',
            fixable: true,
            suggestedFix: 'Enter CPT code for procedure',
          });
          continue;
        }

        // Format validation
        if (!/^\d{5}$/.test(proc.cpt_code)) {
          result.errors.push({
            field: 'procedures',
            code: 'CODE-002',
            message: `Invalid CPT code format: ${proc.cpt_code} (must be 5 digits)`,
            severity: 'error',
            fixable: true,
            suggestedFix: 'CPT codes must be exactly 5 digits',
          });
        }

        // Validate code exists (would use codeValidationService)
        try {
          const codeValidation = await codeValidationService.validateCPTCode(proc.cpt_code);
          if (!codeValidation.isValid) {
            result.warnings.push({
              field: 'procedures',
              code: 'CODE-003',
              message: `CPT code ${proc.cpt_code} may be invalid or outdated`,
              impact: 'medium',
              recommendation: 'Verify code is current and correct',
            });
          }
        } catch (error) {
          // Code validation service not available, skip
        }
      }
    }

    // Validate ICD-10 codes
    if (claimData.diagnoses) {
      for (const diag of claimData.diagnoses) {
        if (!diag.icd_code) {
          result.errors.push({
            field: 'diagnoses',
            code: 'CODE-004',
            message: `Diagnosis missing ICD-10 code`,
            severity: 'critical',
            fixable: true,
            suggestedFix: 'Enter ICD-10 code for diagnosis',
          });
          continue;
        }

        // Format validation
        if (!/^[A-Z]\d{2,3}(\.\d{1,4})?$/.test(diag.icd_code)) {
          result.errors.push({
            field: 'diagnoses',
            code: 'CODE-005',
            message: `Invalid ICD-10 code format: ${diag.icd_code}`,
            severity: 'error',
            fixable: true,
            suggestedFix: 'ICD-10 codes must start with a letter followed by numbers',
          });
        }

        // Validate code exists
        try {
          const codeValidation = await codeValidationService.validateICD10Code(diag.icd_code);
          if (!codeValidation.isValid) {
            result.warnings.push({
              field: 'diagnoses',
              code: 'CODE-006',
              message: `ICD-10 code ${diag.icd_code} may be invalid or outdated`,
              impact: 'medium',
              recommendation: 'Verify code is current and correct',
            });
          }
        } catch (error) {
          // Code validation service not available, skip
        }
      }
    }
  }

  // Check dates
  private async checkDates(
    claimData: ClaimSubmissionData,
    result: ScrubbingResult
  ): Promise<void> {
    if (!claimData.service_date_from) return;

    const serviceDate = new Date(claimData.service_date_from);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Future date check
    if (serviceDate > today) {
      result.errors.push({
        field: 'service_date_from',
        code: 'DATE-001',
        message: 'Service date cannot be in the future',
        severity: 'error',
        fixable: true,
        suggestedFix: 'Enter a valid service date',
      });
    }

    // Too old date check (typically 1 year)
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    if (serviceDate < oneYearAgo) {
      result.warnings.push({
        field: 'service_date_from',
        code: 'DATE-002',
        message: 'Service date is more than 1 year old',
        impact: 'high',
        recommendation: 'Verify service date is correct - may be past timely filing deadline',
      });
    }

    // Date range validation
    if (claimData.service_date_to) {
      const endDate = new Date(claimData.service_date_to);
      if (endDate < serviceDate) {
        result.errors.push({
          field: 'service_date_to',
          code: 'DATE-003',
          message: 'End date cannot be before start date',
          severity: 'error',
          fixable: true,
          suggestedFix: 'End date must be on or after start date',
        });
      }

      // Check date range length (typically max 1 year)
      const daysDiff = Math.ceil((endDate.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        result.warnings.push({
          field: 'service_date_to',
          code: 'DATE-004',
          message: 'Service date range exceeds 1 year',
          impact: 'medium',
          recommendation: 'Verify date range is correct',
        });
      }
    }
  }

  // Validate financial information
  private async validateFinancials(
    claimData: ClaimSubmissionData,
    result: ScrubbingResult
  ): Promise<void> {
    // Total charges validation
    if (claimData.total_charges === undefined || claimData.total_charges === null) {
      result.errors.push({
        field: 'total_charges',
        code: 'FIN-001',
        message: 'Total charges is required',
        severity: 'critical',
        fixable: true,
        suggestedFix: 'Enter total charges',
      });
    } else if (claimData.total_charges <= 0) {
      result.errors.push({
        field: 'total_charges',
        code: 'FIN-002',
        message: 'Total charges must be greater than 0',
        severity: 'error',
        fixable: true,
        suggestedFix: 'Enter a valid charge amount',
      });
    }

    // Calculate expected total from procedures
    if (claimData.procedures && claimData.procedures.length > 0) {
      const calculatedTotal = claimData.procedures.reduce(
        (sum, proc) => sum + (proc.total_price || 0),
        0
      );

      if (Math.abs(calculatedTotal - (claimData.total_charges || 0)) > 0.01) {
        result.warnings.push({
          field: 'total_charges',
          code: 'FIN-003',
          message: `Total charges ($${claimData.total_charges}) doesn't match sum of procedures ($${calculatedTotal.toFixed(2)})`,
          impact: 'high',
          recommendation: 'Verify total charges matches procedure totals',
        });
      }
    }

    // Patient responsibility validation
    if (claimData.patient_responsibility !== undefined) {
      if (claimData.patient_responsibility < 0) {
        result.errors.push({
          field: 'patient_responsibility',
          code: 'FIN-004',
          message: 'Patient responsibility cannot be negative',
          severity: 'error',
          fixable: true,
        });
      }

      if (claimData.patient_responsibility > (claimData.total_charges || 0)) {
        result.warnings.push({
          field: 'patient_responsibility',
          code: 'FIN-005',
          message: 'Patient responsibility exceeds total charges',
          impact: 'high',
          recommendation: 'Verify patient responsibility amount',
        });
      }
    }
  }

  // Check authorization requirements
  private async checkAuthorization(
    claimData: ClaimSubmissionData,
    result: ScrubbingResult
  ): Promise<void> {
    if (!claimData.procedures || claimData.procedures.length === 0) return;

    // Check if any procedure requires authorization
    const proceduresRequiringAuth = ['27447', '27130', '29881', '29882']; // Example codes
    
    const requiresAuth = claimData.procedures.some(proc =>
      proceduresRequiringAuth.includes(proc.cpt_code)
    );

    if (requiresAuth && !claimData.prior_auth_number) {
      result.errors.push({
        field: 'prior_auth_number',
        code: 'AUTH-001',
        message: 'Prior authorization number is required for this procedure',
        severity: 'error',
        fixable: true,
        suggestedFix: 'Enter prior authorization number or obtain authorization',
      });
    }

    // Validate authorization if provided
    if (claimData.prior_auth_number) {
      try {
        const { data: auth } = await supabase
          .from('authorization_requests')
          .select('*')
          .eq('auth_number', claimData.prior_auth_number)
          .single();

        if (!auth) {
          result.warnings.push({
            field: 'prior_auth_number',
            code: 'AUTH-002',
            message: 'Prior authorization number not found in system',
            impact: 'medium',
            recommendation: 'Verify authorization number is correct',
          });
        } else {
          // Check if expired
          if (auth.expiry_date) {
            const expiryDate = new Date(auth.expiry_date);
            const serviceDate = new Date(claimData.service_date_from);
            
            if (expiryDate < serviceDate) {
              result.errors.push({
                field: 'prior_auth_number',
                code: 'AUTH-003',
                message: 'Prior authorization has expired',
                severity: 'error',
                fixable: false,
                suggestedFix: 'Obtain new authorization or use different authorization number',
              });
            }
          }

          // Check status
          if (auth.status !== 'approved') {
            result.errors.push({
              field: 'prior_auth_number',
              code: 'AUTH-004',
              message: `Prior authorization status is ${auth.status}, not approved`,
              severity: 'error',
              fixable: false,
            });
          }
        }
      } catch (error) {
        // Authorization lookup failed, continue
      }
    }
  }

  // Check eligibility (basic check)
  private async checkEligibility(
    claimData: ClaimSubmissionData,
    result: ScrubbingResult
  ): Promise<void> {
    if (!claimData.primary_insurance_id || !claimData.service_date_from) return;

    try {
      // Check if eligibility was verified
      const { data: eligibility } = await supabase
        .from('eligibility_verifications')
        .select('*')
        .eq('insurance_id', claimData.primary_insurance_id)
        .eq('service_date', claimData.service_date_from)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!eligibility) {
        result.warnings.push({
          field: 'primary_insurance_id',
          code: 'ELIG-001',
          message: 'Eligibility not verified for service date',
          impact: 'high',
          recommendation: 'Verify patient eligibility before submitting claim',
        });
      } else if (eligibility.is_eligible === false) {
        result.errors.push({
          field: 'primary_insurance_id',
          code: 'ELIG-002',
          message: 'Patient is not eligible for service date',
          severity: 'critical',
          fixable: false,
        });
      }
    } catch (error) {
      // Eligibility check failed, continue
    }
  }

  // Check for duplicate claims
  private async checkDuplicateClaims(
    claimData: ClaimSubmissionData,
    result: ScrubbingResult
  ): Promise<void> {
    if (!claimData.patient_id || !claimData.service_date_from || !claimData.procedures) return;

    try {
      const procedureCodes = claimData.procedures.map(p => p.cpt_code).sort().join(',');

      const { data: existingClaims } = await supabase
        .from('claims')
        .select('id, claim_number, status')
        .eq('patient_id', claimData.patient_id)
        .eq('service_date_from', claimData.service_date_from)
        .in('status', ['submitted', 'processing', 'paid']);

      if (existingClaims && existingClaims.length > 0) {
        // Check if procedures match
        for (const claim of existingClaims) {
          // In production, would compare procedure codes
          result.warnings.push({
            field: 'procedures',
            code: 'DUP-001',
            message: `Possible duplicate claim found: ${claim.claim_number}`,
            impact: 'high',
            recommendation: 'Verify this is not a duplicate submission',
          });
        }
      }
    } catch (error) {
      // Duplicate check failed, continue
    }
  }

  // Validate payer-specific rules
  private async validatePayerRules(
    claimData: ClaimSubmissionData,
    result: ScrubbingResult
  ): Promise<void> {
    if (!claimData.primary_insurance_id) return;

    try {
      const payerValidation = await payerRulesService.validateClaim(
        claimData,
        claimData.primary_insurance_id
      );

      payerValidation.validationResult.errors.forEach(error => {
        result.errors.push({
          field: 'payer_rules',
          code: 'PAYER-001',
          message: error,
          severity: 'error',
          fixable: true,
        });
      });

      payerValidation.validationResult.warnings.forEach(warning => {
        result.warnings.push({
          field: 'payer_rules',
          code: 'PAYER-002',
          message: warning,
          impact: 'medium',
        });
      });
    } catch (error) {
      // Payer rules validation failed, continue
    }
  }

  // Check code compatibility (diagnosis supports procedure)
  private async checkCodeCompatibility(
    claimData: ClaimSubmissionData,
    result: ScrubbingResult
  ): Promise<void> {
    if (!claimData.procedures || !claimData.diagnoses || claimData.diagnoses.length === 0) {
      return;
    }

    // Basic compatibility check
    // In production, would use actual code compatibility database
    const primaryDiagnosis = claimData.diagnoses.find(d => d.is_primary);
    
    if (primaryDiagnosis) {
      // Check if diagnosis pointer is set for procedures
      claimData.procedures.forEach((proc, index) => {
        if (!proc.diagnosis_pointer) {
          result.warnings.push({
            field: 'procedures',
            code: 'COMPAT-001',
            message: `Procedure ${index + 1} (${proc.cpt_code}) missing diagnosis pointer`,
            impact: 'medium',
            recommendation: 'Link procedure to appropriate diagnosis',
          });
        }
      });
    }
  }

  // Validate modifiers
  private async validateModifiers(
    claimData: ClaimSubmissionData,
    result: ScrubbingResult
  ): Promise<void> {
    if (!claimData.procedures) return;

    claimData.procedures.forEach((proc, index) => {
      if (proc.modifier) {
        // Modifier format validation (2 characters, alphanumeric)
        if (!/^[A-Z0-9]{2}$/.test(proc.modifier)) {
          result.errors.push({
            field: 'procedures',
            code: 'MOD-001',
            message: `Invalid modifier format: ${proc.modifier} (must be 2 characters)`,
            severity: 'error',
            fixable: true,
            suggestedFix: 'Modifiers must be exactly 2 alphanumeric characters',
          });
        }

        // Check if modifier is appropriate for CPT code
        // In production, would validate against modifier-CPT compatibility rules
      }
    });
  }

  // Calculate scrubbing score
  private calculateScore(result: ScrubbingResult): number {
    let score = 100;

    // Deduct points for errors
    result.errors.forEach(error => {
      if (error.severity === 'critical') {
        score -= 20;
      } else {
        score -= 10;
      }
    });

    // Deduct points for warnings
    result.warnings.forEach(warning => {
      if (warning.impact === 'high') {
        score -= 5;
      } else if (warning.impact === 'medium') {
        score -= 3;
      } else {
        score -= 1;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  // Calculate risk level
  private calculateRiskLevel(result: ScrubbingResult): 'low' | 'medium' | 'high' | 'critical' {
    const criticalErrors = result.errors.filter(e => e.severity === 'critical').length;
    const highImpactWarnings = result.warnings.filter(w => w.impact === 'high').length;

    if (criticalErrors > 0 || result.duplicateClaimDetected) {
      return 'critical';
    } else if (result.errors.length > 0 || highImpactWarnings >= 3) {
      return 'high';
    } else if (result.warnings.length > 0) {
      return 'medium';
    }
    return 'low';
  }

  // Estimate denial probability
  private estimateDenialProbability(result: ScrubbingResult): number {
    let probability = 0;

    // Base denial rate
    probability += 5;

    // Add for errors
    result.errors.forEach(error => {
      if (error.severity === 'critical') {
        probability += 15;
      } else {
        probability += 8;
      }
    });

    // Add for warnings
    result.warnings.forEach(warning => {
      if (warning.impact === 'high') {
        probability += 5;
      } else if (warning.impact === 'medium') {
        probability += 3;
      }
    });

    // Duplicate claim increases denial risk
    if (result.duplicateClaimDetected) {
      probability += 20;
    }

    return Math.min(100, probability);
  }

  // Real-time validation (for form fields)
  async validateField(
    field: string,
    value: any,
    claimData: Partial<ClaimSubmissionData>
  ): Promise<{
    isValid: boolean;
    error?: string;
    warning?: string;
    suggestion?: string;
  }> {
    switch (field) {
      case 'cpt_code':
        if (!value || !/^\d{5}$/.test(value)) {
          return {
            isValid: false,
            error: 'CPT code must be exactly 5 digits',
          };
        }
        return { isValid: true };

      case 'icd_code':
        if (!value || !/^[A-Z]\d{2,3}(\.\d{1,4})?$/.test(value)) {
          return {
            isValid: false,
            error: 'ICD-10 code must start with a letter followed by numbers',
          };
        }
        return { isValid: true };

      case 'service_date_from':
        if (value) {
          const date = new Date(value);
          const today = new Date();
          if (date > today) {
            return {
              isValid: false,
              error: 'Service date cannot be in the future',
            };
          }
        }
        return { isValid: true };

      case 'total_charges':
        if (value !== undefined && value <= 0) {
          return {
            isValid: false,
            error: 'Total charges must be greater than 0',
          };
        }
        return { isValid: true };

      default:
        return { isValid: true };
    }
  }
}

export const claimScrubbingService = ClaimScrubbingService.getInstance();

