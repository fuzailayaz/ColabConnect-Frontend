// src/lib/supabase-utils.ts
import { PostgrestError } from '@supabase/supabase-js';

export async function safeQuery<T>(
  query: Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<{ data: T | null; error: PostgrestError | null }> {
  try {
    return await query;
  } catch (error) {
    console.error('Query error:', error);
    return { data: null, error: error as PostgrestError };
  }
}