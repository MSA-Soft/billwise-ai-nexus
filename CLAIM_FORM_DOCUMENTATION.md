# 📋 Claim Form Documentation

## Overview

The BillWise AI Nexus application has a **comprehensive claim management system** with multiple form implementations:

1. **ClaimFormWizard** - Multi-step wizard form (5 steps) - Modern UX
2. **EnhancedClaimForm** - Single-page comprehensive form - Quick entry
3. **CMS1500Form** - HCFA/CMS-1500 form (Professional services)
4. **UB04Form** - UB-04 form (Institutional/Hospital services)
5. **ADADentalForm** - ADA Dental claim form
6. **Claims Component** - Main claims management interface

---

## Complete Claim System Architecture

### Main Claims Component (`Claims.tsx`)
**Purpose:** Central hub for all claim management

**Features:**
- Claims dashboard with statistics
- Claims table with filtering
- Claim creation (opens wizard)
- Claim detail view
- Claim actions (edit, delete, submit)
- Status tracking
- Search and filter capabilities

**Components Used:**
- `ClaimsDashboard` - Overview statistics
- `ClaimsTable` - List of all claims
- `ClaimFormWizard` - Create new claims
- `ClaimDetailModal` - View claim details
- `ClaimsStats` - Statistics cards
- `ClaimsFilter` - Filtering options
- `ClaimsActions` - Bulk actions

---

## 1. ClaimFormWizard (Multi-Step Wizard)

### Location
- **Main Component:** `src/components/ClaimFormWizard.tsx`
- **Step Components:** `src/components/ClaimWizard/`

### Architecture

**Wizard Structure:**
- Modal dialog-based form
- 5 sequential steps with progress tracking
- Step validation before proceeding
- Data persistence across steps

### Steps Breakdown

#### Step 1: Patient Selection (`PatientSelectionStep.tsx`)
**Purpose:** Select patient for the claim

**Features:**
- Patient search (by name, ID, or phone)
- Patient list with details:
  - Name, DOB, Phone
  - Insurance information
  - Eligibility status
- Visual selection indicator
- Selected patient summary card

**Data Collected:**
```typescript
{
  patient: {
    id: string,
    name: string,
    dob: string,
    phone: string,
    insurance: string,
    memberNumber: string,
    eligibility: string
  }
}
```

**Validation:**
- ✅ Patient must be selected to proceed

---

#### Step 2: Service Details (`ServiceDetailsStep.tsx`)
**Purpose:** Add procedures/services (CPT codes)

**Features:**
- Service date picker
- CPT code search functionality
- Add multiple procedures
- Each procedure includes:
  - CPT code
  - Description (auto-filled)
  - Units (quantity)
  - Amount (price per unit)
  - Total (calculated: units × amount)
- Remove procedure capability
- Running total calculation

**Data Collected:**
```typescript
{
  serviceDate: string, // YYYY-MM-DD
  procedures: [
    {
      cptCode: string,      // e.g., "99213"
      description: string,   // e.g., "Office visit, established patient"
      units: number,         // Quantity
      amount: number         // Price per unit
    }
  ]
}
```

**Validation:**
- ✅ At least one procedure required
- ✅ Service date required

**Mock CPT Codes Available:**
- 99213, 99214, 99215 (Office visits)
- 36415 (Blood draw)
- 93000 (Electrocardiogram)
- 80053 (Comprehensive metabolic panel)
- 85025 (Complete blood count)
- 99212 (Office visit)

---

#### Step 3: Diagnosis (`DiagnosisStep.tsx`)
**Purpose:** Add diagnosis codes (ICD-10)

**Features:**
- ICD-10 code search
- Add multiple diagnoses
- Primary diagnosis designation (checkbox)
- Visual distinction:
  - Primary: Green highlight
  - Secondary: Blue highlight
- Remove diagnosis capability
- Auto-set first diagnosis as primary

