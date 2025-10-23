import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseUrl = 'https://pusaxbvoiplsjflmnnyh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1c2F4YnZvaXBsc2pmbG1ubnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzQxNDEsImV4cCI6MjA3NjYxMDE0MX0.Va-Xss-A4mgl7dECObWLMWlb0VwEuTPdPfwmXbEdFbk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding with Muslim names...');
    
    // Get the current user ID
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || randomUUID();

    // Insert insurance payers
    console.log('📝 Inserting insurance payers...');
    const { error: payersError } = await supabase
      .from('insurance_payers')
      .upsert([
        { id: randomUUID(), name: 'Medicare', payer_id_code: 'MEDICARE', is_active: true },
        { id: randomUUID(), name: 'Blue Cross Blue Shield', payer_id_code: 'BCBS', is_active: true },
        { id: randomUUID(), name: 'Aetna', payer_id_code: 'AETNA', is_active: true },
        { id: randomUUID(), name: 'Cigna', payer_id_code: 'CIGNA', is_active: true },
      ]);

    if (payersError) console.error('Payers error:', payersError);
    else console.log('✅ Insurance payers inserted');

    // Insert collections accounts with Muslim names
    console.log('📝 Inserting collections accounts with Muslim names...');
    const { error: collectionsError } = await supabase
      .from('collections_accounts')
      .upsert([
        {
          id: randomUUID(),
          patient_name: 'Ahmad Hassan',
          patient_id: 'PAT-001',
          patient_email: 'ahmad.hassan@email.com',
          patient_phone: '(555) 123-4567',
          original_balance: 450.00,
          current_balance: 450.00,
          days_overdue: 15,
          collection_stage: 'early_collection',
          collection_status: 'active',
          last_contact_date: '2024-05-15',
          next_action_date: '2024-07-01',
          notes: 'Patient prefers email communication',
          user_id: userId
        },
        {
          id: randomUUID(),
          patient_name: 'Fatima Al-Zahra',
          patient_id: 'PAT-002',
          patient_email: 'fatima.alzahra@email.com',
          patient_phone: '(555) 234-5678',
          original_balance: 1275.80,
          current_balance: 1275.80,
          days_overdue: 38,
          collection_stage: 'mid_collection',
          collection_status: 'active',
          last_contact_date: '2024-04-22',
          next_action_date: '2024-07-05',
          notes: 'Patient has payment plan request',
          user_id: userId
        },
        {
          id: randomUUID(),
          patient_name: 'Omar Abdullah',
          patient_id: 'PAT-003',
          patient_email: 'omar.abdullah@email.com',
          patient_phone: '(555) 345-6789',
          original_balance: 89.25,
          current_balance: 89.25,
          days_overdue: 5,
          collection_stage: 'early_collection',
          collection_status: 'active',
          last_contact_date: '2024-06-10',
          next_action_date: '2024-07-15',
          notes: 'Auto-pay setup pending',
          user_id: userId
        },
        {
          id: randomUUID(),
          patient_name: 'Aisha Rahman',
          patient_id: 'PAT-004',
          patient_email: 'aisha.rahman@email.com',
          patient_phone: '(555) 456-7890',
          original_balance: 2340.50,
          current_balance: 2340.50,
          days_overdue: 106,
          collection_stage: 'pre_legal',
          collection_status: 'active',
          last_contact_date: '2024-03-15',
          next_action_date: '2024-07-10',
          notes: 'Patient disputes charges',
          user_id: userId
        },
        {
          id: randomUUID(),
          patient_name: 'Yusuf Ibrahim',
          patient_id: 'PAT-005',
          patient_email: 'yusuf.ibrahim@email.com',
          patient_phone: '(555) 567-8901',
          original_balance: 675.30,
          current_balance: 675.30,
          days_overdue: 8,
          collection_stage: 'early_collection',
          collection_status: 'active',
          last_contact_date: '2024-06-05',
          next_action_date: '2024-07-20',
          notes: 'Good payment history',
          user_id: userId
        },
        {
          id: randomUUID(),
          patient_name: 'Zainab Ali',
          patient_id: 'PAT-006',
          patient_email: 'zainab.ali@email.com',
          patient_phone: '(555) 678-9012',
          original_balance: 890.75,
          current_balance: 890.75,
          days_overdue: 32,
          collection_stage: 'mid_collection',
          collection_status: 'active',
          last_contact_date: '2024-05-20',
          next_action_date: '2024-07-25',
          notes: 'Patient requested payment plan',
          user_id: userId
        }
      ]);

    if (collectionsError) console.error('Collections error:', collectionsError);
    else console.log('✅ Collections accounts inserted');

    // Insert billing statements
    console.log('📝 Inserting billing statements...');
    const { error: statementsError } = await supabase
      .from('billing_statements')
      .upsert([
        {
          id: randomUUID(),
          patient_id: 'PAT-001',
          patient_name: 'Ahmad Hassan',
          amount_due: 450.00,
          statement_date: '2024-05-01',
          due_date: '2024-06-01',
          status: 'sent',
          channel: 'email',
          user_id: userId
        },
        {
          id: randomUUID(),
          patient_id: 'PAT-002',
          patient_name: 'Fatima Al-Zahra',
          amount_due: 1275.80,
          statement_date: '2024-04-01',
          due_date: '2024-05-01',
          status: 'delivered',
          channel: 'email',
          user_id: userId
        },
        {
          id: randomUUID(),
          patient_id: 'PAT-003',
          patient_name: 'Omar Abdullah',
          amount_due: 89.25,
          statement_date: '2024-06-01',
          due_date: '2024-07-01',
          status: 'viewed',
          channel: 'portal',
          user_id: userId
        }
      ]);

    if (statementsError) console.error('Statements error:', statementsError);
    else console.log('✅ Billing statements inserted');

    console.log('🎉 Database seeding completed successfully!');
    
    // Verify data
    console.log('🔍 Verifying data...');
    const { data: patients, error: verifyError } = await supabase
      .from('collections_accounts')
      .select('patient_name, current_balance, collection_stage')
      .limit(5);
    
    if (verifyError) {
      console.error('Verification error:', verifyError);
    } else {
      console.log('📊 Sample patients from database:', patients);
    }
    
  } catch (error) {
    console.error('💥 Seeding failed:', error);
  }
}

seedDatabase();
