import { generateText } from 'ai'
import type { Model } from './models'

// AI SDK v5 has built-in AI Gateway support
// When AI_GATEWAY_API_KEY is set and model format is 'provider/model',
// the SDK automatically routes through AI Gateway

const PROMPT = `You are evaluating a startup founder's application transcript for a competitive startup accelerator program. Based solely on the transcript content, predict whether this founder was accepted into the accelerator.

Respond with ONLY: YES or NO

Transcript:
{transcript}`

export async function getModelPrediction(
  model: Model,
  transcript: string
): Promise<{ prediction: 'YES' | 'NO'; confidence?: number; responseTime: number }> {
  const startTime = Date.now()
  
  const prompt = PROMPT.replace('{transcript}', transcript)

  // Pass model string directly - AI SDK automatically detects 'provider/model' format
  // and routes through AI Gateway when AI_GATEWAY_API_KEY is set
  try {
    const result = await generateText({
      model: model.modelId, // e.g., 'openai/gpt-4o' - SDK handles routing automatically
      prompt,
      // Limit response length for YES/NO answers
      maxTokens: 10,
    })

    const responseTime = Date.now() - startTime
    const text = result.text.trim().toUpperCase()
    
    // Parse YES/NO from response
    let prediction: 'YES' | 'NO'
    if (text.includes('YES') || text.startsWith('Y')) {
      prediction = 'YES'
    } else if (text.includes('NO') || text.startsWith('N')) {
      prediction = 'NO'
    } else {
      // Default to NO if unclear
      prediction = 'NO'
    }

    return {
      prediction,
      responseTime,
    }
  } catch (error) {
    console.error(`Error getting prediction from ${model.name}:`, error)
    throw error
  }
}

