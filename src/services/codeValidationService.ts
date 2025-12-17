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

      // First validate format - if format is correct, code is valid
      this.validateICD10Format(cleanCode, result);
      
      // If format validation passed, mark as valid
      if (result.errors.length === 0) {
        result.isValid = true;
        
        // Check if code exists in our database for enhanced info
        const icd10Code = this.icd10Codes.get(cleanCode);
        if (icd10Code) {
          result.description = icd10Code.description;
          result.category = icd10Code.category;
          
          if (!icd10Code.isBillable) {
            result.warnings.push('This code is not billable');
          }
          
          if (icd10Code.requiresAdditionalDigits) {
            result.warnings.push('This code may require additional digits for specificity');
          }
        } else {
          // Code format is valid but not in our limited database
          // Provide generic description based on code prefix
          result.description = this.getICD10CategoryDescription(cleanCode);
          result.category = this.getICD10Category(cleanCode);
          result.warnings.push('Code format is valid. Verify description with official ICD-10 manual.');
        }
      } else {
        // Format validation failed - try to find similar codes
        const suggestions = this.findSimilarICD10Codes(cleanCode);
        if (suggestions.length > 0) {
          result.suggestions = suggestions.map(s => `${s.code} - ${s.description}`);
        }
      }
      
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
      
      // First validate format
      this.validateCPTFormat(cleanCode, result);
      
      // If format validation passed, mark as valid
      if (result.errors.length === 0) {
        result.isValid = true;
        
        // Check if code exists in our database for enhanced info
        const cptCode = this.cptCodes.get(cleanCode);
        if (cptCode) {
          result.description = cptCode.description;
          result.category = cptCode.category;
          if (cptCode.modifierRequired) {
            result.warnings.push('This code may require a modifier');
          }
          if (cptCode.globalPeriod !== '000') {
            result.warnings.push(`Global period: ${cptCode.globalPeriod} days`);
          }
        } else {
          // Code format is valid but not in our limited database
          result.description = this.getCPTCategoryDescription(cleanCode);
          result.category = this.getCPTCategory(cleanCode);
          result.warnings.push('Code format is valid. Verify description with official CPT manual.');
        }
      } else {
        // Format validation failed - try to find similar codes
        const suggestions = this.findSimilarCPTCodes(cleanCode);
        if (suggestions.length > 0) {
          result.suggestions = suggestions.map(s => `${s.code} - ${s.description}`);
        }
      }
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
      category: 'Dental',
      warnings: [],
      errors: [],
      suggestions: [],
    };

    try {
      const cleanCode = code.replace(/[^A-Z0-9]/g, '').toUpperCase();
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

      // Validate HCPCS format
      // HCPCS Level II codes: 1 letter (A-Z) followed by 4 digits (0000-9999)
      // Format: A0000-Z9999
      if (cleanCode.length !== 5) {
        result.errors.push('HCPCS code must be exactly 5 characters (1 letter + 4 digits)');
      } else if (!/^[A-Z][0-9]{4}$/.test(cleanCode)) {
        result.errors.push('HCPCS code must start with a letter (A-Z) followed by 4 digits');
      }

      // If format validation passed, mark as valid
      if (result.errors.length === 0) {
        result.isValid = true;
        
        // Check if code exists in our database for enhanced info
        const hcpcsCode = this.hcpcsCodes.get(cleanCode);
        if (hcpcsCode) {
          result.description = hcpcsCode.description;
          result.category = hcpcsCode.category;
          
          if (!hcpcsCode.isActive) {
            result.warnings.push('This HCPCS code is inactive');
            result.isValid = false; // Mark as invalid if inactive
          }
          
          if (hcpcsCode.terminationDate) {
            result.warnings.push(`Code terminated on: ${hcpcsCode.terminationDate}`);
          }
        } else {
          // Code format is valid but not in our limited database
          result.description = this.getHCPCSCategoryDescription(cleanCode);
          result.category = this.getHCPCSCategory(cleanCode);
          result.warnings.push('Code format is valid. Verify description with official HCPCS manual.');
        }
      } else {
        // Format validation failed - try to find similar codes
        const suggestions = this.findSimilarHCPCSCodes(cleanCode);
        if (suggestions.length > 0) {
          result.suggestions = suggestions.map(s => `${s.code} - ${s.description}`);
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

  private initializeCPTCodes(): void {
    // Comprehensive CPT codes database
    const cptCodeData: Array<{code: string, description: string, category: string}> = [
      // AAA - Abdominal Aortic Aneurysm
      {code: '34830', description: 'Open repair of infrarenal aortic aneurysm or dissection, plus repair of associated arterial trauma, following unsuccessful endovascular repair; tube prosthesis', category: 'Vascular Surgery'},
      {code: '34831', description: 'Open repair of infrarenal aortic aneurysm or dissection, plus repair of associated arterial trauma, following unsuccessful endovascular repair; aorto-bi-iliac prosthesis', category: 'Vascular Surgery'},
      {code: '34832', description: 'Open repair of infrarenal aortic aneurysm or dissection, plus repair of associated arterial trauma, following unsuccessful endovascular repair; aorto-bifemoral prosthesis', category: 'Vascular Surgery'},
      {code: '35081', description: 'Direct repair of aneurysm, pseudoaneurysm, or excision (partial or total) and graft insertion, with or without patch graft; for aneurysm, pseudoaneurysm, and associated occlusive disease, abdominal aorta', category: 'Vascular Surgery'},
      {code: '35082', description: 'Direct repair of aneurysm, pseudoaneurysm, or excision (partial or total) and graft insertion, with or without patch graft; for ruptured aneurysm, abdominal aorta', category: 'Vascular Surgery'},
      {code: '35091', description: 'Direct repair of aneurysm, pseudoaneurysm, or excision (partial or total) and graft insertion, with or without patch graft; for aneurysm, pseudoaneurysm, and associated occlusive disease, abdominal aorta involving visceral vessels (mesenteric, celiac, renal)', category: 'Vascular Surgery'},
      {code: '35092', description: 'Direct repair of aneurysm, pseudoaneurysm, or excision (partial or total) and graft insertion, with or without patch graft; for ruptured aneurysm, abdominal aorta involving visceral vessels (mesenteric, celiac, renal)', category: 'Vascular Surgery'},
      {code: '35102', description: 'Direct repair of aneurysm, pseudoaneurysm, or excision (partial or total) and graft insertion, with or without patch graft; for aneurysm, pseudoaneurysm, and associated occlusive disease, abdominal aorta involving iliac vessels (common, hypogastric, external)', category: 'Vascular Surgery'},
      {code: '35103', description: 'Direct repair of aneurysm, pseudoaneurysm, or excision (partial or total) and graft insertion, with or without patch graft; for ruptured aneurysm, abdominal aorta involving iliac vessels (common, hypogastric, external)', category: 'Vascular Surgery'},
      // AMP - Amputation
      {code: '23900', description: 'Interthoracoscapular amputation (forequarter)', category: 'Orthopedic Surgery'},
      {code: '23920', description: 'Disarticulation of shoulder', category: 'Orthopedic Surgery'},
      {code: '24900', description: 'Amputation, arm through humerus; with primary closure', category: 'Orthopedic Surgery'},
      {code: '24920', description: 'Amputation, arm through humerus; open, circular (guillotine)', category: 'Orthopedic Surgery'},
      {code: '24930', description: 'Amputation, arm through humerus; re-amputation', category: 'Orthopedic Surgery'},
      {code: '24931', description: 'Amputation, arm through humerus; with implant', category: 'Orthopedic Surgery'},
      {code: '25900', description: 'Amputation, forearm, through radius and ulna', category: 'Orthopedic Surgery'},
      {code: '25905', description: 'Amputation, forearm, through radius and ulna; open, circular (guillotine)', category: 'Orthopedic Surgery'},
      {code: '25909', description: 'Amputation, forearm, through radius and ulna; re-amputation', category: 'Orthopedic Surgery'},
      {code: '25920', description: 'Disarticulation through wrist', category: 'Orthopedic Surgery'},
      {code: '25922', description: 'Disarticulation through wrist; secondary closure or scar revision', category: 'Orthopedic Surgery'},
      {code: '25924', description: 'Disarticulation through wrist; re-amputation', category: 'Orthopedic Surgery'},
      {code: '25927', description: 'Transmetacarpal amputation', category: 'Orthopedic Surgery'},
      {code: '25929', description: 'Transmetacarpal amputation; secondary closure or scar revision', category: 'Orthopedic Surgery'},
      {code: '25931', description: 'Transmetacarpal amputation; re-amputation', category: 'Orthopedic Surgery'},
      {code: '26235', description: 'Partial excision (craterization, saucerization, or diaphysectomy) bone (eg, osteomyelitis); proximal or middle phalanx of finger', category: 'Orthopedic Surgery'},
      {code: '26236', description: 'Partial excision (craterization, saucerization, or diaphysectomy) bone (eg, osteomyelitis); distal phalanx of finger', category: 'Orthopedic Surgery'},
      {code: '26910', description: 'Amputation, metacarpal, with finger or thumb (ray amputation), single, with or without interosseous transfer', category: 'Orthopedic Surgery'},
      {code: '26951', description: 'Amputation, finger or thumb, primary or secondary, any joint or phalanx, single, including neurectomies; with direct closure', category: 'Orthopedic Surgery'},
      {code: '26952', description: 'Amputation, finger or thumb, primary or secondary, any joint or phalanx, single, including neurectomies; with local advancement flaps (V-Y, hood)', category: 'Orthopedic Surgery'},
      {code: '27290', description: 'Interpelviabdominal amputation (hindquarter amputation)', category: 'Orthopedic Surgery'},
      {code: '27295', description: 'Disarticulation of hip', category: 'Orthopedic Surgery'},
      {code: '27590', description: 'Amputation, thigh, through femur, any level', category: 'Orthopedic Surgery'},
      {code: '27591', description: 'Amputation, thigh, through femur, any level; immediate fitting technique including first cast', category: 'Orthopedic Surgery'},
      {code: '27592', description: 'Amputation, thigh, through femur, any level; open, circular (guillotine)', category: 'Orthopedic Surgery'},
      {code: '27598', description: 'Disarticulation at knee', category: 'Orthopedic Surgery'},
      {code: '27880', description: 'Amputation, leg, through tibia and fibula', category: 'Orthopedic Surgery'},
      {code: '27881', description: 'Amputation, leg, through tibia and fibula; with immediate fitting technique including application of first cast', category: 'Orthopedic Surgery'},
      {code: '27882', description: 'Amputation, leg, through tibia and fibula; open, circular (guillotine)', category: 'Orthopedic Surgery'},
      {code: '27884', description: 'Amputation, leg, through tibia and fibula; secondary closure or scar revision', category: 'Orthopedic Surgery'},
      {code: '27886', description: 'Amputation, leg, through tibia and fibula; re-amputation', category: 'Orthopedic Surgery'},
      {code: '27888', description: 'Amputation, ankle, through malleoli of tibia and fibula (e.g., Syme, Pirogoff type procedures), with plastic closure and resection of nerves', category: 'Orthopedic Surgery'},
      {code: '27889', description: 'Ankle disarticulation', category: 'Orthopedic Surgery'},
      {code: '28124', description: 'Partial excision (craterization, saucerization, sequestrectomy, or diaphysectomy) bone (eg, osteomyelitis or bossing); phalanx of toe', category: 'Orthopedic Surgery'},
      {code: '28126', description: 'Resection, partial or complete, phalangeal base, each toe', category: 'Orthopedic Surgery'},
      {code: '28160', description: 'Hemiphalangectomy or interphalangeal joint excision, toe, proximal end of phalanx, each', category: 'Orthopedic Surgery'},
      {code: '28800', description: 'Amputation, foot; midtarsal (e.g., Chopart type procedure)', category: 'Orthopedic Surgery'},
      {code: '28805', description: 'Amputation, foot; transmetatarsal', category: 'Orthopedic Surgery'},
      {code: '28810', description: 'Amputation, metatarsal, with toe, single', category: 'Orthopedic Surgery'},
      {code: '28820', description: 'Amputation, toe; metatarsophalangeal joint', category: 'Orthopedic Surgery'},
      {code: '28825', description: 'Amputation, toe; interphalangeal joint', category: 'Orthopedic Surgery'},
      // APPY - Appendectomy
      {code: '44900', description: 'Incision and drainage of appendiceal abscess, open', category: 'General Surgery'},
      {code: '44950', description: 'Appendectomy', category: 'General Surgery'},
      {code: '44955', description: 'Appendectomy; when done for indicated purpose at time of other major procedure (not as separate procedure)', category: 'General Surgery'},
      {code: '44960', description: 'Appendectomy; for ruptured appendix with abscess or generalized peritonitis', category: 'General Surgery'},
      {code: '44970', description: 'Laparoscopy, surgical, appendectomy', category: 'General Surgery'},
      {code: '44979', description: 'Unlisted laparoscopy procedure, appendix', category: 'General Surgery'},
      // AVSD - Arteriovenous Shunt/Dialysis
      {code: '36800', description: 'Insertion of cannula for hemodialysis, other purpose (separate procedure); vein to vein', category: 'Vascular Surgery'},
      {code: '36810', description: 'Insertion of cannula for hemodialysis, other purpose (separate procedure); arteriovenous, external (Scribner type)', category: 'Vascular Surgery'},
      {code: '36815', description: 'Insertion of cannula for hemodialysis, other purpose (separate procedure); arteriovenous, external revision, or closure', category: 'Vascular Surgery'},
      {code: '36818', description: 'Arteriovenous anastomosis, open; by upper arm cephalic vein transposition', category: 'Vascular Surgery'},
      {code: '36819', description: 'Arteriovenous anastomosis, open; by upper arm basilic vein transposition', category: 'Vascular Surgery'},
      {code: '36820', description: 'Arteriovenous anastomosis, open; by forearm vein transposition', category: 'Vascular Surgery'},
      {code: '36821', description: 'Arteriovenous anastomosis, open; direct, any site (e.g., Cimino type) (separate procedure)', category: 'Vascular Surgery'},
      {code: '36825', description: 'Creation of arteriovenous fistula by other than direct arteriovenous anastomosis (separate procedure); autogenous graft', category: 'Vascular Surgery'},
      {code: '36830', description: 'Creation of arteriovenous fistula by other than direct arteriovenous anastomosis (separate procedure); non autogenous graft', category: 'Vascular Surgery'},
      {code: '36832', description: 'Revision, open, arteriovenous fistula; without thrombectomy, autogenous or nonautogenous dialysis graft (separate procedure)', category: 'Vascular Surgery'},
      {code: '36833', description: 'Revision, open, arteriovenous fistula; with thrombectomy, autogenous or nonautogenous dialysis graft (separate procedure)', category: 'Vascular Surgery'},
      {code: '36838', description: 'Distal revascularization and interval ligation (DRIL), upper extremity hemodialysis access (steal syndrome)', category: 'Vascular Surgery'},
      // BILI - Biliary
      {code: '47010', description: 'Hepatotomy; for open drainage of abscess or cyst, 1 or 2 stages', category: 'General Surgery'},
      {code: '47015', description: 'Laparotomy, with aspiration and/or injection of hepatic parasitic (eg, amoebic or echinococcal) cyst(s) or abscess(es)', category: 'General Surgery'},
      {code: '47100', description: 'Biopsy of liver, wedge', category: 'General Surgery'},
      {code: '47120', description: 'Hepatectomy, resection of liver; partial lobectomy', category: 'General Surgery'},
      {code: '47122', description: 'Hepatectomy, resection of liver; trisegmentectomy', category: 'General Surgery'},
      {code: '47125', description: 'Hepatectomy, resection of liver; total left lobectomy', category: 'General Surgery'},
      {code: '47130', description: 'Hepatectomy, resection of liver; total right lobectomy', category: 'General Surgery'},
      {code: '47140', description: 'Donor hepatectomy (including cold preservation), from living donor; left lateral segment only (segments II and III)', category: 'General Surgery'},
      {code: '47141', description: 'Donor hepatectomy (including cold preservation), from living donor; total left lobectomy (segments II, III and IV)', category: 'General Surgery'},
      {code: '47142', description: 'Donor hepatectomy (including cold preservation), from living donor; total right lobectomy (segments V, VI, VII and VIII)', category: 'General Surgery'},
      {code: '47300', description: 'Marsupialization of cyst or abscess of liver', category: 'General Surgery'},
      {code: '47350', description: 'Management of liver hemorrhage; simple suture of liver wound or injury', category: 'General Surgery'},
      {code: '47360', description: 'Management of liver hemorrhage; complex suture of liver wound or injury, with or without hepatic artery ligation', category: 'General Surgery'},
      {code: '47361', description: 'Management of liver hemorrhage; exploration of hepatic wound, extensive debridement, coagulation and/or suture, with or without packing of liver', category: 'General Surgery'},
      {code: '47362', description: 'Management of liver hemorrhage; re-exploration of hepatic wound for removal of packing', category: 'General Surgery'},
      {code: '47370', description: 'Laparoscopy, surgical, ablation of 1 or more liver tumor(s); radiofrequency', category: 'General Surgery'},
      {code: '47371', description: 'Laparoscopy, surgical, ablation of 1 or more liver tumor(s); cryosurgical', category: 'General Surgery'},
      {code: '47379', description: 'Unlisted laparoscopic procedure, liver', category: 'General Surgery'},
      {code: '47380', description: 'Ablation, open, of 1 or more liver tumor(s); radiofrequency', category: 'General Surgery'},
      {code: '47381', description: 'Ablation, open, of 1 or more liver tumor(s); cryosurgical', category: 'General Surgery'},
      {code: '47400', description: 'Hepaticotomy or hepaticostomy with exploration, drainage, or removal of calculus', category: 'General Surgery'},
      {code: '47420', description: 'Choledochotomy or choledochostomy with exploration, drainage, or removal of calculus, with or without cholecystotomy; without transduodenal sphincterotomy or sphincteroplasty', category: 'General Surgery'},
      {code: '47425', description: 'Choledochotomy or choledochostomy with exploration, drainage, or removal of calculus, with or without cholecystotomy; with transduodenal sphincterotomy or sphincteroplasty', category: 'General Surgery'},
      {code: '47460', description: 'Transduodenal sphincterotomy or sphincteroplasty, with or without transduodenal extraction of calculus (separate procedure)', category: 'General Surgery'},
      {code: '47700', description: 'Exploration for congenital atresia of bile ducts, without repair, with or without liver biopsy, with or without cholangiography', category: 'General Surgery'},
      {code: '47701', description: 'Portoenterostomy (eg, Kasai procedure)', category: 'General Surgery'},
      {code: '47711', description: 'Excision of bile duct tumor, with or without primary repair of bile duct; extrahepatic', category: 'General Surgery'},
      {code: '47712', description: 'Excision of bile duct tumor, with or without primary repair of bile duct; intrahepatic', category: 'General Surgery'},
      {code: '47715', description: 'Excision of choledochal cyst', category: 'General Surgery'},
      {code: '47760', description: 'Anastomosis, of extrahepatic biliary ducts and gastrointestinal tract', category: 'General Surgery'},
      {code: '47765', description: 'Anastomosis, of intrahepatic ducts and gastrointestinal tract', category: 'General Surgery'},
      {code: '47780', description: 'Anastomosis, Roux-en-Y, of extrahepatic biliary ducts and gastrointestinal tract', category: 'General Surgery'},
      {code: '47785', description: 'Anastomosis, Roux-en-Y, of intrahepatic biliary ducts and gastrointestinal tract', category: 'General Surgery'},
      {code: '47800', description: 'Reconstruction, plastic, of extrahepatic biliary ducts with end-to-end anastomosis', category: 'General Surgery'},
      {code: '47900', description: 'Suture of extrahepatic biliary duct for pre-existing injury (separate procedure)', category: 'General Surgery'},
      {code: '48000', description: 'Placement of drains, peripancreatic, for acute pancreatitis', category: 'General Surgery'},
      {code: '48001', description: 'Placement of drains, peripancreatic, for acute pancreatitis; with cholecystostomy, gastrostomy, and jejunostomy', category: 'General Surgery'},
      {code: '48020', description: 'Removal of pancreatic calculus', category: 'General Surgery'},
      {code: '48100', description: 'Biopsy of pancreas, open (eg, fine needle aspiration, needle core biopsy, wedge biopsy)', category: 'General Surgery'},
      {code: '48105', description: 'Resection or debridement of pancreas and peripancreatic tissue for acute necrotizing pancreatitis', category: 'General Surgery'},
      {code: '48120', description: 'Excision of lesion of pancreas (eg, cyst, adenoma)', category: 'General Surgery'},
      {code: '48140', description: 'Pancreatectomy, distal subtotal, with or without splenectomy; without pancreaticojejunostomy', category: 'General Surgery'},
      {code: '48145', description: 'Pancreatectomy, distal subtotal, with or without splenectomy; with pancreaticojejunostomy', category: 'General Surgery'},
      {code: '48146', description: 'Pancreatectomy, distal, near-total with preservation of duodenum (Child-type procedure)', category: 'General Surgery'},
      {code: '48148', description: 'Excision of ampulla of Vater', category: 'General Surgery'},
      {code: '48150', description: 'Pancreatectomy, proximal subtotal with total duodenectomy, partial gastrectomy, choledochoenterostomy and gastrojejunostomy (Whipple-type procedure); with pancreatojejunostomy', category: 'General Surgery'},
      {code: '48152', description: 'Pancreatectomy, proximal subtotal with total duodenectomy, partial gastrectomy, choledochoenterostomy and gastrojejunostomy (Whipple-type procedure); without pancreatojejunostomy', category: 'General Surgery'},
      {code: '48153', description: 'Pancreatectomy, proximal subtotal with near-total duodenectomy, choledochoenterostomy and duodenojejunostomy (pylorus-sparing, Whipple-type procedure); with pancreatojejunostomy', category: 'General Surgery'},
      {code: '48154', description: 'Pancreatectomy, proximal subtotal with near-total duodenectomy, choledochoenterostomy and duodenojejunostomy (pylorus-sparing, Whipple-type procedure); without pancreatojejunostomy', category: 'General Surgery'},
      {code: '48155', description: 'Pancreatectomy, total', category: 'General Surgery'},
      {code: '48160', description: 'Pancreatectomy, total or subtotal, with autologous transplantation of pancreas or pancreatic islet cells', category: 'General Surgery'},
      {code: '48500', description: 'Marsupialization of pancreatic cyst', category: 'General Surgery'},
      {code: '48510', description: 'External drainage, pseudocyst of pancreas; open', category: 'General Surgery'},
      {code: '48520', description: 'Internal anastomosis of pancreatic cyst to gastrointestinal tract; direct', category: 'General Surgery'},
      {code: '48540', description: 'Internal anastomosis of pancreatic cyst to gastrointestinal tract; Roux-en-Y', category: 'General Surgery'},
      {code: '48545', description: 'Pancreatorrhaphy for injury', category: 'General Surgery'},
      {code: '48548', description: 'Pancreaticojejunostomy, side-to-side anastomosis (Puestow-type operation)', category: 'General Surgery'},
      {code: '0585T', description: 'Islet cell transplant, includes portal vein catheterization and infusion, including all imaging, including all guidance, and radiological supervision and interpretation, when performed; laparoscopic', category: 'General Surgery'},
      {code: '0586T', description: 'Islet cell transplant, includes portal vein catheterization and infusion, including all imaging, including all guidance, and radiological supervision and interpretation, when performed; open', category: 'General Surgery'},
      // BRST - Breast
      {code: '11970', description: 'Replacement of tissue expander(s) with permanent implant', category: 'Plastic Surgery'},
      {code: '19101', description: 'Biopsy of breast; open, incisional', category: 'General Surgery'},
      {code: '19105', description: 'Ablation, cryosurgical, of fibroadenoma, including ultrasound guidance, each fibroadenoma', category: 'General Surgery'},
      {code: '19110', description: 'Nipple exploration, with or without excision of a solitary lactiferous duct or a papilloma lactiferous duct', category: 'General Surgery'},
      {code: '19112', description: 'Excision of lactiferous duct fistula', category: 'General Surgery'},
      {code: '19120', description: 'Excision of cyst, fibroadenoma, or other benign or malignant tumor, aberrant breast tissue, duct lesion, nipple or areolar lesion (except 19300), open, male or female, 1 or more lesions', category: 'General Surgery'},
      {code: '19125', description: 'Excision of breast lesion identified by pre-operative placement of radiological marker, open, single lesion', category: 'General Surgery'},
      {code: '19126', description: 'Excision of breast lesion identified by pre-operative placement of radiological marker, open, single lesion; each additional lesion separately identified by a preoperative radiological marker', category: 'General Surgery'},
      {code: '19300', description: 'Mastectomy for gynecomastia', category: 'General Surgery'},
      {code: '19301', description: 'Mastectomy, partial (eg, lumpectomy, tylectomy, quadrantectomy, segmentectomy)', category: 'General Surgery'},
      {code: '19302', description: 'Mastectomy, partial (eg, lumpectomy, tylectomy, quadrantectomy, segmentectomy); with axillary lymphadenectomy', category: 'General Surgery'},
      {code: '19303', description: 'Mastectomy, simple, complete', category: 'General Surgery'},
      {code: '19305', description: 'Mastectomy, radical, including pectoral muscles, axillary lymph nodes', category: 'General Surgery'},
      {code: '19306', description: 'Mastectomy, radical, including pectoral muscles, axillary and internal mammary lymph nodes (Urban type operation)', category: 'General Surgery'},
      {code: '19307', description: 'Mastectomy, modified radical, including axillary lymph nodes, with or without pectoralis minor muscle, but excluding pectoralis major muscle', category: 'General Surgery'},
      {code: '19316', description: 'Mastopexy', category: 'Plastic Surgery'},
      {code: '19318', description: 'Reduction mammaplasty', category: 'Plastic Surgery'},
      {code: '19324', description: 'Mammaplasty, augmentation; without prosthetic implant', category: 'Plastic Surgery'},
      {code: '19325', description: 'Mammaplasty, augmentation; with prosthetic implant', category: 'Plastic Surgery'},
      {code: '19328', description: 'Removal of intact mammary implant', category: 'Plastic Surgery'},
      {code: '19330', description: 'Removal of mammary implant material', category: 'Plastic Surgery'},
      {code: '19340', description: 'Immediate insertion of breast prosthesis following mastopexy, mastectomy or in reconstruction', category: 'Plastic Surgery'},
      {code: '19342', description: 'Delayed insertion of breast prosthesis following mastopexy, mastectomy or in reconstruction', category: 'Plastic Surgery'},
      {code: '19350', description: 'Nipple/areola reconstruction', category: 'Plastic Surgery'},
      {code: '19355', description: 'Correction of inverted nipples', category: 'Plastic Surgery'},
      {code: '19357', description: 'Breast reconstruction, immediate or delayed, with tissue expander, including subsequent expansion', category: 'Plastic Surgery'},
      {code: '19361', description: 'Breast reconstruction with latissimus dorsi flap, without prosthetic implant', category: 'Plastic Surgery'},
      {code: '19364', description: 'Breast reconstruction with free flap', category: 'Plastic Surgery'},
      {code: '19366', description: 'Breast reconstruction with other technique', category: 'Plastic Surgery'},
      {code: '19367', description: 'Breast reconstruction with transverse rectus abdominis myocutaneous flap (TRAM), single pedicle, including closure of donor site', category: 'Plastic Surgery'},
      {code: '19368', description: 'Breast reconstruction with transverse rectus abdominis myocutaneous flap (TRAM), single pedicle, including closure of donor site; with microvascular anastomosis (supercharging)', category: 'Plastic Surgery'},
      {code: '19369', description: 'Breast reconstruction with transverse rectus abdominis myocutaneous flap (TRAM), double pedicle, including closure of donor site', category: 'Plastic Surgery'},
      {code: '19370', description: 'Open periprosthetic capsulotomy, breast', category: 'Plastic Surgery'},
      {code: '19371', description: 'Periprosthetic capsulectomy, breast', category: 'Plastic Surgery'},
      {code: '19380', description: 'Revision of reconstructed breast', category: 'Plastic Surgery'},
      // CARD - Cardiac
      {code: '32658', description: 'Thoracoscopy, surgical; with removal of clot or foreign body from pericardial sac', category: 'Cardiac Surgery'},
      {code: '32659', description: 'Thoracoscopy, surgical; with creation of pericardial window or partial resection of pericardial sac for drainage', category: 'Cardiac Surgery'},
      {code: '32661', description: 'Thoracoscopy, surgical; with excision of pericardial cyst, tumor, or mass', category: 'Cardiac Surgery'},
      {code: '33020', description: 'Pericardiotomy for removal of clot or foreign body (primary procedure)', category: 'Cardiac Surgery'},
      {code: '33025', description: 'Creation of pericardial window or partial resection for drainage', category: 'Cardiac Surgery'},
      {code: '33030', description: 'Pericardiectomy, subtotal or complete; without cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33031', description: 'Pericardiectomy, subtotal or complete; with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33050', description: 'Resection of pericardial cyst or tumor', category: 'Cardiac Surgery'},
      {code: '33120', description: 'Excision of intracardiac tumor, resection with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33130', description: 'Resection of external cardiac tumor', category: 'Cardiac Surgery'},
      {code: '33250', description: 'Operative ablation of supraventricular arrhythmogenic focus or pathway (eg, Wolff-Parkinson-White, atrioventricular node re-entry), tract(s) and/or focus (foci); without cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33251', description: 'Operative ablation of supraventricular arrhythmogenic focus or pathway (eg, Wolff-Parkinson-White, atrioventricular node re-entry), tract(s) and/or focus (foci); with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33254', description: 'Operative tissue ablation and reconstruction of atria, limited (eg, modified maze procedure)', category: 'Cardiac Surgery'},
      {code: '33255', description: 'Operative tissue ablation and reconstruction of atria, extensive (eg, maze procedure); without cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33256', description: 'Operative tissue ablation and reconstruction of atria, extensive (eg, maze procedure); with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33257', description: 'Operative tissue ablation and reconstruction of atria, performed at the time of other cardiac procedure(s), limited (eg, modified maze procedure)', category: 'Cardiac Surgery'},
      {code: '33258', description: 'Operative tissue ablation and reconstruction of atria, performed at the time of other cardiac procedure(s), extensive (eg, maze procedure), without cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33259', description: 'Operative tissue ablation and reconstruction of atria, performed at the time of other cardiac procedure(s), extensive (eg, maze procedure), with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33261', description: 'Operative ablation of ventricular arrhythmogenic focus with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33265', description: 'Endoscopy, surgical; operative tissue ablation and reconstruction of atria, limited (eg, modified maze procedure), without cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33266', description: 'Endoscopy, surgical; operative tissue ablation and reconstruction of atria, extensive (eg, maze procedure), without cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33267', description: 'Exclusion of left atrial appendage, open, any method (eg, excision, isolation via stapling, oversewing, ligation, plication, clip)', category: 'Cardiac Surgery'},
      {code: '33268', description: 'Exclusion of left atrial appendage, open, performed at the time of other sternotomy or thoracotomy procedure(s), any method', category: 'Cardiac Surgery'},
      {code: '33269', description: 'Exclusion of left atrial appendage, thoracoscopic, any method', category: 'Cardiac Surgery'},
      {code: '33300', description: 'Repair of cardiac wound; without bypass', category: 'Cardiac Surgery'},
      {code: '33305', description: 'Repair of cardiac wound; with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33310', description: 'Cardiotomy, exploratory (includes removal of foreign body, atrial or ventricular thrombus); without bypass', category: 'Cardiac Surgery'},
      {code: '33315', description: 'Cardiotomy, exploratory (includes removal of foreign body, atrial or ventricular thrombus); with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33365', description: 'Transcatheter aortic valve replacement (TAVR/TAVI) with prosthetic valve; transaortic approach', category: 'Cardiac Surgery'},
      {code: '33366', description: 'Transcatheter aortic valve replacement (TAVR/TAVI) with prosthetic valve; transapical exposure', category: 'Cardiac Surgery'},
      {code: '33390', description: 'Valvuloplasty, aortic valve, open, with cardiopulmonary bypass; simple', category: 'Cardiac Surgery'},
      {code: '33391', description: 'Valvuloplasty, aortic valve, open, with cardiopulmonary bypass; complex', category: 'Cardiac Surgery'},
      {code: '33404', description: 'Construction of apical-aortic conduit', category: 'Cardiac Surgery'},
      {code: '33405', description: 'Replacement, aortic valve, open, with cardiopulmonary bypass; with prosthetic valve other than homograft or stentless valve', category: 'Cardiac Surgery'},
      {code: '33406', description: 'Replacement, aortic valve, with cardiopulmonary bypass; with allograft valve (freehand)', category: 'Cardiac Surgery'},
      {code: '33410', description: 'Replacement, aortic valve, open, with cardiopulmonary bypass; with stentless tissue valve', category: 'Cardiac Surgery'},
      {code: '33411', description: 'Replacement, aortic valve; with aortic annulus enlargement, noncoronary sinus', category: 'Cardiac Surgery'},
      {code: '33412', description: 'Replacement, aortic valve; with transventricular aortic annulus enlargement (Konno procedure)', category: 'Cardiac Surgery'},
      {code: '33413', description: 'Replacement, aortic valve; by translocation of autologous pulmonary valve with allograft replacement of pulmonary valve (Ross procedure)', category: 'Cardiac Surgery'},
      {code: '33414', description: 'Repair of left ventricular outflow tract obstruction by patch enlargement of the outflow tract', category: 'Cardiac Surgery'},
      {code: '33415', description: 'Resection or incision of subvalvular tissue for discrete subvalvular aortic stenosis', category: 'Cardiac Surgery'},
      {code: '33416', description: 'Ventriculomyotomy (-myectomy) for idiopathic hypertrophic subaortic stenosis', category: 'Cardiac Surgery'},
      {code: '33417', description: 'Aortoplasty (gusset) for supravalvular stenosis', category: 'Cardiac Surgery'},
      {code: '33420', description: 'Valvotomy, mitral valve; closed heart', category: 'Cardiac Surgery'},
      {code: '33422', description: 'Valvotomy, mitral valve; open heart, with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33425', description: 'Valvuloplasty, mitral valve, with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33426', description: 'Valvuloplasty, mitral valve, with cardiopulmonary bypass; with prosthetic ring', category: 'Cardiac Surgery'},
      {code: '33427', description: 'Valvuloplasty, mitral valve, with cardiopulmonary bypass; radical reconstruction, with or without ring', category: 'Cardiac Surgery'},
      {code: '33430', description: 'Replacement, mitral valve, with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33440', description: 'Replacement of aortic valve by translocation of autologous pulmonary valve and transventricular aortic annulus enlargement of left ventricular outflow tract with valved conduit replacement of pulmonary valve', category: 'Cardiac Surgery'},
      {code: '33460', description: 'Valvectomy, tricuspid valve, with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33463', description: 'Valvuloplasty, tricuspid valve; without ring insertion', category: 'Cardiac Surgery'},
      {code: '33464', description: 'Valvuloplasty, tricuspid valve; with ring insertion', category: 'Cardiac Surgery'},
      {code: '33465', description: 'Replacement, tricuspid valve, with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33468', description: 'Tricuspid valve repositioning and plication for Ebstein anomaly', category: 'Cardiac Surgery'},
      {code: '33474', description: 'Valvotomy, pulmonary valve, open heart, with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33475', description: 'Replacement, pulmonary valve', category: 'Cardiac Surgery'},
      {code: '33476', description: 'Right ventricular resection for infundibular stenosis, with or without commissurotomy', category: 'Cardiac Surgery'},
      {code: '33478', description: 'Outflow tract augmentation (gusset), with or without commissurotomy or infundibular resection', category: 'Cardiac Surgery'},
      {code: '33496', description: 'Repair of non-structural prosthetic valve dysfunction with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33542', description: 'Myocardial resection (eg, ventricular aneurysmectomy)', category: 'Cardiac Surgery'},
      {code: '33545', description: 'Repair of postinfarction ventricular septal defect, with or without myocardial resection', category: 'Cardiac Surgery'},
      {code: '33548', description: 'Surgical ventricular restoration procedure, includes prosthetic patch, when performed', category: 'Cardiac Surgery'},
      {code: '33600', description: 'Closure of atrioventricular valve (mitral or tricuspid) by suture or patch', category: 'Cardiac Surgery'},
      {code: '33602', description: 'Closure of semilunar valve (aortic or pulmonary) by suture or patch', category: 'Cardiac Surgery'},
      {code: '33608', description: 'Repair of complex cardiac anomaly other than pulmonary atresia with ventricular septal defect by construction or replacement of conduit from right or left ventricle to pulmonary artery', category: 'Cardiac Surgery'},
      {code: '33610', description: 'Repair of complex cardiac anomalies by surgical enlargement of ventricular septal defect', category: 'Cardiac Surgery'},
      {code: '33611', description: 'Repair of double outlet right ventricle with intraventricular tunnel repair', category: 'Cardiac Surgery'},
      {code: '33612', description: 'Repair of double outlet right ventricle with intraventricular tunnel repair; with repair of right ventricular outflow tract obstruction', category: 'Cardiac Surgery'},
      {code: '33615', description: 'Repair of complex cardiac anomalies by closure of atrial septal defect and anastomosis of atria or vena cava to pulmonary artery (simple Fontan procedure)', category: 'Cardiac Surgery'},
      {code: '33617', description: 'Repair of complex cardiac anomalies (e.g., single ventricle by modified Fontan)', category: 'Cardiac Surgery'},
      {code: '33619', description: 'Repair of single ventricle with aortic outflow obstruction and aortic arch hypoplasia (hypoplastic left heart syndrome)', category: 'Cardiac Surgery'},
      {code: '33641', description: 'Repair atrial septal defect, secundum, with cardiopulmonary bypass, with or without patch', category: 'Cardiac Surgery'},
      {code: '33645', description: 'Direct or patch closure, sinus venosus, with or without anomalous pulmonary venous drainage', category: 'Cardiac Surgery'},
      {code: '33647', description: 'Repair of atrial septal defect and ventricular septal defect, with direct or patch closure', category: 'Cardiac Surgery'},
      {code: '33660', description: 'Repair of incomplete or partial atrioventricular canal (ostium primum atrial septal defect), with or without atrioventricular valve repair', category: 'Cardiac Surgery'},
      {code: '33665', description: 'Repair of intermediate or transitional atrioventricular canal, with or without atrioventricular valve repair', category: 'Cardiac Surgery'},
      {code: '33670', description: 'Repair of complete atrioventricular canal, with or without prosthetic valve', category: 'Cardiac Surgery'},
      {code: '33675', description: 'Closure of multiple ventricular septal defects', category: 'Cardiac Surgery'},
      {code: '33676', description: 'Closure of multiple ventricular septal defects; with pulmonary valvotomy or infundibular resection', category: 'Cardiac Surgery'},
      {code: '33677', description: 'Closure of multiple ventricular septal defects; with removal of pulmonary artery band, with or without gusset', category: 'Cardiac Surgery'},
      {code: '33681', description: 'Closure of single ventricular septal defect, with or without patch', category: 'Cardiac Surgery'},
      {code: '33684', description: 'Closure of single ventricular septal defect, with or without patch; with pulmonary valvotomy or infundibular resection', category: 'Cardiac Surgery'},
      {code: '33688', description: 'Closure of single ventricular septal defect, with or without patch; with removal of pulmonary artery band, with or without gusset', category: 'Cardiac Surgery'},
      {code: '33692', description: 'Complete repair tetralogy of Fallot without pulmonary atresia', category: 'Cardiac Surgery'},
      {code: '33694', description: 'Complete repair tetralogy of Fallot without pulmonary atresia; with transannular patch', category: 'Cardiac Surgery'},
      {code: '33697', description: 'Complete repair tetralogy of Fallot with pulmonary atresia including construction of conduit from right ventricle to pulmonary artery and closure of ventricular septal defect', category: 'Cardiac Surgery'},
      {code: '33702', description: 'Repair sinus of Valsalva fistula, with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33710', description: 'Repair sinus of Valsalva fistula, with cardiopulmonary bypass; with repair of ventricular septal defect', category: 'Cardiac Surgery'},
      {code: '33720', description: 'Repair sinus of Valsalva aneurysm, with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33732', description: 'Repair of cor triatriatum or supravalvular mitral ring by resection of left atrial membrane', category: 'Cardiac Surgery'},
      {code: '33735', description: 'Atrial septectomy or septostomy; closed heart (Blalock-Hanlon type operation)', category: 'Cardiac Surgery'},
      {code: '33736', description: 'Atrial septectomy or septostomy; open heart with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33770', description: 'Repair of transposition of the great arteries with ventricular septal defect and subpulmonary stenosis; without surgical enlargement of ventricular septal defect', category: 'Cardiac Surgery'},
      {code: '33774', description: 'Repair of transposition of the great arteries, atrial baffle procedure with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33776', description: 'Repair of transposition of the great arteries, atrial baffle procedure with cardiopulmonary bypass; with closure of ventricular septal defect', category: 'Cardiac Surgery'},
      {code: '33780', description: 'Repair of transposition of the great arteries, aortic pulmonary artery reconstruction; with closure of ventricular septal defect', category: 'Cardiac Surgery'},
      {code: '33782', description: 'Aortic root translocation with ventricular septal defect and pulmonary stenosis repair; without coronary ostium reimplantation', category: 'Cardiac Surgery'},
      {code: '33783', description: 'Aortic root translocation with ventricular septal defect and pulmonary stenosis repair; with reimplantation of 1 or both coronary ostia', category: 'Cardiac Surgery'},
      {code: '33786', description: 'Total repair, truncus arteriosus (Rastelli type operation)', category: 'Cardiac Surgery'},
      {code: '33814', description: 'Obliteration of aortopulmonary septal defect; with cardiopulmonary bypass', category: 'Cardiac Surgery'},
      {code: '33920', description: 'Repair of pulmonary atresia with ventricular septal defect, by construction or replacement of conduit from right or left ventricle to pulmonary artery', category: 'Cardiac Surgery'},
      {code: '33975', description: 'Insertion of ventricular assist device; extracorporeal, single ventricle', category: 'Cardiac Surgery'},
      {code: '33976', description: 'Insertion of ventricular assist device; extracorporeal, biventricle', category: 'Cardiac Surgery'},
      {code: '33977', description: 'Removal of ventricular assist device; extracorporeal, single ventricle', category: 'Cardiac Surgery'},
      {code: '33978', description: 'Removal of ventricular assist device; extracorporeal, biventricle', category: 'Cardiac Surgery'},
      {code: '33979', description: 'Insertion of ventricular assist device; implantable intracorporeal, single ventricle', category: 'Cardiac Surgery'},
      {code: '33980', description: 'Removal of ventricular assist device; implantable intracorporeal, single ventricle', category: 'Cardiac Surgery'},
      {code: '0051T', description: 'Implantation of a total replacement heart system (artificial heart) with recipient cardiectomy', category: 'Cardiac Surgery'},
      {code: '0052T', description: 'Replacement or repair of implantable component or components of total replacement heart system (artificial heart), thoracic unit', category: 'Cardiac Surgery'},
      {code: '0053T', description: 'Replacement or repair of implantable component or components of total replacement heart system (artificial heart), excluding thoracic unit', category: 'Cardiac Surgery'},
      // CBGB - Coronary Bypass Graft, Vein
      {code: '33509', description: 'Endoscopic harvest of single upper extremity artery segment for coronary artery bypass procedure', category: 'Cardiac Surgery'},
      {code: '33510', description: 'Coronary artery bypass, vein only; single coronary venous graft', category: 'Cardiac Surgery'},
      {code: '33511', description: 'Coronary artery bypass, vein only; 2 coronary venous grafts', category: 'Cardiac Surgery'},
      {code: '33512', description: 'Coronary artery bypass, vein only; 3 coronary venous grafts', category: 'Cardiac Surgery'},
      {code: '33513', description: 'Coronary artery bypass, vein only; 4 coronary venous grafts', category: 'Cardiac Surgery'},
      {code: '33514', description: 'Coronary artery bypass, vein only; 5 coronary venous grafts', category: 'Cardiac Surgery'},
      {code: '33516', description: 'Coronary artery bypass, vein only; 6 or more coronary venous grafts', category: 'Cardiac Surgery'},
      {code: '35600', description: 'Harvest of upper extremity artery, 1 segment, for coronary artery bypass procedure, open', category: 'Cardiac Surgery'},
      // CBGC - Coronary Bypass Graft, Arterial
      {code: '33533', description: 'Coronary artery bypass, using arterial graft(s); single arterial graft', category: 'Cardiac Surgery'},
      {code: '33534', description: 'Coronary artery bypass, using arterial graft(s); 2 coronary arterial grafts', category: 'Cardiac Surgery'},
      {code: '33535', description: 'Coronary artery bypass, using arterial graft(s); 3 coronary arterial grafts', category: 'Cardiac Surgery'},
      {code: '33536', description: 'Coronary artery bypass, using arterial graft(s); 4 or more coronary arterial grafts', category: 'Cardiac Surgery'},
      // CEA - Carotid Endarterectomy
      {code: '35301', description: 'Thromboendarterectomy, including patch graft, if performed; carotid, vertebral, subclavian, by neck incision', category: 'Vascular Surgery'},
      {code: '35390', description: 'Reoperation, carotid, thromboendarterectomy, more than 1 month after original operation', category: 'Vascular Surgery'},
      // CHOL - Cholecystectomy
      {code: '47480', description: 'Cholecystotomy or cholecystostomy, open, with exploration, drainage, or removal of calculus', category: 'General Surgery'},
      {code: '47562', description: 'Laparoscopy, surgical; cholecystectomy', category: 'General Surgery'},
      {code: '47563', description: 'Laparoscopy, surgical; cholecystectomy with cholangiography', category: 'General Surgery'},
      {code: '47564', description: 'Laparoscopy, surgical; cholecystectomy with exploration of common duct', category: 'General Surgery'},
      {code: '47570', description: 'Laparoscopy, surgical; cholecystoenterostomy', category: 'General Surgery'},
      {code: '47600', description: 'Cholecystectomy', category: 'General Surgery'},
      {code: '47605', description: 'Cholecystectomy; with cholangiography', category: 'General Surgery'},
      {code: '47610', description: 'Cholecystectomy with exploration of common duct', category: 'General Surgery'},
      {code: '47612', description: 'Cholecystectomy with exploration of common duct; with choledochoenterostomy', category: 'General Surgery'},
      {code: '47620', description: 'Cholecystectomy with exploration of common duct; with transduodenal sphincterotomy or sphincteroplasty, with or without cholangiography', category: 'General Surgery'},
      {code: '47720', description: 'Cholecystoenterostomy; direct', category: 'General Surgery'},
      {code: '47721', description: 'Cholecystoenterostomy; with gastroenterostomy', category: 'General Surgery'},
      {code: '47740', description: 'Cholecystoenterostomy; Roux-en-Y', category: 'General Surgery'},
      {code: '47741', description: 'Cholecystoenterostomy; Roux-en-Y with gastroenterostomy', category: 'General Surgery'},
      // COLO - Colon
      {code: '44025', description: 'Colotomy, for exploration, biopsy(s), or foreign body removal', category: 'General Surgery'},
      {code: '44110', description: 'Excision of 1 or more lesions of small or large intestine not requiring anastomosis, exteriorization, or fistulization; single enterotomy', category: 'General Surgery'},
      {code: '44111', description: 'Excision of 1 or more lesions of small or large intestine not requiring anastomosis, exteriorization, or fistulization; multiple enterotomies', category: 'General Surgery'},
      {code: '44137', description: 'Removal of transplanted intestinal allograft, complete', category: 'General Surgery'},
      {code: '44140', description: 'Colectomy, partial; with anastomosis', category: 'General Surgery'},
      {code: '44141', description: 'Colectomy, partial; with skin level cecostomy or colostomy', category: 'General Surgery'},
      {code: '44143', description: 'Colectomy, partial; with end colostomy and closure of distal segment (Hartmann type procedure)', category: 'General Surgery'},
      {code: '44144', description: 'Colectomy, partial; with resection, with colostomy or ileostomy and creation of mucofistula', category: 'General Surgery'},
      {code: '44145', description: 'Colectomy, partial; with coloproctostomy (low pelvic anastomosis)', category: 'General Surgery'},
      {code: '44146', description: 'Colectomy, partial; with coloproctostomy (low pelvic anastomosis), with colostomy', category: 'General Surgery'},
      {code: '44147', description: 'Colectomy, partial; abdominal and transanal approach', category: 'General Surgery'},
      {code: '44150', description: 'Colectomy, total, abdominal, without proctectomy; with ileostomy or ileoproctostomy', category: 'General Surgery'},
      {code: '44151', description: 'Colectomy, total, abdominal, without proctectomy; with continent ileostomy', category: 'General Surgery'},
      {code: '44155', description: 'Colectomy, total, abdominal, with proctectomy; with ileostomy', category: 'General Surgery'},
      {code: '44156', description: 'Colectomy, total, abdominal, with proctectomy; with continent ileostomy', category: 'General Surgery'},
      {code: '44157', description: 'Colectomy, total, abdominal, with proctectomy; with ileoanal anastomosis, includes loop ileostomy, and rectal mucosectomy, when performed', category: 'General Surgery'},
      {code: '44158', description: 'Colectomy, total, abdominal, with proctectomy; with ileoanal anastomosis, creation of ileal reservoir (S or J), includes loop ileostomy, and rectal mucosectomy, when performed', category: 'General Surgery'},
      {code: '44160', description: 'Colectomy, partial, with removal of terminal ileum with ileocolostomy', category: 'General Surgery'},
      {code: '44188', description: 'Laparoscopy, surgical, colostomy or skin level cecostomy', category: 'General Surgery'},
      {code: '44204', description: 'Laparoscopy, surgical; colectomy, partial, with anastomosis', category: 'General Surgery'},
      {code: '44205', description: 'Laparoscopy, surgical; colectomy, partial, with removal of terminal ileum with ileocolostomy', category: 'General Surgery'},
      {code: '44206', description: 'Laparoscopy, surgical; colectomy, partial, with end colostomy and closure of distal segment (Hartmann type procedure)', category: 'General Surgery'},
      {code: '44207', description: 'Laparoscopy, surgical; colectomy, partial, with anastomosis, with coloproctostomy (low pelvic anastomosis)', category: 'General Surgery'},
      {code: '44208', description: 'Laparoscopy, surgical; colectomy, partial, with anastomosis, with coloproctostomy (low pelvic anastomosis) with colostomy', category: 'General Surgery'},
      {code: '44210', description: 'Laparoscopy, surgical; colectomy, total, abdominal, without proctectomy, with ileostomy or ileoproctostomy', category: 'General Surgery'},
      {code: '44211', description: 'Laparoscopy, surgical; colectomy, total, abdominal, with proctectomy, with ileoanal anastomosis, creation of ileal reservoir (S or J), with loop ileostomy, includes rectal mucosectomy, when performed', category: 'General Surgery'},
      {code: '44212', description: 'Laparoscopy, surgical; colectomy, total, abdominal, with proctectomy, with ileostomy', category: 'General Surgery'},
      {code: '44213', description: 'Laparoscopy, surgical, mobilization (take-down) of splenic flexure performed in conjunction with partial colectomy', category: 'General Surgery'},
      {code: '44227', description: 'Laparoscopy, surgical, closure of enterostomy, large or small intestine, with resection and anastomosis', category: 'General Surgery'},
      {code: '44320', description: 'Colostomy or skin level cecostomy', category: 'General Surgery'},
      {code: '44322', description: 'Colostomy or skin level cecostomy; with multiple biopsies', category: 'General Surgery'},
      {code: '44340', description: 'Revision of colostomy; simple (release of superficial scar)', category: 'General Surgery'},
      {code: '44345', description: 'Revision of colostomy; complicated (reconstruction in-depth)', category: 'General Surgery'},
      {code: '44346', description: 'Revision of colostomy; with repair of paracolostomy hernia', category: 'General Surgery'},
      {code: '44604', description: 'Suture of large intestine (colorrhaphy) for perforated ulcer, diverticulum, wound, injury or rupture (single or multiple perforations); without colostomy', category: 'General Surgery'},
      {code: '44605', description: 'Suture of large intestine (colorrhaphy) for perforated ulcer, diverticulum, wound, injury or rupture (single or multiple perforations); with colostomy', category: 'General Surgery'},
      {code: '44620', description: 'Closure of enterostomy, large or small intestine', category: 'General Surgery'},
      {code: '44625', description: 'Closure of enterostomy, large or small intestine; with resection and anastomosis other than colorectal', category: 'General Surgery'},
      {code: '44626', description: 'Closure of enterostomy, large or small intestine; with resection and colorectal anastomosis', category: 'General Surgery'},
      // CRAN - Craniotomy
      {code: '61105', description: 'Twist drill hole for subdural or ventricular puncture', category: 'Neurosurgery'},
      {code: '61107', description: 'Twist drill hole(s) for subdural, intracerebral, or ventricular puncture; for implanting ventricular catheter, pressure recording device, or other intracerebral monitoring device', category: 'Neurosurgery'},
      {code: '61108', description: 'Twist drill hole(s) for subdural, intracerebral, or ventricular puncture; for evacuation and/or drainage of subdural hematoma', category: 'Neurosurgery'},
      {code: '61120', description: 'Burr hole(s) for ventricular puncture (including injection of gas, contrast media, dye, or radioactive material)', category: 'Neurosurgery'},
      {code: '61140', description: 'Burr hole(s) or trephine; with biopsy of brain or intracranial lesion', category: 'Neurosurgery'},
      {code: '61150', description: 'Burr hole(s) or trephine; with drainage of brain abscess or cyst', category: 'Neurosurgery'},
      {code: '61151', description: 'Burr hole(s) or trephine; with subsequent tapping (aspiration) of intracranial abscess or cyst', category: 'Neurosurgery'},
      {code: '61154', description: 'Burr hole(s) with evacuation and/or drainage of hematoma, extradural or subdural', category: 'Neurosurgery'},
      {code: '61156', description: 'Burr hole(s); with aspiration of hematoma or cyst, intracerebral', category: 'Neurosurgery'},
      {code: '61210', description: 'Burr hole(s); for implanting ventricular catheter, reservoir, EEG electrode(s), pressure recording device, or other cerebral monitoring device', category: 'Neurosurgery'},
      {code: '61250', description: 'Burr hole(s) or trephine, supratentorial, exploratory, not followed by other surgery', category: 'Neurosurgery'},
      {code: '61253', description: 'Burr hole(s) or trephine, infratentorial, unilateral or bilateral', category: 'Neurosurgery'},
      {code: '61304', description: 'Craniectomy or craniotomy, exploratory; supratentorial', category: 'Neurosurgery'},
      {code: '61305', description: 'Craniectomy or craniotomy, exploratory; infratentorial (posterior fossa)', category: 'Neurosurgery'},
      {code: '61312', description: 'Craniectomy or craniotomy for evacuation of hematoma, supratentorial; extradural or subdural', category: 'Neurosurgery'},
      {code: '61313', description: 'Craniectomy or craniotomy for evacuation of hematoma, supratentorial; intracerebral', category: 'Neurosurgery'},
      {code: '61314', description: 'Craniectomy or craniotomy for evacuation of hematoma, infratentorial; extradural or subdural', category: 'Neurosurgery'},
      {code: '61315', description: 'Craniectomy or craniotomy for evacuation of hematoma, infratentorial; intracerebellar', category: 'Neurosurgery'},
      {code: '61320', description: 'Craniectomy or craniotomy, drainage of intracranial abscess; supratentorial', category: 'Neurosurgery'},
      {code: '61321', description: 'Craniectomy or craniotomy, drainage of intracranial abscess; infratentorial', category: 'Neurosurgery'},
      {code: '61322', description: 'Craniectomy or craniotomy, decompressive, with or without duraplasty, for treatment of intracranial hypertension, without evacuation of associated intraparenchymal hematoma; without lobectomy', category: 'Neurosurgery'},
      {code: '61323', description: 'Craniectomy or craniotomy, decompressive, with or without duraplasty, for treatment of intracranial hypertension, without evacuation of associated intraparenchymal hematoma; with lobectomy', category: 'Neurosurgery'},
      {code: '61330', description: 'Decompression of orbit only, transcranial approach', category: 'Neurosurgery'},
      {code: '61333', description: 'Exploration of orbit (transcranial approach); with removal of lesion', category: 'Neurosurgery'},
      {code: '61340', description: 'Subtemporal cranial decompression (pseudotumor cerebri, slit ventricle syndrome)', category: 'Neurosurgery'},
      {code: '61343', description: 'Craniectomy, suboccipital with cervical laminectomy for decompression of medulla and spinal cord, with or without dural graft', category: 'Neurosurgery'},
      {code: '61345', description: 'Other cranial decompression, posterior fossa', category: 'Neurosurgery'},
      {code: '61458', description: 'Craniectomy, suboccipital; for exploration or decompression of cranial nerves', category: 'Neurosurgery'},
      {code: '61460', description: 'Craniectomy, suboccipital; for section of 1 or more cranial nerves', category: 'Neurosurgery'},
      {code: '61510', description: 'Craniectomy, trephination, bone flap craniotomy; for excision of brain tumor, supratentorial, except meningioma', category: 'Neurosurgery'},
      {code: '61512', description: 'Craniectomy, trephination, bone flap craniotomy; for excision of meningioma, supratentorial', category: 'Neurosurgery'},
      {code: '61514', description: 'Craniectomy, trephination, bone flap craniotomy; for excision of brain abscess, supratentorial', category: 'Neurosurgery'},
      {code: '61516', description: 'Craniectomy, trephination, bone flap craniotomy; for excision or fenestration of cyst, supratentorial', category: 'Neurosurgery'},
      {code: '61518', description: 'Craniectomy for excision of brain tumor, infratentorial or posterior fossa; except meningioma, cerebellopontine angle tumor, or midline tumor at base of skull', category: 'Neurosurgery'},
      {code: '61519', description: 'Craniectomy for excision of brain tumor, infratentorial or posterior fossa; meningioma', category: 'Neurosurgery'},
      {code: '61520', description: 'Craniectomy for excision of brain tumor, infratentorial or posterior fossa; cerebellopontine angle tumor', category: 'Neurosurgery'},
      {code: '61521', description: 'Craniectomy for excision of brain tumor, infratentorial or posterior fossa; midline tumor at base of skull', category: 'Neurosurgery'},
      {code: '61522', description: 'Craniectomy, infratentorial or posterior fossa; for excision of brain abscess', category: 'Neurosurgery'},
      {code: '61524', description: 'Craniectomy, infratentorial or posterior fossa; for excision or fenestration of cyst', category: 'Neurosurgery'},
      {code: '61526', description: 'Craniectomy, bone flap craniotomy, transtemporal (mastoid) for excision of cerebellopontine angle tumor', category: 'Neurosurgery'},
      {code: '61530', description: 'Craniectomy, bone flap craniotomy, transtemporal (mastoid) for excision of cerebellopontine angle tumor; combined with middle/posterior fossa craniotomy/craniectomy', category: 'Neurosurgery'},
      {code: '61531', description: 'Subdural implantation of strip electrodes through 1 or more burr or trephine hole(s) for long-term seizure monitoring', category: 'Neurosurgery'},
      {code: '61533', description: 'Craniotomy with elevation of bone flap; for subdural implantation of an electrode array, for long-term seizure monitoring', category: 'Neurosurgery'},
      {code: '61534', description: 'Craniotomy with elevation of bone flap; for excision of epileptogenic focus without electrocorticography during surgery', category: 'Neurosurgery'},
      {code: '61535', description: 'Craniotomy with elevation of bone flap; for removal of epidural or subdural electrode array, without excision of cerebral tissue', category: 'Neurosurgery'},
      {code: '61536', description: 'Craniotomy with elevation of bone flap; for excision of cerebral epileptogenic focus, with electrocorticography during surgery (includes removal of electrode array)', category: 'Neurosurgery'},
      {code: '61537', description: 'Craniotomy with elevation of bone flap; for lobectomy, temporal lobe, without electrocorticography during surgery', category: 'Neurosurgery'},
      {code: '61538', description: 'Craniotomy with elevation of bone flap; for lobectomy, temporal lobe, with electrocorticography during surgery', category: 'Neurosurgery'},
      {code: '61539', description: 'Craniotomy with elevation of bone flap; for lobectomy, other than temporal lobe, partial or total, with electrocorticography during surgery', category: 'Neurosurgery'},
      {code: '61540', description: 'Craniotomy with elevation of bone flap; for lobectomy, other than temporal lobe, partial or total, without electrocorticography during surgery', category: 'Neurosurgery'},
      {code: '61541', description: 'Craniotomy with elevation of bone flap; for transection of corpus callosum', category: 'Neurosurgery'},
      {code: '61543', description: 'Craniotomy with elevation of bone flap; for partial or subtotal (functional) hemispherectomy', category: 'Neurosurgery'},
      {code: '61544', description: 'Craniotomy with elevation of bone flap; for excision or coagulation of choroid plexus', category: 'Neurosurgery'},
      {code: '61545', description: 'Craniotomy with elevation of bone flap; for excision of craniopharyngioma', category: 'Neurosurgery'},
      {code: '61546', description: 'Craniotomy for hypophysectomy or excision of pituitary tumor, intracranial approach', category: 'Neurosurgery'},
      {code: '61548', description: 'Hypophysectomy or excision of pituitary tumor, transnasal or transseptal approach, nonstereotactic', category: 'Neurosurgery'},
      {code: '61566', description: 'Craniotomy with elevation of bone flap; for selective amygdalohippocampectomy', category: 'Neurosurgery'},
      {code: '61567', description: 'Craniotomy with elevation of bone flap; for multiple subpial transections, with electrocorticography during surgery', category: 'Neurosurgery'},
      {code: '61570', description: 'Craniectomy or craniotomy; with excision of foreign body from brain', category: 'Neurosurgery'},
      {code: '61571', description: 'Craniectomy or craniotomy; with treatment of penetrating wound of brain', category: 'Neurosurgery'},
      {code: '61575', description: 'Transoral approach to skull base, brain stem or upper spinal cord for biopsy, decompression or excision of lesion', category: 'Neurosurgery'},
      {code: '61576', description: 'Transoral approach to skull base, brain stem or upper spinal cord for biopsy, decompression or excision of lesion; requiring splitting of tongue and/or mandible (including tracheostomy)', category: 'Neurosurgery'},
      {code: '61580', description: 'Craniofacial approach to anterior cranial fossa; extradural, including lateral rhinotomy, ethmoidectomy, sphenoidectomy, without maxillectomy or orbital exenteration', category: 'Neurosurgery'},
      {code: '61581', description: 'Craniofacial approach to anterior cranial fossa; extradural, including lateral rhinotomy, orbital exenteration, ethmoidectomy, sphenoidectomy and/or maxillectomy', category: 'Neurosurgery'},
      {code: '61582', description: 'Craniofacial approach to anterior cranial fossa; extradural, including unilateral or bifrontal craniotomy, elevation of frontal lobe(s), osteotomy of base of anterior cranial fossa', category: 'Neurosurgery'},
      {code: '61583', description: 'Craniofacial approach to anterior cranial fossa; intradural, including unilateral or bifrontal craniotomy, elevation or resection of frontal lobe, osteotomy of base of anterior cranial fossa', category: 'Neurosurgery'},
      {code: '61584', description: 'Orbitocranial approach to anterior cranial fossa, extradural, including supraorbital ridge osteotomy and elevation of frontal and/or temporal lobe(s); without orbital exenteration', category: 'Neurosurgery'},
      {code: '61585', description: 'Orbitocranial approach to anterior cranial fossa, extradural, including supraorbital ridge osteotomy and elevation of frontal and/or temporal lobe(s); with orbital exenteration', category: 'Neurosurgery'},
      {code: '61586', description: 'Bicoronal, transzygomatic and/or LeFort I osteotomy approach to anterior cranial fossa with or without internal fixation, without bone graft', category: 'Neurosurgery'},
      {code: '61590', description: 'Infratemporal pre-auricular approach to middle cranial fossa (parapharyngeal space, infratemporal and midline skull base, nasopharynx), with or without disarticulation of the mandible, including parotidectomy, craniotomy, decompression and/or mobilization', category: 'Neurosurgery'},
      {code: '61591', description: 'Infratemporal post-auricular approach to middle cranial fossa (internal auditory meatus, petrous apex, tentorium, cavernous sinus, parasellar area, infratemporal fossa) including mastoidectomy, resection of sigmoid sinus, with or without decompression', category: 'Neurosurgery'},
      {code: '61592', description: 'Orbitocranial zygomatic approach to middle cranial fossa (cavernous sinus and carotid artery, clivus, basilar artery or petrous apex) including osteotomy of zygoma, craniotomy, extra- or intradural elevation of temporal lobe', category: 'Neurosurgery'},
      {code: '61595', description: 'Transtemporal approach to posterior cranial fossa, jugular foramen or midline skull base, including mastoidectomy, decompression of sigmoid sinus and/or facial nerve, with or without mobilization', category: 'Neurosurgery'},
      {code: '61598', description: 'Transpetrosal approach to posterior cranial fossa, clivus or foramen magnum, including ligation of superior petrosal sinus and/or sigmoid sinus', category: 'Neurosurgery'},
      {code: '61600', description: 'Resection or excision of neoplastic, vascular or infectious lesion of base of anterior cranial fossa; extradural', category: 'Neurosurgery'},
      {code: '61601', description: 'Resection or excision of neoplastic, vascular or infectious lesion of base of anterior cranial fossa; intradural, including dural repair, with or without graft', category: 'Neurosurgery'},
      {code: '61605', description: 'Resection or excision of neoplastic, vascular or infectious lesion of infratemporal fossa, parapharyngeal space, petrous apex; extradural', category: 'Neurosurgery'},
      {code: '61606', description: 'Resection or excision of neoplastic, vascular or infectious lesion of infratemporal fossa, parapharyngeal space, petrous apex; intradural, including dural repair, with or without graft', category: 'Neurosurgery'},
      {code: '61607', description: 'Resection or excision of neoplastic, vascular or infectious lesion of parasellar area, cavernous sinus, clivus or midline skull base; extradural', category: 'Neurosurgery'},
      {code: '61608', description: 'Resection or excision of neoplastic, vascular or infectious lesion of parasellar area, cavernous sinus, clivus or midline skull base; intradural, including dural repair, with or without graft', category: 'Neurosurgery'},
      {code: '61615', description: 'Resection or excision of neoplastic, vascular or infectious lesion of base of posterior cranial fossa, jugular foramen, foramen magnum, or C1-C3 vertebral bodies; extradural', category: 'Neurosurgery'},
      {code: '61616', description: 'Resection or excision of neoplastic, vascular or infectious lesion of base of posterior cranial fossa, jugular foramen, foramen magnum, or C1-C3 vertebral bodies; intradural, including dural repair, with or without graft', category: 'Neurosurgery'},
      {code: '61618', description: 'Secondary repair of dura for cerebrospinal fluid leak, anterior, middle or posterior cranial fossa following surgery of the skull base; by free tissue graft', category: 'Neurosurgery'},
      {code: '61619', description: 'Secondary repair of dura for cerebrospinal fluid leak, anterior, middle or posterior cranial fossa following surgery of the skull base; by local or regionalized vascularized pedicle flap or myocutaneous flap', category: 'Neurosurgery'},
      {code: '61680', description: 'Surgery of intracranial arteriovenous malformation; supratentorial, simple', category: 'Neurosurgery'},
      {code: '61682', description: 'Surgery of intracranial arteriovenous malformation; supratentorial, complex', category: 'Neurosurgery'},
      {code: '61684', description: 'Surgery of intracranial arteriovenous malformation; infratentorial, simple', category: 'Neurosurgery'},
      {code: '61686', description: 'Surgery of intracranial arteriovenous malformation; infratentorial, complex', category: 'Neurosurgery'},
      {code: '61690', description: 'Surgery of intracranial arteriovenous malformation; dural, simple', category: 'Neurosurgery'},
      {code: '61692', description: 'Surgery of intracranial arteriovenous malformation; dural, complex', category: 'Neurosurgery'},
      {code: '61697', description: 'Surgery of complex intracranial aneurysm, intracranial approach; carotid circulation', category: 'Neurosurgery'},
      {code: '61698', description: 'Surgery of complex intracranial aneurysm, intracranial approach; vertebrobasilar circulation', category: 'Neurosurgery'},
      {code: '61700', description: 'Surgery of simple intracranial aneurysm, intracranial approach; carotid circulation', category: 'Neurosurgery'},
      {code: '61702', description: 'Surgery of simple intracranial aneurysm, intracranial approach; vertebrobasilar circulation', category: 'Neurosurgery'},
      {code: '61703', description: 'Surgery of intracranial aneurysm, cervical approach by application of occluding clamp to cervical carotid artery (Selverstone-Crutchfield type)', category: 'Neurosurgery'},
      {code: '61705', description: 'Surgery of aneurysm, vascular malformation or carotid-cavernous fistula; by intracranial and cervical occlusion of carotid artery', category: 'Neurosurgery'},
      {code: '61708', description: 'Surgery of aneurysm, vascular malformation or carotid-cavernous fistula; by intracranial electrothrombosis', category: 'Neurosurgery'},
      {code: '61710', description: 'Surgery of aneurysm, vascular malformation or carotid-cavernous fistula; by intra-arterial embolization, injection procedure, or balloon catheter', category: 'Neurosurgery'},
      {code: '61711', description: 'Anastomosis, arterial, extracranial-intracranial (eg, middle cerebral/cortical) arteries', category: 'Neurosurgery'},
      {code: '61720', description: 'Creation of lesion by stereotactic method, including burr hole(s) and localizing and recording techniques, single or multiple stages; globus pallidus or thalamus', category: 'Neurosurgery'},
      {code: '61735', description: 'Creation of lesion by stereotactic method, including burr hole(s) and localizing and recording techniques, single or multiple stages; subcortical structure(s) other than globus pallidus or thalamus', category: 'Neurosurgery'},
      {code: '61736', description: 'Single-trajectory laser interstitial thermal therapy (LITT) of 1 simple intracranial lesion, including burr hole, with magnetic resonance imaging guidance', category: 'Neurosurgery'},
      {code: '61737', description: 'Multiple-trajectory laser interstitial thermal therapy (LITT) of complex intracranial lesion, including burr hole', category: 'Neurosurgery'},
      {code: '61750', description: 'Stereotactic biopsy, aspiration, or excision, including burr hole(s), for intracranial lesion', category: 'Neurosurgery'},
      {code: '61751', description: 'Stereotactic biopsy, aspiration, or excision, including burr hole(s), for intracranial lesion; with computed tomography and/or magnetic resonance guidance', category: 'Neurosurgery'},
      {code: '61760', description: 'Stereotactic implantation of depth electrodes into the cerebrum for long-term seizure monitoring', category: 'Neurosurgery'},
      {code: '61770', description: 'Stereotactic localization, including burr hole(s), with insertion of catheter(s) or probe(s) for placement of radiation source', category: 'Neurosurgery'},
      {code: '61850', description: 'Twist drill or burr hole(s) for implantation of neurostimulator electrodes, cortical', category: 'Neurosurgery'},
      {code: '61860', description: 'Craniectomy or craniotomy for implantation of neurostimulator electrodes, cerebral, cortical', category: 'Neurosurgery'},
      {code: '61863', description: 'Twist drill, burr hole, craniotomy, or craniectomy with stereotactic implantation of neurostimulator electrode array in subcortical site (eg, thalamus, globus pallidus, subthalamic nucleus, periventricular, periaqueductal gray), without use of intraoperative microelectrode recording; first array', category: 'Neurosurgery'},
      {code: '61867', description: 'Twist drill, burr hole, craniotomy, or craniectomy with stereotactic implantation of neurostimulator electrode array in subcortical site (eg, thalamus, globus pallidus, subthalamic nucleus, periventricular, periaqueductal gray), with use of intraoperative microelectrode recording; first array', category: 'Neurosurgery'},
      {code: '61870', description: 'Craniectomy for implantation of neurostimulator electrodes, cerebellar; cortical', category: 'Neurosurgery'},
      {code: '61880', description: 'Revision or removal of intracranial neurostimulator electrodes', category: 'Neurosurgery'},
      {code: '62000', description: 'Elevation of depressed skull fracture; simple, extradural', category: 'Neurosurgery'},
      {code: '62005', description: 'Elevation of depressed skull fracture; compound or comminuted, extradural', category: 'Neurosurgery'},
      {code: '62010', description: 'Elevation of depressed skull fracture; with repair of dura and/or debridement of brain', category: 'Neurosurgery'},
      {code: '62100', description: 'Craniotomy for repair of dural/cerebrospinal fluid leak, including surgery for rhinorrhea/otorrhea', category: 'Neurosurgery'},
      {code: '62120', description: 'Repair of encephalocele, skull vault, including cranioplasty', category: 'Neurosurgery'},
      {code: '62121', description: 'Craniotomy for repair of encephalocele, skull base', category: 'Neurosurgery'},
      {code: '62161', description: 'Neuroendoscopy, intracranial; with dissection of adhesions, fenestration of septum pellucidum or intraventricular cysts (including placement, replacement, or removal of ventricular catheter)', category: 'Neurosurgery'},
      {code: '62163', description: 'Neuroendoscopy, intracranial; with retrieval of foreign body', category: 'Neurosurgery'},
      {code: '62164', description: 'Neuroendoscopy, intracranial; with excision of brain tumor, including placement of external ventricular catheter for drainage', category: 'Neurosurgery'},
      {code: '62165', description: 'Neuroendoscopy, intracranial; with excision of pituitary tumor, transnasal or trans-sphenoidal approach', category: 'Neurosurgery'},
      {code: '62200', description: 'Ventriculocisternostomy, third ventricle', category: 'Neurosurgery'},
      {code: '62201', description: 'Ventriculocisternostomy, third ventricle; stereotactic, neuroendoscopic method', category: 'Neurosurgery'},
      // CSEC - Cesarean Section
      {code: '59100', description: 'Hysterotomy, abdominal (e.g., for hydatidiform mole, abortion)', category: 'Obstetrics'},
      {code: '59510', description: 'Routine obstetric care including antepartum care, cesarean delivery, and postpartum care', category: 'Obstetrics'},
      {code: '59514', description: 'Cesarean delivery only', category: 'Obstetrics'},
      {code: '59515', description: 'Cesarean delivery only; including postpartum care', category: 'Obstetrics'},
      {code: '59618', description: 'Routine obstetric care including antepartum care, cesarean delivery, and postpartum care, following attempted vaginal delivery after previous cesarean delivery', category: 'Obstetrics'},
      {code: '59620', description: 'Cesarean delivery only, following attempted vaginal delivery after previous cesarean delivery', category: 'Obstetrics'},
      {code: '59622', description: 'Cesarean delivery only, following attempted vaginal delivery after previous cesarean delivery; including postpartum care', category: 'Obstetrics'},
      {code: '59857', description: 'Induced abortion, by 1 or more vaginal suppositories (e.g., prostaglandin) with or without cervical dilation (e.g., laminaria), including hospital admission and visits, delivery of fetus and secundines; with hysterotomy (failed medical evacuation)', category: 'Obstetrics'},
      // Evaluation and Management codes
      {code: '99213', description: 'Office or other outpatient visit for the evaluation and management of an established patient', category: 'Evaluation and Management'},
      {code: '99214', description: 'Office or other outpatient visit for the evaluation and management of an established patient', category: 'Evaluation and Management'},
      {code: '99215', description: 'Office or other outpatient visit for the evaluation and management of an established patient', category: 'Evaluation and Management'},
    ];

    // Add all CPT codes to the map
    cptCodeData.forEach(({code, description, category}) => {
      this.cptCodes.set(code, {
        code,
        description,
        category,
        modifierRequired: false,
        unitOfService: 'per procedure',
        globalPeriod: '000',
      });
    });
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

    // Initialize with comprehensive CPT codes from user-provided data
    this.initializeCPTCodes();

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
    // ICD-10 format validation - more lenient
    // ICD-10 codes: Letter + 2 digits + optional decimal + 0-4 more characters
    // Format: A00.0, A00.00, A00.000, A00.0000, etc.
    
    // Remove any existing errors from format validation
    const formatErrors: string[] = [];
    
    if (code.length < 3) {
      formatErrors.push('ICD-10 code must be at least 3 characters');
    } else if (code.length > 7) {
      formatErrors.push('ICD-10 code must be no more than 7 characters');
    }

    // Must start with letter A-Z followed by 2 digits
    if (!/^[A-Z][0-9]{2}/.test(code)) {
      formatErrors.push('ICD-10 code must start with a letter (A-Z) followed by 2 digits');
    }

    // If decimal point exists, validate decimal portion
    if (code.includes('.')) {
      const parts = code.split('.');
      if (parts.length !== 2) {
        formatErrors.push('ICD-10 code can have only one decimal point');
      } else if (parts[1].length > 4) {
        formatErrors.push('ICD-10 code decimal portion cannot exceed 4 digits');
      } else if (parts[1].length === 0) {
        formatErrors.push('ICD-10 code decimal portion cannot be empty');
      }
    }

    // After letter and 2 digits, only digits and decimal allowed
    if (!/^[A-Z][0-9]{2}([.][0-9]{1,4})?$/.test(code)) {
      if (formatErrors.length === 0) {
        formatErrors.push('ICD-10 code format invalid: Letter + 2 digits + optional decimal + 1-4 digits');
      }
    }

    // Replace errors array with format errors
    result.errors = result.errors.filter(e => !e.includes('ICD-10'));
    result.errors.push(...formatErrors);
  }

  private validateCPTFormat(code: string, result: CodeValidationResult): void {
    // CPT format validation - must be exactly 5 digits
    const formatErrors: string[] = [];
    
    if (code.length !== 5) {
      formatErrors.push('CPT code must be exactly 5 digits');
    }

    if (!/^[0-9]{5}$/.test(code)) {
      formatErrors.push('CPT code must contain only digits (0-9)');
    }

    // Replace errors array with format errors
    result.errors = result.errors.filter(e => !e.includes('CPT'));
    result.errors.push(...formatErrors);
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

  // Helper methods to provide category descriptions for codes not in database
  private getICD10Category(code: string): string {
    const firstChar = code.charAt(0);
    const categoryMap: { [key: string]: string } = {
      'A': 'Certain infectious and parasitic diseases',
      'B': 'Certain infectious and parasitic diseases',
      'C': 'Neoplasms',
      'D': 'Diseases of blood and blood-forming organs',
      'E': 'Endocrine, nutritional and metabolic diseases',
      'F': 'Mental, behavioral and neurodevelopmental disorders',
      'G': 'Diseases of the nervous system',
      'H': 'Diseases of the eye and adnexa',
      'I': 'Diseases of the circulatory system',
      'J': 'Diseases of the respiratory system',
      'K': 'Diseases of the digestive system',
      'L': 'Diseases of the skin and subcutaneous tissue',
      'M': 'Diseases of the musculoskeletal system',
      'N': 'Diseases of the genitourinary system',
      'O': 'Pregnancy, childbirth and the puerperium',
      'P': 'Certain conditions originating in the perinatal period',
      'Q': 'Congenital malformations, deformations and chromosomal abnormalities',
      'R': 'Symptoms, signs and abnormal clinical and laboratory findings',
      'S': 'Injury, poisoning and certain other consequences of external causes',
      'T': 'Injury, poisoning and certain other consequences of external causes',
      'U': 'Codes for special purposes',
      'V': 'External causes of morbidity',
      'W': 'External causes of morbidity',
      'X': 'External causes of morbidity',
      'Y': 'External causes of morbidity',
      'Z': 'Factors influencing health status and contact with health services',
    };
    return categoryMap[firstChar] || 'Unknown category';
  }

  private getICD10CategoryDescription(code: string): string {
    return `ICD-10 code in category: ${this.getICD10Category(code)}`;
  }

  private getCPTCategory(code: string): string {
    const firstDigit = code.charAt(0);
    const categoryMap: { [key: string]: string } = {
      '0': 'Anesthesia',
      '1': 'Surgery',
      '2': 'Surgery',
      '3': 'Surgery',
      '4': 'Surgery',
      '5': 'Surgery',
      '6': 'Surgery',
      '7': 'Surgery',
      '8': 'Surgery',
      '9': 'Medicine / Evaluation and Management',
    };
    return categoryMap[firstDigit] || 'Unknown category';
  }

  private getCPTCategoryDescription(code: string): string {
    const category = this.getCPTCategory(code);
    return `CPT code in category: ${category}`;
  }

  private getHCPCSCategory(code: string): string {
    const firstChar = code.charAt(0);
    const categoryMap: { [key: string]: string } = {
      'A': 'Transportation Services & Medical & Surgical Supplies',
      'B': 'Enteral and Parenteral Therapy',
      'C': 'Outpatient PPS',
      'D': 'Dental Procedures',
      'E': 'Durable Medical Equipment',
      'G': 'Procedures / Professional Services (Temporary)',
      'H': 'Alcohol and Drug Abuse Treatment Services',
      'J': 'Drugs Administered Other Than Oral Method',
      'K': 'Temporary Codes',
      'L': 'Orthotic and Prosthetic Procedures',
      'M': 'Medical Services',
      'P': 'Pathology and Laboratory Services',
      'Q': 'Temporary Codes',
      'R': 'Diagnostic Radiology Services',
      'S': 'Temporary National Codes',
      'T': 'Temporary National Codes',
      'U': 'Coronavirus Testing',
      'V': 'Vision, Hearing, and Speech-Language Pathology Services',
      'W': 'Transportation Services',
      'X': 'Temporary Codes',
    };
    return categoryMap[firstChar] || 'Unknown category';
  }

  private getHCPCSCategoryDescription(code: string): string {
    return `HCPCS code in category: ${this.getHCPCSCategory(code)}`;
  }
}

// Lazy-loaded service to avoid initialization errors
export const getCodeValidationService = () => CodeValidationService.getInstance();
