# Authorization Expiration & Visit Usage Management - Professional Research

**Research Date:** 2025-01-XX  
**Focus Areas:** Expiring/Expired Authorization Management & Visit Usage Tracking  
**Industry Standards:** Healthcare RCM Best Practices

---

## Executive Summary

This document provides comprehensive research on how professional healthcare systems manage:
1. **Expiring and Expired Authorizations** - Proactive monitoring, alerts, renewal workflows
2. **Visit Usage Management** - Tracking visits against authorizations, validation, exhaustion handling

**Key Finding:** Real systems use **multi-tiered alert systems**, **automated renewal workflows**, and **real-time visit tracking** with validation at every step.

---

## 1. EXPIRING AUTHORIZATION MANAGEMENT

### 1.1 Proactive Monitoring & Alert System

**Industry Standard: Multi-Tier Alert System**

Real authorization systems implement **progressive alerting** at multiple intervals:

#### Alert Tiers (Industry Best Practice):

1. **90 Days Before Expiration** (Early Warning)
   - **Purpose:** Long-term planning
   - **Action:** Review patient treatment plan
   - **Recipient:** Care coordinator, provider
   - **Notification Type:** Dashboard alert, email

2. **60 Days Before Expiration** (Planning Phase)
   - **Purpose:** Begin renewal preparation
   - **Action:** Gather renewal documentation
   - **Recipient:** Authorization staff, provider
   - **Notification Type:** Dashboard alert, email, task creation

3. **30 Days Before Expiration** (Action Required)
   - **Purpose:** Critical renewal window
   - **Action:** Submit renewal request
   - **Recipient:** Authorization staff, provider, patient (optional)
   - **Notification Type:** Dashboard alert, email, SMS, task with high priority

4. **14 Days Before Expiration** (Urgent)
   - **Purpose:** Escalation if not renewed
   - **Action:** Expedited renewal or alternative plan
   - **Recipient:** Authorization manager, provider, patient
   - **Notification Type:** Urgent alert, phone call, escalated task

5. **7 Days Before Expiration** (Critical)
   - **Purpose:** Final warning
   - **Action:** Emergency renewal or reschedule services
   - **Recipient:** All stakeholders
   - **Notification Type:** Critical alert, multiple channels

6. **On Expiration Date** (Expired)
   - **Purpose:** Block services, require new authorization
   - **Action:** Prevent service delivery, create new auth request
   - **Recipient:** All stakeholders
   - **Notification Type:** System block, alert, task creation

#### Implementation Requirements:

```typescript
// Alert Configuration
interface ExpirationAlertConfig {
  days_before: number;  // 90, 60, 30, 14, 7, 0
  alert_type: 'info' | 'warning' | 'urgent' | 'critical';
  notification_channels: ('dashboard' | 'email' | 'sms' | 'task')[];
  recipients: ('staff' | 'provider' | 'patient')[];
  auto_action?: 'create_task' | 'send_email' | 'block_service';
}
```

**Database Fields Needed:**
- `expiration_date` (DATE) - When authorization expires
- `last_alert_sent_at` (TIMESTAMP) - Track last alert
- `alert_tier_completed` (JSONB) - Track which tiers have been sent
- `renewal_initiated` (BOOLEAN) - Whether renewal has been started
- `renewal_request_date` (DATE) - When renewal was requested

---

### 1.2 Renewal Workflow Management

**Industry Standard: Automated Renewal Process**

#### Renewal Workflow Steps:

1. **Detection Phase**
   - System identifies authorization expiring within threshold
   - Checks if renewal already initiated
   - Validates patient still needs service

2. **Preparation Phase**
   - Gather required documentation
   - Check if clinical status changed
   - Verify payer requirements haven't changed
   - Pre-fill renewal form with existing data

3. **Submission Phase**
   - Submit renewal request to payer
   - Track submission method (X12 278, portal, fax)
   - Get confirmation number
   - Set expected response date

