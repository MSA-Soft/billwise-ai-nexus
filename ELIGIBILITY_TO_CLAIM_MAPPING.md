Eligibility Verification to Claim Form Auto-Population

Industry Standard Workflow

In medical billing systems, when a user has already performed eligibility verification for a patient, that verified data should automatically populate the claim form to:
1. **Save time** - Reduce manual data entry
2. **Ensure accuracy** - Use verified insurance information
3. **Maintain consistency** - Same data across eligibility and claims
4. **Comply with regulations** - Use verified subscriber information

Data Mapping: Eligibility Verification → Claim Form

1. Patient Information
- `patient_id` → Patient selection
- `patient_name` → Patient name (display)
- `patient_dob` → Date of birth (for validation)
- `patient_gender` → Gender (if needed in claim)
- `patient_address`, `patient_city`, `patient_state`, `patient_zip` → Patient address fields
2. Subscriber Information (Insurance Holder)
- `subscriber_id` → Member ID / Subscriber ID
- `subscriber_first_name`, `subscriber_last_name` → Subscriber name fields
- `subscriber_dob` → Subscriber DOB
- `subscriber_gender` → Subscriber gender
- `subscriber_relationship` → Relationship to patient (Self, Spouse, Child, etc.)
- `subscriber_address`, `subscriber_city`, `subscriber_state`, `subscriber_zip` → Subscriber address

3. Insurance Information
- `primary_insurance_id` → Primary insurance payer selection
- `primary_insurance_name` → Primary insurance name (display)
- `insurance_id` → Member ID / Policy number
- `group_number` → Group number
- `plan_type` → Plan type
- `effective_date` → Coverage effective date
- `termination_date` → Coverage termination date
- `copay` → Copay amount
- `coinsurance` → Coinsurance percentage
- `deductible` → Deductible amount
- `in_network_status` → In-network status

4. Secondary Insurance (if applicable)
- `secondary_insurance_name` → Secondary insurance payer
- `secondary_insurance_id` → Secondary member ID
- `secondary_group_number` → Secondary group number
- `secondary_subscriber_first_name`, `secondary_subscriber_last_name` → Secondary subscriber name
- `secondary_subscriber_dob` → Secondary subscriber DOB
- `secondary_relationship_code` → Relationship code

### 5. Provider Information
- `provider_id` → Rendering provider
- `provider_name` → Provider name (display)
- `npp_id` → Non-physician practitioner (if applicable)
- `facility_id` → Facility/service location

### 6. Service Information
- `appointment_date` or `date_of_service` → Service date
- `type_of_visit` → Visit type
- `service_type` → Service type (Inpatient, Outpatient, etc.)

### 7. Procedure Codes (CPT)
- `cpt_codes` (JSONB array) → Charges/procedures section
  - Each CPT code includes: code, modifier1, modifier2, modifier3, pos, tos, units, charge, renderingNpi

### 8. Diagnosis Codes (ICD)
- `icd_codes` (JSONB array) → Diagnosis codes section
  - Each ICD code includes: code, description, type, isPrimary

### 9. Prior Authorization
- `prior_auth_number` → Prior authorization number
- `prior_auth_status` → Authorization status
- `prior_auth_effective_date` → Auth effective date
- `prior_auth_expiration_date` → Auth expiration date

### 10. Financial Information
- `patient_responsibility` → Patient responsibility amount
- `estimated_cost` → Total charges
- `allowed_amount` → Allowed amount
- `copay` → Copay due

## Implementation Strategy

### Step 1: Query Eligibility Verification
When patient is selected in claim form:
1. Query `eligibility_verifications` table
2. Filter by:
   - `patient_id` = selected patient
   - `date_of_service` = service date (or most recent if date not set)
   - `is_eligible` = true (only use verified eligible records)
   - Order by `created_at DESC` (most recent first)
   - Limit to 1 (most recent verification)

### Step 2: Auto-Populate Claim Form
If eligibility verification found:
1. Map all matching fields to claim form
2. Show user a notification: "Eligibility data found. Auto-filled from verification dated [date]"
3. Allow user to edit any auto-filled fields
4. Preserve user edits if they change anything

### Step 3: Handle Edge Cases
- Multiple verifications: Use most recent
- Partial data: Fill what's available, leave rest empty
- Date mismatch: Allow user to select which verification to use
- No verification: Form remains empty (current behavior)

## Key Considerations

1. **Data Validation**: Verify dates are still valid (coverage not expired)
2. **User Override**: Always allow manual editing of auto-filled data
3. **Audit Trail**: Log when eligibility data is used to populate claim
4. **Date Matching**: Match service date with eligibility verification date
5. **Insurance Changes**: Check if insurance info has changed since verification

