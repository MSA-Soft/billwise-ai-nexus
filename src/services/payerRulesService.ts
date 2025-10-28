// Payer-Specific Rules Service for BillWise AI Nexus
// Handles dynamic validation rules for different insurance payers

export interface PayerRule {
  id: string;
  payerId: string;
  ruleType: 'eligibility' | 'authorization' | 'billing' | 'coding' | 'timing';
  condition: string;
  action: 'allow' | 'deny' | 'warn' | 'require';
  message: string;
  priority: number;
  isActive: boolean;
  effectiveDate: string;
  expirationDate?: string;
}

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  requirements: string[];
  suggestions: string[];
}

export interface PayerSpecificValidation {
  payerId: string;
  payerName: string;
  rules: PayerRule[];
  validationResult: ValidationResult;
}

export class PayerRulesService {
  private static instance: PayerRulesService;
  private payerRules: Map<string, PayerRule[]> = new Map();
  private payerConfigs: Map<string, any> = new Map();

  private constructor() {
    this.initializePayerRules();
  }

  public static getInstance(): PayerRulesService {
    if (!PayerRulesService.instance) {
      PayerRulesService.instance = new PayerRulesService();
    }
    return PayerRulesService.instance;
  }

  // Validate claim against payer-specific rules
  async validateClaim(claimData: any, payerId: string): Promise<PayerSpecificValidation> {
    const payerName = this.getPayerName(payerId);
    const rules = this.payerRules.get(payerId) || [];
    const validationResult: ValidationResult = {
      isValid: true,
      warnings: [],
      errors: [],
      requirements: [],
      suggestions: [],
    };

    try {
      // Apply each rule
      for (const rule of rules) {
        if (!rule.isActive) continue;
        
        const ruleResult = this.applyRule(rule, claimData);
        if (ruleResult) {
          switch (rule.action) {
            case 'allow':
              validationResult.suggestions.push(rule.message);
              break;
            case 'deny':
              validationResult.isValid = false;
              validationResult.errors.push(rule.message);
              break;
            case 'warn':
              validationResult.warnings.push(rule.message);
              break;
            case 'require':
              validationResult.requirements.push(rule.message);
              break;
          }
        }
      }

      // Check for missing requirements
      if (validationResult.requirements.length > 0) {
        validationResult.isValid = false;
      }

    } catch (error) {
      validationResult.isValid = false;
      validationResult.errors.push('Error validating payer-specific rules');
      console.error('Payer rules validation error:', error);
    }

    return {
      payerId,
      payerName,
      rules,
      validationResult,
    };
  }

  // Get eligibility requirements for a payer
  async getEligibilityRequirements(payerId: string, serviceType: string): Promise<string[]> {
    const rules = this.payerRules.get(payerId) || [];
    const eligibilityRules = rules.filter(rule => 
      rule.ruleType === 'eligibility' && 
      rule.isActive &&
      this.evaluateCondition(rule.condition, { serviceType })
    );

    return eligibilityRules.map(rule => rule.message);
  }

  // Get authorization requirements for a payer
  async getAuthorizationRequirements(payerId: string, procedureCodes: string[]): Promise<string[]> {
    const rules = this.payerRules.get(payerId) || [];
    const authRules = rules.filter(rule => 
      rule.ruleType === 'authorization' && 
      rule.isActive &&
      this.evaluateCondition(rule.condition, { procedureCodes })
    );

    return authRules.map(rule => rule.message);
  }

  // Get billing requirements for a payer
  async getBillingRequirements(payerId: string, claimAmount: number): Promise<string[]> {
    const rules = this.payerRules.get(payerId) || [];
    const billingRules = rules.filter(rule => 
      rule.ruleType === 'billing' && 
      rule.isActive &&
      this.evaluateCondition(rule.condition, { claimAmount })
    );

    return billingRules.map(rule => rule.message);
  }

  // Add new payer rule
  async addPayerRule(rule: PayerRule): Promise<void> {
    const existingRules = this.payerRules.get(rule.payerId) || [];
    existingRules.push(rule);
    this.payerRules.set(rule.payerId, existingRules);
  }

  // Update existing payer rule
  async updatePayerRule(ruleId: string, updates: Partial<PayerRule>): Promise<void> {
    for (const [payerId, rules] of this.payerRules) {
      const ruleIndex = rules.findIndex(rule => rule.id === ruleId);
      if (ruleIndex !== -1) {
        rules[ruleIndex] = { ...rules[ruleIndex], ...updates };
        this.payerRules.set(payerId, rules);
        break;
      }
    }
  }

  // Get all rules for a payer
  getPayerRules(payerId: string): PayerRule[] {
    return this.payerRules.get(payerId) || [];
  }

