import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface UserProfile {
  id: string
  email: string
  company_name?: string
  naics_codes: string[] // Array of NAICS codes user is interested in
  created_at: string
  updated_at: string
}

export interface SavedOpportunity {
  id: string
  user_id: string
  notice_id: string
  title: string
  solicitation_number: string
  naics_code: string
  posted_date: string
  deadline?: string
  saved_at: string
}