4. **Tracking Phase**
   - Monitor renewal status
   - Follow up if response delayed
   - Handle additional info requests
   - Track until approved/denied

5. **Completion Phase**
   - Receive new authorization number
   - Update expiration date
   - Link to original authorization (for history)
   - Notify all stakeholders

#### Renewal Types:

**Type 1: Simple Renewal (Same Service)**
- Same CPT codes
- Same diagnosis
- Same frequency
- **Process:** Pre-fill form, minimal changes needed

**Type 2: Modified Renewal (Changed Service)**
- Different CPT codes
- Updated diagnosis
- Changed frequency
- **Process:** Requires new clinical justification

**Type 3: Continuation Renewal (Ongoing Treatment)**
- Part of treatment plan
- Multiple renewals expected
- **Process:** Streamlined workflow, auto-renewal possible

#### Database Schema for Renewals:

```sql
-- Renewal tracking
ALTER TABLE authorization_requests ADD COLUMN IF NOT EXISTS:
  renewal_of_authorization_id UUID REFERENCES authorization_requests(id),
  renewal_initiated_at TIMESTAMP,
  renewal_submitted_at TIMESTAMP,
  renewal_status VARCHAR(50), -- 'not_started', 'preparing', 'submitted', 'approved', 'denied'
  renewal_expected_response_date DATE,
  renewal_actual_response_date DATE,
  renewal_auth_number VARCHAR(100);
```

---

### 1.3 Expired Authorization Handling

**Industry Standard: Multi-Level Response**

#### When Authorization Expires:

**Level 1: Immediate Actions (Day 0)**
- ✅ **Block Service Delivery:** Prevent scheduling new services
- ✅ **Alert All Stakeholders:** Notify provider, patient, staff
- ✅ **Create Urgent Task:** High-priority task for new authorization
- ✅ **Update Status:** Change status to "Expired"
- ✅ **Log Event:** Audit trail of expiration

**Level 2: Service Impact (Days 1-7)**
- ⚠️ **Pending Services:** Review scheduled services
- ⚠️ **Reschedule if Needed:** Move appointments if no authorization
- ⚠️ **Emergency Authorization:** Expedited request if urgent
- ⚠️ **Patient Communication:** Explain impact and next steps

**Level 3: Recovery (Days 8-30)**
- 🔄 **New Authorization:** Submit new request
- 🔄 **Appeal if Needed:** If renewal was denied
- 🔄 **Alternative Options:** Explore other treatment options
- 🔄 **Documentation:** Document why service was delayed

#### Expired Authorization Statuses:

```
[Active] → [Expiring Soon (30 days)] → [Expiring Soon (14 days)] → 
[Expiring Soon (7 days)] → [EXPIRED] → [Renewal Requested] → [New Authorization]
```

#### Database Fields for Expired Handling:

```sql
-- Expiration tracking
ALTER TABLE authorization_requests ADD COLUMN IF NOT EXISTS:
  expired_at TIMESTAMP,
  expiration_handled BOOLEAN DEFAULT false,
  expiration_action VARCHAR(50), -- 'renewal_requested', 'new_auth_created', 'service_cancelled'
  expiration_impact_notes TEXT,
  services_blocked_count INTEGER;
```

---

### 1.4 Automated Renewal Triggers

**Industry Best Practice: Smart Renewal Detection**

#### Trigger Conditions:

1. **Appointment Scheduled Beyond Expiration**
   - Patient has appointment after expiration date
   - **Action:** Auto-create renewal task
   - **Priority:** High (based on appointment date)

2. **Treatment Plan Continuation**
   - Patient has ongoing treatment plan
   - **Action:** Auto-initiate renewal 60 days before
   - **Priority:** Medium

3. **Visit Usage Pattern**
   - Patient using visits regularly
   - Will exhaust visits before expiration
   - **Action:** Auto-renewal or new authorization
   - **Priority:** Medium

4. **Provider Request**
   - Provider indicates need for continuation
   - **Action:** Manual renewal trigger
   - **Priority:** Based on urgency

