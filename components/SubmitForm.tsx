'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SubmitForm() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [accepted, setAccepted] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL')
      return
    }

    if (accepted === null) {
      setError('Please select whether the application was accepted')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl, accepted }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit video')
      }

      // Success - redirect to main page
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Failed to submit video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-mono text-gray-700 mb-2">
          YouTube URL
        </label>
        <input
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="
            w-full px-4 py-2 border border-gray-300 rounded-sm
            font-mono text-sm bg-white focus:outline-none focus:border-gray-500
          "
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-mono text-gray-700 mb-2">
          Was this application accepted?
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setAccepted(true)}
            disabled={loading}
            className={`
              flex-1 px-6 py-3 rounded-sm font-mono text-sm border transition-colors
              ${
                accepted === true
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            YES
          </button>
          <button
            type="button"
            onClick={() => setAccepted(false)}
            disabled={loading}
            className={`
              flex-1 px-6 py-3 rounded-sm font-mono text-sm border transition-colors
              ${
                accepted === false
                  ? 'bg-red-50 border-red-500 text-red-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            NO
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-sm">
          <p className="text-sm font-mono text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || accepted === null || !youtubeUrl.trim()}
        className="
          w-full px-6 py-3 border border-gray-300 rounded-sm
          font-mono text-sm bg-white hover:bg-gray-50
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
      >
        {loading ? 'Submitting...' : 'Submit Video'}
      </button>
    </form>
  )
}

