# 🔍 Mock Data Analysis Report

## Overview
This document identifies all forms and components in the BillWise AI Nexus project that are using mock/hardcoded data instead of database connections.

---

## 📋 Forms Using Mock Data

### 🔴 **CRITICAL - Main Claims Components**

#### 1. **Claims.tsx** (`src/components/Claims.tsx`)
**Status:** ❌ Using Mock Data
- **Line 54-145:** Hardcoded `mockClaims` array with 6 sample claims
- **Issue:** Main claims dashboard displays mock data instead of fetching from `claims` table
- **Impact:** HIGH - Core functionality broken
- **Fix Required:**
  - Replace `mockClaims` with database query to `claims` table
  - Join with `claim_procedures`, `claim_diagnoses`, `patients`, `providers`, `facilities` tables
  - Use `claimSubmissionService` or create `claimService.ts`

#### 2. **EnhancedClaims.tsx** (`src/components/EnhancedClaims.tsx`)
**Status:** ❌ Using Mock Data
- **Line 36-79:** Hardcoded `mockClaims` array with 3 sample claims
- **Issue:** Enhanced claims view uses mock data
- **Impact:** HIGH - Alternative claims interface broken
- **Fix Required:**
  - Fetch from `claims` table
  - Integrate with existing claim services

#### 3. **EnhancedClaimList.tsx** (`src/components/EnhancedClaims/EnhancedClaimList.tsx`)
**Status:** ❌ Using Mock Data
- **Line 49-93:** Hardcoded `mockClaims` array
- **Line 95-99:** Hardcoded `mockFacilities` array
- **Issue:** Claim list and facilities use mock data
- **Impact:** HIGH
- **Fix Required:**
  - Fetch claims from database
  - Fetch facilities from `facilities` table

---

### 🟠 **HIGH PRIORITY - Claim Form Components**

#### 4. **EnhancedClaimForm.tsx** (`src/components/EnhancedClaims/EnhancedClaimForm.tsx`)
**Status:** ⚠️ Partially Using Mock Data
- **Line 291-296:** `mockPlaceOfServiceCodes` - Hardcoded POS codes
- **Line 298-303:** `mockCptCodes` - Hardcoded CPT codes (only 4 codes)
- **Line 305-310:** `mockIcdCodes` - Hardcoded ICD codes (only 4 codes)
- **Good:** Patient, provider, payer, facility, practice data fetched from DB
- **Issue:** Code lookups use limited mock data
- **Impact:** HIGH - Users can't select real codes
- **Fix Required:**
  - Fetch CPT codes from `cpt_hcpcs_codes` table
  - Fetch ICD codes from `diagnosis_codes` table
  - Fetch POS codes from `codes` table or use standard POS code list
  - Reference: `Codes.tsx` already fetches from these tables

#### 5. **ServiceDetailsStep.tsx** (`src/components/ClaimWizard/ServiceDetailsStep.tsx`)
**Status:** ❌ Using Mock Data
- **Line 17-26:** `mockCptCodes` - Hardcoded CPT codes (only 8 codes)
- **Issue:** CPT code selection in claim wizard uses mock data
- **Impact:** HIGH - Core claim creation broken
- **Fix Required:**
  - Fetch from `cpt_hcpcs_codes` table
  - Use same approach as `Codes.tsx` component

#### 6. **DiagnosisStep.tsx** (`src/components/ClaimWizard/DiagnosisStep.tsx`)
**Status:** ❌ Using Mock Data
- **Line 17-26:** `mockIcdCodes` - Hardcoded ICD codes (only 8 codes)
- **Issue:** Diagnosis code selection in claim wizard uses mock data
- **Impact:** HIGH - Core claim creation broken
- **Fix Required:**
  - Fetch from `diagnosis_codes` table
  - Use same approach as `Codes.tsx` component

---

### 🟡 **MEDIUM PRIORITY - Configuration Forms**