#### Implementation Logic:

```typescript
// Renewal trigger logic
function checkRenewalNeeded(authorization: Authorization): RenewalAction {
  const daysUntilExpiry = calculateDaysUntilExpiry(authorization.expiration_date);
  const hasFutureAppointments = checkFutureAppointments(authorization.patient_id);
  const visitsRemaining = authorization.visits.authorized - authorization.visits.used;
  
  // Trigger conditions
  if (daysUntilExpiry <= 30 && hasFutureAppointments) {
    return { action: 'create_renewal_task', priority: 'high' };
  }
  
  if (daysUntilExpiry <= 60 && visitsRemaining > 0) {
    return { action: 'prepare_renewal', priority: 'medium' };
  }
  
  if (visitsRemaining <= 2 && daysUntilExpiry > 30) {
    return { action: 'consider_new_auth', priority: 'medium' };
  }
  
  return { action: 'monitor', priority: 'low' };
}
```

---

## 2. VISIT USAGE MANAGEMENT

### 2.1 Visit Tracking Architecture

**Industry Standard: Real-Time Visit Tracking**

#### Visit Tracking Components:

1. **Visit Count Tracking**
   - **Authorized Visits:** Number approved by payer
   - **Used Visits:** Number actually used
   - **Remaining Visits:** Calculated (Authorized - Used)
   - **Exhausted Status:** Boolean flag when used >= authorized

2. **Visit Validation**
   - **Before Service:** Check authorization valid
   - **Check Expiration:** Verify not expired
   - **Check Remaining:** Verify visits available
   - **Check Service Match:** Verify service matches authorization

3. **Visit Recording**
   - **Service Date:** When visit occurred
   - **Service Type:** What was provided
   - **CPT Codes:** Procedure codes used
   - **Provider:** Who provided service
   - **Link to Appointment:** Connect to appointment record

#### Database Schema for Visit Tracking:

```sql
-- Visit usage tracking table
CREATE TABLE IF NOT EXISTS authorization_visit_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    authorization_request_id UUID NOT NULL REFERENCES authorization_requests(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    visit_date DATE NOT NULL,
    service_type VARCHAR(100),
    cpt_codes TEXT[],
    provider_id UUID REFERENCES providers(id),
    visit_number INTEGER, -- 1, 2, 3... (sequential)
    status VARCHAR(50) DEFAULT 'completed', -- 'scheduled', 'completed', 'cancelled', 'no_show'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Update authorization_requests table
ALTER TABLE authorization_requests ADD COLUMN IF NOT EXISTS:
  visits_authorized INTEGER DEFAULT 0,
  visits_used INTEGER DEFAULT 0,
  visits_remaining INTEGER GENERATED ALWAYS AS (visits_authorized - visits_used) STORED,
  last_visit_date DATE,
  first_visit_date DATE;
```

---

### 2.2 Visit Usage Validation

**Industry Standard: Multi-Level Validation**

#### Validation Levels:

**Level 1: Pre-Service Validation (Before Appointment)**
- ✅ Authorization exists and is approved
- ✅ Authorization not expired
- ✅ Visits remaining > 0
- ✅ Service matches authorization
- ✅ Provider authorized
- ✅ Date within authorization period

**Level 2: At-Service Validation (During Visit)**
- ✅ Re-verify authorization still valid
- ✅ Confirm visit count available
- ✅ Record visit details
- ✅ Link visit to authorization

**Level 3: Post-Service Validation (After Visit)**
- ✅ Increment visit count
- ✅ Update authorization status if exhausted
- ✅ Create next visit task if needed
- ✅ Update last visit date

#### Validation Logic:

