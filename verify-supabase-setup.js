/**
 * Supabase Setup Verification Script
 * Run this to check if your Supabase setup is correct
 * 
 * Usage: node verify-supabase-setup.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = __dirname;

console.log('🔍 Verifying Supabase Setup...\n');

// Check 1: .env.local file exists
console.log('1. Checking .env.local file...');
const envPath = join(projectRoot, '.env.local');
if (!existsSync(envPath)) {
  console.error('   ❌ .env.local file NOT FOUND');
  console.error('   📝 Create it by copying env.example:');
  console.error('      cp env.example .env.local');
  console.error('   📝 Then add your Supabase credentials\n');
  process.exit(1);
} else {
  console.log('   ✅ .env.local file exists');
}

// Check 2: Read and parse .env.local
console.log('\n2. Checking environment variables...');
let envContent;
try {
  envContent = readFileSync(envPath, 'utf-8');
} catch (error) {
  console.error('   ❌ Cannot read .env.local file:', error.message);
  process.exit(1);
}

// Check 3: Required variables
const requiredVars = {
  'VITE_SUPABASE_URL': false,
  'VITE_SUPABASE_ANON_KEY': false,
  'VITE_SUPABASE_PUBLISHABLE_KEY': false, // Alternative name
};

let hasUrl = false;
let hasKey = false;

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();
    
    if (key === 'VITE_SUPABASE_URL') {
      hasUrl = true;
      if (value && value !== 'your_supabase_url_here' && value !== 'your-project-id.supabase.co') {
        console.log(`   ✅ VITE_SUPABASE_URL is set: ${value.substring(0, 30)}...`);
      } else {
        console.error('   ❌ VITE_SUPABASE_URL is not set (still has placeholder)');
      }
    }
    
    if (key === 'VITE_SUPABASE_ANON_KEY' || key === 'VITE_SUPABASE_PUBLISHABLE_KEY') {
      hasKey = true;
      if (value && value.length > 50 && !value.includes('your')) {
        console.log(`   ✅ ${key} is set (${value.length} characters)`);
      } else {
        console.error(`   ❌ ${key} is not set correctly (too short or has placeholder)`);
      }
    }
  }
});

if (!hasUrl) {
  console.error('   ❌ VITE_SUPABASE_URL is missing');
}

if (!hasKey) {
  console.error('   ❌ VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY is missing');
}

// Check 4: Package installation
console.log('\n3. Checking @supabase/supabase-js package...');
try {
  const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8'));
  if (packageJson.dependencies && packageJson.dependencies['@supabase/supabase-js']) {
    console.log(`   ✅ @supabase/supabase-js is installed (version: ${packageJson.dependencies['@supabase/supabase-js']})`);
  } else {
    console.error('   ❌ @supabase/supabase-js is NOT installed');
    console.error('   📦 Install it: npm install @supabase/supabase-js');
  }
} catch (error) {
  console.error('   ⚠️  Cannot check package.json:', error.message);
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasUrl && hasKey) {
  console.log('✅ Setup looks good!');
  console.log('\n📝 Next steps:');
  console.log('   1. Make sure your Supabase project is active');
  console.log('   2. Run the database schema: COMPLETE_DATABASE_SCHEMA.sql');
  console.log('   3. Restart your dev server: npm run dev');
  console.log('   4. Check browser console for connection status');
} else {
  console.log('❌ Setup incomplete!');
  console.log('\n📝 Fix these issues:');
  if (!hasUrl) console.log('   - Add VITE_SUPABASE_URL to .env.local');
  if (!hasKey) console.log('   - Add VITE_SUPABASE_ANON_KEY to .env.local');
  console.log('\n📚 See QUICK_FIX_SUPABASE.md for detailed instructions');
}
console.log('='.repeat(50) + '\n');

