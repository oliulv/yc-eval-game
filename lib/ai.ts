import { generateText } from 'ai'
import type { Model } from './models'

// AI SDK v5 has built-in AI Gateway support
// When AI_GATEWAY_API_KEY is set and model format is 'provider/model',
// the SDK automatically routes through AI Gateway

const BASE_PROMPT = `You are evaluating a startup founder's application transcript for a competitive startup accelerator program. Based solely on the transcript content, predict whether this founder was accepted into the accelerator.`

function buildPrompt(
  transcript: string,
  options?: { includeReasoning?: boolean; forcePrediction?: 'YES' | 'NO' }
) {
  if (options?.includeReasoning) {
    const prefix = options.forcePrediction
      ? `You already answered ${options.forcePrediction}. Keep that same label.`
      : `Decide YES or NO.`
    return `${BASE_PROMPT}

${prefix} Respond with:
ANSWER: YES or NO
REASON: One concise sentence explaining why.

Transcript:
${transcript}`
  }

  return `${BASE_PROMPT}

Respond with ONLY: YES or NO

Transcript:
${transcript}`
}

export async function getModelPrediction(
  model: Model,
  transcript: string,
  options?: { includeReasoning?: boolean; forcePrediction?: 'YES' | 'NO' }
): Promise<{
  prediction: 'YES' | 'NO'
  confidence?: number
  responseTime: number
  reasoning?: string
}> {
  const startTime = Date.now()

  const prompt = buildPrompt(transcript, options)

  try {
    const result = await generateText({
      model: model.modelId, // SDK handles routing automatically
      prompt,
      maxOutputTokens: options?.includeReasoning ? 120 : 10,
      temperature: options?.includeReasoning ? 0.2 : 0,
    })

    const responseTime = Date.now() - startTime
    const text = result.text.trim()
    const upper = text.toUpperCase()

    // Parse YES/NO from response
    let prediction: 'YES' | 'NO'
    if (upper.includes('YES') || upper.startsWith('Y')) {
      prediction = 'YES'
    } else if (upper.includes('NO') || upper.startsWith('N')) {
      prediction = 'NO'
    } else {
      prediction = 'NO'
    }

    let reasoning: string | undefined
    if (options?.includeReasoning) {
      const reasonLine = text.split('\n').find((line) =>
        line.toLowerCase().startsWith('reason')
      )
      if (reasonLine) {
        reasoning = reasonLine.replace(/reason[:\s]*/i, '').trim()
      } else {
        const parts = text.split(':')
        reasoning = parts.slice(1).join(':').trim() || text
      }
    }

    return {
      prediction,
      responseTime,
      reasoning,
    }
  } catch (error) {
    console.error(`Error getting prediction from ${model.name}:`, error)
    throw error
  }
}