```typescript
interface VisitValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  can_proceed: boolean;
}

function validateVisitUsage(
  authorization: Authorization,
  serviceDate: Date,
  cptCode: string
): VisitValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Check expiration
  if (new Date(authorization.expiration_date) < serviceDate) {
    errors.push({
      code: 'AUTH_EXPIRED',
      message: 'Authorization expired before service date',
      severity: 'error'
    });
  }
  
  // Check visits remaining
  if (authorization.visits.used >= authorization.visits.authorized) {
    errors.push({
      code: 'VISITS_EXHAUSTED',
      message: 'All authorized visits have been used',
      severity: 'error'
    });
  }
  
  // Check service match
  if (!authorization.procedure_codes.includes(cptCode)) {
    warnings.push({
      code: 'SERVICE_MISMATCH',
      message: 'Service code does not match authorization',
      severity: 'warning'
    });
  }
  
  // Check date range
  if (serviceDate < new Date(authorization.service_start_date) || 
      serviceDate > new Date(authorization.service_end_date)) {
    errors.push({
      code: 'DATE_OUT_OF_RANGE',
      message: 'Service date outside authorization period',
      severity: 'error'
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    can_proceed: errors.length === 0
  };
}
```

---

### 2.3 Visit Recording & Tracking

**Industry Standard: Automatic Visit Recording**

#### When to Record Visits:

1. **Appointment Completed**
   - Status changes to "completed"
   - **Action:** Auto-record visit usage
   - **Validation:** Check authorization before recording

2. **Service Provided**
   - Provider marks service as delivered
   - **Action:** Record visit with service details
   - **Validation:** Verify authorization and visit count

3. **Manual Recording**
   - Staff manually records visit
   - **Action:** Record with validation
   - **Use Case:** Retroactive recording, corrections

#### Visit Recording Process:

```typescript
async function recordVisitUsage(
  authorizationId: string,
  appointmentId: string,
  visitDate: Date,
  serviceDetails: ServiceDetails
): Promise<VisitUsageRecord> {
  // 1. Get authorization
  const auth = await getAuthorization(authorizationId);
  
  // 2. Validate
  const validation = validateVisitUsage(auth, visitDate, serviceDetails.cptCode);
  if (!validation.can_proceed) {
    throw new Error(`Visit validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
  }
  
  // 3. Record visit
  const visitRecord = await createVisitRecord({
    authorization_request_id: authorizationId,
    appointment_id: appointmentId,
    visit_date: visitDate,
    service_type: serviceDetails.serviceType,
    cpt_codes: serviceDetails.cptCodes,
    provider_id: serviceDetails.providerId,
    visit_number: auth.visits.used + 1,
    status: 'completed'
  });
  
  // 4. Update authorization
  await updateAuthorization(authorizationId, {
    visits_used: auth.visits.used + 1,
    last_visit_date: visitDate,
    status: (auth.visits.used + 1 >= auth.visits.authorized) ? 'exhausted' : auth.status
  });
  
  // 5. Create audit event
  await createAuthorizationEvent(authorizationId, {
    event_type: 'visit_recorded',
    visit_number: visitRecord.visit_number,
    visit_date: visitDate
  });
  
  // 6. Check if exhausted - create renewal task
  if (auth.visits.used + 1 >= auth.visits.authorized) {
    await createRenewalTask(authorizationId, 'visits_exhausted');
  }
  
  return visitRecord;
}
```

---

### 2.4 Exhausted Visit Handling

**Industry Standard: Proactive Exhaustion Management**

#### When Visits Are Exhausted:

**Immediate Actions:**
- ✅ **Update Status:** Change to "Exhausted"
- ✅ **Block Further Usage:** Prevent additional visit recording
- ✅ **Alert Stakeholders:** Notify provider, patient, staff
- ✅ **Create Renewal Task:** High-priority task for new authorization
- ✅ **Review Treatment Plan:** Assess if more visits needed

**Workflow Options:**

1. **Renewal Path** (If More Visits Needed)
   - Create new authorization request
   - Link to original authorization
   - Expedite if urgent
   - Track until approved

2. **Treatment Completion Path** (If Treatment Complete)
   - Mark authorization as "completed"
   - Close out treatment plan
   - Document completion
   - Archive authorization

3. **Appeal Path** (If Denied)
   - Submit appeal for additional visits
   - Provide clinical justification
   - Track appeal status

#### Exhaustion Detection:

```typescript
function checkVisitExhaustion(authorization: Authorization): ExhaustionStatus {
  const remaining = authorization.visits.authorized - authorization.visits.used;
  
  if (remaining <= 0) {
    return {
      exhausted: true,
      action: 'block_usage',
      priority: 'high',
      next_steps: ['create_renewal_task', 'notify_provider', 'notify_patient']
    };
  }
  
  if (remaining === 1) {
    return {
      exhausted: false,
      warning: true,
      action: 'prepare_renewal',
      priority: 'medium',
      next_steps: ['create_renewal_task', 'alert_staff']
    };
  }
  
  if (remaining <= 3) {
    return {
      exhausted: false,
      warning: true,
      action: 'monitor',
      priority: 'low',
      next_steps: ['track_usage']
    };
  }
  
  return {
    exhausted: false,
    warning: false,
    action: 'normal',
    priority: 'low'
  };
}
```

---

### 2.5 Visit-to-Authorization Linking

**Industry Standard: Bidirectional Linking**

#### Linking Requirements:

1. **Authorization → Visits**
   - View all visits for an authorization
   - Track visit history
   - Calculate usage statistics
   - Identify patterns

2. **Visit → Authorization**
   - Link visit to authorization number
   - Validate visit against authorization
   - Include auth number in claim
   - Audit trail

3. **Appointment → Authorization**
   - Check authorization before scheduling
   - Validate at appointment time
   - Auto-record visit on completion
   - Link appointment to authorization

#### Database Relationships:

```sql
-- Authorization has many visits
authorization_requests (1) ←→ (many) authorization_visit_usage

