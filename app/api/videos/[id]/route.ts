import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import type { Video } from '@/types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient()
    const { id } = await params
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Don't expose raw_transcript
    const { raw_transcript, ...video } = data

    return NextResponse.json(video as Video)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch video' },
      { status: 500 }
    )
  }
}
