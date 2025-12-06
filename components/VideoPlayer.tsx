'use client'

import YouTube from 'react-youtube'
import { useEffect, useRef, useState } from 'react'

interface VideoPlayerProps {
  youtubeId: string
  title?: string | null
  onVideoEnd?: () => void
}

export default function VideoPlayer({ youtubeId, title, onVideoEnd }: VideoPlayerProps) {
  const [playerReady, setPlayerReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const opts = {
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
    },
  }

  // Hint to browser to defer iframe load where possible
  useEffect(() => {
    const iframe = containerRef.current?.querySelector('iframe')
    if (iframe) {
      iframe.setAttribute('loading', 'lazy')
    }
  }, [youtubeId, playerReady])

  return (
    <div className="w-full">
      <div
        className="relative w-full bg-black rounded-sm border border-gray-200 overflow-hidden"
        style={{ aspectRatio: '16/9' }}
        ref={containerRef}
      >
        <YouTube
          videoId={youtubeId}
          opts={opts}
          onReady={() => setPlayerReady(true)}
          onEnd={onVideoEnd}
          className="absolute inset-0 w-full h-full"
          iframeClassName="w-full h-full"
        />
      </div>
    </div>
  )
}
