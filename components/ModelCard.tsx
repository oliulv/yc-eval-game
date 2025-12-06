'use client'

import { useState, useEffect } from 'react'

interface ModelCardProps {
  modelName: string
  prediction?: 'YES' | 'NO'
  responseTime?: number
  correct?: boolean
  error?: string
  isThinking?: boolean
  reasoning?: string
  onRequestReasoning?: () => void
  isLoadingReasoning?: boolean
}

export default function ModelCard({
  modelName,
  prediction,
  responseTime,
  correct,
  error,
  isThinking = false,
  reasoning,
  onRequestReasoning,
  isLoadingReasoning = false,
}: ModelCardProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (isThinking) {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
      }, 500)
      return () => clearInterval(interval)
    }
  }, [isThinking])

  return (
    <div
      className={`
        border border-gray-200 rounded-sm p-4 bg-white
        transition-all duration-300
        ${prediction ? 'border-gray-300' : ''}
        ${correct === true ? 'border-green-500' : ''}
        ${correct === false ? 'border-red-500' : ''}
      `}
      style={{ minHeight: '190px' }}
    >
      <div className="flex flex-col h-full justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-mono text-sm text-gray-900 break-all leading-snug">
            {modelName}
          </h3>
          {responseTime && (
            <span className="text-xs text-gray-500 font-mono">{responseTime}ms</span>
          )}
        </div>

        {isThinking && (
          <div className="text-gray-400 font-mono text-sm">
            Thinking{dots}
          </div>
        )}

        {error && (
          <div className="text-red-500 font-mono text-xs break-words">{error}</div>
        )}

        {prediction && (
          <div className="space-y-2">
            <div
              className={`
                inline-block px-3 py-1 rounded-sm font-mono text-sm
                ${
                  prediction === 'YES'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }
              `}
            >
              {prediction}
            </div>
            {correct !== undefined && (
              <div className="text-xs font-mono flex items-center gap-2">
                {correct ? (
                  <span className="text-green-600">✓ Correct</span>
                ) : (
                  <span className="text-red-600">✗ Incorrect</span>
                )}
              </div>
            )}

            <div>
              {reasoning ? (
                <div className="text-xs font-mono text-gray-700 whitespace-pre-line break-words">
                  {reasoning}
                </div>
              ) : onRequestReasoning ? (
                <button
                  onClick={onRequestReasoning}
                  disabled={isLoadingReasoning}
                  className="text-xs font-mono text-gray-700 underline underline-offset-4 hover:text-gray-900 disabled:opacity-50"
                >
                  {isLoadingReasoning ? 'Loading reasoning...' : 'View reasoning'}
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
