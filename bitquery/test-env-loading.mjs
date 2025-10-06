import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Environment Variable Loading...');
console.log('📁 Current working directory:', process.cwd());
console.log('📁 Script directory:', __dirname);

// Try loading from multiple locations
console.log('\n🔍 Loading environment variables...');
dotenv.config(); // Current working directory
dotenv.config({ path: join(__dirname, '.env') }); // bitquery/.env
dotenv.config({ path: join(__dirname, '../.env') }); // root/.env
dotenv.config({ path: join(__dirname, '../js-scraper/.env') }); // js-scraper/.env

console.log('\n🔑 Environment Variables Status:');
console.log('  BITQUERY_API_KEY:', process.env.BITQUERY_API_KEY ? `✅ Set (${process.env.BITQUERY_API_KEY.length} chars)` : '❌ Not Set');
console.log('  ACCESS_TOKEN:', process.env.ACCESS_TOKEN ? `✅ Set (${process.env.ACCESS_TOKEN.length} chars)` : '❌ Not Set');
console.log('  SUPABASE_URL:', process.env.SUPABASE_URL ? `✅ Set (${process.env.SUPABASE_URL.length} chars)` : '❌ Not Set');
console.log('  SUPABASE_ANON_SECRET:', process.env.SUPABASE_ANON_SECRET ? `✅ Set (${process.env.SUPABASE_ANON_SECRET.length} chars)` : '❌ Not Set');

// Test API headers
console.log('\n🌐 API Headers Test:');
const headers = {
  'Content-Type': 'application/json',
  'X-API-KEY': process.env.BITQUERY_API_KEY,
  'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN
};

console.log('  X-API-KEY:', headers['X-API-KEY'] ? '✅ Set' : '❌ Undefined');
console.log('  Authorization:', headers['Authorization'] ? '✅ Set' : '❌ Undefined');

console.log('\n✅ Environment loading test completed!');
