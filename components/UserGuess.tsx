'use client'

import { useState } from 'react'

interface UserGuessProps {
  actual?: boolean
  onReveal?: () => void
}

export default function UserGuess({ actual, onReveal }: UserGuessProps) {
  const [userGuess, setUserGuess] = useState<'YES' | 'NO' | null>(null)
  const [revealed, setRevealed] = useState(false)

  const revealNow = () => {
    if (actual === undefined) return
    setRevealed(true)
    onReveal?.()
  }

  const handleGuess = (guess: 'YES' | 'NO') => {
    setUserGuess(guess)
    setRevealed(true)
    onReveal?.()
  }

  const correct = revealed && userGuess !== null && actual !== undefined
    ? userGuess === (actual ? 'YES' : 'NO')
    : undefined

  return (
    <div className="border border-gray-200 rounded-sm p-6 bg-white">
      <h2 className="text-lg font-mono text-gray-900 mb-4 border-b border-gray-200 pb-2">
        Your Guess
      </h2>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => handleGuess('YES')}
          disabled={revealed}
          className={`
            flex-1 px-6 py-3 rounded-sm font-mono text-sm
            border transition-colors
            ${
              userGuess === 'YES'
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          YES
        </button>
        <button
          onClick={() => setUserGuess('NO')}
          disabled={revealed}
          className={`
            flex-1 px-6 py-3 rounded-sm font-mono text-sm
            border transition-colors
            ${
              userGuess === 'NO'
                ? 'bg-red-50 border-red-500 text-red-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          NO
        </button>
      </div>

      {userGuess && (
        <div className="mb-4">
          <p className="text-sm font-mono text-gray-600 mb-2">
            Your guess: <span className="font-bold">{userGuess}</span>
          </p>
        </div>
      )}

      {actual === undefined && (
        <div className="text-xs font-mono text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-sm">
          Actual answer not loaded yet.
        </div>
      )}

      {revealed && actual !== undefined && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <p className="text-sm font-mono mb-2">
            Actual result:{' '}
            <span className={actual ? 'text-green-600' : 'text-red-600'}>
              {actual ? 'YES' : 'NO'}
            </span>
          </p>
          {correct !== undefined && (
            <p className={`text-sm font-mono ${correct ? 'text-green-600' : 'text-red-600'}`}>
              {correct ? '✓ You were correct!' : '✗ You were incorrect'}
            </p>
          )}
        </div>
      )}

      {!revealed && actual !== undefined && userGuess === null && (
        <button
          onClick={revealNow}
          className="text-xs font-mono text-gray-600 underline underline-offset-4 mt-2"
        >
          Skip guess and reveal answer
        </button>
      )}
    </div>
  )
}
