# 📋 Comprehensive Research: Claim Submission Requirements

## Executive Summary

This document provides comprehensive research on mandatory requirements for healthcare claim submission, pre-submission requirements, and post-submission actions based on current industry standards and regulations (2024).

---

## Part 1: MANDATORY FIELDS FOR CLAIM SUBMISSION

### CMS-1500 Form (Professional Services) - Required Fields

#### Patient Information (MANDATORY)
1. **Field 1 - Type of Insurance Coverage**
   - Mark appropriate box (Medicare, Medicaid, Tricare, Commercial, etc.)
   - **Required:** Yes

2. **Field 1a - Insured's ID Number**
   - Enter exactly as it appears on insurance card
   - **Required:** Yes

3. **Field 2 - Patient's Name**
   - Full legal name (Last, First, Middle Initial)
   - Must match insurance card exactly
   - **Required:** Yes

4. **Field 3 - Patient's Date of Birth & Sex**
   - Format: MM/DD/YYYY
   - Mark appropriate gender box
   - **Required:** Yes

5. **Field 4 - Insured's Name**
   - If different from patient
   - **Required:** If patient is not the insured

6. **Field 5 - Patient's Address**
   - Complete address including ZIP code
   - Telephone number
   - **Required:** Yes

7. **Field 6 - Patient's Relationship to Insured**
   - Self, Spouse, Child, Other
   - **Required:** Yes

8. **Field 7 - Insured's Address**
   - If different from patient
   - **Required:** If different from patient

#### Insurance Information (MANDATORY)
9. **Field 9 - Other Insured's Information**
   - If secondary insurance exists
   - **Required:** If applicable

10. **Field 9a - Other Insured's Policy/Group Number**
    - **Required:** If secondary insurance

11. **Field 9d - Insurance Plan Name**
    - Name of secondary insurance plan
    - **Required:** If secondary insurance

12. **Field 10a-c - Condition Related To**
    - Employment, Auto Accident, Other Accident
    - **Required:** If applicable

13. **Field 11 - Insured's Policy Group or FECA Number**
    - **Required:** Yes

#### Service & Diagnosis Information (MANDATORY)
14. **Field 21 - Diagnosis Codes**
    - ICD-10 codes (up to 12 codes)
    - Must justify medical necessity
    - **Required:** Yes (at least primary diagnosis)

15. **Field 24A - Date(s) of Service**
    - Format: MM/DD/YYYY
    - **Required:** Yes

16. **Field 24B - Place of Service Code**
    - Standard POS codes (11=Office, 21=Inpatient, etc.)
    - **Required:** Yes

17. **Field 24D - Procedure/Service Code**
    - CPT or HCPCS codes
    - **Required:** Yes

18. **Field 24F - Charges**
    - Dollar amount for each service
    - **Required:** Yes

#### Provider Information (MANDATORY)
19. **Field 25 - Federal Tax ID Number**
    - Provider's TIN or SSN
    - **Required:** Yes

20. **Field 31 - Provider's Signature**
    - Provider signature and date
    - **Required:** Yes

21. **Field 32 - Service Facility Location**
    - Name and address where services rendered
    - **Required:** Yes

22. **Field 33 - Billing Provider Information**
    - Name, address, NPI, phone number
    - **Required:** Yes

---

### UB-04 Form (Institutional Services) - Required Fields

#### Patient Information
- Patient name, DOB, gender
- Patient address
- Admission date and type
- Discharge date

#### Provider Information
- Billing provider NPI
- Service facility NPI
- Tax ID number

#### Service Information
- Statement covers period (from/to dates)
- Revenue codes
- HCPCS/CPT codes
- Units of service
- Total charges

#### Diagnosis Information
- Principal diagnosis (ICD-10)
- Other diagnoses
- External cause codes (if applicable)

#### Financial Information
- Total charges
- Non-covered charges
- Patient responsibility

---

### ADA Dental Form - Required Fields

1. **Patient Information**
   - Name, DOB, gender
   - Address, phone
   - Subscriber ID

2. **Provider Information**
   - Dentist name, NPI
   - Practice address
   - Tax ID

3. **Service Information**
   - Date of service
   - Tooth numbers (if applicable)
   - ADA procedure codes
   - Surface codes
   - Fees

4. **Diagnosis Information**
   - Diagnosis codes
   - Treatment plan information

---

## Part 2: PRE-SUBMISSION REQUIREMENTS (MANDATORY)

### 1. Patient Eligibility Verification ⚠️ CRITICAL

