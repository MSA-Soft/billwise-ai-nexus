import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pusaxbvoiplsjflmnnyh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1c2F4YnZvaXBsc2pmbG1ubnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzQxNDEsImV4cCI6MjA3NjYxMDE0MX0.Va-Xss-A4mgl7dECObWLMWlb0VwEuTPdPfwmXbEdFbk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'test@billwise.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Test User',
        }
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return;
    }

    console.log('User created successfully:', authData);

    // Create profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: 'test@billwise.com',
            full_name: 'Test User'
          }
        ]);

      if (profileError) {
        console.error('Profile error:', profileError);
      } else {
        console.log('Profile created successfully');
      }

      // Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: authData.user.id,
            role: 'admin'
          }
        ]);

      if (roleError) {
        console.error('Role error:', roleError);
      } else {
        console.log('User role created successfully');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser();
