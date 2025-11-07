// Natural Language Processing Service
// Extract data from clinical notes, auto-populate forms

import { aiService } from './aiService';

export interface ExtractedData {
  patientInfo?: {
    name?: string;
    dob?: string;
    age?: number;
    gender?: string;
  };
  diagnosis?: {
    primary?: string;
    secondary?: string[];
    icdCodes?: string[];
  };
  procedures?: {
    codes?: string[];
    descriptions?: string[];
    dates?: string[];
  };
  medications?: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
  }>;
  clinicalIndication?: string;
  medicalNecessity?: string;
  symptoms?: string[];
  treatmentPlan?: string;
  providerNotes?: string;
}

export interface ExtractionResult {
  extractedData: ExtractedData;
  confidence: number; // 0-100
  sourceText: string;
  extractionMethod: 'ai' | 'rule-based' | 'hybrid';
  fieldsExtracted: string[];
  fieldsMissing: string[];
}

export class NLPService {
  private static instance: NLPService;

  static getInstance(): NLPService {
    if (!NLPService.instance) {
      NLPService.instance = new NLPService();
    }
    return NLPService.instance;
  }

  // Extract data from clinical notes
  async extractFromClinicalNotes(text: string): Promise<ExtractionResult> {
    try {
      const extractedData: ExtractedData = {};
      const fieldsExtracted: string[] = [];
      const fieldsMissing: string[] = [];

      // Use AI for extraction if available
      if (this.hasAICapability()) {
        return await this.extractWithAI(text);
      }

      // Fallback to rule-based extraction
      return await this.extractWithRules(text);
    } catch (error: any) {
      console.error('Error extracting from clinical notes:', error);
      throw new Error(error.message || 'Failed to extract data from clinical notes');
    }
  }

