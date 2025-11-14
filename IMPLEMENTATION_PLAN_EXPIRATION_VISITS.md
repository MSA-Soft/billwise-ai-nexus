# Implementation Plan: Authorization Expiration & Visit Management

**Status:** ✅ Ready to Implement  
**Estimated Time:** 5-8 weeks  
**Priority:** High

---

## ✅ PHASE 1: Database Foundation (COMPLETED)

### 1.1 Database Schema Updates ✅
- ✅ Created `IMPLEMENT_AUTHORIZATION_EXPIRATION_AND_VISITS.sql`
- ✅ Added expiration tracking fields to `authorization_requests`
- ✅ Created `authorization_visit_usage` table
- ✅ Added indexes for performance
- ✅ Created helper functions (calculate_visits_remaining, is_authorization_expired, etc.)
- ✅ Created triggers for auto-updates

### 1.2 Next Steps:
1. **Run SQL Script:** Execute `IMPLEMENT_AUTHORIZATION_EXPIRATION_AND_VISITS.sql` in Supabase
2. **Verify:** Check that all tables, columns, and functions are created
3. **Test:** Run test queries to ensure everything works

---

## ✅ PHASE 2: Service Layer (COMPLETED)

### 2.1 Expiration Management Service ✅
- ✅ Created `src/services/expirationManagementService.ts`
- ✅ Multi-tier alert system (90, 60, 30, 14, 7 days, expired)
- ✅ Expiration detection and tracking
- ✅ Renewal workflow initiation
- ✅ Expiration statistics

### 2.2 Visit Usage Service ✅
- ✅ Created `src/services/visitUsageService.ts`
- ✅ Visit validation before recording
- ✅ Visit recording with auto-updates
- ✅ Visit history tracking
- ✅ Exhaustion detection
- ✅ Appointment integration validation

### 2.3 Next Steps:
1. **Test Services:** Create test cases for each service method
2. **Error Handling:** Add comprehensive error handling
3. **Logging:** Add detailed logging for debugging

---

## 🔄 PHASE 3: UI Integration (IN PROGRESS)

### 3.1 Update AuthorizationTracking Component

**Changes Needed:**
1. **Replace hardcoded expiration logic** with `expirationManagementService`
2. **Add expiration alerts display** with multi-tier alerts
3. **Add visit usage dashboard** showing usage statistics
4. **Add renewal workflow UI** for initiating renewals
5. **Update expiring authorizations tab** with real data and alerts

**Implementation Steps:**
```typescript
// 1. Import services
import { expirationManagementService } from '@/services/expirationManagementService';
import { visitUsageService } from '@/services/visitUsageService';

// 2. Replace expiringAuths calculation
const [expiringAuths, setExpiringAuths] = useState<ExpiringAuthorization[]>([]);
const [expirationAlerts, setExpirationAlerts] = useState<ExpirationAlert[]>([]);

useEffect(() => {
  loadExpiringAuthorizations();
  loadExpirationAlerts();
}, []);

// 3. Add alert display component
// 4. Add visit usage display
// 5. Add renewal initiation button
```

### 3.2 Create Expiration Alerts Component

**New Component:** `src/components/ExpirationAlerts.tsx`
- Display multi-tier alerts
- Color-coded by priority
- Action buttons (Initiate Renewal, View Details)
- Alert dismissal

### 3.3 Create Visit Usage Dashboard Component

**New Component:** `src/components/VisitUsageDashboard.tsx`
- Usage statistics (authorized, used, remaining)
- Usage percentage bar
- Visit history timeline
- Exhaustion warnings

---

## 🔄 PHASE 4: Appointment Integration (PENDING)

### 4.1 Update Schedule Component

**Changes Needed:**
1. **Add authorization validation** before appointment save
2. **Auto-record visit** when appointment marked as completed
3. **Show authorization warnings** if expiring soon or exhausted
4. **Block scheduling** if authorization expired or exhausted

**Implementation:**
```typescript
// In Schedule.tsx handleAppointmentSave
import { visitUsageService } from '@/services/visitUsageService';

// Before saving appointment
if (appointmentData.status === 'completed') {
  // Validate authorization
  const validation = await visitUsageService.validateAuthorizationForAppointment(
    appointmentData.patient_id,
    new Date(appointmentData.appointment_date),
    appointmentData.procedure_code
  );
  
  if (!validation.can_proceed) {
    // Show error, don't save
    toast({
      variant: "destructive",
      title: "Authorization Issue",
      description: validation.errors.map(e => e.message).join(', ')
    });
    return;
  }
  
  // After saving, auto-record visit
  if (validation.authorization) {
    await visitUsageService.autoRecordVisitOnAppointmentCompletion(
      appointmentId,
      validation.authorization.id,
      user.id
    );
  }
}
```

