import { createClientComponentClient, SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

// Create singleton instance (auth options not needed here)
const supabase = createClientComponentClient<Database>({
  options: {
    db: {
      schema: 'public'
    }
    // Removed invalid `auth` config
  }
})

// Export supabase client directly for easy import
export { supabase }

// Real-time subscription helper
export const subscribeToChannel = (
  channel: string,
  callback: (payload: any) => void
) => {
  const subscription = supabase
    .channel(channel)
    .on('postgres_changes', { event: '*', schema: 'public' }, callback)
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

// Optimistic updates helper
export const optimisticMutate = async (
  table: string,
  operation: 'insert' | 'update' | 'delete',
  data: any,
  options?: { onSuccess?: () => void; onError?: (error: any) => void }
) => {
  try {
    let result
    switch (operation) {
      case 'insert':
        result = await supabase.from(table).insert(data).select().single()
        break
      case 'update':
        result = await supabase.from(table).update(data).eq('id', data.id).select().single()
        break
      case 'delete':
        result = await supabase.from(table).delete().eq('id', data.id)
        break
    }

    options?.onSuccess?.()
    return result.data
  } catch (error) {
    options?.onError?.(error)
    throw error
  }
}
