import OpenAI from 'openai'
import { Readable } from 'stream'

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY is required for transcription. ' +
      'Please add it to your .env.local file. ' +
      'Note: Whisper transcription requires direct OpenAI API access (not available through AI Gateway).'
    )
  }
  
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function transcribeAudio(audioBuffer: Buffer, filename: string = 'audio.mp3'): Promise<string> {
  const openai = getOpenAIClient()
  
  // Convert Buffer to File-like object for OpenAI API
  // OpenAI SDK accepts File, but in Node.js we need to create a File from Blob
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/mpeg' })
  const file = new File([blob], filename, { type: 'audio/mpeg' })
  
  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: 'whisper-1',
    language: 'en',
  })

  return transcription.text
}

