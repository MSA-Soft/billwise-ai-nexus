// Code Validation Service for BillWise AI Nexus
// Handles ICD-10, CPT, and HCPCS code validation

// Code Validation Service for BillWise AI Nexus
// Handles ICD-10, CPT, and HCPCS code validation

export interface CodeValidationResult {
  isValid: boolean;
  code: string;
  description: string;
  category: string;
  warnings: string[];
  errors: string[];
  suggestions: string[];
}

export interface ICD10Code {
  code: string;
  description: string;
  category: string;
  isBillable: boolean;
  requiresAdditionalDigits: boolean;
}

export interface CPTCode {
  code: string;
  description: string;
  category: string;
  modifierRequired: boolean;
  unitOfService: string;
  globalPeriod: string;
}

export interface HCPCSCode {
  code: string;
  description: string;
  category: string;
  isActive: boolean;
  effectiveDate: string;
  terminationDate?: string;
}

export class CodeValidationService {
  private static instance: CodeValidationService;
  private icd10Codes: Map<string, ICD10Code> = new Map();
  private cptCodes: Map<string, CPTCode> = new Map();
  private hcpcsCodes: Map<string, HCPCSCode> = new Map();

  private constructor() {
    this.initializeCodeSets();
  }

  public static getInstance(): CodeValidationService {
    if (!CodeValidationService.instance) {
      CodeValidationService.instance = new CodeValidationService();
    }
    return CodeValidationService.instance;
  }

  // Validate ICD-10 Diagnosis Code
  async validateICD10(code: string): Promise<CodeValidationResult> {
  codeType?: string;
  timestamp?: string;
  denialRisk?: {
    riskLevel: string;
    riskScore: number;
    riskFactors: any[];
    denialProbability?: number;
  };
  recommendations?: string[];
}

export interface ICD10Code {
  code: string;
  description: string;
  category: string;
  isBillable: boolean;
  requiresAdditionalDigits: boolean;
}

export interface CPTCode {
  code: string;
  description: string;
  category: string;
  modifierRequired: boolean;
  unitOfService: string;
  globalPeriod: string;
}

export interface HCPCSCode {
  code: string;
  description: string;
  category: string;
  isActive: boolean;
  effectiveDate: string;
  terminationDate?: string;
}

export class CodeValidationService {
  private static instance: CodeValidationService;
  private icd10Codes: Map<string, ICD10Code> = new Map();
  private cptCodes: Map<string, CPTCode> = new Map();
  private hcpcsCodes: Map<string, HCPCSCode> = new Map();

  private constructor() {
    this.initializeCodeSets();
  }

  public static getInstance(): CodeValidationService {
    if (!CodeValidationService.instance) {
      CodeValidationService.instance = new CodeValidationService();
    }
    return CodeValidationService.instance;
  }

  // Validate ICD-10 Diagnosis Code
  async validateICD10(code: string): Promise<CodeValidationResult> {
    const result: CodeValidationResult = {
      isValid: false,
      code: code.toUpperCase(),
      description: '',
      category: '',
      warnings: [],
      errors: [],
      suggestions: [],
    };

    try {
      // Clean and format the code
      const cleanCode = code.replace(/[^A-Z0-9.]/g, '').toUpperCase();
      
      if (!cleanCode) {
        result.errors.push('Invalid ICD-10 code format');
        return result;
      }

      // Check if code exists in our database
      const icd10Code = this.icd10Codes.get(cleanCode);
      if (icd10Code) {
        result.isValid = true;
        result.description = icd10Code.description;
        result.category = icd10Code.category;
        
        if (!icd10Code.isBillable) {
          result.warnings.push('This code is not billable');
        }
        
        if (icd10Code.requiresAdditionalDigits) {
          result.warnings.push('This code may require additional digits for specificity');
        }
      } else {
        // Try to find similar codes
        const suggestions = this.findSimilarICD10Codes(cleanCode);
        if (suggestions.length > 0) {
          result.suggestions = suggestions.map(s => `${s.code} - ${s.description}`);
          result.errors.push('Code not found. Did you mean one of these?');
        } else {
          result.errors.push('Invalid ICD-10 code');
        }
      }

      // Additional validation rules
      this.validateICD10Format(cleanCode, result);
      
    } catch (error) {
      result.errors.push('Error validating ICD-10 code');
      console.error('ICD-10 validation error:', error);
    }

    return result;
  }