  // Extract using AI (OpenAI)
  private async extractWithAI(text: string): Promise<ExtractionResult> {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey || apiKey === 'demo-key') {
        // Fallback to rule-based
        return await this.extractWithRules(text);
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a medical data extraction expert. Extract structured data from clinical notes. Return JSON with: patientInfo (name, dob, age, gender), diagnosis (primary, secondary, icdCodes), procedures (codes, descriptions, dates), medications (name, dosage, frequency), clinicalIndication, medicalNecessity, symptoms, treatmentPlan.`
            },
            {
              role: 'user',
              content: `Extract medical data from this clinical note:\n\n${text}`
            }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 2000,
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const extracted = JSON.parse(data.choices[0].message.content);

        return {
          extractedData: extracted,
          confidence: 85, // High confidence for AI extraction
          sourceText: text,
          extractionMethod: 'ai',
          fieldsExtracted: Object.keys(extracted).filter(key => extracted[key] !== null && extracted[key] !== undefined),
          fieldsMissing: [],
        };
      }
    } catch (error) {
      console.log('AI extraction failed, using rule-based');
    }

    // Fallback to rule-based
    return await this.extractWithRules(text);
  }

  // Extract using rule-based patterns
  private async extractWithRules(text: string): Promise<ExtractionResult> {
    const extractedData: ExtractedData = {};
    const fieldsExtracted: string[] = [];
    const fieldsMissing: string[] = [];

    // Extract patient name
    const nameMatch = text.match(/(?:patient|pt|name):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
    if (nameMatch) {
      extractedData.patientInfo = { ...extractedData.patientInfo, name: nameMatch[1] };
      fieldsExtracted.push('patientName');
    } else {
      fieldsMissing.push('patientName');
    }

    // Extract DOB
    const dobMatch = text.match(/(?:dob|date of birth|birthdate):\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    if (dobMatch) {
      extractedData.patientInfo = { ...extractedData.patientInfo, dob: dobMatch[1] };
      fieldsExtracted.push('patientDOB');
    }

    // Extract age
    const ageMatch = text.match(/(?:age):\s*(\d+)\s*(?:years?|yrs?|yo)/i);
    if (ageMatch) {
      extractedData.patientInfo = { ...extractedData.patientInfo, age: parseInt(ageMatch[1]) };
      fieldsExtracted.push('patientAge');
    }

    // Extract gender
    const genderMatch = text.match(/\b(male|female|m|f|man|woman)\b/i);
    if (genderMatch) {
      const gender = genderMatch[1].toLowerCase();
      extractedData.patientInfo = { 
        ...extractedData.patientInfo, 
        gender: gender.startsWith('m') ? 'male' : 'female' 
      };
      fieldsExtracted.push('patientGender');
    }

    // Extract diagnosis codes (ICD-10)
    const icdMatches = text.match(/\b([A-Z]\d{2,3}(?:\.\d{1,4})?)\b/g);
    if (icdMatches) {
      extractedData.diagnosis = {
        ...extractedData.diagnosis,
        icdCodes: icdMatches.filter(code => /^[A-Z]\d{2,3}(\.\d{1,4})?$/.test(code)),
      };
      if (extractedData.diagnosis.icdCodes && extractedData.diagnosis.icdCodes.length > 0) {
        extractedData.diagnosis.primary = extractedData.diagnosis.icdCodes[0];
        fieldsExtracted.push('diagnosisCodes');
      }
    }

    // Extract procedure codes (CPT)
    const cptMatches = text.match(/\b(\d{5})\b/g);
    if (cptMatches) {
      const cptCodes = cptMatches.filter(code => /^\d{5}$/.test(code));
      if (cptCodes.length > 0) {
        extractedData.procedures = {
          ...extractedData.procedures,
          codes: cptCodes,
        };
        fieldsExtracted.push('procedureCodes');
      }
    }

    // Extract clinical indication
    const indicationMatch = text.match(/(?:clinical indication|indication|reason for visit):\s*(.+?)(?:\n|\.|$)/i);
    if (indicationMatch) {
      extractedData.clinicalIndication = indicationMatch[1].trim();
      fieldsExtracted.push('clinicalIndication');
    } else {
      // Try to extract from symptoms or chief complaint
      const symptomMatch = text.match(/(?:chief complaint|symptoms|presenting):\s*(.+?)(?:\n|\.|$)/i);
      if (symptomMatch) {
        extractedData.clinicalIndication = symptomMatch[1].trim();
        fieldsExtracted.push('clinicalIndication');
      } else {
        fieldsMissing.push('clinicalIndication');
      }
    }

    // Extract medical necessity
    const necessityMatch = text.match(/(?:medical necessity|medically necessary|necessity):\s*(.+?)(?:\n\n|\.\s|$)/is);
    if (necessityMatch) {
      extractedData.medicalNecessity = necessityMatch[1].trim();
      fieldsExtracted.push('medicalNecessity');
    } else {
      fieldsMissing.push('medicalNecessity');
    }

    // Extract symptoms
    const symptomsMatch = text.match(/(?:symptoms|symptom|complaints?):\s*(.+?)(?:\n|\.|$)/i);
    if (symptomsMatch) {
      extractedData.symptoms = symptomsMatch[1].split(',').map(s => s.trim());
      fieldsExtracted.push('symptoms');
    }

    // Extract treatment plan
    const treatmentMatch = text.match(/(?:treatment plan|plan|treatment):\s*(.+?)(?:\n\n|$)/is);
    if (treatmentMatch) {
      extractedData.treatmentPlan = treatmentMatch[1].trim();
      fieldsExtracted.push('treatmentPlan');
    }

    // Extract medications
    const medicationMatches = text.match(/(?:medications?|meds?|prescribed):\s*(.+?)(?:\n\n|$)/is);
    if (medicationMatches) {
      const medsText = medicationMatches[1];
      const medList = medsText.split(/[,\n]/).map(med => {
        const parts = med.trim().split(/\s+/);
        return {
          name: parts[0] || '',
          dosage: parts[1] || '',
          frequency: parts[2] || '',
        };
      });
      extractedData.medications = medList.filter(m => m.name.length > 0);
      if (extractedData.medications.length > 0) {
        fieldsExtracted.push('medications');
      }
    }

    // Calculate confidence
    const confidence = this.calculateConfidence(fieldsExtracted.length, fieldsMissing.length);

    return {
      extractedData,
      confidence,
      sourceText: text,
      extractionMethod: 'rule-based',
      fieldsExtracted,
      fieldsMissing,
    };
  }

  // Calculate extraction confidence
  private calculateConfidence(extracted: number, missing: number): number {
    const total = extracted + missing;
    if (total === 0) return 0;
    return Math.round((extracted / total) * 100);
  }

  // Check if AI capability is available
  private hasAICapability(): boolean {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    return !!(apiKey && apiKey !== 'demo-key');
  }

  // Auto-populate form from extracted data
  async autoPopulateForm(
    extractedData: ExtractedData,
    formType: 'authorization' | 'claim' | 'patient'
  ): Promise<Record<string, any>> {
    const formData: Record<string, any> = {};

    switch (formType) {
      case 'authorization':
        if (extractedData.patientInfo?.name) {
          formData.patient_name = extractedData.patientInfo.name;
        }
        if (extractedData.patientInfo?.dob) {
          formData.patient_dob = extractedData.patientInfo.dob;
        }
        if (extractedData.diagnosis?.icdCodes && extractedData.diagnosis.icdCodes.length > 0) {
          formData.diagnosis_codes = extractedData.diagnosis.icdCodes;
          formData.primary_diagnosis = extractedData.diagnosis.primary;
        }
        if (extractedData.procedures?.codes && extractedData.procedures.codes.length > 0) {
          formData.procedure_codes = extractedData.procedures.codes;
        }
        if (extractedData.clinicalIndication) {
          formData.clinical_indication = extractedData.clinicalIndication;
        }
        if (extractedData.medicalNecessity) {
          formData.medical_necessity = extractedData.medicalNecessity;
        }
        break;

      case 'claim':
        if (extractedData.patientInfo?.name) {
          formData.patient_name = extractedData.patientInfo.name;
        }
        if (extractedData.diagnosis?.icdCodes && extractedData.diagnosis.icdCodes.length > 0) {
          formData.diagnoses = extractedData.diagnosis.icdCodes.map((code, index) => ({
            icd_code: code,
            is_primary: index === 0,
          }));
        }
        if (extractedData.procedures?.codes && extractedData.procedures.codes.length > 0) {
          formData.procedures = extractedData.procedures.codes.map(code => ({
            cpt_code: code,
            description: '', // Would be filled from code lookup
            quantity: 1,
            unit_price: 0,
            total_price: 0,
          }));
        }
        break;

      case 'patient':
        if (extractedData.patientInfo?.name) {
          formData.name = extractedData.patientInfo.name;
        }
        if (extractedData.patientInfo?.dob) {
          formData.date_of_birth = extractedData.patientInfo.dob;
        }
        if (extractedData.patientInfo?.age) {
          formData.age = extractedData.patientInfo.age;
        }
        if (extractedData.patientInfo?.gender) {
          formData.gender = extractedData.patientInfo.gender;
        }
        break;
    }

    return formData;
  }

  // Extract from multiple documents
  async extractFromMultipleDocuments(documents: Array<{ text: string; type: string }>): Promise<ExtractionResult> {
    const combinedText = documents.map(d => `[${d.type}]\n${d.text}`).join('\n\n');
    return await this.extractFromClinicalNotes(combinedText);
  }

  // Validate extracted data
  validateExtractedData(extractedData: ExtractedData): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate diagnosis codes
    if (extractedData.diagnosis?.icdCodes) {
      extractedData.diagnosis.icdCodes.forEach(code => {
        if (!/^[A-Z]\d{2,3}(\.\d{1,4})?$/.test(code)) {
          warnings.push(`Invalid ICD-10 code format: ${code}`);
        }
      });
    }

    // Validate procedure codes
    if (extractedData.procedures?.codes) {
      extractedData.procedures.codes.forEach(code => {
        if (!/^\d{5}$/.test(code)) {
          warnings.push(`Invalid CPT code format: ${code}`);
        }
      });
    }

    // Check for required fields
    if (!extractedData.clinicalIndication) {
      errors.push('Clinical indication is required');
    }

    if (!extractedData.diagnosis?.icdCodes || extractedData.diagnosis.icdCodes.length === 0) {
      warnings.push('No diagnosis codes found');
    }

    if (!extractedData.procedures?.codes || extractedData.procedures.codes.length === 0) {
      warnings.push('No procedure codes found');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export const nlpService = NLPService.getInstance();