#### 7. **Statements.tsx** (`src/components/Statements.tsx`)
**Status:** ❌ Using Mock Data
- **Line 26-60:** `sampleTemplates` - Hardcoded statement templates
- **Line 75:** Initialized with `sampleTemplates`
- **Issue:** Statement templates not saved/loaded from database
- **Impact:** MEDIUM - Template management broken
- **Fix Required:**
  - Check if `statement_templates` table exists
  - Fetch templates from database
  - Save new/updated templates to database

#### 8. **Labels.tsx** (`src/components/Labels.tsx`)
**Status:** ❌ Using Mock Data
- **Line 37-109:** `sampleLabels` - Hardcoded label templates
- **Line 170:** Initialized with `sampleLabels`
- **Issue:** Label templates not saved/loaded from database
- **Impact:** MEDIUM - Label management broken
- **Fix Required:**
  - Fetch from `label_templates` table
  - Save new/updated templates to database

#### 9. **PayerAgreements.tsx** (`src/components/PayerAgreements.tsx`)
**Status:** ❌ Using Mock Data
- **Line 42:** `samplePayerAgreements` - Hardcoded payer agreements
- **Line 81:** Initialized with `samplePayerAgreements`
- **Issue:** Payer agreements not loaded from database
- **Impact:** MEDIUM
- **Fix Required:**
  - Fetch from `payer_agreements` table

#### 10. **Facilities.tsx** (`src/components/Facilities.tsx`)
**Status:** ⚠️ Partially Using Mock Data
- **Line 53-90:** `sampleFacilities` - Hardcoded facility data
- **Issue:** May be using sample data as fallback
- **Impact:** MEDIUM
- **Fix Required:**
  - Verify if fetching from `facilities` table
  - Remove sample data if not needed

---

### 🟢 **LOW PRIORITY - Demo/Test Components**

#### 11. **AuthorizationWorkflow.tsx** (`src/components/AuthorizationWorkflow.tsx`)
**Status:** ❌ Using Mock Data
- **Line 183-194:** Hardcoded `patients` array (10 patients)
- **Line 196-209:** Hardcoded `payers` array (12 payers)
- **Line 211+:** Hardcoded `authRequests` array
- **Issue:** Authorization workflow uses mock data
- **Impact:** MEDIUM - Authorization management broken
- **Fix Required:**
  - Fetch patients from `patients` table
  - Fetch payers from `insurance_payers` table
  - Fetch auth requests from `authorization_requests` table

#### 12. **EligibilityVerification.tsx** (`src/components/EligibilityVerification.tsx`)
**Status:** ⚠️ Partially Using Mock Data
- **Line 408-479:** `loadSampleData()` function seeds dummy verification history
- **Line 717-816:** Fallback to mock facilities/providers if tables don't exist
- **Issue:** Sample data loaded on first load, fallback to mock data
- **Impact:** MEDIUM - May show incorrect data
- **Fix Required:**
  - Remove sample data seeding
  - Ensure proper error handling without mock fallbacks
  - Verify all tables exist

#### 13. **ProviderQuickActions.tsx** (`src/components/ProviderQuickActions.tsx`)
**Status:** ❌ Using Mock Data
- **Line 94-107:** Mock eligibility check result
- **Line 144-157:** Mock code validation result
- **Line 190-204:** Mock prior auth generation
- **Line 235-250:** Mock appeal generation
- **Line 281-295:** Mock payment plan calculation
- **Issue:** All quick actions return mock data
- **Impact:** MEDIUM - Quick actions don't work
- **Fix Required:**
  - Connect to `eligibilityVerificationService`
  - Connect to `codeValidationService`
  - Connect to `authorizationTaskService`
  - Connect to `paymentPlanService`

#### 14. **EDIDashboard.tsx** (`src/components/EDIDashboard.tsx`)
**Status:** ⚠️ Partially Using Mock Data
- **Line 84-126:** `loadSampleTransactions()` - Hardcoded sample EDI transactions
- **Line 81:** Loads sample data on mount
- **Issue:** Initial load shows mock data, but real transactions can be added
- **Impact:** LOW - Demo data shown initially
- **Fix Required:**
  - Fetch from `edi_transactions` table on load
  - Remove sample data loading