  // Validate CPT Procedure Code
  async validateCPT(code: string): Promise<CodeValidationResult> {
    const result: CodeValidationResult = {
      isValid: false,
      code: code.toUpperCase(),
      description: '',
      category: '',
      warnings: [],
      errors: [],
      suggestions: [],
    };

    try {
      const cleanCode = code.replace(/[^A-Z0-9]/g, '').toUpperCase();
      
      if (!cleanCode || cleanCode.length < 5) {
        result.errors.push('CPT code must be 5 digits');
        return result;
      }

      const cptCode = this.cptCodes.get(cleanCode);
      if (cptCode) {
        result.isValid = true;
        result.description = cptCode.description;
        result.category = cptCode.category;
        
        if (cptCode.modifierRequired) {
          result.warnings.push('This code may require a modifier');
        }
        
        if (cptCode.globalPeriod !== '000') {
          result.warnings.push(`Global period: ${cptCode.globalPeriod} days`);
        }
      } else {
        const suggestions = this.findSimilarCPTCodes(cleanCode);
        if (suggestions.length > 0) {
          result.suggestions = suggestions.map(s => `${s.code} - ${s.description}`);
          result.errors.push('Code not found. Did you mean one of these?');
        } else {
          result.errors.push('Invalid CPT code');
        }
      }

      this.validateCPTFormat(cleanCode, result);
      
    } catch (error) {
      result.errors.push('Error validating CPT code');
      console.error('CPT validation error:', error);
    }

    return result;
  }

  // Validate CDT (Dental) Code
  async validateCDT(code: string): Promise<CodeValidationResult> {
    const result: CodeValidationResult = {
      isValid: false,
      code: code.toUpperCase(),
      description: '',
      category: '',
      warnings: [],
      errors: [],
      suggestions: [],
    };

    try {
      // Clean and format the code
      const cleanCode = code.replace(/[^A-Z0-9.]/g, '').toUpperCase();
      
      if (!cleanCode) {
        result.errors.push('Invalid ICD-10 code format');
        return result;
      }

      // Check if code exists in our database
      const icd10Code = this.icd10Codes.get(cleanCode);
      if (icd10Code) {
        result.isValid = true;
        result.description = icd10Code.description;
        result.category = icd10Code.category;
        
        if (!icd10Code.isBillable) {
          result.warnings.push('This code is not billable');
        }
        
        if (icd10Code.requiresAdditionalDigits) {
          result.warnings.push('This code may require additional digits for specificity');
        }
      } else {
        // Unknown to our local dataset: treat as provisionally valid if format is correct
        const suggestions = this.findSimilarICD10Codes(cleanCode);
        if (suggestions.length > 0) {
          result.suggestions = suggestions.map(s => `${s.code} - ${s.description}`);
        }
        result.warnings.push('Code not found in local set. Proceed if format is correct.');
        result.isValid = true; // provisional; finalized after format validation below
      }

      // Additional validation rules
      this.validateICD10Format(cleanCode, result);
      // Final validity is based on presence of hard errors (format issues)
      result.isValid = result.errors.length === 0;
      
    } catch (error) {
      result.errors.push('Error validating ICD-10 code');
      console.error('ICD-10 validation error:', error);
    }

    return result;
  }

