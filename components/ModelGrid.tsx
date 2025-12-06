'use client'

import { useState, useEffect } from 'react'
import ModelCard from './ModelCard'
import { MODELS } from '@/lib/models'

interface Prediction {
  modelId: string
  modelName: string
  prediction?: 'YES' | 'NO'
  confidence?: number
  responseTime?: number
  correct?: boolean
  error?: string
}

interface ModelGridProps {
  videoId: string
  transcript: string | null
  actual?: boolean
  selectedModelIds?: string[]
}

export default function ModelGrid({
  videoId,
  transcript,
  actual,
  selectedModelIds,
}: ModelGridProps) {
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Update correct/incorrect status when actual is revealed
  useEffect(() => {
    if (actual !== undefined) {
      setPredictions((prev) => {
        const updated: Record<string, Prediction> = {}
        Object.keys(prev).forEach((modelId) => {
          const pred = prev[modelId]
          updated[modelId] = {
            ...pred,
            correct: pred.prediction
              ? pred.prediction === (actual ? 'YES' : 'NO')
              : undefined,
          }
        })
        return updated
      })
    }
  }, [actual])

  const modelsToUse = selectedModelIds && selectedModelIds.length > 0
    ? MODELS.filter(m => selectedModelIds.includes(m.id))
    : MODELS

  const handlePredict = async () => {
    if (!transcript) {
      alert('Transcript not available. Please wait for transcription.')
      return
    }

    setIsLoading(true)
    setPredictions({})

    // Initialize all models as "thinking"
    const initialPredictions: Record<string, Prediction> = {}
    modelsToUse.forEach(model => {
      initialPredictions[model.id] = {
        modelId: model.id,
        modelName: model.name,
      }
    })
    setPredictions(initialPredictions)

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          modelIds: selectedModelIds || MODELS.map(m => m.id),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get predictions')
      }

      // Update predictions with results
      const newPredictions: Record<string, Prediction> = {}
      data.predictions.forEach((pred: Prediction) => {
        newPredictions[pred.modelId] = {
          ...pred,
          correct: actual !== undefined && pred.prediction
            ? pred.prediction === (actual ? 'YES' : 'NO')
            : undefined,
        }
      })
      setPredictions(newPredictions)
    } catch (error: any) {
      console.error('Prediction error:', error)
      // Update with errors
      const errorPredictions: Record<string, Prediction> = {}
      modelsToUse.forEach(model => {
        errorPredictions[model.id] = {
          modelId: model.id,
          modelName: model.name,
          error: error.message || 'Failed to predict',
        }
      })
      setPredictions(errorPredictions)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-mono text-gray-900 border-b border-gray-200 pb-1">
          Model Predictions
        </h2>
        <button
          onClick={handlePredict}
          disabled={isLoading || !transcript}
          className="
            px-4 py-2 border border-gray-300 rounded-sm
            font-mono text-sm bg-white hover:bg-gray-50
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          {isLoading ? 'Predicting...' : 'Get Predictions'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modelsToUse.map((model) => {
          const prediction = predictions[model.id]
          return (
            <ModelCard
              key={model.id}
              modelName={model.name}
              prediction={prediction?.prediction}
              responseTime={prediction?.responseTime}
              correct={prediction?.correct}
              error={prediction?.error}
              isThinking={isLoading && !prediction?.prediction && !prediction?.error}
            />
          )
        })}
      </div>
    </div>
  )
}

