'use client'

import { MODELS } from '@/lib/models'

interface ModelSelectorProps {
  selectedModelIds: string[]
  onChange: (selectedIds: string[]) => void
}

export default function ModelSelector({ selectedModelIds, onChange }: ModelSelectorProps) {
  const toggleModel = (modelId: string) => {
    if (selectedModelIds.includes(modelId)) {
      onChange(selectedModelIds.filter(id => id !== modelId))
    } else {
      onChange([...selectedModelIds, modelId])
    }
  }

  const selectAll = () => {
    onChange(MODELS.map(m => m.id))
  }

  const deselectAll = () => {
    onChange([])
  }

  return (
    <div className="border border-gray-200 rounded-sm p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono text-gray-900 border-b border-gray-200 pb-1">
          Select Models
        </h3>
        <div className="flex gap-2">
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {MODELS.map((model) => (
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
            <span className="text-xs font-mono text-gray-700">{model.name}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

