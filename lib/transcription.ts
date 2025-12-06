import { downloadAudioWithYtDlp, type DownloadError } from './youtube'
import { transcribeAudio } from './whisper'
import { sanitizeTranscript } from './sanitize'
import { getSupabaseAdminClient } from './supabase'

export interface TranscriptionResult {
  rawTranscript: string
  sanitizedTranscript: string
}

export function isMissingStatusColumns(message?: string) {
  if (!message) return false
  return (
    message.includes('transcript_status') ||
    message.includes('last_transcription_error')
  )
}

export function isDownloadError(error: any): error is DownloadError {
  if (!error) return false
  return (
    'stderr' in error ||
    'exitCode' in error ||
    'statusCode' in error ||
    (typeof error.message === 'string' &&
      error.message.toLowerCase().includes('yt-dlp'))
  )
}

export async function transcribeYoutubeAudio(
  youtubeId: string
): Promise<TranscriptionResult> {
  const { buffer } = await downloadAudioWithYtDlp(youtubeId)
  const rawTranscript = await transcribeAudio(buffer, `${youtubeId}.mp3`)
  const sanitizedTranscript = sanitizeTranscript(rawTranscript)
  return { rawTranscript, sanitizedTranscript }
}

export async function markDownloadFailure(
  youtubeId: string,
  errorMessage?: string
) {
  try {
    const supabaseAdmin = getSupabaseAdminClient()
    const { error } = await supabaseAdmin
      .from('videos')
      .update({
        transcript_status: 'DOWNLOAD_FAILED',
        last_transcription_error: errorMessage?.slice(0, 500) ?? null,
      })
      .eq('youtube_id', youtubeId)

    if (error && !isMissingStatusColumns(error.message)) {
      console.error('[DOWNLOAD_STATUS_UPDATE_ERROR]', error)
    }
  } catch (err) {
    console.error('[DOWNLOAD_STATUS_UPDATE_ERROR]', err)
  }
}

export async function persistTranscription(
  youtubeId: string,
  result: TranscriptionResult,
  options?: {
    allowInsertIfMissing?: boolean
    accepted?: boolean
    title?: string | null
  }
) {
  const supabaseAdmin = getSupabaseAdminClient()
  const { rawTranscript, sanitizedTranscript } = result
  const timestamp = new Date().toISOString()
  const payload = {
    transcript: sanitizedTranscript,
    raw_transcript: rawTranscript,
    transcribed_at: timestamp,
    transcript_status: 'TRANSCRIBED' as const,
    last_transcription_error: null,
  }

  const { data: existingVideo } = await supabaseAdmin
    .from('videos')
    .select('id')
    .eq('youtube_id', youtubeId)
    .single()

  if (existingVideo) {
    const { error } = await supabaseAdmin
      .from('videos')
      .update(payload)
      .eq('youtube_id', youtubeId)

    if (error) {
      if (isMissingStatusColumns(error.message)) {
        const { error: fallbackError } = await supabaseAdmin
          .from('videos')
          .update({
            transcript: sanitizedTranscript,
            raw_transcript: rawTranscript,
            transcribed_at: timestamp,
          })
          .eq('youtube_id', youtubeId)

        if (fallbackError) throw fallbackError
      } else {
        throw error
      }
    }
    return
  }

  if (!options?.allowInsertIfMissing) {
    throw new Error('Video not found to attach transcript')
  }

  const insertPayload = {
    youtube_id: youtubeId,
    title: options?.title ?? null,
    accepted: options?.accepted ?? false,
    ...payload,
  }

  const { error: insertError } = await supabaseAdmin
    .from('videos')
    .insert(insertPayload)

  if (insertError) {
    if (isMissingStatusColumns(insertError.message)) {
      const { error: fallbackError } = await supabaseAdmin
        .from('videos')
        .insert({
          youtube_id: youtubeId,
          title: options?.title ?? null,
          accepted: options?.accepted ?? false,
          transcript: sanitizedTranscript,
          raw_transcript: rawTranscript,
          transcribed_at: timestamp,
        })

      if (fallbackError) throw fallbackError
    } else {
      throw insertError
    }
  }
}
