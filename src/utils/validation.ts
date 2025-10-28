import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number');
export const ssnSchema = z.string().regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN must be in format XXX-XX-XXXX');

// Patient validation
export const patientSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  ssn: ssnSchema.optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  address: z.string().max(200, 'Address too long').optional(),
  insurance_id: z.string().max(50, 'Insurance ID too long').optional(),
});

// Billing statement validation
export const billingStatementSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  amount: z.number().positive('Amount must be positive'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled']),
  description: z.string().max(500, 'Description too long').optional(),
});

// Collection account validation
export const collectionAccountSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  original_amount: z.number().positive('Amount must be positive'),
  current_balance: z.number().min(0, 'Balance cannot be negative'),
  days_overdue: z.number().min(0, 'Days overdue cannot be negative'),
  status: z.enum(['active', 'settled', 'closed']),
  collection_agency: z.string().max(100, 'Agency name too long').optional(),
});

// Authorization request validation
export const authorizationRequestSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  procedure_code: z.string().max(10, 'Procedure code too long'),
  description: z.string().max(200, 'Description too long'),
  requested_amount: z.number().positive('Amount must be positive'),
  status: z.enum(['pending', 'approved', 'denied', 'expired']),
  prior_auth_number: z.string().max(50, 'Prior auth number too long').optional(),
});

// Payment plan validation
export const paymentPlanSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  total_amount: z.number().positive('Amount must be positive'),
  monthly_payment: z.number().positive('Monthly payment must be positive'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  status: z.enum(['active', 'completed', 'defaulted', 'cancelled']),
});

// Utility functions for sanitization
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const sanitizeEmail = (email: string): string => {
  return sanitizeString(email).toLowerCase();
};

export const sanitizePhone = (phone: string): string => {
  return sanitizeString(phone).replace(/[^\d\+\-\(\)\s]/g, '');
};

export const sanitizeSSN = (ssn: string): string => {
  return sanitizeString(ssn).replace(/[^\d\-]/g, '');
};

// Validation helper functions
export const validateAndSanitize = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
};

// XSS prevention
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// SQL injection prevention (additional layer)
export const sanitizeForDatabase = (input: string): string => {
  return input
    .replace(/[';\\]/g, '') // Remove potential SQL injection characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment starts
    .replace(/\*\//g, ''); // Remove block comment ends
};
