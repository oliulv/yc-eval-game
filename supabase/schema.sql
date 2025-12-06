-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id TEXT NOT NULL UNIQUE,
  title TEXT,
  transcript TEXT, -- Sanitized transcript (shown to models)
  raw_transcript TEXT, -- Original transcript (never exposed)
  transcript_status TEXT DEFAULT 'PENDING', -- PENDING, TRANSCRIBED, DOWNLOAD_FAILED
  last_transcription_error TEXT,
  accepted BOOLEAN NOT NULL,
  transcribed_at TIMESTAMP WITH TIME ZONE,
  submitted_by TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model predictions table
CREATE TABLE IF NOT EXISTS model_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  prediction TEXT NOT NULL CHECK (prediction IN ('YES', 'NO')),
  confidence DECIMAL,
  response_time_ms INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_model_predictions_video_id ON model_predictions(video_id);
CREATE INDEX IF NOT EXISTS idx_model_predictions_model_name ON model_predictions(model_name);
CREATE INDEX IF NOT EXISTS idx_model_predictions_created_at ON model_predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_videos_youtube_id ON videos(youtube_id);
CREATE INDEX IF NOT EXISTS idx_videos_accepted ON videos(accepted);

-- View for model statistics (for leaderboard)
CREATE OR REPLACE VIEW model_stats AS
SELECT 
  model_name,
  COUNT(*) as total_predictions,
  SUM(CASE 
    WHEN mp.prediction = 'YES' AND v.accepted = true THEN 1
    WHEN mp.prediction = 'NO' AND v.accepted = false THEN 1
    ELSE 0
  END) as correct_predictions,
  ROUND(
    (SUM(CASE 
      WHEN mp.prediction = 'YES' AND v.accepted = true THEN 1
      WHEN mp.prediction = 'NO' AND v.accepted = false THEN 1
      ELSE 0
    END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 
    2
  ) as accuracy,
  ROUND(AVG(response_time_ms), 0) as avg_response_time
FROM model_predictions mp
JOIN videos v ON mp.video_id = v.id
GROUP BY model_name
HAVING COUNT(*) > 0
ORDER BY accuracy DESC, total_predictions DESC;
