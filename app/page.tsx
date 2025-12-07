'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import VideoPlayer from '@/components/VideoPlayer'
import ModelGrid from '@/components/ModelGrid'
import UserGuess from '@/components/UserGuess'
import ModelSelector from '@/components/ModelSelector'
import type { Video } from '@/types'
import { DEFAULT_MODEL_ID } from '@/config/modelAllowlist'

function getStoredModels() {
  if (typeof window === 'undefined') return [DEFAULT_MODEL_ID]
  try {
    const raw = window.localStorage.getItem('selectedModelIds')
    const parsed = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch (_) {
    // ignore
  }
  return [DEFAULT_MODEL_ID]
}

function getStoredMaxReason() {
  if (typeof window === 'undefined') return 8000
  try {
    const raw = window.localStorage.getItem('maxReasonMs')
    const val = Math.max(500, Number(raw) || 8000)
    return val
  } catch {
    return 8000
  }
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(getStoredModels)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [maxReasonMs, setMaxReasonMs] = useState(getStoredMaxReason)
  const [showModelPicker, setShowModelPicker] = useState(false)
  const initializedFromStorage = useRef(false)
  const hasRandomized = useRef(false)

  const currentVideo = videos[currentVideoIndex]

  useEffect(() => {
    const load = async () => {
      // mark that initial read has occurred
      initializedFromStorage.current = true

      await fetchVideos()
      setLoadingVideos(false)
    }
    load()
  }, [])

  // Randomize initial video when videos are first loaded (only once)
  useEffect(() => {
    if (currentVideo) {
      setTranscript(currentVideo.transcript)
      setRevealed(false)
    }
  }, [currentVideo])

  // Persist preferences
  useEffect(() => {
    try {
      window.localStorage.setItem('selectedModelIds', JSON.stringify(selectedModelIds))
    } catch {
      // ignore
    }
  }, [selectedModelIds])

  useEffect(() => {
    try {
      window.localStorage.setItem('maxReasonMs', String(maxReasonMs))
    } catch {
      // ignore
    }
  }, [maxReasonMs])

  const fetchVideos = async () => {
    try {
      const currentId = videos[currentVideoIndex]?.id

      const response = await fetch('/api/videos?limit=100')
      const data = await response.json()

      // Shuffle entire list for variety
      let list: Video[] = (data.videos || []).slice().sort(() => Math.random() - 0.5)

      // Initial load: pick a random video but treat it as #1 by reordering array
      if (!hasRandomized.current && list.length > 0) {
        const randomIndex = Math.floor(Math.random() * list.length)
        const [randomVideo] = list.splice(randomIndex, 1)
        list = [randomVideo, ...list]
        hasRandomized.current = true
      }

      setVideos(list)

      // Keep the user on the same video after refreshes if possible
      if (currentId) {
        const newIndex = list.findIndex((v: Video) => v.id === currentId)
        setCurrentVideoIndex(newIndex >= 0 ? newIndex : 0)
      } else {
        setCurrentVideoIndex(0)
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    }
  }

  const handleNext = () => {
    setCurrentVideoIndex((prev) =>
      prev < videos.length - 1 ? prev + 1 : prev
    )
  }

  const handlePrevious = () => {
    setCurrentVideoIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  if (loadingVideos) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-mono mb-4 text-gray-900">Loading videos...</h1>
            <p className="text-gray-600 font-mono">Fetching the next batch.</p>
          </div>
        </div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-mono mb-4 text-gray-900">No videos available</h1>
            <p className="text-gray-600 font-mono mb-8">
              Add videos to get started (use local upload script).
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-mono text-gray-900">YC Eval Game</h1>
            <div className="flex gap-4">
              <Link
                href="/leaderboard"
                className="text-sm font-mono text-gray-700 hover:text-gray-900 border-b border-transparent hover:border-gray-300"
              >
                Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentVideo && (
          <div className="space-y-6">
            {/* Video Navigation */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentVideoIndex === 0}
                  className="px-4 py-2 border border-gray-300 rounded-sm font-mono text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-sm font-mono text-gray-600">
                  {currentVideoIndex + 1} / {videos.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentVideoIndex === videos.length - 1}
                  className="px-4 py-2 border border-gray-300 rounded-sm font-mono text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Main Content: Video and Predictions Side by Side on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left Column: Video */}
              <div className="space-y-4 lg:col-span-3">
                <VideoPlayer
                  youtubeId={currentVideo.youtube_id}
                />

                {!transcript && (
                  <div className="p-3 border border-gray-200 rounded-sm bg-yellow-50">
                    <p className="text-xs font-mono text-yellow-700">
                      Transcript not available for this video. Add one via the local upload script.
                    </p>
                  </div>
                )}

                {/* User Guess */}
                <UserGuess
                  key={currentVideo.id}
                  actual={currentVideo.accepted}
                  title={currentVideo.title}
                  onReveal={() => setRevealed(true)}
                />
              </div>

              {/* Right Column: Model Selector and Predictions */}
              <div className="space-y-4 lg:col-span-2">
                <div className="border border-gray-200 rounded-sm bg-white">
                  <button
                    onClick={() => setShowModelPicker((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-200 text-sm font-mono"
                  >
                    <span className="text-gray-900">Models & Reasoning Settings</span>
                    <span className="text-gray-600">{showModelPicker ? 'Hide' : 'Show'}</span>
                  </button>
                  {showModelPicker && (
                    <div className="p-4 space-y-4">
                      <div className="border border-gray-200 rounded-sm p-4 bg-white">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-mono text-gray-900">
                            Max reasoning time (ms)
                          </label>
                          <input
                            type="number"
                            min={500}
                            step={250}
                            value={maxReasonMs}
                            onChange={(e) => setMaxReasonMs(Math.max(500, Number(e.target.value) || 500))}
                            className="w-28 px-2 py-1 border border-gray-300 rounded-sm text-sm font-mono"
                          />
                        </div>
                        <p className="text-xs font-mono text-gray-500 mt-2">
                          Requests will timeout after this duration.
                        </p>
                      </div>

                      <ModelSelector
                        selectedModelIds={selectedModelIds}
                        onChange={setSelectedModelIds}
                      />
                    </div>
                  )}
                </div>

                <ModelGrid
                  key={currentVideo.id}
                  videoId={currentVideo.id}
                  transcript={transcript}
                  actual={currentVideo.accepted}
                  selectedModelIds={selectedModelIds}
                  maxReasonMs={maxReasonMs}
                  onActualReveal={() => setRevealed(true)}
                />
              </div>
            </div>
        </div>
        )}
      </main>
    </div>
  )
}
