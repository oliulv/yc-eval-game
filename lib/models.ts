export interface Model {
  id: string
  name: string
  modelId: string // Format: provider/model-name (e.g., 'openai/gpt-4o')
}

export const MODELS: Model[] = [
  // OpenAI
  { id: 'gpt-4o', name: 'GPT-4o', modelId: 'openai/gpt-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', modelId: 'openai/gpt-4o-mini' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', modelId: 'openai/gpt-4.1-mini' },
  
  // Anthropic
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', modelId: 'anthropic/claude-sonnet-4' },
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', modelId: 'anthropic/claude-haiku-4.5' },
  
  // Google
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', modelId: 'google/gemini-2.5-flash' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', modelId: 'google/gemini-3-pro-preview' },
  
  // xAI (Grok)
  { id: 'grok-2', name: 'Grok 2', modelId: 'xai/grok-2' },
  { id: 'grok-code-fast-1', name: 'Grok Code Fast 1', modelId: 'xai/grok-code-fast-1' },
  
  // Meta (via Groq on AI Gateway)
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', modelId: 'meta-llama/llama-3.3-70b-instruct' },
]

export function getModelById(id: string): Model | undefined {
  return MODELS.find(m => m.id === id)
}

