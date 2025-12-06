'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import VideoPlayer from '@/components/VideoPlayer'
import ModelGrid from '@/components/ModelGrid'
import UserGuess from '@/components/UserGuess'
import ModelSelector from '@/components/ModelSelector'
import type { Video } from '@/types'
import { MODELS } from '@/lib/models'

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(MODELS.map(m => m.id))
  const [transcript, setTranscript] = useState<string | null>(null)
  const [transcribing, setTranscribing] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const router = useRouter()

  const currentVideo = videos[currentVideoIndex]

  useEffect(() => {
    fetchVideos()
  }, [])

  useEffect(() => {
    if (currentVideo) {
      setTranscript(currentVideo.transcript)
      setRevealed(false)
      
      // Auto-transcribe if needed
      if (!currentVideo.transcript && !transcribing) {
        transcribeVideo(currentVideo.youtube_id)
      }
    }
  }, [currentVideo])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos?limit=100')
      const data = await response.json()
      setVideos(data.videos || [])
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    }
  }

  const transcribeVideo = async (youtubeId: string) => {
    setTranscribing(true)
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeId }),
      })

      const data = await response.json()
      if (data.transcript) {
        setTranscript(data.transcript)
        // Refresh videos to get updated transcript
        fetchVideos()
      }
    } catch (error) {
      console.error('Transcription failed:', error)
    } finally {
      setTranscribing(false)
    }
  }

  const handleNext = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1)
    }
  }

  if (videos.length === 0) {
  return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-mono mb-4 text-gray-900">No videos available</h1>
            <p className="text-gray-600 font-mono mb-8">
              Add videos to get started
            </p>
            <Link
              href="/submit"
              className="inline-block px-6 py-3 border border-gray-300 rounded-sm font-mono text-sm hover:bg-gray-50"
            >
              Submit a Video
            </Link>
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
              <Link
                href="/submit"
                className="text-sm font-mono text-gray-700 hover:text-gray-900 border-b border-transparent hover:border-gray-300"
              >
                Submit Video
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentVideo && (
          <div className="space-y-8">
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

            {/* Video Player */}
            <VideoPlayer
              youtubeId={currentVideo.youtube_id}
              title={currentVideo.title || undefined}
            />

            {/* Transcription Status */}
            {transcribing && (
              <div className="p-4 border border-gray-200 rounded-sm bg-gray-50">
                <p className="text-sm font-mono text-gray-600">
                  Transcribing video...
                </p>
              </div>
            )}

            {!transcript && !transcribing && (
              <div className="p-4 border border-gray-200 rounded-sm bg-yellow-50">
                <p className="text-sm font-mono text-yellow-700">
                  Transcript not available. Click "Get Predictions" to transcribe automatically.
                </p>
              </div>
            )}

            {/* Model Selector */}
            <ModelSelector
              selectedModelIds={selectedModelIds}
              onChange={setSelectedModelIds}
            />

            {/* Model Predictions */}
            <ModelGrid
              videoId={currentVideo.id}
              transcript={transcript}
              actual={revealed ? currentVideo.accepted : undefined}
              selectedModelIds={selectedModelIds}
            />

            {/* User Guess */}
            <UserGuess
              actual={revealed ? currentVideo.accepted : undefined}
              onReveal={() => setRevealed(true)}
            />
        </div>
        )}
      </main>
    </div>
  )
}
