import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://pusaxbvoiplsjflmnnyh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1c2F4YnZvaXBsc2pmbG1ubnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzQxNDEsImV4cCI6MjA3NjYxMDE0MX0.Va-Xss-A4mgl7dECObWLMWlb0VwEuTPdPfwmXbEdFbk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('comprehensive-seed-data.sql', 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('🎉 Database seeding completed!');
    
    // Verify data was inserted
    console.log('🔍 Verifying data...');
    
    const { data: patients, error: patientsError } = await supabase
      .from('collections_accounts')
      .select('patient_name, current_balance')
      .limit(5);
    
    if (patientsError) {
      console.error('Error fetching patients:', patientsError);
    } else {
      console.log('📊 Sample patients:', patients);
    }
    
  } catch (error) {
    console.error('💥 Seeding failed:', error);
  }
}

seedDatabase();
