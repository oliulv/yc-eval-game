'use client'

import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_MODEL_ID } from '@/config/modelAllowlist'
import type { GatewayModel } from '@/lib/gatewayModels'

interface ModelSelectorProps {
  selectedModelIds: string[]
  onChange: (selectedIds: string[]) => void
}

export default function ModelSelector({ selectedModelIds, onChange }: ModelSelectorProps) {
  const [models, setModels] = useState<GatewayModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/models')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load models')
        setModels(data.models || [])
      } catch (err: any) {
        setError(err?.message || 'Failed to load models')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const recommended = useMemo(
    () => models.filter((m) => m.recommended),
    [models]
  )
  const rest = useMemo(() => {
    const filtered = models.filter((m) => !m.recommended)
    if (!search.trim()) return filtered
    return filtered.filter((m) => m.id.toLowerCase().includes(search.toLowerCase()))
  }, [models, search])

  const toggleModel = (modelId: string) => {
    if (selectedModelIds.includes(modelId)) {
      onChange(selectedModelIds.filter(id => id !== modelId))
    } else {
      onChange([...selectedModelIds, modelId])
    }
  }

  const selectAll = () => {
    onChange(models.map(m => m.id))
  }

  const deselectAll = () => {
    onChange([])
  }

  const selectRecommended = () => {
    if (recommended.length > 0) {
      onChange(recommended.map((m) => m.id))
    } else if (models.length > 0) {
      onChange([models[0].id])
    } else {
      onChange([DEFAULT_MODEL_ID])
    }
  }

  return (
    <div className="border border-gray-200 rounded-sm p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono text-gray-900 border-b border-gray-200 pb-1">
          Select Models
        </h3>
        <div className="flex gap-2">
          <button
            onClick={selectRecommended}
            className="text-xs font-mono px-2 py-1 border border-gray-300 rounded-sm hover:bg-gray-50"
          >
            Recommended
          </button>
          <button
            onClick={selectAll}
            className="text-xs font-mono px-2 py-1 border border-gray-300 rounded-sm hover:bg-gray-50"
          >
            All
          </button>
          <button
            onClick={deselectAll}
            className="text-xs font-mono px-2 py-1 border border-gray-300 rounded-sm hover:bg-gray-50"
          >
            None
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-xs font-mono text-gray-500">Loading models...</div>
      )}
      {error && (
        <div className="text-xs font-mono text-red-600">Failed: {error}</div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {recommended.length > 0 && (
            <div>
              <div className="text-xs font-mono text-gray-600 mb-2">Recommended</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {recommended.map((model) => (
                  <label
                    key={model.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedModelIds.includes(model.id)}
                      onChange={() => toggleModel(model.id)}
                      className="w-4 h-4 border-gray-300 rounded-sm"
                    />
                    <span className="text-xs font-mono text-gray-700">{model.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-xs font-mono text-gray-600 mb-2">All Models</div>
            <input
              type="text"
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full mb-2 px-2 py-1 border border-gray-300 rounded-sm text-xs font-mono"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
              {rest.map((model) => (
                <label
                  key={model.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedModelIds.includes(model.id)}
                    onChange={() => toggleModel(model.id)}
                    className="w-4 h-4 border-gray-300 rounded-sm"
                  />
                  <span className="text-xs font-mono text-gray-700">{model.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