#### 15. **PriorAuthDashboard.tsx** (`src/components/PriorAuthDashboard.tsx`)
**Status:** ❌ Using Mock Data
- **Line 162-189:** Mock AI analysis results
- **Line 215-236:** Mock workflow processing results
- **Issue:** AI analysis and workflow use mock data
- **Impact:** MEDIUM
- **Fix Required:**
  - Connect to `approvalPredictionService`
  - Connect to `workflowService`

#### 16. **BillingCycleConfig.tsx** (`src/components/BillingCycleConfig.tsx`)
**Status:** ❌ Using Mock Data
- **Line 55-75:** Mock billing cycle processing results
- **Issue:** Billing cycle processing returns mock data
- **Impact:** MEDIUM
- **Fix Required:**
  - Connect to actual billing cycle service
  - Process real statements from database

#### 17. **ClaimStatusTracking.tsx** (`src/components/ClaimStatusTracking.tsx`)
**Status:** ❌ Using Mock Data
- **Line 49:** Mock claim data
- **Issue:** Claim status tracking uses mock data
- **Impact:** MEDIUM
- **Fix Required:**
  - Fetch from `claims` table
  - Track status changes from `claim_status_history` if exists

#### 18. **EnhancedClaims/DenialManagement.tsx** (`src/components/EnhancedClaims/DenialManagement.tsx`)
**Status:** ❌ Using Mock Data
- **Line 60:** `mockDenialReasons` - Hardcoded denial reasons
- **Issue:** Denial management uses mock data
- **Impact:** MEDIUM
- **Fix Required:**
  - Fetch from `claim_denials` table
  - Use `denialManagementService`

#### 19. **EnhancedClaims/AIAnalysisPanel.tsx** (`src/components/EnhancedClaims/AIAnalysisPanel.tsx`)
**Status:** ❌ Using Mock Data
- **Line 37:** Mock AI insights
- **Issue:** AI analysis uses mock data
- **Impact:** LOW
- **Fix Required:**
  - Connect to `approvalPredictionService`
  - Connect to `claimScrubbingService`

#### 20. **EnhancedClaims/LetterGenerator.tsx** (`src/components/EnhancedClaims/LetterGenerator.tsx`)
**Status:** ❌ Using Mock Data
- **Line 85-126:** Mock letter generation
- **Issue:** Letter generator uses mock template
- **Impact:** LOW
- **Fix Required:**
  - Use actual letter templates from database
  - Generate based on claim data

#### 21. **PayerRulesManagement.tsx** (`src/components/PayerRulesManagement.tsx`)
**Status:** ❌ Using Mock Data
- **Line 58:** Mock payer rules data
- **Issue:** Payer rules management uses mock data
- **Impact:** MEDIUM
- **Fix Required:**
  - Fetch from `payer_rules` table if exists
  - Or use `payerRulesService`

#### 22. **PatientBalanceBilling.tsx** (`src/components/PatientBalanceBilling.tsx`)
**Status:** ❌ Using Mock Data
- **Line 68:** Mock transaction history generation
- **Issue:** Patient balance billing uses mock transaction data
- **Impact:** MEDIUM
- **Fix Required:**
  - Fetch from `payments` table
  - Fetch from `billing_statements` table

#### 23. **ReportsAnalytics.tsx** (`src/components/ReportsAnalytics.tsx`)
**Status:** ❌ Using Mock Data
- **Line 23:** Mock data for charts
- **Issue:** Reports use mock data
- **Impact:** MEDIUM
- **Fix Required:**
  - Use `reportService` to fetch real data
  - Use `predictiveAnalyticsService` for analytics

#### 24. **analytics/EnhancedAnalyticsDashboard.tsx** (`src/components/analytics/EnhancedAnalyticsDashboard.tsx`)
**Status:** ⚠️ Partially Using Mock Data
- **Line 166, 214, 224:** Mock average days calculations
- **Line 262:** Mock previous period data for trends
- **Issue:** Some calculations use mock/placeholder data
- **Impact:** LOW - Some metrics may be inaccurate
- **Fix Required:**
  - Calculate from actual database data
  - Fetch historical data for trends

