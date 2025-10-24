// Simple Node.js script to debug environment variables
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Environment Debug Script');
console.log('========================');

// Check if .env.local exists
const envLocalPath = path.join(__dirname, '.env.local');
const envPath = path.join(__dirname, '.env');

console.log('\n📁 File Check:');
console.log('.env.local exists:', fs.existsSync(envLocalPath));
console.log('.env exists:', fs.existsSync(envPath));

if (fs.existsSync(envLocalPath)) {
  console.log('\n📄 .env.local contents:');
  const content = fs.readFileSync(envLocalPath, 'utf8');
  console.log(content);
}

if (fs.existsSync(envPath)) {
  console.log('\n📄 .env contents:');
  const content = fs.readFileSync(envPath, 'utf8');
  console.log(content);
}

console.log('\n🔧 Process Environment:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

console.log('\n✅ Debug complete!');