  // Validate CPT Procedure Code
  async validateCPT(code: string): Promise<CodeValidationResult> {
    const result: CodeValidationResult = {
      isValid: false,
      code: code.toUpperCase(),
      description: '',
      category: '',
      category: 'Dental',
      warnings: [],
      errors: [],
      suggestions: [],
    };

    try {
      const cleanCode = code.replace(/[^A-Z0-9]/g, '').toUpperCase();
      
      if (!cleanCode || cleanCode.length < 5) {
        result.errors.push('CPT code must be 5 digits');
        return result;
      }

      const cptCode = this.cptCodes.get(cleanCode);
      if (cptCode) {
        result.isValid = true;
        result.description = cptCode.description;
        result.category = cptCode.category;
        
        if (cptCode.modifierRequired) {
          result.warnings.push('This code may require a modifier');
        }
        
        if (cptCode.globalPeriod !== '000') {
          result.warnings.push(`Global period: ${cptCode.globalPeriod} days`);
        }
      } else {
        const suggestions = this.findSimilarCPTCodes(cleanCode);
        if (suggestions.length > 0) {
          result.suggestions = suggestions.map(s => `${s.code} - ${s.description}`);
          result.errors.push('Code not found. Did you mean one of these?');
        } else {
          result.errors.push('Invalid CPT code');
        }
      }

      this.validateCPTFormat(cleanCode, result);
      
    } catch (error) {
      result.errors.push('Error validating CPT code');
      console.error('CPT validation error:', error);
      if (!cleanCode || cleanCode.length !== 5) {
        result.errors.push('CDT code must be 5 characters (D followed by 4 digits)');
        return result;
      }

      if (!/^D[0-9]{4}$/.test(cleanCode)) {
        result.errors.push('CDT code must start with D followed by 4 digits');
        return result;
      }

      // For now, mark as valid if format is correct
      result.isValid = true;
      result.description = 'Dental procedure code';
      
    } catch (error) {
      result.errors.push('Error validating CDT code');
      console.error('CDT validation error:', error);
    }

    return result;
  }

  // Validate HCPCS Code
  async validateHCPCS(code: string): Promise<CodeValidationResult> {
    const result: CodeValidationResult = {
      isValid: false,
      code: code.toUpperCase(),
      description: '',
      category: '',
      warnings: [],
      errors: [],
      suggestions: [],
    };

    try {
      const cleanCode = code.replace(/[^A-Z0-9]/g, '').toUpperCase();
      
      if (!cleanCode) {
        result.errors.push('Invalid HCPCS code format');
        return result;
      }

      const hcpcsCode = this.hcpcsCodes.get(cleanCode);
      if (hcpcsCode) {
        result.isValid = hcpcsCode.isActive;
        result.description = hcpcsCode.description;
        result.category = hcpcsCode.category;
        
        if (!hcpcsCode.isActive) {
          result.errors.push('This HCPCS code is inactive');
        }
        
        if (hcpcsCode.terminationDate) {
          result.warnings.push(`Code terminated on: ${hcpcsCode.terminationDate}`);
        }
      } else {
        const suggestions = this.findSimilarHCPCSCodes(cleanCode);
        if (suggestions.length > 0) {
          result.suggestions = suggestions.map(s => `${s.code} - ${s.description}`);
          result.errors.push('Code not found. Did you mean one of these?');
        } else {
          result.errors.push('Invalid HCPCS code');
        }
      }
      
    } catch (error) {
      result.errors.push('Error validating HCPCS code');
      console.error('HCPCS validation error:', error);
    }

    return result;
  }

  // Validate Code Combination (ICD-10 + CPT)
  async validateCodeCombination(icd10Codes: string[], cptCodes: string[]): Promise<{
    isValid: boolean;
    warnings: string[];
    errors: string[];
    suggestions: string[];
  }> {
    const result = {
      isValid: true,
      warnings: [] as string[],
      errors: [] as string[],
      suggestions: [] as string[],
    };

    try {
      // Validate each code individually
      for (const icd10 of icd10Codes) {
        const icd10Result = await this.validateICD10(icd10);
        if (!icd10Result.isValid) {
          result.isValid = false;
          result.errors.push(`Invalid ICD-10 code: ${icd10}`);
        }
        result.warnings.push(...icd10Result.warnings);
        result.errors.push(...icd10Result.errors);
      }

      for (const cpt of cptCodes) {
        const cptResult = await this.validateCPT(cpt);
        if (!cptResult.isValid) {
          result.isValid = false;
          result.errors.push(`Invalid CPT code: ${cpt}`);
        }
        result.warnings.push(...cptResult.warnings);
        result.errors.push(...cptResult.errors);
      }

      // Check for common code combination issues
      this.validateCodeCompatibility(icd10Codes, cptCodes, result);
      
    } catch (error) {
      result.isValid = false;
      result.errors.push('Error validating code combination');
      console.error('Code combination validation error:', error);
    }

    return result;
  }

