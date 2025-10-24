import { describe, it, expect } from 'vitest'
import {
  emailSchema,
  passwordSchema,
  phoneSchema,
  ssnSchema,
  patientSchema,
  billingStatementSchema,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeSSN,
  escapeHtml,
  validateAndSanitize,
} from '@/utils/validation'

describe('Validation Utils', () => {
  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      expect(emailSchema.parse('test@example.com')).toBe('test@example.com')
      expect(emailSchema.parse('user.name@domain.co.uk')).toBe('user.name@domain.co.uk')
    })

    it('should reject invalid email addresses', () => {
      expect(() => emailSchema.parse('invalid-email')).toThrow()
      expect(() => emailSchema.parse('@example.com')).toThrow()
      expect(() => emailSchema.parse('test@')).toThrow()
    })
  })

  describe('Password Validation', () => {
    it('should validate passwords with minimum length', () => {
      expect(passwordSchema.parse('password123')).toBe('password123')
      expect(passwordSchema.parse('123456')).toBe('123456')
    })

    it('should reject passwords that are too short', () => {
      expect(() => passwordSchema.parse('12345')).toThrow()
      expect(() => passwordSchema.parse('')).toThrow()
    })
  })

  describe('Phone Validation', () => {
    it('should validate phone numbers', () => {
      expect(phoneSchema.parse('+1-555-123-4567')).toBe('+1-555-123-4567')
      expect(phoneSchema.parse('(555) 123-4567')).toBe('(555) 123-4567')
      expect(phoneSchema.parse('5551234567')).toBe('5551234567')
    })

    it('should reject invalid phone numbers', () => {
      expect(() => phoneSchema.parse('abc-def-ghij')).toThrow()
      expect(() => phoneSchema.parse('123')).toThrow()
    })
  })

  describe('SSN Validation', () => {
    it('should validate SSN format', () => {
      expect(ssnSchema.parse('123-45-6789')).toBe('123-45-6789')
    })

    it('should reject invalid SSN formats', () => {
      expect(() => ssnSchema.parse('123456789')).toThrow()
      expect(() => ssnSchema.parse('123-45-678')).toThrow()
      expect(() => ssnSchema.parse('12-345-6789')).toThrow()
    })
  })

  describe('Patient Schema', () => {
    it('should validate complete patient data', () => {
      const patientData = {
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
        ssn: '123-45-6789',
        phone: '(555) 123-4567',
        email: 'john@example.com',
        address: '123 Main St',
        insurance_id: 'INS123',
      }

      expect(patientSchema.parse(patientData)).toEqual(patientData)
    })

    it('should validate minimal patient data', () => {
      const patientData = {
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
      }

      expect(patientSchema.parse(patientData)).toEqual(patientData)
    })

    it('should reject invalid patient data', () => {
      expect(() => patientSchema.parse({})).toThrow()
      expect(() => patientSchema.parse({ first_name: '', last_name: 'Doe' })).toThrow()
    })
  })

  describe('Billing Statement Schema', () => {
    it('should validate billing statement data', () => {
      const statementData = {
        patient_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 1000.50,
        due_date: '2024-01-15',
        status: 'pending',
        description: 'Medical services',
      }

      expect(billingStatementSchema.parse(statementData)).toEqual(statementData)
    })

    it('should reject invalid billing statement data', () => {
      expect(() => billingStatementSchema.parse({})).toThrow()
      expect(() => billingStatementSchema.parse({ amount: -100 })).toThrow()
      expect(() => billingStatementSchema.parse({ status: 'invalid' })).toThrow()
    })
  })

  describe('Sanitization Functions', () => {
    it('should sanitize strings', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('alert("xss")')
      expect(sanitizeString('  whitespace  ')).toBe('whitespace')
      expect(sanitizeString('javascript:void(0)')).toBe('void(0)')
    })

    it('should sanitize emails', () => {
      expect(sanitizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com')
    })

    it('should sanitize phone numbers', () => {
      expect(sanitizePhone('+1 (555) 123-4567')).toBe('+1 (555) 123-4567')
      expect(sanitizePhone('555-123-4567 ext. 123')).toBe('555-123-4567 ext. 123')
    })

    it('should sanitize SSNs', () => {
      expect(sanitizeSSN('123-45-6789')).toBe('123-45-6789')
      expect(sanitizeSSN('123 45 6789')).toBe('123-45-6789')
    })

    it('should escape HTML', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
      expect(escapeHtml('Hello & welcome')).toBe('Hello &amp; welcome')
    })
  })

  describe('Validation and Sanitization', () => {
    it('should validate and sanitize data successfully', () => {
      const result = validateAndSanitize(patientSchema, {
        first_name: '  John  ',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.first_name).toBe('John')
      }
    })

    it('should return errors for invalid data', () => {
      const result = validateAndSanitize(patientSchema, {
        first_name: '',
        last_name: 'Doe',
        date_of_birth: 'invalid-date',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0)
      }
    })
  })
})
