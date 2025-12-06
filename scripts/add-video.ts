import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { downloadAudioWithYtDlp, fetchYouTubeTitle, youtubeWatchUrl } from '@/lib/youtube'
import { transcribeAudio } from '@/lib/whisper'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

async function main() {
  const [rawUrl, rawAccepted] = process.argv.slice(2)

  if (!rawUrl || !rawAccepted) {
    console.error('Usage: bun scripts/add-video.ts <youtube-url> <yes|no>')
    process.exit(1)
  }

  const accepted =
    rawAccepted.toLowerCase() === 'yes' || rawAccepted.toLowerCase() === 'y'
      ? true
      : rawAccepted.toLowerCase() === 'no' || rawAccepted.toLowerCase() === 'n'
      ? false
      : null

  if (accepted === null) {
    console.error('Second argument must be "yes" or "no"')
    process.exit(1)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Extract YouTube ID
  const match = rawUrl.match(/(?:v=|youtu\.be\/|embed\/)([^&\n?#]+)/)
  const youtubeId = match ? match[1] : rawUrl

  console.log(`→ Processing ${youtubeId}`)

  // Check if exists
  const { data: existing } = await supabase
    .from('videos')
    .select('id')
    .eq('youtube_id', youtubeId)
    .single()

  if (existing) {
    console.log('Video already exists, aborting.')
    process.exit(0)
  }

  // Fetch title
  const title = await fetchYouTubeTitle(youtubeId)

  // Download + transcribe locally
  const { buffer } = await downloadAudioWithYtDlp(youtubeId)
  const rawTranscript = await transcribeAudio(buffer, `${youtubeId}.mp3`)
  const sanitizedTranscript = rawTranscript.trim()

  const payloadFull = {
    youtube_id: youtubeId,
    title,
    accepted,
    transcript: sanitizedTranscript,
    raw_transcript: rawTranscript,
    transcribed_at: new Date().toISOString(),
    transcript_status: 'TRANSCRIBED',
    last_transcription_error: null,
    submitted_by: 'local_script',
  }

  const payloadMinimal = {
    youtube_id: youtubeId,
    title,
    accepted,
    transcript: sanitizedTranscript,
    raw_transcript: rawTranscript,
    transcribed_at: new Date().toISOString(),
    submitted_by: 'local_script',
  }

  let video: any
  try {
    const { data, error } = await supabase
      .from('videos')
      .insert(payloadFull)
      .select()
      .single()
    if (error) throw error
    video = data
  } catch (error: any) {
    const message = error?.message || ''
    if (
      message.includes('last_transcription_error') ||
      message.includes('transcript_status')
    ) {
      const { data, error: fallbackError } = await supabase
        .from('videos')
        .insert(payloadMinimal)
        .select()
        .single()
      if (fallbackError) {
        console.error('Insert failed (fallback):', fallbackError.message)
        process.exit(1)
      }
      video = data
    } else {
      console.error('Insert failed:', message)
      process.exit(1)
    }
  }

  console.log('✅ Added video:')
  console.log(` - id: ${video.id}`)
  console.log(` - url: ${youtubeWatchUrl(youtubeId)}`)
  console.log(` - title: ${title}`)
  console.log(` - accepted: ${accepted}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
