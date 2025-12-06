import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// Support both naming conventions (publishable key is the same as anon key)
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function assertEnvPresent(kind: 'anon' | 'service') {
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  if (kind === 'anon' && !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)'
    )
  }
  if (kind === 'service' && !supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }
}

let cachedSupabase: SupabaseClient | null = null
let cachedSupabaseAdmin: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!cachedSupabase) {
    assertEnvPresent('anon')
    cachedSupabase = createClient(supabaseUrl!, supabaseAnonKey!)
  }
  return cachedSupabase
}

export function getSupabaseAdminClient(): SupabaseClient {
  if (!cachedSupabaseAdmin) {
    assertEnvPresent('service')
    cachedSupabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!)
  }
  return cachedSupabaseAdmin
}