**Data Collected:**
```typescript
{
  diagnoses: [
    {
      icdCode: string,        // e.g., "I10"
      description: string,    // e.g., "Essential hypertension"
      primary: boolean        // true for primary diagnosis
    }
  ]
}
```

**Validation:**
- ✅ At least one diagnosis required
- ✅ At least one must be marked as primary

**Mock ICD Codes Available:**
- I10 (Essential hypertension)
- E11.9 (Type 2 diabetes)
- Z00.00 (General examination)
- M79.3 (Panniculitis)
- I25.10 (Atherosclerotic heart disease)
- J06.9 (Acute upper respiratory infection)
- K21.9 (GERD)
- M25.561 (Pain in right knee)

---

#### Step 4: Insurance (`InsuranceStep.tsx`)
**Purpose:** Select insurance and provider information

**Features:**
- Provider selection dropdown
- Primary insurance selection (required)
- Secondary insurance selection (optional)
- Eligibility verification (simulated)
- Prior authorization number input
- Insurance summary card
- Real-time eligibility status

**Data Collected:**
```typescript
{
  provider: {
    id: string,
    name: string,
    specialty: string
  },
  insurance: {
    primary: {
      id: string,
      name: string,
      type: string,        // "Commercial" or "Government"
      eligibility: string  // "Active", "Inactive"
    },
    secondary?: {
      id: string,
      name: string,
      type: string
    },
    authNumber?: string   // Prior authorization number
  }
}
```

**Validation:**
- ✅ Primary insurance required
- ✅ Provider selection required

**Mock Insurance Providers:**
- Blue Cross Blue Shield
- Aetna
- Medicare
- Cigna
- UnitedHealth

---

#### Step 5: Review (`ReviewStep.tsx`)
**Purpose:** Review all claim information before submission

**Features:**
- Complete claim summary
- Sections:
  - Patient Information
  - Service Information
  - Procedures & Services (with totals)
  - Diagnosis Codes (primary highlighted)
  - Insurance Information
  - Additional Notes
- Validation checklist:
  - ✅ Patient selected
  - ✅ Procedures added
  - ✅ Diagnoses added
  - ✅ Primary insurance selected
  - ✅ Provider selected
- Visual indicators (green checkmarks for complete)

**Data Displayed:**
- All collected data from previous steps
- Calculated totals
- Validation status

---

### Wizard Features

**Progress Tracking:**
- Visual progress bar
- Step indicators with icons
- Completed steps show checkmarks
- Current step highlighted

**Navigation:**
- Previous/Next buttons
- Step validation before proceeding
- Cancel button (closes wizard)
- Submit button (final step only)

**Validation:**
- Step-by-step validation
- Error messages for incomplete steps
- Cannot proceed until step is complete
- Final validation on review step

**Data Flow:**
```typescript
interface ClaimFormData {
  patient: any;
  serviceDate: string;
  procedures: Array<{
    cptCode: string;
    description: string;
    units: number;
    amount: number;
  }>;
  diagnoses: Array<{
    icdCode: string;
    description: string;
    primary: boolean;
  }>;
  insurance: {
    primary: any;
    secondary?: any;
    authNumber?: string;
  };
  provider: any;
  notes: string;
}
```

---

## 2. EnhancedClaimForm (Single-Page Form)

### Location
- `src/components/EnhancedClaims/EnhancedClaimForm.tsx`

### Architecture

**Form Structure:**
- Single-page comprehensive form
- Modal dialog-based
- All sections visible (scrollable)
- Save draft or submit options

### Form Sections

#### 1. Basic Information
- Claim number (auto-generated)
- Form type (HCFA/CMS-1500)
- CMS form version (02/12, 08/05)

#### 2. Patient & Provider Information
- Patient selection
- Provider selection
- Service date range (from/to)
- Appointment ID

#### 3. Procedures Section
- Add/remove procedures dynamically
- Each procedure includes:
  - CPT code (dropdown with search)
  - Description
  - Quantity
  - Unit price
  - Total price (auto-calculated)
  - Modifier
  - Diagnosis pointer

