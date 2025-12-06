'use client'

import YouTube from 'react-youtube'
import { useState } from 'react'

interface VideoPlayerProps {
  youtubeId: string
  title?: string | null
  onVideoEnd?: () => void
}

export default function VideoPlayer({ youtubeId, title, onVideoEnd }: VideoPlayerProps) {
  const [playerReady, setPlayerReady] = useState(false)

  const opts = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
    },
  }

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-xl font-mono mb-4 text-gray-900 border-b border-gray-200 pb-2">
          {title}
        </h2>
      )}
      <div className="relative w-full aspect-video bg-black rounded-sm border border-gray-200">
        <YouTube
          videoId={youtubeId}
          opts={opts}
          onReady={() => setPlayerReady(true)}
          onEnd={onVideoEnd}
          className="w-full h-full"
        />
      </div>
    </div>
  )
}

