import { NextResponse } from 'next/server'
import { getModelPrediction } from '@/lib/ai'
import { MODELS, getModelById, type Model } from '@/lib/models'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { videoId, modelIds } = await request.json()

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    // Get video and transcript
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

    // Filter models
    const selectedModels = modelIds && modelIds.length > 0
      ? modelIds.map((id: string) => getModelById(id)).filter(Boolean)
      : MODELS

    // Get predictions from all selected models in parallel
    const predictions = await Promise.allSettled(
      selectedModels.map(async (model: Model) => {
        const result = await getModelPrediction(model, video.transcript!)
        
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
          modelId: selectedModels[idx].id,
          modelName: selectedModels[idx].name,
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

