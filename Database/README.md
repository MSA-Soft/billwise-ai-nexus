# Database Files

This folder contains all database-related files for the BillWise AI Nexus project.

## 🚨 **URGENT FIXES**

### `URGENT_DATABASE_FIX.sql`
**PRIORITY: HIGH** - Run this first to fix the missing columns error!
- Fixes the `amount_discussed` column error
- Adds all missing columns to `collection_activities` table
- Creates proper RLS policies
- **Run this in your Supabase SQL Editor immediately**

## 📊 **Database Setup Files**

### `comprehensive-supabase-setup.sql`
- Complete database schema setup
- Creates all tables with proper relationships
- Includes RLS policies and indexes

### `complete-setup-fixed.sql`
- Fixed version of the complete setup
- Resolves common schema issues
- Includes proper foreign key constraints

### `complete-setup-with-user.sql`
- Setup with user authentication
- Includes user management
- Proper RLS policies for multi-user access

## 🗃️ **Sample Data Files**

### `comprehensive-dummy-data-final.sql`
- **RECOMMENDED** - Use this for sample data
- Contains diverse patient names (including Muslim names)
- Proper UUID format for all IDs
- No foreign key constraint issues

### `comprehensive-dummy-data-no-user-id.sql`
- Sample data without user_id constraints
- Good for testing without authentication
- Includes all major data types

### `comprehensive-dummy-data.sql`
- Original comprehensive sample data
- May have UUID format issues
- Use only if other files don't work

## 🔧 **Database Maintenance**

### `fix-collection-activities-schema.sql`
- Fixes collection_activities table schema
- Adds missing columns
- Creates proper constraints

### `fix-database-schema.js`
- JavaScript script to fix schema issues
- Requires Node.js and Supabase credentials
- Alternative to running SQL directly

### `fix-database.js`
- General database maintenance script
- Fixes common issues
- Updates schema as needed

## 🌱 **Data Seeding Scripts**

### `seed-database.js`
- Main seeding script
- Populates database with sample data
- Handles UUID generation

### `seed-data-direct.js`
- Direct database seeding
- Bypasses some validation
- Faster for large datasets

### `seed-data-uuid.js`
- UUID-specific seeding
- Ensures proper UUID format
- Handles foreign key relationships

## 👤 **User Management**

### `create-fresh-user.sql`
- Creates new user accounts
- Sets up authentication
- Configures user permissions

### `create-test-user.js`
- JavaScript user creation
- Automated user setup
- Testing user accounts

### `fix-user-password.sql`
- Resets user passwords
- Fixes authentication issues
- Updates user credentials

## ☁️ **Cloud Database**

### `setup-cloud-database.js`
- Sets up cloud database connection
- Configures remote Supabase instance
- Handles cloud-specific settings

### `add-sample-data-comprehensive.js`
- Adds comprehensive sample data to cloud
- Handles large datasets
- Cloud-optimized seeding

## 📋 **Usage Instructions**

1. **First Time Setup:**
   ```sql
   -- Run in Supabase SQL Editor
   \i comprehensive-supabase-setup.sql
   \i comprehensive-dummy-data-final.sql
   ```

2. **Fix Schema Issues:**
   ```sql
   -- Run if you get column errors
   \i URGENT_DATABASE_FIX.sql
   ```

3. **Add Sample Data:**
   ```sql
   -- Run to populate with test data
   \i comprehensive-dummy-data-final.sql
   ```

## ⚠️ **Important Notes**

- **Always backup your database before running setup scripts**
- **Run `URGENT_DATABASE_FIX.sql` first if you're getting column errors**
- **Use `comprehensive-dummy-data-final.sql` for sample data**
- **Test in development environment before production**

## 🔗 **Related Files**

- `../supabase/migrations/` - Supabase migration files
- `../src/integrations/supabase/` - Supabase client configuration
- `../env.example` - Environment variables template




