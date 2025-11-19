# Database Setup Instructions

## Quick Start

Instead of running multiple SQL files, you can now use a **single comprehensive SQL file** that contains all database tables, indexes, RLS policies, and triggers.

## Single File Setup

### Option 1: Complete Setup (Recommended)

1. Open Supabase Dashboard → SQL Editor
2. Open the file: `COMPLETE_DATABASE_SCHEMA.sql`
3. Copy the entire contents
4. Paste into Supabase SQL Editor
5. Click "Run" or press `Ctrl+Enter`
6. Wait for completion (should take 1-2 minutes)

**That's it!** All tables, indexes, RLS policies, and triggers will be created automatically.

### Option 2: Section-by-Section Setup

If you prefer to run sections individually (for debugging or partial setup):

1. Open `COMPLETE_DATABASE_SCHEMA.sql`
2. Each section is clearly marked:
   - Section 1: Notification System
   - Section 2: Workflow Automation
   - Section 3: Advanced Reporting
   - Section 4: Automated Claim Submission
   - Section 5: Denial Management
   - Section 6: Payer Relationship Management
   - Section 7: Patient Portal
   - Section 8: Enhanced Security
   - Section 9: API-First Design
   - Section 10: EHR Integration
   - Section 11: Payer API Connections
   - Section 12: Authorization Tasks
   - Section 13: Facilities

3. Copy and run each section individually

## What's Included

The `COMPLETE_DATABASE_SCHEMA.sql` file includes:

✅ **All Tables** (30+ tables)
- Notification system tables
- Workflow automation tables
- Reporting tables
- Claim management tables
- Denial management tables
- Payer relationship tables
- Patient portal tables
- Security tables (MFA, RBAC, Audit)
- API management tables
- EHR integration tables
- Payer API connection tables
- Authorization task tables
- Facilities table

✅ **All Indexes** (100+ indexes)
- Performance optimization indexes
- Foreign key indexes
- Search optimization indexes

✅ **All RLS Policies** (50+ policies)
- Row-level security for all tables
- User-specific access controls
- Admin-only access controls

✅ **All Triggers** (15+ triggers)
- Auto-update timestamps
- Data validation triggers

✅ **Default Data**
- Default roles (admin, billing_manager, billing_staff, patient)
- System configurations

## Verification

After running the script, you should see:

```
✅ Complete database schema created successfully! All tables, indexes, RLS policies, and triggers have been set up.
```

## Benefits of Single File

1. **Easier Management**: One file instead of 13+ separate files
2. **Dependency Handling**: All dependencies are automatically handled
3. **Consistency**: Ensures all tables are created in the correct order
4. **Version Control**: Single file is easier to track in Git
5. **Deployment**: Faster deployment with one script execution

## Troubleshooting

### If you get "relation already exists" errors:
- The script uses `IF NOT EXISTS` clauses, so it's safe to run multiple times
- If you need to recreate tables, drop them first or use `DROP TABLE IF EXISTS`

### If you get permission errors:
- Ensure you're running as a database admin/superuser
- Check that RLS policies are correctly configured

### If some tables are missing:
- Check the Supabase SQL Editor for error messages
- Run the specific section that failed
- Verify all dependencies are met

## Next Steps

After running the schema:

1. **Create Storage Buckets**:
   - Go to Supabase Dashboard → Storage
   - Create bucket: `patient-documents` (private)
   - Create bucket: `authorization-documents` (private)

2. **Set Up Default User**:
   - Create your first admin user
   - Assign admin role

3. **Configure Environment Variables**:
   - Update `.env.local` with your Supabase credentials

4. **Test the Application**:
   - Start the development server
   - Test authentication
   - Test basic CRUD operations

## Support

If you encounter any issues:
1. Check the Supabase SQL Editor logs
2. Verify all dependencies are met
3. Ensure you have proper permissions
4. Review the error messages for specific table issues

---

**Note**: The old individual SQL files are still available if needed, but using `COMPLETE_DATABASE_SCHEMA.sql` is recommended for easier management.

