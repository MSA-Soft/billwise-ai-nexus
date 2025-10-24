// Application constants for BillWise AI Nexus

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// Application Settings
export const APP_CONFIG = {
  NAME: 'BillWise AI Nexus',
  VERSION: '1.0.0',
  DESCRIPTION: 'Medical Billing Management System',
  SUPPORT_EMAIL: 'support@billwise.com',
  PHONE: '(555) 123-4567',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  BILLING_STAFF: 'billing_staff',
  PATIENT: 'patient',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Billing Status
export const BILLING_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

export type BillingStatus = typeof BILLING_STATUS[keyof typeof BILLING_STATUS];

// Collection Status
export const COLLECTION_STATUS = {
  ACTIVE: 'active',
  SETTLED: 'settled',
  CLOSED: 'closed',
} as const;

export type CollectionStatus = typeof COLLECTION_STATUS[keyof typeof COLLECTION_STATUS];

// Authorization Status
export const AUTHORIZATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied',
  EXPIRED: 'expired',
} as const;

export type AuthorizationStatus = typeof AUTHORIZATION_STATUS[keyof typeof AUTHORIZATION_STATUS];

// Payment Plan Status
export const PAYMENT_PLAN_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DEFAULTED: 'defaulted',
  CANCELLED: 'cancelled',
} as const;

export type PaymentPlanStatus = typeof PAYMENT_PLAN_STATUS[keyof typeof PAYMENT_PLAN_STATUS];

// Activity Types
export const ACTIVITY_TYPES = {
  CALL: 'call',
  LETTER: 'letter',
  EMAIL: 'email',
  PAYMENT: 'payment',
  SETTLEMENT: 'settlement',
} as const;

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES];

// Common Denial Codes
export const DENIAL_CODES = {
  CO_1: 'CO-1', // Deductible Amount
  CO_2: 'CO-2', // Coinsurance Amount
  CO_3: 'CO-3', // Co-payment Amount
  CO_11: 'CO-11', // Diagnosis Not Covered
  CO_16: 'CO-16', // Prior Authorization Required
  CO_18: 'CO-18', // Duplicate Claim
  CO_19: 'CO-19', // Claim Denied
  CO_20: 'CO-20', // Not Covered
} as const;

// Table Configuration
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// Form Validation
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 20,
  ADDRESS_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 500,
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
} as const;

// Currency Configuration
export const CURRENCY_CONFIG = {
  SYMBOL: '$',
  DECIMAL_PLACES: 2,
  THOUSAND_SEPARATOR: ',',
  DECIMAL_SEPARATOR: '.',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'billwise_auth_token',
  USER_PREFERENCES: 'billwise_user_preferences',
  THEME: 'billwise_theme',
  LANGUAGE: 'billwise_language',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
  PATIENTS: {
    LIST: '/patients',
    CREATE: '/patients',
    UPDATE: '/patients/:id',
    DELETE: '/patients/:id',
  },
  BILLING: {
    STATEMENTS: '/billing/statements',
    CREATE_STATEMENT: '/billing/statements',
    UPDATE_STATEMENT: '/billing/statements/:id',
    DELETE_STATEMENT: '/billing/statements/:id',
  },
  COLLECTIONS: {
    ACCOUNTS: '/collections/accounts',
    ACTIVITIES: '/collections/activities',
    CREATE_ACCOUNT: '/collections/accounts',
    UPDATE_ACCOUNT: '/collections/accounts/:id',
    DELETE_ACCOUNT: '/collections/accounts/:id',
  },
  AUTHORIZATIONS: {
    REQUESTS: '/authorizations/requests',
    CREATE_REQUEST: '/authorizations/requests',
    UPDATE_REQUEST: '/authorizations/requests/:id',
    DELETE_REQUEST: '/authorizations/requests/:id',
  },
  PAYMENTS: {
    PLANS: '/payments/plans',
    INSTALLMENTS: '/payments/installments',
    CREATE_PLAN: '/payments/plans',
    UPDATE_PLAN: '/payments/plans/:id',
    DELETE_PLAN: '/payments/plans/:id',
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    REPORTS: '/analytics/reports',
    METRICS: '/analytics/metrics',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again.',
  TIMEOUT: 'Request timed out. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully.',
  CREATED: 'Record created successfully.',
  UPDATED: 'Record updated successfully.',
  DELETED: 'Record deleted successfully.',
  SENT: 'Message sent successfully.',
  UPLOADED: 'File uploaded successfully.',
} as const;
