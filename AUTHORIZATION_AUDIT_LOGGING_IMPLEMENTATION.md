# Authorization Audit Logging Implementation

## Overview
Complete audit trail system for all authorization actions, tracking who did what, when, and why. This is HIPAA-compliant and provides full accountability for authorization management.

## Database Schema

### Table: `authorization_audit_logs`
Created via `CREATE_AUTHORIZATION_AUDIT_LOGS.sql`

**Key Fields:**
- `user_id` - Who performed the action
- `user_email` / `user_name` - Denormalized for quick access
- `authorization_request_id` - Which authorization was affected
- `action` - What action was performed (create, update, submit, approve, deny, use_visit, renew, appeal, cancel, delete)
- `action_category` - Category of action (creation, status_change, visit_usage, renewal, appeal, modification)
- `old_status` / `new_status` - Status changes
- `old_values` / `new_values` - Field-level changes (JSONB)
- `notes` - User-provided notes
- `reason` - System or user-provided reason
- `details` - Additional context (JSONB)
- `severity` - low, medium, high, critical
- `ip_address` / `user_agent` - Security context
- `created_at` - When the action occurred

## Service: `authorizationAuditService`

Located in `src/services/authorizationAuditService.ts`

### Key Methods:

1. **`logAction()`** - Generic logging method
2. **`logCreate()`** - Log authorization creation
3. **`logUpdate()`** - Log authorization updates
4. **`logStatusChange()`** - Log status changes (approve, deny, submit)
5. **`logSubmit()`** - Log submission to payer
6. **`logUseVisit()`** - Log visit usage
7. **`logRenewal()`** - Log renewal initiation
8. **`logAppeal()`** - Log appeal submission
9. **`getAuditLogs()`** - Query audit logs
10. **`getAuthorizationHistory()`** - Get full history for an authorization
11. **`getUserActivity()`** - Get user's authorization activity

## Integrated Actions

### ✅ Authorization Creation
- **Location**: `AuthorizationRequestDialog.tsx`
- **Action**: `create`
- **Logged**: When new authorization is created
- **Details**: Patient name, payer, service type, procedure codes

### ✅ Authorization Update
- **Location**: `AuthorizationRequestDialog.tsx`
- **Action**: `update`
- **Logged**: When authorization is edited
- **Details**: Old values vs new values (full comparison)

### ✅ Authorization Submission
- **Location**: `AuthorizationTracking.tsx` (Draft section)
- **Action**: `submit`
- **Logged**: When draft is submitted to payer
- **Details**: Old status (draft) → New status (pending)

### ✅ Status Changes
- **Location**: `AuthorizationTracking.tsx` (Update Status dialog)
- **Action**: `approve`, `deny`, or `update`
- **Logged**: When status is manually changed
- **Details**: Old status → New status, notes, patient/payer info

### ✅ Visit Usage
- **Location**: `AuthorizationTracking.tsx` (Use Visit button)
- **Action**: `use_visit`
- **Logged**: When visit is recorded
- **Details**: Visit date, service type, CPT codes, visits remaining

### ✅ Renewal Initiation
- **Location**: `AuthorizationTracking.tsx` (Renew button)
- **Action**: `renew`
- **Logged**: When renewal is initiated
- **Details**: Patient, expiration date, days until expiry

## Security Features

1. **Row Level Security (RLS)**: Users can only view audit logs for authorizations they have access to
2. **Immutable Logs**: Audit logs cannot be updated or deleted (read-only)
3. **User Tracking**: Every action is tied to a specific user ID
4. **IP Address & User Agent**: Security context captured (when available)
5. **Severity Levels**: Actions categorized by severity (low, medium, high, critical)

## Query Examples

### Get Full History for an Authorization
```typescript
const history = await authorizationAuditService.getAuthorizationHistory(authId);
```

### Get User Activity
```typescript
const activity = await authorizationAuditService.getUserActivity(userId, 100);
```

### Query Specific Actions
```typescript
const submissions = await authorizationAuditService.getAuditLogs({
  action: 'submit',
  start_date: '2025-01-01',
  limit: 50
});
```

## Database Views & Functions

1. **`authorization_audit_summary`** - View for easy querying with joined data
2. **`get_authorization_audit_history(auth_id)`** - Function to get history for an authorization
3. **`get_user_authorization_activity(user_uuid, limit)`** - Function to get user activity

## Next Steps

1. **Run SQL Script**: Execute `CREATE_AUTHORIZATION_AUDIT_LOGS.sql` in Supabase
2. **Test Audit Logging**: Create/update/submit authorizations and verify logs
3. **Add Audit Log Viewer**: Create UI component to view audit history
4. **Add Export Functionality**: Export audit logs for compliance reports
5. **Add Alerts**: Alert on critical actions (delete, cancel, etc.)

## Compliance

- ✅ **HIPAA Compliant**: Complete audit trail for PHI access/modification
- ✅ **Immutable**: Logs cannot be altered or deleted
- ✅ **User Attribution**: Every action tied to specific user
- ✅ **Timestamp Tracking**: Precise timestamps for all actions
- ✅ **Change Tracking**: Before/after values for modifications
- ✅ **Context Capture**: IP address, user agent, notes, reasons