---

## 📊 Summary Statistics

### By Priority:
- **🔴 CRITICAL:** 3 components (Claims, EnhancedClaims, EnhancedClaimList)
- **🟠 HIGH:** 3 components (EnhancedClaimForm, ServiceDetailsStep, DiagnosisStep)
- **🟡 MEDIUM:** 10 components (Statements, Labels, PayerAgreements, etc.)
- **🟢 LOW:** 8 components (Demo/test components)

### By Category:
- **Claims Management:** 8 components
- **Code Lookups:** 3 components (CPT, ICD, POS codes)
- **Configuration/Templates:** 4 components
- **Authorization:** 2 components
- **Analytics/Reports:** 2 components
- **Other:** 5 components

### Total Affected: **24 components**

---

## 🔧 Recommended Fix Strategy

### Phase 1: Critical Fixes (Week 1)
1. **Claims.tsx** - Connect to `claims` table
2. **EnhancedClaims.tsx** - Connect to `claims` table
3. **EnhancedClaimList.tsx** - Connect to `claims` and `facilities` tables

### Phase 2: High Priority (Week 2)
4. **ServiceDetailsStep.tsx** - Connect to `cpt_hcpcs_codes` table
5. **DiagnosisStep.tsx** - Connect to `diagnosis_codes` table
6. **EnhancedClaimForm.tsx** - Connect to code tables

### Phase 3: Medium Priority (Week 3-4)
7. **Statements.tsx** - Connect to `statement_templates` table
8. **Labels.tsx** - Connect to `label_templates` table
9. **PayerAgreements.tsx** - Connect to `payer_agreements` table
10. **AuthorizationWorkflow.tsx** - Connect to respective tables
11. **ProviderQuickActions.tsx** - Connect to services

### Phase 4: Low Priority (Week 5+)
12. Remaining components as needed

---

## 🛠️ Implementation Notes

### Code Tables Reference
The `Codes.tsx` component already demonstrates proper database fetching:
- `cpt_hcpcs_codes` table for CPT codes
- `diagnosis_codes` table for ICD codes
- `remittance_codes`, `revenue_codes`, `adjustment_codes`, etc.

### Service Layer
Many services already exist:
- `claimSubmissionService.ts`
- `codeValidationService.ts`
- `eligibilityAuditService.ts`
- `authorizationTaskService.ts`
- `denialManagementService.ts`
- `reportService.ts`
- etc.

**Action:** Connect components to these existing services instead of using mock data.

### Database Tables Available
Based on schema analysis, these tables exist:
- ✅ `claims`, `claim_procedures`, `claim_diagnoses`
- ✅ `cpt_hcpcs_codes`, `diagnosis_codes`
- ✅ `facilities`, `providers`, `patients`, `insurance_payers`
- ✅ `authorization_requests`, `authorization_tasks`
- ✅ `billing_statements`, `statement_templates`
- ✅ `label_templates`
- ✅ `edi_transactions`
- ✅ `payments`, `payment_plans`

---

## ✅ Components Already Using Database (Good Examples)

1. **Patients.tsx** - ✅ Fetches from `patients` table
2. **Providers.tsx** - ✅ Fetches from `providers` table
3. **Payers.tsx** - ✅ Fetches from `insurance_payers` table
4. **Codes.tsx** - ✅ Fetches from all code tables
5. **Superbills.tsx** - ✅ Fetches from `superbills` table
6. **CollectionAgencies.tsx** - ✅ Fetches from `collection_agencies` table
7. **ReferringProviders.tsx** - ✅ Fetches from `referring_providers` table

**Use these as reference implementations!**

---

## 📝 Next Steps

1. **Review this document** with the development team
2. **Prioritize fixes** based on business needs
3. **Create tickets** for each component
4. **Implement fixes** following the phase strategy
5. **Test thoroughly** after each phase
6. **Update documentation** as fixes are completed

---

**Generated:** $(date)
**Last Updated:** Analysis of codebase mock data usage

