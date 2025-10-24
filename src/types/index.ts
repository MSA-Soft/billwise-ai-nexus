// Centralized type definitions for BillWise AI Nexus

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'billing_staff' | 'patient';
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}

// Patient Types
export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  ssn?: string;
  phone?: string;
  email?: string;
  address?: string;
  insurance_id?: string;
  created_at: string;
  updated_at: string;
}

// Billing Types
export interface BillingStatement {
  id: string;
  patient_id: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CollectionAccount {
  id: string;
  patient_id: string;
  original_amount: number;
  current_balance: number;
  days_overdue: number;
  status: 'active' | 'settled' | 'closed';
  collection_agency?: string;
  created_at: string;
  updated_at: string;
}

export interface CollectionActivity {
  id: string;
  account_id: string;
  activity_type: 'call' | 'letter' | 'email' | 'payment' | 'settlement';
  description: string;
  amount?: number;
  created_at: string;
  created_by: string;
}

// Authorization Types
export interface AuthorizationRequest {
  id: string;
  patient_id: string;
  procedure_code: string;
  description: string;
  requested_amount: number;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  prior_auth_number?: string;
  created_at: string;
  updated_at: string;
}

// Payment Types
export interface PaymentPlan {
  id: string;
  patient_id: string;
  total_amount: number;
  monthly_payment: number;
  start_date: string;
  status: 'active' | 'completed' | 'defaulted' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface PaymentInstallment {
  id: string;
  plan_id: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  paid_date?: string;
  created_at: string;
}

// Analytics Types
export interface AnalyticsData {
  totalRevenue: number;
  outstandingBalance: number;
  collectionRate: number;
  averageDaysToPayment: number;
  topDenialReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    collections: number;
  }>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form Types
export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

// Hook Types
export interface UseApiOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export interface UseApiResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  mutate: (data: T) => void;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
