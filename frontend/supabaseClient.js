// This file is provided for reference/external usage.
// The internal application uses src/lib/supabase.ts for type safety and path consistency.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || (import.meta && import.meta.env && import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || (import.meta && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY)

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Key missing in environment.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
