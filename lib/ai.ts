import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import type { Model } from './models'

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

  let provider: any
  let modelId: string

  switch (model.provider) {
    case 'openai':
      provider = openai(model.modelId)
      modelId = model.modelId
      break
    case 'anthropic':
      provider = anthropic(model.modelId)
      modelId = model.modelId
      break
    case 'google':
      provider = google(model.modelId)
      modelId = model.modelId
      break
    case 'meta':
      // Meta models via OpenAI-compatible endpoint
      provider = openai(model.modelId)
      modelId = model.modelId
      break
    case 'mistral':
      // Mistral via OpenAI-compatible endpoint
      provider = openai(model.modelId)
      modelId = model.modelId
      break
    case 'grok':
      // Grok (xAI) via OpenAI-compatible API
      const grokClient = createOpenAI({
        apiKey: process.env.GROK_API_KEY,
        baseURL: 'https://api.x.ai/v1',
      })
      provider = grokClient(model.modelId)
      modelId = model.modelId
      break
    default:
      throw new Error(`Unsupported provider: ${model.provider}`)
  }

  try {
    const result = await generateText({
      model: provider,
      prompt,
      // Limit response length for YES/NO answers
      maxTokens: 10,
    } as Parameters<typeof generateText>[0])

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