  private initializePayerRules(): void {
    // Medicare Rules
    this.payerRules.set('MEDICARE', [
      {
        id: 'medicare-001',
        payerId: 'MEDICARE',
        ruleType: 'eligibility',
        condition: 'patientAge >= 65',
        action: 'allow',
        message: 'Patient is eligible for Medicare',
        priority: 1,
        isActive: true,
        effectiveDate: '2024-01-01',
      },
      {
        id: 'medicare-002',
        payerId: 'MEDICARE',
        ruleType: 'authorization',
        condition: 'procedureCode in ["99213", "99214", "99215"]',
        action: 'allow',
        message: 'Office visit codes do not require prior authorization',
        priority: 2,
        isActive: true,
        effectiveDate: '2024-01-01',
      },
      {
        id: 'medicare-003',
        payerId: 'MEDICARE',
        ruleType: 'billing',
        condition: 'claimAmount > 1000',
        action: 'require',
        message: 'Claims over $1000 require additional documentation',
        priority: 3,
        isActive: true,
        effectiveDate: '2024-01-01',
      },
    ]);

    // Blue Cross Blue Shield Rules
    this.payerRules.set('BCBS', [
      {
        id: 'bcbs-001',
        payerId: 'BCBS',
        ruleType: 'eligibility',
        condition: 'patientAge >= 18',
        action: 'allow',
        message: 'Patient is eligible for BCBS coverage',
        priority: 1,
        isActive: true,
        effectiveDate: '2024-01-01',
      },
      {
        id: 'bcbs-002',
        payerId: 'BCBS',
        ruleType: 'authorization',
        condition: 'procedureCode in ["99213", "99214", "99215"]',
        action: 'require',
        message: 'Office visit codes require prior authorization',
        priority: 2,
        isActive: true,
        effectiveDate: '2024-01-01',
      },
      {
        id: 'bcbs-003',
        payerId: 'BCBS',
        ruleType: 'coding',
        condition: 'diagnosisCode.length < 1',
        action: 'deny',
        message: 'At least one diagnosis code is required',
        priority: 1,
        isActive: true,
        effectiveDate: '2024-01-01',
      },
    ]);

    // Aetna Rules
    this.payerRules.set('AETNA', [
      {
        id: 'aetna-001',
        payerId: 'AETNA',
        ruleType: 'eligibility',
        condition: 'patientAge >= 21',
        action: 'allow',
        message: 'Patient is eligible for Aetna coverage',
        priority: 1,
        isActive: true,
        effectiveDate: '2024-01-01',
      },
      {
        id: 'aetna-002',
        payerId: 'AETNA',
        ruleType: 'timing',
        condition: 'claimAge > 90',
        action: 'deny',
        message: 'Claims must be submitted within 90 days',
        priority: 1,
        isActive: true,
        effectiveDate: '2024-01-01',
      },
      {
        id: 'aetna-003',
        payerId: 'AETNA',
        ruleType: 'billing',
        condition: 'claimAmount > 500',
        action: 'warn',
        message: 'High-value claims may require additional review',
        priority: 2,
        isActive: true,
        effectiveDate: '2024-01-01',
      },
    ]);
  }

  private applyRule(rule: PayerRule, claimData: any): boolean {
    try {
      return this.evaluateCondition(rule.condition, claimData);
    } catch (error) {
      console.error('Error applying rule:', error);
      return false;
    }
  }

  private evaluateCondition(condition: string, data: any): boolean {
    try {
      // Simple condition evaluator
      // In a real implementation, this would be more sophisticated
      const context = {
        ...data,
        patientAge: data.patientAge || 0,
        claimAmount: data.claimAmount || 0,
        claimAge: data.claimAge || 0,
        procedureCode: data.procedureCode || '',
        diagnosisCode: data.diagnosisCode || [],
        serviceType: data.serviceType || '',
      };

      // Replace variables in condition
      let evaluatedCondition = condition;
      for (const [key, value] of Object.entries(context)) {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        if (typeof value === 'string') {
          evaluatedCondition = evaluatedCondition.replace(regex, `"${value}"`);
        } else if (Array.isArray(value)) {
          evaluatedCondition = evaluatedCondition.replace(regex, JSON.stringify(value));
        } else {
          evaluatedCondition = evaluatedCondition.replace(regex, String(value));
        }
      }

      // Evaluate the condition (simplified - in production, use a proper expression evaluator)
      return this.safeEvaluate(evaluatedCondition);
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  private safeEvaluate(expression: string): boolean {
    try {
      // This is a simplified evaluator - in production, use a proper expression evaluator
      // For now, we'll handle basic comparisons
      if (expression.includes('>=')) {
        const [left, right] = expression.split('>=');
        return parseFloat(left.trim()) >= parseFloat(right.trim());
      }
      if (expression.includes('<=')) {
        const [left, right] = expression.split('<=');
        return parseFloat(left.trim()) <= parseFloat(right.trim());
      }
      if (expression.includes('>')) {
        const [left, right] = expression.split('>');
        return parseFloat(left.trim()) > parseFloat(right.trim());
      }
      if (expression.includes('<')) {
        const [left, right] = expression.split('<');
        return parseFloat(left.trim()) < parseFloat(right.trim());
      }
      if (expression.includes('==')) {
        const [left, right] = expression.split('==');
        return left.trim() === right.trim();
      }
      if (expression.includes('!=')) {
        const [left, right] = expression.split('!=');
        return left.trim() !== right.trim();
      }
      if (expression.includes(' in ')) {
        const [left, right] = expression.split(' in ');
        const array = JSON.parse(right.trim());
        return array.includes(left.trim().replace(/"/g, ''));
      }
      
      return false;
    } catch (error) {
      console.error('Error in safeEvaluate:', error);
      return false;
    }
  }

  private getPayerName(payerId: string): string {
    const payerNames: { [key: string]: string } = {
      'MEDICARE': 'Medicare',
      'BCBS': 'Blue Cross Blue Shield',
      'AETNA': 'Aetna',
      'CIGNA': 'Cigna',
      'HUMANA': 'Humana',
      'UHC': 'UnitedHealth',
    };
    return payerNames[payerId] || payerId;
  }
}

// Lazy-loaded service to avoid initialization errors
export const getPayerRulesService = () => PayerRulesService.getInstance();