-- Visit belongs to authorization and appointment
authorization_visit_usage:
  - authorization_request_id (FK)
  - appointment_id (FK, nullable)

-- Appointment can have authorization
appointments:
  - authorization_request_id (FK, nullable)
```

---

## 3. INTEGRATION WITH APPOINTMENT SYSTEM

### 3.1 Pre-Appointment Authorization Check

**Industry Standard: Validation Before Scheduling**

#### Check Process:

1. **Before Scheduling**
   - Check if service requires authorization
   - Verify authorization exists and is approved
   - Check expiration date
   - Verify visits remaining
   - **Action:** Block scheduling if invalid

2. **At Appointment Time**
   - Re-verify authorization still valid
   - Check visits remaining
   - **Action:** Warn if expiring soon, block if expired

3. **After Appointment**
   - Auto-record visit usage
   - Update authorization visit count
   - Check if exhausted
   - Create next visit task if needed

#### Implementation:

```typescript
async function validateAuthorizationForAppointment(
  patientId: string,
  serviceDate: Date,
  cptCode: string
): Promise<AuthorizationValidation> {
  // Find active authorization for patient
  const auth = await findActiveAuthorization(patientId, cptCode, serviceDate);
  
  if (!auth) {
    return {
      valid: false,
      error: 'NO_AUTHORIZATION',
      message: 'No active authorization found for this service',
      action: 'require_authorization'
    };
  }
  
  // Check expiration
  if (new Date(auth.expiration_date) < serviceDate) {
    return {
      valid: false,
      error: 'AUTHORIZATION_EXPIRED',
      message: `Authorization expired on ${auth.expiration_date}`,
      action: 'require_renewal'
    };
  }
  
  // Check visits
  if (auth.visits.used >= auth.visits.authorized) {
    return {
      valid: false,
      error: 'VISITS_EXHAUSTED',
      message: 'All authorized visits have been used',
      action: 'require_renewal'
    };
  }
  
  // Check service match
  if (!auth.procedure_codes.includes(cptCode)) {
    return {
      valid: false,
      error: 'SERVICE_MISMATCH',
      message: 'Service code does not match authorization',
      action: 'verify_service'
    };
  }
  
  return {
    valid: true,
    authorization: auth,
    visits_remaining: auth.visits.authorized - auth.visits.used,
    days_until_expiry: calculateDaysUntil(auth.expiration_date)
  };
}
```

---

### 3.2 Automatic Visit Recording on Appointment Completion

**Industry Standard: Seamless Integration**

#### Auto-Recording Logic:

```typescript
// In appointment completion handler
async function handleAppointmentCompletion(appointmentId: string) {
  const appointment = await getAppointment(appointmentId);
  
  // Check if linked to authorization
  if (appointment.authorization_request_id) {
    // Auto-record visit
    await recordVisitUsage({
      authorizationId: appointment.authorization_request_id,
      appointmentId: appointment.id,
      visitDate: appointment.appointment_date,
      serviceDetails: {
        cptCode: appointment.procedure_code,
        serviceType: appointment.service_type,
        providerId: appointment.provider_id
      }
    });
    
    // Check if exhausted
    const auth = await getAuthorization(appointment.authorization_request_id);
    if (auth.visits.used >= auth.visits.authorized) {
      // Create renewal task
      await createRenewalTask(auth.id, 'visits_exhausted');
    }
  }
  
  // Create next visit task (existing functionality)
  await createNextVisitTask(...);
}
```

---

## 4. DASHBOARD & REPORTING

### 4.1 Expiration Dashboard

**Industry Standard: Visual Expiration Management**

#### Dashboard Components:

1. **Expiration Timeline View**
   - Visual timeline of expiring authorizations
   - Color-coded by urgency (green/yellow/orange/red)
   - Grouped by days until expiration

2. **Alert Summary**
   - Count of authorizations in each alert tier
   - Pending renewals
   - Expired authorizations

3. **Action Required List**
   - Authorizations needing immediate attention
   - Sorted by priority
   - Quick action buttons

4. **Renewal Status**
   - Renewals in progress
   - Renewal success rate
   - Average renewal time

#### Metrics to Track:

- **Expiring This Week:** Count
- **Expiring This Month:** Count
- **Expired:** Count
- **Renewals Pending:** Count
- **Renewal Success Rate:** Percentage
- **Average Days to Renewal:** Number

---

### 4.2 Visit Usage Dashboard

**Industry Standard: Usage Analytics**

#### Dashboard Components:

1. **Usage Overview**
   - Total authorized visits
   - Total used visits
   - Total remaining visits
   - Usage percentage

2. **Exhaustion Alerts**
   - Authorizations with < 3 visits remaining
   - Exhausted authorizations
   - Renewal needs

3. **Visit History**
   - Timeline of visits
   - Visit details
   - Service provided
   - Provider information

4. **Usage Patterns**
   - Visits per week/month
   - Average visits per authorization
   - Exhaustion rate
   - Renewal frequency

---

## 5. IMPLEMENTATION RECOMMENDATIONS

### 5.1 Database Enhancements Needed

```sql
-- Add expiration tracking fields
ALTER TABLE authorization_requests ADD COLUMN IF NOT EXISTS:
  authorization_expiration_date DATE,
  expiration_alert_sent_tiers JSONB DEFAULT '[]'::jsonb,
  renewal_initiated BOOLEAN DEFAULT false,
  renewal_of_authorization_id UUID REFERENCES authorization_requests(id),
  expired_at TIMESTAMP,
  expiration_handled BOOLEAN DEFAULT false;

