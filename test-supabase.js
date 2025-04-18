require("dotenv").config({ path: ".env.local" }); // Explicitly load .env.local

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseAnonKey) {
  console.log(`✅ Connected to Supabase!`);
  console.log(`🔗 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Supabase Anon Key: ${supabaseAnonKey.substring(0, 10)}...`);
} else {
  console.error("❌ Error loading Supabase configurations. Check your .env.local file.");
}
