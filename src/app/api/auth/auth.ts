import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { MongoClient } from 'mongodb';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, anonKey);
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// MongoDB Configuration
const mongoUri = process.env.MONGO_URI!;
const mongoClient = new MongoClient(mongoUri);
const dbName = process.env.MONGO_DB_NAME!;
const mongoDb = mongoClient.db(dbName);
const authLogsCollection = mongoDb.collection('auth_logs');

export async function registerUser(
  email: string,
  password: string,
  username: string,
  firstName: string,
  lastName: string
) {
  const router = useRouter();

  // Supabase Sign-Up
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(`❌ Registration Error: ${error.message}`);

  const user = data.user;
  if (!user) throw new Error('🚨 User registration failed');

  // Insert user into Supabase database
  const { error: insertError } = await supabaseAdmin.from('users').insert([
    { id: user.id, email, username, first_name: firstName, last_name: lastName }
  ]);
  if (insertError) throw new Error(`❌ Supabase Insert Error: ${insertError.message}`);

  // Log registration in MongoDB
  await authLogsCollection.insertOne({
    userId: user.id,
    email,
    action: 'register',
    timestamp: new Date()
  });

  router.push('/welcome');
  return { user };
}

export async function loginUser(email: string, password: string) {
  const router = useRouter();

  // Supabase Sign-In
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`❌ Login Error: ${error.message}`);

  // Log login in MongoDB
  if (data.user) {
    await authLogsCollection.insertOne({
      userId: data.user.id,
      email,
      action: 'login',
      timestamp: new Date()
    });
  }

  router.push('/dashboard');
  return data;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`❌ Logout Error: ${error.message}`);
  return { message: '✅ Logged out successfully' };
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`❌ Get User Error: ${error.message}`);
  return data.user;
}
