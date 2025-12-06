# YC Eval Game

A full-stack LLM evaluation platform where AI models predict startup accelerator acceptance from video transcripts.

## Features

- **Video Evaluation**: Watch YC application videos and see AI models make predictions
- **Multiple Models**: Compare predictions from leading AI models (GPT-4o, Claude, Gemini, Llama, Mistral)
- **Transcription**: Automatic YouTube video transcription using OpenAI Whisper
- **Data Leakage Protection**: Sanitized transcripts prevent exposing sensitive information
- **Global Leaderboard**: Track model accuracy across all predictions
- **Community Submissions**: Users can add new videos to the database

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Vercel AI SDK with multiple providers
- **Database**: Supabase (Postgres)
- **Transcription**: OpenAI Whisper API
- **Styling**: Tailwind CSS

## Setup

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables (copy `.env.example` to `.env.local`):
```bash
cp .env.example .env.local
```

3. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Add your Supabase credentials to `.env.local`

4. Add API keys to `.env.local`:
   - OpenAI API key (for Whisper + GPT models)
   - Anthropic API key
   - Google Generative AI API key

5. Run the development server:
```bash
bun run dev
```

## Database Schema

The app uses three main tables:
- `videos`: Stores video metadata, transcripts, and acceptance labels
- `model_predictions`: Tracks all model predictions
- `model_stats`: View for leaderboard statistics

## API Routes

- `GET /api/videos` - List videos
- `GET /api/videos/[id]` - Get single video
- `POST /api/transcribe` - Transcribe YouTube video
- `POST /api/predict` - Get predictions from all models
- `GET /api/stats` - Get leaderboard statistics
- `POST /api/submit` - Submit new video

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

Make sure to set up Supabase database and run the schema SQL before deploying.
