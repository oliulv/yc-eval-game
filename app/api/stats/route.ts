import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import type { ModelStats } from '@/types'

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('model_stats')
      .select('*')
      .order('accuracy', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      stats: (data || []) as ModelStats[],
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