  private initializeCodeSets(): void {
    // Initialize with common ICD-10 codes
    this.icd10Codes.set('A00.0', {
      code: 'A00.0',
      description: 'Cholera due to Vibrio cholerae 01, biovar cholerae',
      category: 'Infectious and parasitic diseases',
      isBillable: true,
      requiresAdditionalDigits: false,
    });

    this.icd10Codes.set('Z00.00', {
      code: 'Z00.00',
      description: 'Encounter for general adult medical examination without abnormal findings',
      category: 'Factors influencing health status',
      isBillable: true,
      requiresAdditionalDigits: false,
    });

    // Initialize with common CPT codes
    this.cptCodes.set('99213', {
      code: '99213',
      description: 'Office or other outpatient visit for the evaluation and management of an established patient',
      category: 'Evaluation and Management',
      modifierRequired: false,
      unitOfService: 'per visit',
      globalPeriod: '000',
    });

    this.cptCodes.set('99214', {
      code: '99214',
      description: 'Office or other outpatient visit for the evaluation and management of an established patient',
      category: 'Evaluation and Management',
      modifierRequired: false,
      unitOfService: 'per visit',
      globalPeriod: '000',
    });

    // Initialize with common HCPCS codes
    this.hcpcsCodes.set('A0425', {
      code: 'A0425',
      description: 'Ambulance service, basic life support, non-emergency transport',
      category: 'Transportation Services',
      isActive: true,
      effectiveDate: '2023-01-01',
    });
  }

  private validateICD10Format(code: string, result: CodeValidationResult): void {
    // ICD-10 format validation
    if (code.length < 3 || code.length > 7) {
      result.errors.push('ICD-10 code must be 3-7 characters');
    }

    if (!/^[A-Z][0-9]{2}/.test(code)) {
      result.errors.push('ICD-10 code must start with a letter followed by 2 digits');
    }

    if (code.includes('.') && code.split('.')[1].length > 2) {
      result.warnings.push('ICD-10 code may have too many decimal places');
    }
  }

  private validateCPTFormat(code: string, result: CodeValidationResult): void {
    // CPT format validation
    if (code.length !== 5) {
      result.errors.push('CPT code must be exactly 5 digits');
    }

    if (!/^[0-9]{5}$/.test(code)) {
      result.errors.push('CPT code must contain only digits');
    }
  }

  private findSimilarICD10Codes(code: string): ICD10Code[] {
    const suggestions: ICD10Code[] = [];
    const searchTerm = code.toLowerCase();
    
    for (const [key, value] of this.icd10Codes) {
      if (key.toLowerCase().includes(searchTerm) || 
          value.description.toLowerCase().includes(searchTerm)) {
        suggestions.push(value);
        if (suggestions.length >= 5) break;
      }
    }
    
    return suggestions;
  }

  private findSimilarCPTCodes(code: string): CPTCode[] {
    const suggestions: CPTCode[] = [];
    const searchTerm = code.toLowerCase();
    
    for (const [key, value] of this.cptCodes) {
      if (key.toLowerCase().includes(searchTerm) || 
          value.description.toLowerCase().includes(searchTerm)) {
        suggestions.push(value);
        if (suggestions.length >= 5) break;
      }
    }
    
    return suggestions;
  }

  private findSimilarHCPCSCodes(code: string): HCPCSCode[] {
    const suggestions: HCPCSCode[] = [];
    const searchTerm = code.toLowerCase();
    
    for (const [key, value] of this.hcpcsCodes) {
      if (key.toLowerCase().includes(searchTerm) || 
          value.description.toLowerCase().includes(searchTerm)) {
        suggestions.push(value);
        if (suggestions.length >= 5) break;
      }
    }
    
    return suggestions;
  }