#### 4. Diagnoses Section
- Add/remove diagnoses dynamically
- Each diagnosis includes:
  - ICD code (dropdown with search)
  - Description
  - Primary checkbox

#### 5. Insurance Information
- Primary insurance selection
- Secondary insurance selection (optional)
- Insurance type (EDI)
- Secondary claim checkbox

#### 6. Financial Information
- Total charges (auto-calculated from procedures)
- Patient responsibility
- Insurance amount
- Copay amount
- Deductible amount

#### 7. Authorization
- Prior authorization number
- Referral number
- Treatment authorization code

#### 8. Additional Notes
- Free-text notes field

### Form State

```typescript
{
  // Basic
  claim_number: string,
  form_type: 'HCFA' | 'CMS1500',
  cms_form_version: string,
  
  // Patient & Provider
  patient_id: string,
  provider_id: string,
  appointment_id: string,
  
  // Service
  service_date_from: string,
  service_date_to: string,
  place_of_service_code: string,
  facility_id: string,
  
  // Insurance
  primary_insurance_id: string,
  secondary_insurance_id: string | 'none',
  insurance_type: 'EDI',
  is_secondary_claim: boolean,
  
  // Financial
  total_charges: number,
  patient_responsibility: number,
  insurance_amount: number,
  copay_amount: number,
  deductible_amount: number,
  
  // Authorization
  prior_auth_number: string,
  referral_number: string,
  treatment_auth_code: string,
  
  // Status
  status: 'draft' | 'submitted',
  submission_method: 'EDI',
  notes: string
}
```

### Actions

**Save Draft:**
- Saves claim with status 'draft'
- Can be edited later
- Does not submit to insurance

**Submit Claim:**
- Validates required fields
- Sets status to 'submitted'
- Ready for EDI transmission
- Cannot be edited after submission

---

## Key Differences

| Feature | ClaimFormWizard | EnhancedClaimForm |
|---------|----------------|-------------------|
| **Layout** | Multi-step wizard | Single-page form |
| **User Experience** | Guided, step-by-step | Comprehensive, all-at-once |
| **Best For** | New users, complex claims | Experienced users, quick entry |
| **Validation** | Step-by-step | Final validation |
| **Data Entry** | Progressive disclosure | All fields visible |
| **Mobile Friendly** | ✅ Better | ⚠️ May be overwhelming |

---

## Data Flow

### ClaimFormWizard Flow:
```
Step 1 (Patient) 
  → Step 2 (Services) 
    → Step 3 (Diagnosis) 
      → Step 4 (Insurance) 
        → Step 5 (Review) 
          → Submit
```

### EnhancedClaimForm Flow:
```
All Sections Visible
  → Fill all fields
    → Save Draft OR Submit
```

---

## Integration Points

### Database Tables (Expected)
- `claims` - Main claim records
- `claim_procedures` - CPT codes for claims
- `claim_diagnoses` - ICD codes for claims
- `patients` - Patient information
- `providers` - Provider information
- `insurance_payers` - Insurance companies
- `facilities` - Facility/location information

### Services Used
- `databaseService` - CRUD operations
- `ediService` - EDI transaction submission
- `codeValidationService` - CPT/ICD code validation

---

## Current Limitations

1. **Mock Data:**
   - Uses hardcoded mock patients, providers, insurance
   - CPT/ICD codes are limited mock data
   - Not connected to real database yet

2. **Validation:**
   - Basic validation only
   - No real-time code validation
   - No insurance eligibility verification (simulated)

3. **Submission:**
   - Form submission is logged to console
   - Not actually saved to database
   - Not sent via EDI (needs implementation)

---

## Future Enhancements Needed

1. **Database Integration:**
   - Connect to real `claims` table
   - Save draft claims
   - Load existing claims for editing

2. **Code Validation:**
   - Real CPT code validation
   - Real ICD-10 code validation
   - Code lookup from database