**What to Verify:**
- ✅ **Active Coverage:** Insurance is active on date of service
- ✅ **Coverage Dates:** Effective and termination dates
- ✅ **Benefits:** Services are covered under plan
- ✅ **Copayments:** Amount patient owes
- ✅ **Deductibles:** Remaining deductible amount
- ✅ **Coinsurance:** Patient's percentage responsibility
- ✅ **Out-of-Pocket Maximum:** Remaining OOP max
- ✅ **Service Limitations:** Any restrictions on services
- ✅ **Network Status:** Provider is in-network

**How to Verify:**
- Electronic eligibility verification (X12 270/271 transaction)
- Insurance company online portal
- Phone verification
- Insurance card verification

**Why Critical:**
- Prevents claim denials due to inactive coverage
- Identifies patient financial responsibility upfront
- Reduces unexpected patient bills
- Improves cash flow

**Timeline:**
- Verify **before** rendering services (ideally 24-48 hours before)
- Re-verify if service date changes

---

### 2. Prior Authorization ⚠️ CRITICAL

**When Required:**
- Certain procedures (surgery, imaging, specialty services)
- High-cost services
- Experimental treatments
- Specific medications
- Durable Medical Equipment (DME)

**What to Obtain:**
- Authorization number
- Authorization expiration date
- Approved services list
- Approved quantity/duration
- Any limitations or restrictions

**How to Obtain:**
- Submit authorization request to payer
- Use X12 278 transaction (electronic)
- Phone authorization
- Online portal submission

**Why Critical:**
- Claims will be **denied** without authorization
- Cannot retroactively obtain authorization
- Required for payment
- Legal requirement for some services

**Timeline:**
- Request **before** rendering service
- Allow 5-14 business days for approval
- Verify authorization is still valid on service date

---

### 3. Accurate Documentation 📝

**Required Documentation:**
- ✅ **Medical Records:** Complete and legible
- ✅ **Operative Reports:** For surgical procedures
- ✅ **Test Results:** Supporting diagnostic tests
- ✅ **Progress Notes:** Detailed visit notes
- ✅ **Consultation Notes:** If referred
- ✅ **Procedure Notes:** Detailed procedure documentation

**Documentation Requirements:**
- Must support medical necessity
- Must justify services billed
- Must be contemporaneous (created at time of service)
- Must be signed by provider
- Must be available for audit

**Why Critical:**
- Required for claim approval
- Needed for audits
- Supports appeals if denied
- Legal protection

---

### 4. Correct Coding 🏷️

**ICD-10 Diagnosis Codes:**
- Must be current and valid
- Must justify medical necessity
- Must match documentation
- Primary diagnosis must be listed first
- Up to 12 diagnosis codes allowed

**CPT/HCPCS Procedure Codes:**
- Must accurately describe service
- Must be current and valid
- Must match documentation
- Appropriate modifiers if needed

**Common Coding Errors:**
- ❌ Using outdated codes
- ❌ Codes don't match documentation
- ❌ Missing primary diagnosis
- ❌ Incorrect modifiers
- ❌ Unbundling (billing separately what should be bundled)

**Why Critical:**
- Incorrect coding = claim denial
- Under-coding = lost revenue
- Over-coding = fraud risk
- Audits focus on coding accuracy

---

### 5. Claim Form Completion ✅

**Before Submission Checklist:**
- [ ] All mandatory fields completed
- [ ] Patient information matches insurance card
- [ ] Dates are correct (service date, submission date)
- [ ] Codes are current and valid
- [ ] Charges are accurate
- [ ] Provider information is correct
- [ ] Signature is present
- [ ] No blank required fields
- [ ] No typos or errors

**Claim Scrubbing:**
- Use claim editing software
- Validate codes before submission
- Check for common errors
- Verify NPI numbers
- Validate dates

---

### 6. Timely Filing Requirements ⏰

**General Rules:**
- **Medicare:** 1 year from date of service
- **Medicaid:** Varies by state (typically 12 months)
- **Commercial:** Varies by payer (typically 90-180 days)
- **New York:** 120 days (unless contract specifies otherwise)
- **California:** 12 months from date of service

**Best Practice:**
- Submit within **30 days** of service date
- Electronic claims: Submit within 24-48 hours
- Paper claims: Submit within 5-7 business days

**Why Critical:**
- Claims submitted after deadline are **denied**
- Cannot appeal timely filing denials
- Results in lost revenue
- No exceptions (except rare circumstances)

---

### 7. Electronic Submission Requirements 💻

**HIPAA Requirements:**
- Providers must submit electronically if:
  - Submit more than 10 claims per month
  - Have access to electronic submission
  - Payer accepts electronic claims

**EDI Standards:**
- Use X12 837 transaction format
- HIPAA-compliant format
- Secure transmission (HTTPS, SFTP)
- Acknowledgment required (997/999)

**Benefits:**
- Faster processing (3-5 days vs 30+ days)
- Fewer errors
- Real-time validation
- Lower costs

