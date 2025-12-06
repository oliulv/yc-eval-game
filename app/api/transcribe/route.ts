import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'
import {
  isDownloadError,
  markDownloadFailure,
  persistTranscription,
  transcribeYoutubeAudio,
} from '@/lib/transcription'

export async function POST(request: Request) {
  try {
    const { youtubeId } = await request.json()

    if (!youtubeId) {
      return NextResponse.json(
        { error: 'YouTube ID is required' },
        { status: 400 }
      )
    }

    // Check if video already exists and has transcript
    const supabaseAdmin = getSupabaseAdminClient()
    const { data: existingVideo } = await supabaseAdmin
      .from('videos')
      .select('transcript, raw_transcript, title, accepted')
      .eq('youtube_id', youtubeId)
      .single()

    if (existingVideo?.transcript) {
      return NextResponse.json({
        transcript: existingVideo.transcript,
        cached: true,
      })
    }

    // Transcribe with yt-dlp-backed flow (works for all uploaded videos too)
    try {
      const transcription = await transcribeYoutubeAudio(youtubeId)
      await persistTranscription(youtubeId, transcription, {
        allowInsertIfMissing: true,
        accepted: existingVideo?.accepted ?? false,
        title: existingVideo?.title ?? null,
      })

      return NextResponse.json({
        transcript: transcription.sanitizedTranscript,
        cached: false,
      })
    } catch (err: any) {
      const errnoCode = (err as NodeJS.ErrnoException)?.code
      const details =
        errnoCode === 'ENOENT'
          ? 'yt-dlp binary not found. Install yt-dlp and ensure it is on PATH.'
          : err?.message || 'Failed to transcribe video'

      if (isDownloadError(err)) {
        console.error('[YTDL_DOWNLOAD_ERROR]', {
          youtubeId,
          message: err?.message,
          statusCode: err?.statusCode,
          code: errnoCode,
          stderr: err?.stderr,
        })

        await markDownloadFailure(youtubeId, details)

        return NextResponse.json(
          {
            ok: false,
            error: 'download_failed',
            statusCode: err?.statusCode ?? 500,
            details,
          },
          { status: 500 }
        )
      }

      throw err
    }

  } catch (error: any) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe video' },
      { status: 500 }
    )
  }
}