3. **Patient/Provider Lookup:**
   - Real patient search from database
   - Real provider selection
   - Real insurance lookup

4. **EDI Integration:**
   - Generate X12 837 format
   - Submit to clearinghouse
   - Track submission status

5. **Enhanced Features:**
   - Claim templates
   - Bulk claim creation
   - Claim history
   - Denial management integration

---

## Usage Examples

### Opening ClaimFormWizard:
```typescript
<ClaimFormWizard
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSubmit={(data) => {
    console.log('Claim submitted:', data);
    // Save to database
  }}
/>
```

### Opening EnhancedClaimForm:
```typescript
<EnhancedClaimForm
  isOpen={isOpen}
  patientId="patient-123"
  onSave={(data) => {
    console.log('Claim saved:', data);
  }}
  onCancel={() => setIsOpen(false)}
/>
```

---

## 3. Standard Billing Forms

### CMS1500Form (HCFA/CMS-1500)
**Location:** `src/components/billing-forms/CMS1500Form.tsx`

**Purpose:** Professional services claim form (CMS-1500 format)

**Used For:**
- Physician services
- Outpatient services
- Professional billing

**Features:**
- Standard CMS-1500 form layout
- All required fields
- Print-ready format
- EDI submission ready

---

### UB04Form (UB-04)
**Location:** `src/components/billing-forms/UB04Form.tsx`

**Purpose:** Institutional/Hospital services claim form

**Used For:**
- Hospital inpatient services
- Hospital outpatient services
- Skilled nursing facilities
- Institutional billing

**Features:**
- Standard UB-04 form layout
- Institutional billing fields
- Revenue codes
- Print-ready format

---

### ADADentalForm
**Location:** `src/components/billing-forms/ADADentalForm.tsx`

**Purpose:** Dental services claim form (ADA format)

**Used For:**
- Dental procedures
- Oral surgery
- Orthodontic services
- Dental billing

**Features:**
- ADA standard form layout
- Dental procedure codes
- Tooth numbering system
- Print-ready format

---

## File Structure

```
src/components/
├── Claims.tsx                    # Main claims management hub
├── ClaimsDashboard.tsx           # Statistics and overview
├── ClaimsTable.tsx               # Claims list table
├── ClaimFormWizard.tsx           # Multi-step wizard
├── ClaimDetailModal.tsx          # View claim details
├── ClaimsStats.tsx               # Statistics cards
├── ClaimsFilter.tsx              # Filtering component
├── ClaimsActions.tsx             # Bulk actions
├── ClaimWizard/
│   ├── PatientSelectionStep.tsx  # Step 1
│   ├── ServiceDetailsStep.tsx    # Step 2
│   ├── DiagnosisStep.tsx         # Step 3
│   ├── InsuranceStep.tsx         # Step 4
│   └── ReviewStep.tsx            # Step 5
├── EnhancedClaims/
│   ├── EnhancedClaimForm.tsx     # Single-page form
│   ├── EnhancedClaimList.tsx     # Enhanced claims list
│   ├── CMS1500Form.tsx           # CMS-1500 form
│   ├── DenialManagement.tsx      # Denial handling
│   ├── AIAnalysisPanel.tsx       # AI analysis
│   └── LetterGenerator.tsx       # Appeal letters
└── billing-forms/
    ├── CMS1500Form.tsx           # Standard CMS-1500
    ├── UB04Form.tsx              # UB-04 institutional
    └── ADADentalForm.tsx         # ADA dental form
```

---

## Summary

The claim form system provides two approaches:
- **Wizard** for guided, step-by-step claim creation
- **Enhanced Form** for comprehensive, all-at-once entry

Both forms collect the same essential data:
- Patient information
- Procedures (CPT codes)
- Diagnoses (ICD codes)
- Insurance information
- Provider details
- Financial calculations

The forms are currently using mock data and need database integration to be fully functional.