---

## Part 3: POST-SUBMISSION ACTIONS (MANDATORY)

### 1. Claim Tracking & Monitoring 📊

**What to Track:**
- Submission date
- Claim number/reference ID
- Payer acknowledgment (997/999)
- Processing status
- Payment date
- Denial date (if applicable)

**How to Track:**
- Payer online portal
- EDI acknowledgment reports
- Claim status inquiry (X12 276/277)
- Internal tracking system

**Timeline:**
- **Electronic Claims:**
  - Acknowledgment: Within 24 hours
  - Processing: 3-5 business days
  - Payment: 14-30 days

- **Paper Claims:**
  - Processing: 14-30 business days
  - Payment: 30-45 days

**Follow-Up Schedule:**
- Check status: 10-15 days after submission
- Follow up if no response: 20-25 days
- Escalate if needed: 30+ days

---

### 2. Remittance Advice (EOB/ERA) Review 💰

**What is Remittance Advice:**
- Explanation of Benefits (EOB) - Paper
- Electronic Remittance Advice (ERA) - Electronic
- Shows payment details, adjustments, denials

**What to Review:**
- ✅ **Payment Amount:** Matches expected payment
- ✅ **Adjustments:** Understand why amounts adjusted
- ✅ **Denials:** Identify denied services
- ✅ **Patient Responsibility:** Accurate patient balance
- ✅ **Check Number:** For reconciliation
- ✅ **Payment Date:** For posting

**Action Items:**
- Post payments to patient accounts
- Identify denials for appeal
- Calculate patient responsibility
- Reconcile with expected payment
- Document adjustments

---

### 3. Denial Management 🚫

**Common Denial Reasons:**
1. **Eligibility Issues:**
   - Coverage terminated
   - Service not covered
   - Out of network

2. **Authorization Issues:**
   - Prior authorization required
   - Authorization expired
   - Authorization not obtained

3. **Coding Issues:**
   - Invalid codes
   - Codes don't match documentation
   - Missing primary diagnosis

4. **Timely Filing:**
   - Claim submitted too late
   - Past filing deadline

5. **Duplicate Claims:**
   - Claim already submitted
   - Duplicate service

6. **Documentation:**
   - Insufficient documentation
   - Missing information

**Denial Management Process:**
1. **Identify Denial:** Review EOB/ERA
2. **Categorize:** Determine denial reason
3. **Investigate:** Review claim and documentation
4. **Correct:** Fix errors if applicable
5. **Resubmit:** Submit corrected claim
6. **Appeal:** If resubmission not appropriate
7. **Track:** Monitor appeal status
8. **Document:** Keep records of all actions

**Appeal Timeline:**
- **First Level Appeal:** 30-60 days
- **Second Level Appeal:** 30-60 days
- **External Review:** 30-60 days
- **Total Process:** 90-180 days

**Best Practices:**
- Appeal within deadline (typically 30-60 days)
- Include all supporting documentation
- Write clear, professional appeal letters
- Track all appeals
- Analyze denial patterns

---

### 4. Payment Posting 💵

**What to Post:**
- Insurance payments
- Patient payments
- Adjustments (write-offs)
- Denials

**Reconciliation:**
- Match payments to claims
- Verify payment amounts
- Post adjustments correctly
- Calculate patient balance
- Identify underpayments

**Action Items:**
- Post payments within 24-48 hours
- Reconcile daily
- Identify discrepancies
- Follow up on underpayments
- Update patient accounts

---

### 5. Patient Billing 👤

**After Insurance Payment:**
- Calculate patient responsibility
- Generate patient statement
- Send statement within 30 days
- Follow up on unpaid balances

**Patient Communication:**
- Explain EOB to patient
- Clarify patient responsibility
- Offer payment plans if needed
- Answer billing questions

**Timeline:**
- Send statement: Within 30 days of payment
- First follow-up: 30 days after statement
- Second follow-up: 60 days after statement
- Collections: 90+ days overdue

---

### 6. Record Keeping 📁

**What to Keep:**
- ✅ Copy of submitted claim
- ✅ EOB/ERA documents
- ✅ Denial letters
- ✅ Appeal documentation
- ✅ Correspondence with payer
- ✅ Payment records
- ✅ Patient statements
- ✅ Medical records

**Retention Requirements:**
- **HIPAA:** 6 years minimum
- **Medicare:** 7 years
- **State Laws:** Varies (typically 5-7 years)
- **Tax Purposes:** 7 years

**Best Practices:**
- Store electronically (secure, searchable)
- Organize by date/patient
- Backup regularly
- Easy retrieval for audits
- HIPAA-compliant storage

---

### 7. Claim Status Inquiry 🔍