-- Add visit tracking fields
ALTER TABLE authorization_requests ADD COLUMN IF NOT EXISTS:
  visits_authorized INTEGER DEFAULT 0,
  visits_used INTEGER DEFAULT 0,
  visits_remaining INTEGER GENERATED ALWAYS AS (visits_authorized - visits_used) STORED,
  last_visit_date DATE,
  first_visit_date DATE,
  exhausted_at TIMESTAMP;

-- Create visit usage table
CREATE TABLE IF NOT EXISTS authorization_visit_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    authorization_request_id UUID NOT NULL REFERENCES authorization_requests(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    visit_date DATE NOT NULL,
    service_type VARCHAR(100),
    cpt_codes TEXT[],
    provider_id UUID REFERENCES providers(id),
    visit_number INTEGER,
    status VARCHAR(50) DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_auth_visit_usage_auth_id ON authorization_visit_usage(authorization_request_id);
CREATE INDEX IF NOT EXISTS idx_auth_visit_usage_appt_id ON authorization_visit_usage(appointment_id);
CREATE INDEX IF NOT EXISTS idx_auth_visit_usage_date ON authorization_visit_usage(visit_date);
CREATE INDEX IF NOT EXISTS idx_auth_requests_expiration ON authorization_requests(authorization_expiration_date);
```

---

### 5.2 Service Layer Functions Needed

1. **Expiration Management Service**
   - `checkExpiringAuthorizations(days: number)`
   - `sendExpirationAlert(authorizationId, tier)`
   - `initiateRenewal(authorizationId)`
   - `handleExpiredAuthorization(authorizationId)`

2. **Visit Usage Service**
   - `validateVisitUsage(authorizationId, serviceDate, cptCode)`
   - `recordVisitUsage(authorizationId, visitDetails)`
   - `checkVisitExhaustion(authorizationId)`
   - `getVisitHistory(authorizationId)`

3. **Integration Service**
   - `validateAuthorizationForAppointment(patientId, serviceDate, cptCode)`
   - `linkAppointmentToAuthorization(appointmentId, authorizationId)`
   - `autoRecordVisitOnAppointmentCompletion(appointmentId)`

---

### 5.3 UI Components Needed

1. **Expiration Management Dashboard**
   - Expiration timeline view
   - Alert summary cards
   - Action required list
   - Renewal workflow UI

2. **Visit Usage Dashboard**
   - Usage overview
   - Visit history timeline
   - Exhaustion alerts
   - Usage analytics

3. **Integration Components**
   - Authorization check before scheduling
   - Visit recording dialog
   - Exhaustion warning alerts
   - Renewal initiation UI

---

## 6. BEST PRACTICES SUMMARY

### 6.1 Expiration Management

✅ **DO:**
- Set up multi-tier alerts (90, 60, 30, 14, 7 days)
- Automate renewal workflow
- Track renewal status
- Block services when expired
- Create tasks for expired authorizations

❌ **DON'T:**
- Wait until expiration to act
- Ignore early warning alerts
- Allow services with expired authorization
- Forget to notify stakeholders

### 6.2 Visit Usage Management

✅ **DO:**
- Validate before every service
- Record visits automatically
- Track visit history
- Alert when visits low
- Block usage when exhausted

❌ **DON'T:**
- Allow visits without validation
- Record visits manually only
- Ignore exhaustion warnings
- Allow over-usage
- Forget to link visits to appointments

---

## 7. CONCLUSION

**Key Takeaways:**

1. **Expiration Management:** Requires proactive multi-tier alerting system with automated renewal workflows
2. **Visit Usage:** Requires real-time tracking with validation at every step and automatic recording
3. **Integration:** Must seamlessly integrate with appointment system for validation and auto-recording
4. **Automation:** Critical to automate alerts, renewals, and visit recording to reduce errors

**Implementation Priority:**
1. **High:** Expiration alerts, visit validation, visit recording
2. **Medium:** Renewal workflow, exhaustion handling, dashboard
3. **Low:** Advanced analytics, predictive renewal

**Estimated Development Time:**
- **Expiration Management:** 2-3 weeks
- **Visit Usage Management:** 2-3 weeks
- **Integration:** 1-2 weeks
- **Total:** 5-8 weeks

---

**Research Status:** ✅ Complete  
**Ready for Implementation:** ✅ Yes  
**Next Steps:** Database schema updates, service layer implementation, UI components

