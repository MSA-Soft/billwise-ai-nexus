import { supabase } from '@/integrations/supabase/client';

/**
 * Generates a patient ID in the format PAT-YYYYMMNNNNN
 * Where:
 * - PAT is the prefix
 * - YYYY is the 4-digit year
 * - MM is the 2-digit month
 * - NNNNN is a 5-digit sequential number for that month/year
 * 
 * Example: PAT-20251100001 (November 2025, patient #1)
 */
export async function generatePatientId(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `PAT-${year}${month}`;
  
  // Find the highest sequential number for this month/year
  const { data: existingPatients, error } = await supabase
    .from('patients' as any)
    .select('patient_id')
    .like('patient_id', `${prefix}%`)
    .order('patient_id', { ascending: false })
    .limit(1);
  
  if (error) {
    console.error('Error fetching existing patient IDs:', error);
    // Fallback to timestamp-based ID if query fails
    return `${prefix}${String(Date.now()).slice(-5).padStart(5, '0')}`;
  }
  
  let nextNumber = 1;
  if (existingPatients && existingPatients.length > 0) {
    const lastId = existingPatients[0].patient_id;
    // Only process if it matches our format (starts with PAT-)
    if (lastId && lastId.startsWith(prefix)) {
      // Extract the number part after the prefix
      const numberPart = lastId.replace(prefix, '');
      const lastNumber = parseInt(numberPart) || 0;
      nextNumber = lastNumber + 1;
    }
  }
  
  const newPatientId = `${prefix}${String(nextNumber).padStart(5, '0')}`;
  console.log('🆔 Generated Patient ID:', newPatientId, 'for month/year:', `${year}-${month}`);
  return newPatientId;
}

