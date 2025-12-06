import { NextResponse } from 'next/server'
import ytdl from '@distube/ytdl-core'
import { transcribeAudio } from '@/lib/whisper'
import { sanitizeTranscript } from '@/lib/sanitize'
import { supabaseAdmin } from '@/lib/supabase'

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
    const { data: existingVideo } = await supabaseAdmin
      .from('videos')
      .select('transcript, raw_transcript')
      .eq('youtube_id', youtubeId)
      .single()

    if (existingVideo?.transcript) {
      return NextResponse.json({
        transcript: existingVideo.transcript,
        cached: true,
      })
    }

    // Download audio from YouTube
    let audioBuffer: Buffer
    try {
      const audioStream = ytdl(youtubeId, {
        quality: 'lowestaudio',
        filter: 'audioonly',
      })

      // Convert stream to buffer
      const chunks: Buffer[] = []
      for await (const chunk of audioStream) {
        chunks.push(Buffer.from(chunk))
      }
      audioBuffer = Buffer.concat(chunks)
    } catch (ytdlError: any) {
      console.error('ytdl-core error:', ytdlError)
      throw new Error(`Failed to download audio from YouTube: ${ytdlError.message}. The video may be unavailable or restricted.`)
    }

    // Transcribe with Whisper
    const rawTranscript = await transcribeAudio(audioBuffer, `${youtubeId}.mp3`)

    // Sanitize transcript
    const sanitizedTranscript = sanitizeTranscript(rawTranscript)

    // Update video in database
    if (existingVideo) {
      const { error } = await supabaseAdmin
        .from('videos')
        .update({
          transcript: sanitizedTranscript,
          raw_transcript: rawTranscript,
          transcribed_at: new Date().toISOString(),
        })
        .eq('youtube_id', youtubeId)

      if (error) throw error
    } else {
      // Video doesn't exist yet, create it
      // We'll need title and accepted status - for now just create placeholder
      const { error } = await supabaseAdmin
        .from('videos')
        .insert({
          youtube_id: youtubeId,
          transcript: sanitizedTranscript,
          raw_transcript: rawTranscript,
          accepted: false, // Will be set when video is properly added
          transcribed_at: new Date().toISOString(),
        })

      if (error) throw error
    }

    return NextResponse.json({
      transcript: sanitizedTranscript,
      cached: false,
    })
  } catch (error: any) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe video' },
      { status: 500 }
    )
  }
}