### 4.2 Add Authorization Check Before Scheduling

**New Function:** Check authorization before allowing appointment creation
- Validate authorization exists
- Check expiration date
- Check visits remaining
- Show warnings if needed

---

## 📋 PHASE 5: Automated Alerts (PENDING)

### 5.1 Background Job for Expiration Alerts

**Implementation Options:**
1. **Supabase Edge Function** (Recommended)
   - Scheduled function to check expiring authorizations
   - Send alerts via email/notifications
   - Run daily

2. **Client-Side Polling**
   - Check on component mount
   - Refresh periodically
   - Less reliable but simpler

### 5.2 Alert Notification System

**Channels:**
- Dashboard alerts (in-app)
- Email notifications (future)
- SMS notifications (future)
- Task creation (already implemented)

---

## 📋 PHASE 6: Renewal Workflow (PENDING)

### 6.1 Renewal Request Form

**Enhancement to AuthorizationRequestDialog:**
- Add "Renewal" mode
- Pre-fill from original authorization
- Link to original authorization
- Track renewal status

### 6.2 Renewal Tracking

**UI Components:**
- Renewal status indicator
- Renewal timeline
- Link to original authorization
- Renewal history

---

## 🎯 IMPLEMENTATION CHECKLIST

### Database ✅
- [x] SQL migration script created
- [ ] SQL script executed in Supabase
- [ ] Tables and columns verified
- [ ] Functions tested
- [ ] Triggers tested

### Services ✅
- [x] expirationManagementService created
- [x] visitUsageService created
- [ ] Services tested
- [ ] Error handling verified
- [ ] Integration tests written

### UI Components
- [ ] AuthorizationTracking updated
- [ ] ExpirationAlerts component created
- [ ] VisitUsageDashboard component created
- [ ] Renewal workflow UI added
- [ ] Expiring tab enhanced

### Integration
- [ ] Schedule component updated
- [ ] Auto-visit recording implemented
- [ ] Authorization validation before scheduling
- [ ] Appointment completion integration

### Testing
- [ ] Unit tests for services
- [ ] Integration tests
- [ ] UI component tests
- [ ] End-to-end workflow tests

---

## 🚀 QUICK START GUIDE

### Step 1: Run Database Migration
```sql
-- Execute in Supabase SQL Editor
-- File: IMPLEMENT_AUTHORIZATION_EXPIRATION_AND_VISITS.sql
```

### Step 2: Verify Database
```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('authorization_visit_usage');

-- Check columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'authorization_requests' 
AND column_name IN ('authorization_expiration_date', 'visits_authorized', 'visits_used');

-- Test functions
SELECT calculate_visits_remaining('your-auth-id');
SELECT is_authorization_expired('your-auth-id');
```

### Step 3: Update Components
1. Import services in `AuthorizationTracking.tsx`
2. Replace hardcoded logic with service calls
3. Add expiration alerts display
4. Add visit usage display

### Step 4: Integrate with Appointments
1. Update `Schedule.tsx` to validate authorization
2. Add auto-visit recording on completion
3. Add authorization warnings

### Step 5: Test
1. Create test authorization with expiration date
2. Test expiration alerts
3. Test visit recording
4. Test exhaustion handling
5. Test appointment integration

---

## 📊 EXPECTED RESULTS

After implementation:
- ✅ **Expiration Alerts:** Multi-tier alerts (90, 60, 30, 14, 7 days, expired)
- ✅ **Visit Tracking:** Real-time visit usage tracking
- ✅ **Auto-Recording:** Visits auto-recorded on appointment completion
- ✅ **Validation:** Authorization validated before service
- ✅ **Exhaustion Handling:** Automatic exhaustion detection and alerts
- ✅ **Renewal Workflow:** Streamlined renewal process

---

## ⚠️ IMPORTANT NOTES

1. **Database Migration:** Must run SQL script first before using services
2. **Data Migration:** Existing authorizations need expiration dates set
3. **Visit Count:** Existing visit data needs to be migrated to new table
4. **Testing:** Thoroughly test before production deployment
5. **RLS Policies:** Ensure RLS policies allow access to new tables

---

## 🔄 NEXT STEPS

1. **Review SQL Script:** Verify all changes are correct
2. **Run Migration:** Execute in Supabase
3. **Update Components:** Integrate services into UI
4. **Test Thoroughly:** Test all workflows
5. **Deploy:** Deploy to production

---

**Status:** Ready for implementation  
**Files Created:**
- ✅ `IMPLEMENT_AUTHORIZATION_EXPIRATION_AND_VISITS.sql`
- ✅ `src/services/expirationManagementService.ts`
- ✅ `src/services/visitUsageService.ts`
- ✅ `IMPLEMENTATION_PLAN_EXPIRATION_VISITS.md`

**Next:** Update UI components to use these services

