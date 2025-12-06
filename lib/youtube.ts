import { spawn } from 'node:child_process'

export interface DownloadError extends Error {
  statusCode?: number
  stderr?: string
  exitCode?: number
}

const YT_DLP_BINARY = process.env.YT_DLP_BINARY || 'yt-dlp'

export const youtubeWatchUrl = (youtubeId: string) =>
  `https://www.youtube.com/watch?v=${youtubeId}`

function extractHttpStatus(stderr: string): number | undefined {
  const match = stderr.match(/HTTP\s+Error\s+(\d{3})/i)
  if (match) return Number(match[1])
  return undefined
}

/**
 * Download audio via yt-dlp so we don't depend on decipher/n-transform parsing
 * that frequently breaks in ytdl-core variants when YouTube updates player JS.
 */
export async function downloadAudioWithYtDlp(
  youtubeId: string
): Promise<{ buffer: Buffer; stderr: string }> {
  const url = youtubeWatchUrl(youtubeId)
  const ytDlp = spawn(
    YT_DLP_BINARY,
    ['-f', 'bestaudio', '-o', '-', '--no-playlist', url],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  )

  const chunks: Buffer[] = []
  let stderr = ''

  ytDlp.stdout?.on('data', (chunk) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  })

  ytDlp.stderr?.on('data', (chunk) => {
    stderr += chunk.toString()
  })

  const exitCode = await new Promise<number>((resolve, reject) => {
    ytDlp.once('error', (err) => reject(err))
    ytDlp.once('close', (code) => resolve(code ?? 1))
  })

  if (exitCode !== 0) {
    const snippet = stderr
      .trim()
      .split('\n')
      .slice(-5)
      .join(' | ')
    const error: DownloadError = new Error(
      `yt-dlp failed (exit ${exitCode})${snippet ? `: ${snippet}` : ''}`
    )
    error.statusCode = extractHttpStatus(stderr)
    error.stderr = stderr
    error.exitCode = exitCode
    throw error
  }

  if (chunks.length === 0) {
    const error: DownloadError = new Error('yt-dlp returned no audio data')
    error.stderr = stderr
    throw error
  }

  return {
    buffer: Buffer.concat(chunks),
    stderr,
  }
}

export async function fetchYouTubeTitle(youtubeId: string): Promise<string> {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    youtubeWatchUrl(youtubeId)
  )}&format=json`

  const response = await fetch(oembedUrl)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch video metadata (status ${response.status})`
    )
  }

  const data = (await response.json()) as { title?: string }
  if (!data.title) {
    throw new Error('Video metadata missing title')
  }

  return data.title
}
