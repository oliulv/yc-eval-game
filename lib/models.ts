export interface Model {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'meta' | 'mistral' | 'grok'
  modelId: string
}

export const MODELS: Model[] = [
  // OpenAI
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', modelId: 'gpt-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', modelId: 'gpt-4o-mini' },
  
  // Anthropic
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', modelId: 'claude-3-5-sonnet-20241022' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic', modelId: 'claude-3-haiku-20240307' },
  
  // Google
  { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', provider: 'google', modelId: 'gemini-1.5-pro' },
  { id: 'gemini-1-5-flash', name: 'Gemini 1.5 Flash', provider: 'google', modelId: 'gemini-1.5-flash' },
  
  // Meta (via OpenAI-compatible API)
  { id: 'llama-3-1-70b', name: 'Llama 3.1 70B', provider: 'meta', modelId: 'meta-llama/Meta-Llama-3.1-70B-Instruct' },
  
  // Mistral
  { id: 'mistral-large', name: 'Mistral Large', provider: 'mistral', modelId: 'mistral-large' },
  { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', provider: 'mistral', modelId: 'mixtral-8x7b-instruct' },
  
  // Grok (xAI)
  { id: 'grok-2-1212', name: 'Grok 2', provider: 'grok', modelId: 'grok-2-1212' },
  { id: 'grok-2-vision-1212', name: 'Grok 2 Vision', provider: 'grok', modelId: 'grok-2-vision-1212' },
]

export function getModelById(id: string): Model | undefined {
  return MODELS.find(m => m.id === id)
}