  private validateCodeCompatibility(icd10Codes: string[], cptCodes: string[], result: any): void {
    // Check for common compatibility issues
    if (icd10Codes.length === 0 && cptCodes.length > 0) {
      result.warnings.push('CPT codes should be accompanied by ICD-10 diagnosis codes');
    }

    if (icd10Codes.length > 0 && cptCodes.length === 0) {
      result.warnings.push('ICD-10 diagnosis codes should be accompanied by CPT procedure codes');
    }

    // Check for specific code combinations that might be problematic
    const hasPreventiveCodes = cptCodes.some(code => ['99381', '99382', '99383', '99384', '99385', '99386', '99387'].includes(code));
    const hasSickVisitCodes = cptCodes.some(code => ['99213', '99214', '99215'].includes(code));
    
    if (hasPreventiveCodes && hasSickVisitCodes) {
      result.warnings.push('Mixing preventive and sick visit codes may require modifiers');
    }
  }
}

// Lazy-loaded service to avoid initialization errors
export const getCodeValidationService = () => CodeValidationService.getInstance();
    const result: CodeValidationResult = {
      isValid: false,
      code: code.toUpperCase(),
      description: '',
      category: '',
      warnings: [],
      errors: [],
      suggestions: [],
    };

    try {
      const cleanCode = code.replace(/[^A-Z0-9]/g, '').toUpperCase();
      
      if (!cleanCode) {
        result.errors.push('Invalid HCPCS code format');
        return result;
      }

      const hcpcsCode = this.hcpcsCodes.get(cleanCode);
      if (hcpcsCode) {
        result.isValid = hcpcsCode.isActive;
        result.description = hcpcsCode.description;
        result.category = hcpcsCode.category;
        
        if (!hcpcsCode.isActive) {
          result.errors.push('This HCPCS code is inactive');
        }
        
        if (hcpcsCode.terminationDate) {
          result.warnings.push(`Code terminated on: ${hcpcsCode.terminationDate}`);
        }
      } else {
        const suggestions = this.findSimilarHCPCSCodes(cleanCode);
        if (suggestions.length > 0) {
          result.suggestions = suggestions.map(s => `${s.code} - ${s.description}`);
          result.errors.push('Code not found. Did you mean one of these?');
        } else {
          result.errors.push('Invalid HCPCS code');
        }
      }
      
    } catch (error) {
      result.errors.push('Error validating HCPCS code');
      console.error('HCPCS validation error:', error);
    }

