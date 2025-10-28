import { supabase } from '@/integrations/supabase/client';

export const testDatabaseConnection = async () => {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
};

export const testCollectionsData = async () => {
  try {
    console.log('🔍 Testing collections data...');
    
    const { data, error } = await supabase
      .from('collections_accounts')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Collections data test failed:', error);
      return false;
    }

    console.log('✅ Collections data accessible:', data?.length || 0, 'records');
    return true;
  } catch (error) {
    console.error('❌ Collections data error:', error);
    return false;
  }
};

export const runAllTests = async () => {
  console.log('🚀 Running database tests...');
  
  const connectionTest = await testDatabaseConnection();
  const collectionsTest = await testCollectionsData();
  
  if (connectionTest && collectionsTest) {
    console.log('🎉 All database tests passed!');
    return true;
  } else {
    console.log('❌ Some database tests failed');
    return false;
  }
};
