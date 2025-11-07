/**
 * NPI and Taxonomy Specialty Lookup Service
 * Uses the official CMS NPPES API for provider lookups via Supabase Edge Function
 * This avoids CORS issues by proxying requests through the server
 * 
 * API Documentation: https://npiregistry.cms.hhs.gov/api-page
 * Base URL: https://npiregistry.cms.hhs.gov/api/
 */

import { supabase } from "@/integrations/supabase/client";

export interface NPISearchResult {
  number: string;
  enumeration_type: string;
  basic: {
    organization_name?: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    credential?: string;
    enumeration_date: string;
    last_updated: string;
    status: string;
  };
  addresses: Array<{
    country_code: string;
    country_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postal_code: string;
    telephone_number?: string;
    fax_number?: string;
  }>;
  taxonomies: Array<{
    code: string;
    desc: string;
    primary: boolean;
    state?: string;
    license?: string;
  }>;
}

export interface NPISearchResponse {
  result_count: number;
  results: NPISearchResult[];
}

export interface TaxonomyCode {
  code: string;
  description: string;
  grouping: string;
  classification: string;
  specialization: string;
}

/**
 * Search for NPI by NPI number
 * Uses Supabase Edge Function to avoid CORS issues
 * Falls back to direct API call if Edge Function is not available
 */
