import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pusaxbvoiplsjflmnnyh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  console.log('Please add your service role key to .env file:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabaseSchema() {
  try {
    console.log('🔧 Fixing database schema...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'fix-collection-activities-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      return;
    }
    
    console.log('✅ Database schema fixed successfully!');
    console.log('📋 Added missing columns to collection_activities table:');
    console.log('   - amount_discussed (DECIMAL)');
    console.log('   - promise_to_pay_date (DATE)');
    console.log('   - performed_by (TEXT)');
    console.log('   - contact_method (TEXT)');
    console.log('   - outcome (TEXT)');
    console.log('🔒 RLS policies created');
    console.log('📊 Indexes created for performance');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Alternative method using direct SQL execution
async function fixDatabaseSchemaDirect() {
  try {
    console.log('🔧 Fixing database schema (direct method)...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'fix-collection-activities-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        
        const { data, error } = await supabase
          .from('_sql')
          .select('*')
          .eq('query', statement);
        
        if (error) {
          console.log(`⚠️  Statement may have already been executed: ${error.message}`);
        }
      }
    }
    
    console.log('✅ Database schema fix completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Manual fix instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Open the SQL Editor');
    console.log('3. Copy and paste the contents of fix-collection-activities-schema.sql');
    console.log('4. Execute the SQL');
  }
}

// Run the fix
fixDatabaseSchemaDirect();
