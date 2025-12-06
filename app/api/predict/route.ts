import { NextResponse } from 'next/server'
import { getModelPrediction } from '@/lib/ai'
import { getSupabaseAdminClient } from '@/lib/supabase'
import { getAllowedModels } from '@/lib/gatewayModels'
import { DEFAULT_MODEL_ID } from '@/config/modelAllowlist'

export async function POST(request: Request) {
  try {
    const { videoId, modelIds, maxReasonMs } = await request.json()

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    // Get video and transcript
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
        { error: 'Video transcript not available. Please transcribe first.' },
        { status: 400 }
      )
    }

    const allowedModels = await getAllowedModels()
    const modelMap = new Map(allowedModels.map((m) => [m.id, m]))
    const resolvedModels =
      modelIds && modelIds.length > 0
        ? modelIds.map((id: string) => modelMap.get(id)).filter(Boolean)
        : allowedModels.filter((m) => m.id === DEFAULT_MODEL_ID || m.recommended).slice(0, 5)

    if (resolvedModels.length === 0) {
      return NextResponse.json(
        { error: 'No valid models selected' },
        { status: 400 }
      )
    }

    const timeoutMs = Math.max(500, Number(maxReasonMs) || 8000)

    // Get predictions from all selected models in parallel
    const predictions = await Promise.allSettled(
      resolvedModels.map(async (model) => {
        const result = await getModelPrediction(
          { id: model.id, name: model.label, modelId: model.id },
          video.transcript!,
          { maxReasonMs: timeoutMs }
        )
        
        // Store prediction in database
        await supabaseAdmin
          .from('model_predictions')
          .insert({
            video_id: videoId,
            model_name: model.id,
            prediction: result.prediction,
            confidence: result.confidence || null,
            response_time_ms: result.responseTime,
          })

        return {
          modelId: model.id,
          modelName: model.name,
          prediction: result.prediction,
          confidence: result.confidence,
          responseTime: result.responseTime,
          correct: result.prediction === (video.accepted ? 'YES' : 'NO'),
        }
      })
    )

    const results = predictions.map((p, idx) => {
      if (p.status === 'fulfilled') {
        return p.value
      } else {
        return {
          modelId: resolvedModels[idx].id,
          modelName: resolvedModels[idx].label,
          error: p.reason?.message || 'Prediction failed',
        }
      }
    })

    return NextResponse.json({
      predictions: results,
      actual: video.accepted,
    })
  } catch (error: any) {
    console.error('Prediction error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get predictions' },
      { status: 500 }
    )
  }
}
