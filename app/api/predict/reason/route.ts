import { NextResponse } from 'next/server'
import { getModelPrediction } from '@/lib/ai'
import { getModelById } from '@/lib/models'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { videoId, modelId, prediction: priorPrediction } = await request.json()

    if (!videoId || !modelId) {
      return NextResponse.json(
        { error: 'videoId and modelId are required' },
        { status: 400 }
      )
    }

    const model = getModelById(modelId)
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    const { data: video, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('id, transcript, accepted')
      .eq('id', videoId)
      .single()

    if (videoError || !video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    if (!video.transcript) {
      return NextResponse.json(
        { error: 'Transcript not available' },
        { status: 400 }
      )
    }

    const result = await getModelPrediction(model, video.transcript, {
      includeReasoning: true,
      forcePrediction: priorPrediction,
    })

    return NextResponse.json({
      modelId: model.id,
      modelName: model.name,
      prediction: result.prediction,
      reasoning: result.reasoning,
      responseTime: result.responseTime,
      correct: result.prediction === (video.accepted ? 'YES' : 'NO'),
    })
  } catch (error: any) {
    console.error('Prediction reasoning error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reasoning' },
      { status: 500 }
    )
  }
}
