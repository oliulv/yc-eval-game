import { cache } from 'react'
import { MODEL_ALLOWLIST_PREFIXES, RECOMMENDED_MODEL_IDS } from '@/config/modelAllowlist'

export type GatewayModel = {
  id: string
  provider: string
  label: string
  kind: 'chat' | 'image' | 'embedding' | 'other'
  recommended: boolean
}

type ModelsResponse = { data: { id: string; object?: string }[] }

function inferKind(id: string): GatewayModel['kind'] {
  const lower = id.toLowerCase()
  if (lower.includes('image') || lower.includes('img') || lower.includes('vision') || lower.includes('flux')) {
    return 'image'
  }
  if (lower.includes('embed')) {
    return 'embedding'
  }
  return 'chat'
}

function makeLabel(id: string) {
  const parts = id.split('/')
  if (parts.length === 2) {
    return `${parts[0]} – ${parts[1]}`
  }
  return id
}

function matchesAllowlist(id: string) {
  return MODEL_ALLOWLIST_PREFIXES.some((prefix) => id.startsWith(prefix))
}

function isRecommended(id: string) {
  return RECOMMENDED_MODEL_IDS.includes(id)
}

async function fetchGatewayModelsRaw(): Promise<ModelsResponse['data']> {
  const apiKey = process.env.AI_GATEWAY_API_KEY
  if (!apiKey) {
    throw new Error('Missing AI_GATEWAY_API_KEY environment variable')
  }

  const res = await fetch('https://ai-gateway.vercel.sh/v1/models', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: 'no-cache',
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to fetch models from Gateway: ${res.status} ${body}`)
  }

  const json = (await res.json()) as ModelsResponse
  return json.data || []
}

export const getAllowedModels = cache(async (): Promise<GatewayModel[]> => {
  const raw = await fetchGatewayModelsRaw()
  const filtered = raw
    .map(({ id }) => ({
      id,
      provider: id.split('/')[0] || 'unknown',
      label: makeLabel(id),
      kind: inferKind(id),
      recommended: isRecommended(id),
    }))
    .filter((m) => matchesAllowlist(m.id))

  // Sort recommended first, then alphabetical
  return filtered.sort((a, b) => {
    if (a.recommended && !b.recommended) return -1
    if (!a.recommended && b.recommended) return 1
    return a.id.localeCompare(b.id)
  })
})
