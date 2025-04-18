import { createClient, type User, type AuthChangeEvent, type Session } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

console.log('✅ Initializing Supabase Client...');

// Create a single instance of the Supabase client with error handling
let supabaseInstance;

try {
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'colabconnect_auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      detectSessionInUrl: true, // Ensure URL auth callbacks are detected
      flowType: 'pkce' // Use PKCE flow for more secure auth
    },
    db: { schema: 'public' },
    global: { 
      headers: { 'x-application-name': 'CollabConnect' } 
    },
  });
  console.log('✅ Supabase client created successfully');
} catch (error) {
  console.error('🚨 Error creating Supabase client:', error);
  // Create a fallback client with minimal configuration
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  });
}

export const supabase = supabaseInstance;

// Debug log was moved to the try block above

// Initialize auth state listener with error handling
if (typeof window !== 'undefined') {
  try {
    supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log('🔄 Auth State Changed:', event, session?.user?.email);
      
      // Remove automatic redirects from global listener to prevent loops
      // Let middleware handle redirects instead
      if (event === 'SIGNED_OUT') {
        console.log('🔄 User signed out - middleware will handle redirect');
        // No longer forcing redirect here
      }
    });
  } catch (error) {
    console.error('🚨 Error setting up auth state listener:', error);
  }
}

/**
 * Helper functions for working with Supabase
 */

/**
 * Get the current user from Supabase
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('❌ Error fetching user:', error);
      return null;
    }
    return data.user;
  } catch (error) {
    console.error('❌ Error in getCurrentUser:', error);
    return null;
  }
}

/**
 * Create a user profile if it doesn't exist
 * @param user The authenticated user
 */
export async function ensureUserProfile(user: User): Promise<void> {
  try {
    // Check if the user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', profileError);
      return;
    }

    // If no profile exists, create one
    if (!profile) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('❌ Error creating profile:', insertError);
      } else {
        console.log('✅ Created new user profile for:', user.email);
      }
    }
  } catch (error) {
    console.error('❌ Error in ensureUserProfile:', error);
  }
}

/**
 * Sync user activity to MongoDB
 * @param activity Activity data to sync
 */
export async function syncActivity(activity: any): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch("/api/sync-activity", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ activity, userId: user.id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to sync activity to MongoDB");
    }
  } catch (error) {
    console.error("❌ Error syncing activity to MongoDB:", error);
  }
}

/**
 * Update project analytics
 * @param projectId Project ID
 * @param analytics Analytics data
 */
export async function updateProjectAnalytics(projectId: string, analytics: any): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch("/api/update-project-analytics", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ projectId, analytics, userId: user.id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update project analytics");
    }
  } catch (error) {
    console.error("❌ Error updating project analytics:", error);
  }
}

/**
 * Clear user cache
 */
export function clearCache(): void {
  console.log('🧹 Clearing user cache...');
  
  // Clear local storage items related to user session
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dashboardVisited');
    // Add any other app-specific cache items that should be cleared on logout
  }
}

// Export default for easier imports
export default supabase;
