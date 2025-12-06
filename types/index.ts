export interface Video {
  id: string
  youtube_id: string
  title: string | null
  transcript: string | null
  raw_transcript: string | null
  accepted: boolean
  transcribed_at: string | null
  submitted_by: string
  created_at: string
}

export interface ModelPrediction {
  id: string
  video_id: string
  model_name: string
  prediction: 'YES' | 'NO'
  confidence: number | null
  response_time_ms: number
  created_at: string
}

export interface ModelStats {
  model_name: string
  total_predictions: number
  correct_predictions: number
  accuracy: number
  avg_response_time: number
}