**When to Inquire:**
- No acknowledgment received (electronic)
- No response after 30 days
- Payment delayed
- Status unclear

**How to Inquire:**
- X12 276/277 transaction (electronic)
- Payer online portal
- Phone inquiry
- Written inquiry

**Information Needed:**
- Claim number
- Patient information
- Date of service
- Submission date
- Provider information

---

## Part 4: BEST PRACTICES & WORKFLOW

### Pre-Submission Workflow

```
1. Schedule Appointment
   ↓
2. Verify Eligibility (24-48 hours before)
   ↓
3. Check Prior Authorization Requirements
   ↓
4. Obtain Authorization (if needed)
   ↓
5. Render Service
   ↓
6. Document Service (same day)
   ↓
7. Code Services (within 24 hours)
   ↓
8. Review Claim (before submission)
   ↓
9. Submit Claim (within 30 days)
```

### Post-Submission Workflow

```
1. Receive Acknowledgment (24 hours)
   ↓
2. Track Status (10-15 days)
   ↓
3. Receive Remittance (14-30 days)
   ↓
4. Review EOB/ERA
   ↓
5. Post Payment
   ↓
6. Handle Denials (if any)
   ↓
7. Bill Patient (if applicable)
   ↓
8. Follow Up (if needed)
```

---

## Part 5: COMMON MISTAKES TO AVOID

### Pre-Submission Mistakes ❌

1. **Not Verifying Eligibility**
   - Result: Claim denied for inactive coverage
   - Fix: Always verify before service

2. **Missing Prior Authorization**
   - Result: Claim denied, cannot appeal
   - Fix: Check authorization requirements

3. **Incorrect Patient Information**
   - Result: Claim rejected
   - Fix: Verify against insurance card

4. **Outdated Codes**
   - Result: Claim denied
   - Fix: Use current code sets

5. **Missing Documentation**
   - Result: Claim denied, audit risk
   - Fix: Document thoroughly

6. **Timely Filing Violations**
   - Result: Claim denied, no appeal
   - Fix: Submit within deadlines

### Post-Submission Mistakes ❌

1. **Not Tracking Claims**
   - Result: Lost claims, delayed payment
   - Fix: Implement tracking system

2. **Ignoring Denials**
   - Result: Lost revenue
   - Fix: Appeal all valid denials

3. **Not Posting Payments**
   - Result: Incorrect balances
   - Fix: Post within 24-48 hours

4. **Not Following Up**
   - Result: Delayed payment
   - Fix: Follow up regularly

5. **Poor Record Keeping**
   - Result: Audit issues
   - Fix: Maintain organized records

---

## Part 6: COMPLIANCE REQUIREMENTS

### HIPAA Compliance
- ✅ Secure transmission (encryption)
- ✅ Access controls
- ✅ Audit trails
- ✅ Patient privacy protection

### Medicare Requirements
- ✅ Mandatory claim submission
- ✅ Electronic submission (with exceptions)
- ✅ Timely filing (1 year)
- ✅ Accurate coding

### State Requirements
- ✅ Vary by state
- ✅ Check state-specific rules
- ✅ Timely filing limits
- ✅ Appeal deadlines

---

## Part 7: METRICS TO TRACK

### Key Performance Indicators (KPIs)

1. **Submission Metrics:**
   - Days to submit
   - Submission rate
   - Electronic submission rate

2. **Processing Metrics:**
   - Days to payment
   - First pass approval rate
   - Denial rate

3. **Financial Metrics:**
   - Collection rate
   - Days in A/R
   - Net collection rate

4. **Denial Metrics:**
   - Denial rate by reason
   - Appeal success rate
   - Days to appeal

---

## Summary: Critical Requirements Checklist

### Before Submission ✅
- [ ] Patient eligibility verified
- [ ] Prior authorization obtained (if required)
- [ ] Documentation complete
- [ ] Codes accurate and current
- [ ] Claim form complete
- [ ] All required fields filled
- [ ] Information matches insurance card
- [ ] Within timely filing deadline

### During Submission ✅
- [ ] Electronic submission (if possible)
- [ ] HIPAA-compliant format
- [ ] Acknowledgment received
- [ ] Claim number recorded

### After Submission ✅
- [ ] Claim tracked
- [ ] Status monitored
- [ ] Remittance reviewed
- [ ] Payments posted
- [ ] Denials addressed
- [ ] Patient billed
- [ ] Records maintained

---

## References & Sources

1. CMS.gov - Medicare Claim Submission Requirements
2. Security Health - CMS-1500 Instructions
3. HealthNet California - Claims Submission Requirements
4. AMBCI - Medical Claims Submission Process
5. Various State Insurance Departments
6. HIPAA Regulations
7. Industry Best Practices (2024)

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Status:** Comprehensive Research Complete

