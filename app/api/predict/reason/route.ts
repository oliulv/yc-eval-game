import { NextResponse } from 'next/server'
import { getModelPrediction } from '@/lib/ai'
import { getSupabaseAdminClient } from '@/lib/supabase'
import { getAllowedModels } from '@/lib/gatewayModels'

export async function POST(request: Request) {
  try {
    const { videoId, modelId, prediction: priorPrediction, maxReasonMs } = await request.json()

    if (!videoId || !modelId) {
      return NextResponse.json(
        { error: 'videoId and modelId are required' },
        { status: 400 }
      )
    }

    const allowedModels = await getAllowedModels()
    const model = allowedModels.find((m) => m.id === modelId)
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    const supabaseAdmin = getSupabaseAdminClient()
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

    const timeoutMs = Math.max(500, Number(maxReasonMs) || 8000)
    let result
    try {
      result = await getModelPrediction(
        { id: model.id, name: model.label, modelId: model.id },
        video.transcript,
        {
          includeReasoning: true,
          forcePrediction: priorPrediction,
          maxReasonMs: timeoutMs,
        }
      )
    } catch (err) {
      // Fallback: try again without reasoning if model/provider rejects
      result = await getModelPrediction(
        { id: model.id, name: model.label, modelId: model.id },
        video.transcript,
        {
          includeReasoning: false,
          forcePrediction: priorPrediction,
          maxReasonMs: timeoutMs,
        }
      )
    }

    return NextResponse.json({
      modelId: model.id,
      modelName: model.label,
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
