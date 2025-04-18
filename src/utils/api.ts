import { createClient } from '@supabase/supabase-js';
import { Activity, ProjectAnalytics, UserStats } from '@/types/activity';
// Define a Project type if you have one, otherwise 'any' is okay for now
// import { Project } from '@/types/project'; // Example type import

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// --- Project API Functions (Using Next.js API Routes) ---

// Fetches ALL projects via the Next.js API route
export async function getProjects(): Promise<any[]> { // Use specific type if possible, e.g., Promise<Project[]>
  try {
    const response = await fetch('/api/projects', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store', // Avoid caching issues during development
    });

    if (!response.ok) {
      console.warn(`Projects API returned status: ${response.status}`);
      // Consider throwing an error or returning a specific error object
      return [];
    }

    const data = await response.json();
    // Add validation if needed (e.g., using Zod)
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    // Re-throw or return an error state for the UI to handle
    throw new Error('Failed to fetch projects.');
    // return []; // Or return empty array if preferred error handling
  }
}

// Fetches a SINGLE project by ID via the Next.js API route
export async function getProjectById(projectId: string | string[]): Promise<any> { // Use specific type Promise<Project>
  // Ensure ID is a string (Next.js router query can be string[])
  const id = Array.isArray(projectId) ? projectId[0] : projectId;
  if (!id) {
    console.error("getProjectById called with invalid ID:", projectId);
    throw new Error("Invalid Project ID provided.");
  }

  try {
    // Assumes you have an API route at /api/projects/[id].ts (or .js)
    const response = await fetch(`/api/projects/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store', // Or configure caching as needed
    });

    if (!response.ok) {
      let errorDetails = `Status: ${response.status}`;
      try {
         // Try to get more specific error message from API response body
         const errorData = await response.json();
         errorDetails += `, Message: ${errorData.message || 'Unknown error'}`;
      } catch (parseError) {
         // Fallback if response body isn't JSON or is empty
         errorDetails += `, Body: ${await response.text()}`;
      }
      console.error(`Failed to fetch project ${id}. ${errorDetails}`);
      throw new Error(`Failed to load project details. ${errorDetails}`);
    }

    const data = await response.json();
    // Add validation if needed
    return data; // Return the single project object
  } catch (error) {
    console.error(`Error fetching project by ID (${id}):`, error);
    // Re-throw the caught error or a new generic one
    throw error instanceof Error ? error : new Error('An unexpected error occurred while fetching the project.');
  }
}


// --- Skill Management Functions (Directly using Supabase) ---
export async function getSkills() {
  // Consider adding better error handling (try/catch)
  const { data, error } = await supabase
    .from('user_skills') // Ensure this table name matches your SQL ('user_skills' vs 'skills')
    .select('skill_name') // Adjust selection based on your table structure
    .order('updated_at', { ascending: false }); // Ensure 'updated_at' column exists

  if (error) {
      console.error("Error fetching skills:", error);
      throw error; // Let the calling code handle it
  }

  // Check your 'user_skills' table structure. Does it have 'skill_name'?
  // Or should you join with the 'skills' table?
  // Example assuming 'user_skills' has 'skill_name':
  return {
    data: {
      // Ensure data is not null before mapping
      skills: data ? data.map(item => item.skill_name) : [],
    },
    status: 200,
  };
}

export async function addSkill({ skill }: { skill: string }) {
  // Needs user context (usually auth.uid()) to know *which* user's skill to add.
  // This function likely needs the user ID passed to it, or retrieve it from Supabase auth session.
  // Also, your 'user_skills' table requires 'skill_id' (UUID) not 'skill_name' (TEXT),
  // and 'user_id'. You might need to find the skill_id first.
  // This function needs significant revision based on your schema.

  // Placeholder - this will likely fail with current schema:
  const { data, error } = await supabase
    .from('user_skills')
    .insert([
      {
        // user_id: ???, // Needs the authenticated user's ID
        // skill_id: ???, // Needs the UUID of the skill from the 'skills' table
        proficiency_level: 1,
        // 'updated_at' might be handled by database trigger/default
      },
    ]);

  if (error) {
    console.error("Error adding skill:", error);
    throw error;
  }
  return { status: 201, data }; // Check what 'data' contains upon insert
}

export async function deleteSkill(skillName: string) {
   // Similar to addSkill, needs user_id and likely skill_id based on the primary key (user_id, skill_id).
   // Deleting by 'skill_name' might require joining tables or finding the skill_id first.
   // This function needs revision.

  // Placeholder - this will likely fail with current schema:
  const { error } = await supabase
    .from('user_skills')
    .delete()
    // .eq('user_id', ???) // Needs user ID
    .eq('skill_name', skillName); // This column might not exist directly on user_skills

  if (error) {
    console.error("Error deleting skill:", error);
    throw error;
  }
  return { status: 200 };
}

// --- Sync Activity Function (Using Next.js API Route) ---
export async function syncActivity(data: {
  activity?: Activity;
  projectAnalytics?: ProjectAnalytics;
  userStats?: UserStats;
}) {
  try {
    const response = await fetch('/api/sync-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

     if (!response.ok) {
        // Handle non-OK responses
        const errorData = await response.text();
        throw new Error(`Sync activity failed: ${response.status} ${errorData}`);
     }

    return await response.json();
  } catch (error) {
    console.error('Error syncing activity:', error);
    throw error; // Re-throw for the caller
  }
}

// --- User Profile API Function (Directly using Supabase) ---
export async function getUserProfile(userId: string) {
   if (!userId) {
      throw new Error("User ID required to fetch profile.");
   }
   // Ensure 'user_profiles' table name is correct (vs 'profiles' in your SQL)
   // Use 'profiles' as per your SQL schema
  const { data, error } = await supabase
    .from('profiles') // Use 'profiles' table
    .select('*')
    .eq('id', userId)
    .single(); // Returns one row or null

  if (error) {
     // Differentiate between "not found" and other errors if needed
     if (error.code === 'PGRST116') { // PostgREST code for " İlişki bulunamadı" (relation not found / 0 rows)
        return null; // Or throw a specific "NotFound" error
     }
     console.error(`Error fetching user profile for ${userId}:`, error);
     throw error;
  }
  return data;
}

// --- Resume Upload Function (Using Supabase Storage) ---
export async function uploadResume(file: File, userId: string): Promise<{ url: string } | { error: string }> {
  try {
    if (!file || !userId) {
      return { error: 'File and user ID are required' };
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return { error: 'File must be a PDF or Word document' };
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { error: 'File size must be less than 5MB' };
    }

    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `resumes/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('user-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('user-documents')
      .getPublicUrl(filePath);

    // Update user profile with resume URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ resume_url: urlData.publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { url: urlData.publicUrl };
  } catch (error) {
    console.error('Error uploading resume:', error);
    return { error: 'Failed to upload resume' };
  }
}

// --- Exported API Object ---
export const api = {
  supabase, // Exposing Supabase client directly can be okay, but often wrapped
  getProjects,
  getProjectById, // <-- Added the new function
  getSkills,
  addSkill,
  deleteSkill,
  syncActivity,
  getUserProfile,
  uploadResume,
};

// Default export is convenient
export default api;