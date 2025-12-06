import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetLeaderboard() {
  console.log('🧹 Clearing model_predictions table...')
  const { error } = await supabase
    .from('model_predictions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // match-all sentinel to satisfy PostgREST filter requirement

  if (error) {
    console.error('❌ Failed to clear leaderboard:', error.message)
    process.exit(1)
  }

  console.log('✅ Leaderboard reset: all model predictions removed.')
}

resetLeaderboard().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
