import { supabase } from '@/integrations/supabase/client';
import { companyService } from '@/services/companyService';

/**
 * Get the current company ID from the user's session
 * This is used to automatically filter data by company
 */
export async function getCurrentCompanyId(): Promise<string | null> {
  try {
    const company = await companyService.getCurrentCompany();
    return company?.id || null;
  } catch (error) {
    console.error('Error getting current company ID:', error);
    return null;
  }
}

/**
 * Ensure company_id is set in data object
 * Used when creating/updating records
 */
export async function ensureCompanyId<T extends { company_id?: string }>(
  data: T
): Promise<T & { company_id: string }> {
  const companyId = await getCurrentCompanyId();
  if (!companyId) {
    throw new Error('No company selected. Please select a company first.');
  }
  return { ...data, company_id: companyId };
}

/**
 * Add company_id filter to a Supabase query
 */
export async function withCompanyFilter<T>(
  query: any,
  companyId?: string
): Promise<any> {
  const id = companyId || await getCurrentCompanyId();
  if (id) {
    return query.eq('company_id', id);
  }
  return query;
}

/**
 * Get company context for React components
 * Returns current company ID synchronously from localStorage
 */
export function getCompanyIdFromStorage(): string | null {
  try {
    const stored = localStorage.getItem('current_company_id');
    return stored || null;
  } catch {
    return null;
  }
}

/**
 * Set company ID in localStorage
 */
export function setCompanyIdInStorage(companyId: string): void {
  try {
    localStorage.setItem('current_company_id', companyId);
  } catch (error) {
    console.error('Error storing company ID:', error);
  }
}