    return result;
  }

  // Validate Code Combination (ICD-10 + CPT)
  async validateCodeCombination(icd10Codes: string[], cptCodes: string[]): Promise<{
    isValid: boolean;
    warnings: string[];
    errors: string[];
    suggestions: string[];
  }> {
    const result = {
      isValid: true,
      warnings: [] as string[],
      errors: [] as string[],
      suggestions: [] as string[],
    };

    try {
      // Validate each code individually
      for (const icd10 of icd10Codes) {
        const icd10Result = await this.validateICD10(icd10);
        if (!icd10Result.isValid) {
          result.isValid = false;
          result.errors.push(`Invalid ICD-10 code: ${icd10}`);
        }
        result.warnings.push(...icd10Result.warnings);
        result.errors.push(...icd10Result.errors);
      }

      for (const cpt of cptCodes) {
        const cptResult = await this.validateCPT(cpt);
        if (!cptResult.isValid) {
          result.isValid = false;
          result.errors.push(`Invalid CPT code: ${cpt}`);
        }
        result.warnings.push(...cptResult.warnings);
        result.errors.push(...cptResult.errors);
      }

      // Check for common code combination issues
      this.validateCodeCompatibility(icd10Codes, cptCodes, result);
      
    } catch (error) {
      result.isValid = false;
      result.errors.push('Error validating code combination');
      console.error('Code combination validation error:', error);
    }

    return result;
  }

  private initializeCodeSets(): void {
    // Initialize with common ICD-10 codes
    this.icd10Codes.set('A00.0', {
      code: 'A00.0',
      description: 'Cholera due to Vibrio cholerae 01, biovar cholerae',
      category: 'Infectious and parasitic diseases',
      isBillable: true,
      requiresAdditionalDigits: false,
    });

    this.icd10Codes.set('Z00.00', {
      code: 'Z00.00',
      description: 'Encounter for general adult medical examination without abnormal findings',
      category: 'Factors influencing health status',
      isBillable: true,
      requiresAdditionalDigits: false,
    });

    // Initialize with common CPT codes
    this.cptCodes.set('99213', {
      code: '99213',
      description: 'Office or other outpatient visit for the evaluation and management of an established patient',
      category: 'Evaluation and Management',
      modifierRequired: false,
      unitOfService: 'per visit',
      globalPeriod: '000',
    });

    this.cptCodes.set('99214', {
      code: '99214',
      description: 'Office or other outpatient visit for the evaluation and management of an established patient',
      category: 'Evaluation and Management',
      modifierRequired: false,
      unitOfService: 'per visit',
      globalPeriod: '000',
    });

    // Initialize with common HCPCS codes
    this.hcpcsCodes.set('A0425', {
      code: 'A0425',
      description: 'Ambulance service, basic life support, non-emergency transport',
      category: 'Transportation Services',
      isActive: true,
      effectiveDate: '2023-01-01',
    });
  }

  private validateICD10Format(code: string, result: CodeValidationResult): void {
    // ICD-10 format validation
    if (code.length < 3 || code.length > 7) {
      result.errors.push('ICD-10 code must be 3-7 characters');
    }

    if (!/^[A-Z][0-9]{2}/.test(code)) {
      result.errors.push('ICD-10 code must start with a letter followed by 2 digits');
    }

    if (code.includes('.') && code.split('.')[1].length > 2) {
      result.warnings.push('ICD-10 code may have too many decimal places');
    }
  }

  private validateCPTFormat(code: string, result: CodeValidationResult): void {
    // CPT format validation
    if (code.length !== 5) {
      result.errors.push('CPT code must be exactly 5 digits');
    }

    if (!/^[0-9]{5}$/.test(code)) {
      result.errors.push('CPT code must contain only digits');
    }
  }

  private findSimilarICD10Codes(code: string): ICD10Code[] {
    const suggestions: ICD10Code[] = [];
    const searchTerm = code.toLowerCase();
    
    for (const [key, value] of this.icd10Codes) {
      if (key.toLowerCase().includes(searchTerm) || 
          value.description.toLowerCase().includes(searchTerm)) {
        suggestions.push(value);
        if (suggestions.length >= 5) break;
      }
    }
    
    return suggestions;
  }

  private findSimilarCPTCodes(code: string): CPTCode[] {
    const suggestions: CPTCode[] = [];
    const searchTerm = code.toLowerCase();
    
    for (const [key, value] of this.cptCodes) {
      if (key.toLowerCase().includes(searchTerm) || 
          value.description.toLowerCase().includes(searchTerm)) {
        suggestions.push(value);
        if (suggestions.length >= 5) break;
      }
    }
    
    return suggestions;
  }

  private findSimilarHCPCSCodes(code: string): HCPCSCode[] {
    const suggestions: HCPCSCode[] = [];
    const searchTerm = code.toLowerCase();
    
    for (const [key, value] of this.hcpcsCodes) {
      if (key.toLowerCase().includes(searchTerm) || 
          value.description.toLowerCase().includes(searchTerm)) {
        suggestions.push(value);
        if (suggestions.length >= 5) break;
      }
    }
    
    return suggestions;
  }

  private validateCodeCompatibility(icd10Codes: string[], cptCodes: string[], result: any): void {
    // Check for common compatibility issues
    if (icd10Codes.length === 0 && cptCodes.length > 0) {
      result.warnings.push('CPT codes should be accompanied by ICD-10 diagnosis codes');
    }

    if (icd10Codes.length > 0 && cptCodes.length === 0) {
      result.warnings.push('ICD-10 diagnosis codes should be accompanied by CPT procedure codes');
    }

    // Check for specific code combinations that might be problematic
    const hasPreventiveCodes = cptCodes.some(code => ['99381', '99382', '99383', '99384', '99385', '99386', '99387'].includes(code));
    const hasSickVisitCodes = cptCodes.some(code => ['99213', '99214', '99215'].includes(code));
    
    if (hasPreventiveCodes && hasSickVisitCodes) {
      result.warnings.push('Mixing preventive and sick visit codes may require modifiers');
    }
  }
}

// Lazy-loaded service to avoid initialization errors
export const getCodeValidationService = () => CodeValidationService.getInstance();
