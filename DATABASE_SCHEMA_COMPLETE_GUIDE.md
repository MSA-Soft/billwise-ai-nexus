# Complete Database Schema Guide for Billwise AI Nexus

## Overview

This document provides a comprehensive guide to the complete database schema for the Billwise AI Nexus application. The database is designed to support all modules including patient management, claims processing, scheduling, billing, collections, and more.

## Database Files

1. **COMPLETE_SUPABASE_SCHEMA.sql** - Base schema with core tables
2. **COMPLETE_DATABASE_SCHEMA_ADDITIONS.sql** - All additional tables identified from comprehensive codebase analysis

## Complete Table List

### Core Tables (from COMPLETE_SUPABASE_SCHEMA.sql)

1. **profiles** - User profiles
2. **user_roles** - User role assignments
3. **facilities** - Appointment locations
4. **providers** - Doctors and NPPs
5. **insurance_payers** - Insurance companies
6. **collections_accounts** - Patient collection accounts
7. **collection_activities** - Collection activity logs
8. **collection_letters** - Collection letters sent
9. **settlement_offers** - Settlement offers made
10. **attorney_referrals** - Attorney referral records
11. **dispute_claims** - Dispute claim records
12. **billing_statements** - Billing statements
13. **payment_plans** - Payment plan agreements
14. **payment_installments** - Payment plan installments
15. **payment_reminders** - Payment reminder records
16. **patient_communication_preferences** - Patient communication settings
17. **authorization_requests** - Prior authorization requests
18. **authorization_events** - Authorization event logs
19. **ai_approval_suggestions** - AI approval suggestions
20. **billing_cycles** - Billing cycle configurations
21. **chat_conversations** - Chat conversation records
22. **chat_messages** - Chat messages
23. **eligibility_verifications** - Eligibility verification records
24. **audit_logs** - Audit trail
25. **collaboration_events** - Real-time collaboration events

### Additional Tables (from COMPLETE_DATABASE_SCHEMA_ADDITIONS.sql)

#### Patient Management
26. **patients** - Complete patient registration data
27. **patient_insurance** - Patient insurance information (primary and secondary)
28. **patient_medical_history** - Medical history (allergies, medications, conditions, surgeries, family history)
29. **patient_vital_signs** - Vital signs records
30. **patient_progress_notes** - SOAP progress notes
31. **patient_treatment_plans** - Treatment plans
32. **patient_documents** - Patient document uploads
33. **patient_messages** - Patient/provider messages

#### Scheduling
34. **appointments** - Appointment scheduling

#### Claims Management
35. **claims** - Main claims table
36. **claim_procedures** - CPT codes for claims
37. **claim_diagnoses** - ICD codes for claims
38. **claim_denials** - Claim denial records

#### Practice Management
39. **practices** - Practice information
40. **referring_providers** - Referring provider details
41. **payer_agreements** - Payer contract agreements
42. **collection_agencies** - Collection agency information

#### Alerts and Labels
43. **alerts** - Alert system records
44. **label_templates** - Label template configurations

#### Superbills and Statements
45. **superbills** - Superbill templates
46. **statement_templates** - Statement template configurations

#### Codes Management
47. **codes** - CPT, ICD, HCPCS, and other codes
48. **code_validations** - Code validation history

#### Payment Processing
49. **payments** - Individual payment records

#### EDI Transactions
50. **edi_transactions** - EDI transaction logs

## Key Relationships

### Patient Management Flow
```
patients
  ├── patient_insurance (1:1)
  ├── patient_medical_history (1:1)
  ├── patient_vital_signs (1:many)
  ├── patient_progress_notes (1:many)
  ├── patient_treatment_plans (1:many)
  ├── patient_documents (1:many)
  ├── patient_messages (1:many)
  ├── appointments (1:many)
  └── claims (1:many)
```

### Claims Management Flow
```
claims
  ├── claim_procedures (1:many) - CPT codes
  ├── claim_diagnoses (1:many) - ICD codes
  ├── claim_denials (1:many)
  ├── payments (1:many)
  └── edi_transactions (1:many)
```

### Collections Flow
```
collections_accounts
  ├── collection_activities (1:many)
  ├── collection_letters (1:many)
  ├── settlement_offers (1:many)
  ├── attorney_referrals (1:many)
  └── dispute_claims (1:many)
```

### Billing Flow
```
billing_statements
  ├── payment_plans (1:many)
  │   └── payment_installments (1:many)
  └── payment_reminders (1:many)
```

## Installation Instructions

### Step 1: Run Base Schema
Execute `COMPLETE_SUPABASE_SCHEMA.sql` in your Supabase SQL Editor.

### Step 2: Run Additions
Execute `COMPLETE_DATABASE_SCHEMA_ADDITIONS.sql` in your Supabase SQL Editor.

### Step 3: Verify Tables
Check that all 50 tables were created successfully.

### Step 4: Customize RLS Policies
Review and customize Row Level Security policies based on your security requirements.

### Step 5: Add Dummy Data
The scripts include some dummy data, but you may want to add more for testing.

## Important Notes

1. **Foreign Keys**: All relationships use proper foreign keys with CASCADE or SET NULL as appropriate.

2. **Indexes**: Comprehensive indexes are created for performance optimization.

3. **Triggers**: Automatic `updated_at` timestamp triggers are set up for all tables.

4. **RLS**: Row Level Security is enabled on all tables. You must customize policies based on your needs.

5. **Enums**: All status and type fields use PostgreSQL ENUMs for data integrity.

6. **JSONB Fields**: Complex data structures (arrays, nested objects) are stored as JSONB for flexibility.

## Data Types Used

- **UUID**: Primary keys and foreign keys
- **VARCHAR/TEXT**: String data
- **NUMERIC**: Financial amounts and decimal values
- **DATE/TIMESTAMP**: Date and time data
- **BOOLEAN**: True/false flags
- **JSONB**: Complex nested data structures
- **ENUM**: Predefined value sets

## Next Steps

1. **Test Relationships**: Verify all foreign key relationships work correctly
2. **Add Sample Data**: Insert comprehensive sample data for testing
3. **Configure RLS**: Set up proper Row Level Security policies
4. **Performance Tuning**: Monitor and optimize queries as needed
5. **Backup Strategy**: Set up regular database backups

## Support

For questions or issues with the database schema, refer to:
- Supabase documentation: https://supabase.com/docs
- PostgreSQL documentation: https://www.postgresql.org/docs/

