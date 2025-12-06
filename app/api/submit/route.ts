import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import ytdl from '@distube/ytdl-core'

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

    // Validate YouTube video exists
    try {
      const info = await ytdl.getInfo(youtubeId)
      const title = info.videoDetails.title
    } catch (error) {
      return NextResponse.json(
        { error: 'YouTube video not found or unavailable' },
        { status: 404 }
      )
    }

    // Get video info for title
    const info = await ytdl.getInfo(youtubeId)
    const title = info.videoDetails.title

    // Generate a simple session ID for anonymous submissions
    const sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Insert video (transcript will be null, transcribed on first prediction)
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
      throw insertError
    }

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        youtube_id: video.youtube_id,
        title: video.title,
        accepted: video.accepted,
      },
    })
  } catch (error: any) {
    console.error('Submit error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit video' },
      { status: 500 }
    )
  }
}

