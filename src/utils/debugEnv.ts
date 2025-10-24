// Debug environment variables
export const debugEnvironment = () => {
  console.log('🔍 Environment Debug Info:');
  console.log('Mode:', import.meta.env.MODE);
  console.log('Dev:', import.meta.env.DEV);
  console.log('Prod:', import.meta.env.PROD);
  
  console.log('\n📋 Environment Variables:');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing');
  console.log('VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('VITE_APP_ENV:', import.meta.env.VITE_APP_ENV || 'Not set');
  console.log('VITE_APP_VERSION:', import.meta.env.VITE_APP_VERSION || 'Not set');
  
  console.log('\n🔧 All import.meta.env keys:');
  console.log(Object.keys(import.meta.env));
  
  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    openaiKey: import.meta.env.VITE_OPENAI_API_KEY,
    appEnv: import.meta.env.VITE_APP_ENV,
    appVersion: import.meta.env.VITE_APP_VERSION,
  };
};
