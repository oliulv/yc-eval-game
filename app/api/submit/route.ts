import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'
import { fetchYouTubeTitle } from '@/lib/youtube'
import {
  isDownloadError,
  markDownloadFailure,
  persistTranscription,
  transcribeYoutubeAudio,
} from '@/lib/transcription'

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

export async function POST(request: Request) {
  try {
    const { youtubeUrl, accepted } = await request.json()

    if (!youtubeUrl || typeof accepted !== 'boolean') {
      return NextResponse.json(
        { error: 'YouTube URL and accepted status are required' },
        { status: 400 }
      )
    }

    const youtubeId = extractYouTubeId(youtubeUrl)
    if (!youtubeId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }

    // Check if video already exists
    const supabaseAdmin = getSupabaseAdminClient()
    const { data: existing } = await supabaseAdmin
      .from('videos')
      .select('id')
      .eq('youtube_id', youtubeId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Video already exists', videoId: existing.id },
        { status: 409 }
      )
    }

    let title: string
    try {
      title = await fetchYouTubeTitle(youtubeId)
    } catch (error: any) {
      return NextResponse.json(
        {
          error: 'YouTube video not found or unavailable',
          details: error?.message,
        },
        { status: 404 }
      )
    }

    // Generate a simple session ID for anonymous submissions
    const sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Insert video, then transcribe immediately using yt-dlp-backed pipeline
    const { data: video, error: insertError } = await supabaseAdmin
      .from('videos')
      .insert({
        youtube_id: youtubeId,
        title,
        accepted,
        submitted_by: sessionId,
        transcript: null,
        raw_transcript: null,
      })
      .select()
      .single()

    if (insertError) {
      if ((insertError as any)?.code === '23505') {
        return NextResponse.json(
          { error: 'Video already exists' },
          { status: 409 }
        )
      }
      throw insertError
    }

    // Immediately transcribe using the same yt-dlp-backed pipeline used elsewhere
    try {
      const transcription = await transcribeYoutubeAudio(youtubeId)
      await persistTranscription(youtubeId, transcription, {
        allowInsertIfMissing: false,
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
      }

      return NextResponse.json(
        { error: details, video },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        video: {
          id: video.id,
          youtube_id: video.youtube_id,
          title: video.title,
          accepted: video.accepted,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Submit error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit video' },
      { status: 500 }
    )
  }
}