export async function searchNPIByNumber(npi: string): Promise<NPISearchResult | null> {
  try {
    // Remove any non-numeric characters
    const cleanNPI = npi.replace(/\D/g, '');
    
    if (cleanNPI.length !== 10) {
      throw new Error('NPI must be exactly 10 digits');
    }

    // Try Supabase Edge Function first (only if we haven't marked it as unavailable)
    if (edgeFunctionAvailable !== false) {
      try {
        const { data, error } = await supabase.functions.invoke('npi-lookup', {
          body: {
            action: 'searchByNumber',
            number: cleanNPI
          }
        });

        if (!error && data) {
          edgeFunctionAvailable = true; // Cache success
          const response: NPISearchResponse = data;
          
          if (response.result_count === 0 || !response.results || response.results.length === 0) {
            return null;
          }

          return response.results[0];
        }
      } catch (edgeFunctionError: any) {
        // Mark Edge Function as unavailable to avoid repeated failed calls
        edgeFunctionAvailable = false;
        
        // Check if it's a CORS/network error
        if (edgeFunctionError.message?.includes('CORS') || 
            edgeFunctionError.message?.includes('Failed to fetch') ||
            edgeFunctionError.message?.includes('ERR_FAILED')) {
          throw new Error('NPI lookup requires the Supabase Edge Function to be deployed. Please deploy the "npi-lookup" function. See QUICK_DEPLOY_EDGE_FUNCTION.md for instructions.');
        }
        
        // For other errors, try direct API call
        console.warn('Edge Function error, trying direct API call:', edgeFunctionError.message);
      }
    }

    // Fallback: Direct API call (will fail due to CORS in browser, but provides clear error)
    const url = `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${cleanNPI}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NPISearchResponse = await response.json();
      
      if (data.result_count === 0 || !data.results || data.results.length === 0) {
        return null;
      }

      return data.results[0];
    } catch (fetchError: any) {
      // If it's a CORS error, provide helpful message
      if (fetchError.message?.includes('CORS') || fetchError.message?.includes('Failed to fetch')) {
        throw new Error('NPI lookup requires the Supabase Edge Function to be deployed. Please deploy the "npi-lookup" function. See QUICK_DEPLOY_EDGE_FUNCTION.md for instructions.');
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error('Error searching NPI:', error);
    throw error;
  }
}

/**
 * Search for NPIs by provider name
 * Uses Supabase Edge Function to avoid CORS issues
 */
export async function searchNPIByName(
  firstName?: string,
  lastName?: string,
  organizationName?: string,
  state?: string,
  limit: number = 10
): Promise<NPISearchResult[]> {
  try {
    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('npi-lookup', {
      body: {
        action: 'searchByName',
        firstName,
        lastName,
        organizationName,
        state,
        limit
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to search NPI by name');
    }

    const response: NPISearchResponse = data;
    
    return response.results || [];
  } catch (error: any) {
    console.error('Error searching NPI by name:', error);
    throw new Error(error.message || 'Failed to search NPI by name');
  }
}

// Cache to track if Edge Function is available
let edgeFunctionAvailable: boolean | null = null;

/**
 * Search for taxonomy codes by description/keyword
 * Note: This searches within NPI records, so it returns providers with matching taxonomies
 * Uses Supabase Edge Function to avoid CORS issues, falls back to local search
 */
export async function searchTaxonomyByDescription(
  description: string,
  limit: number = 20
): Promise<Array<{ code: string; description: string }>> {
  // Always use local search for now (Edge Function needs to be deployed)
  // This avoids CORS errors and provides immediate functionality
  const localResults = searchTaxonomyCodes(description);
  return localResults.map(t => ({ code: t.code, description: t.description }));

  /* 
  // Uncomment this section once Edge Function is deployed
  try {
    // Check if Edge Function is available (cache the result)
    if (edgeFunctionAvailable === false) {
      // Skip Edge Function call if we know it's not available
      const localResults = searchTaxonomyCodes(description);
      return localResults.map(t => ({ code: t.code, description: t.description }));
    }

    // Try Supabase Edge Function first
    try {
      const { data, error } = await supabase.functions.invoke('npi-lookup', {
        body: {
          action: 'searchTaxonomy',
          description,
          limit
        }
      });

      if (!error && data) {
        edgeFunctionAvailable = true; // Cache success
        const response: NPISearchResponse = data;
        
        // Extract unique taxonomy codes from results
        const taxonomyMap = new Map<string, string>();
        
        response.results?.forEach(result => {
          result.taxonomies?.forEach(taxonomy => {
            if (!taxonomyMap.has(taxonomy.code)) {
              taxonomyMap.set(taxonomy.code, taxonomy.desc);
            }
          });
        });

        const results = Array.from(taxonomyMap.entries()).map(([code, description]) => ({
          code,
          description
        }));

        if (results.length > 0) {
          return results;
        }
      }
    } catch (edgeFunctionError: any) {
      // Mark Edge Function as unavailable
      edgeFunctionAvailable = false;
      // Silently fall through to local search (no console spam)
    }

    // Fallback: Use local taxonomy code search (always works, no API needed)
    const localResults = searchTaxonomyCodes(description);
    return localResults.map(t => ({ code: t.code, description: t.description }));
    
  } catch (error: any) {
    // Final fallback: return local results even on error
    const localResults = searchTaxonomyCodes(description);
    return localResults.map(t => ({ code: t.code, description: t.description }));
  }
  */
}

/**
 * Get common taxonomy codes (commonly used specialties)
 * This is a static list since the full taxonomy list is very large
 */
export function getCommonTaxonomyCodes(): TaxonomyCode[] {
  return [
    { code: '207Q00000X', description: 'Family Medicine', grouping: 'Allopathic & Osteopathic Physicians', classification: 'Family Medicine', specialization: '' },
    { code: '207R00000X', description: 'Internal Medicine', grouping: 'Allopathic & Osteopathic Physicians', classification: 'Internal Medicine', specialization: '' },
    { code: '207RI0001X', description: 'Internal Medicine - Critical Care Medicine', grouping: 'Allopathic & Osteopathic Physicians', classification: 'Internal Medicine', specialization: 'Critical Care Medicine' },
    { code: '208000000X', description: 'Pediatrics', grouping: 'Allopathic & Osteopathic Physicians', classification: 'Pediatrics', specialization: '' },
    { code: '208D00000X', description: 'General Practice', grouping: 'Allopathic & Osteopathic Physicians', classification: 'General Practice', specialization: '' },
    { code: '208G00000X', description: 'Thoracic Surgery (Cardiothoracic Vascular Surgery)', grouping: 'Allopathic & Osteopathic Physicians', classification: 'Thoracic Surgery (Cardiothoracic Vascular Surgery)', specialization: '' },
    { code: '208M00000X', description: 'Hospitalist', grouping: 'Allopathic & Osteopathic Physicians', classification: 'Hospitalist', specialization: '' },
    { code: '208U00000X', description: 'Clinical Pharmacology', grouping: 'Allopathic & Osteopathic Physicians', classification: 'Clinical Pharmacology', specialization: '' },
    { code: '213E00000X', description: 'Podiatrist', grouping: 'Podiatric Medicine & Surgery Service Providers', classification: 'Podiatrist', specialization: '' },
    { code: '231H00000X', description: 'Audiologist', grouping: 'Speech, Language and Hearing Service Providers', classification: 'Audiologist', specialization: '' },
    { code: '235Z00000X', description: 'Speech-Language Pathologist', grouping: 'Speech, Language and Hearing Service Providers', classification: 'Speech-Language Pathologist', specialization: '' },
    { code: '246Q00000X', description: 'Pathology', grouping: 'Technologists, Technicians & Other Technical Service Providers', classification: 'Pathology', specialization: '' },
    { code: '261Q00000X', description: 'Clinic/Center', grouping: 'Ambulatory Health Care Facilities', classification: 'Clinic/Center', specialization: '' },
    { code: '261QM0801X', description: 'Mental Health Clinic/Center (Including Community Mental Health Center)', grouping: 'Ambulatory Health Care Facilities', classification: 'Clinic/Center', specialization: 'Mental Health (Including Community Mental Health Center)' },
    { code: '261QM1300X', description: 'Multi-Specialty Clinic/Center', grouping: 'Ambulatory Health Care Facilities', classification: 'Clinic/Center', specialization: 'Multi-Specialty' },
    { code: '282N00000X', description: 'General Acute Care Hospital', grouping: 'Hospitals', classification: 'General Acute Care Hospital', specialization: '' },
    { code: '363A00000X', description: 'Physician Assistant', grouping: 'Physician Assistants & Advanced Practice Nursing Providers', classification: 'Physician Assistant', specialization: '' },
    { code: '363L00000X', description: 'Nurse Practitioner', grouping: 'Physician Assistants & Advanced Practice Nursing Providers', classification: 'Nurse Practitioner', specialization: '' },
    { code: '364S00000X', description: 'Clinical Nurse Specialist', grouping: 'Physician Assistants & Advanced Practice Nursing Providers', classification: 'Clinical Nurse Specialist', specialization: '' },
    { code: '367A00000X', description: 'Anesthesiologist Assistant', grouping: 'Physician Assistants & Advanced Practice Nursing Providers', classification: 'Anesthesiologist Assistant', specialization: '' },
  ];
}

/**
 * Search taxonomy codes by keyword (searches in description)
 */
export function searchTaxonomyCodes(keyword: string): TaxonomyCode[] {
  const commonCodes = getCommonTaxonomyCodes();
  const lowerKeyword = keyword.toLowerCase();
  
  return commonCodes.filter(taxonomy => 
    taxonomy.description.toLowerCase().includes(lowerKeyword) ||
    taxonomy.code.toLowerCase().includes(lowerKeyword) ||
    taxonomy.classification.toLowerCase().includes(lowerKeyword) ||
    taxonomy.specialization.toLowerCase().includes(lowerKeyword)
  );
}

