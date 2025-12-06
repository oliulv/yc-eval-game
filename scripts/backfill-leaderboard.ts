import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { getModelPrediction } from '@/lib/ai'
import { getAllowedModels } from '@/lib/gatewayModels'
import { RECOMMENDED_MODEL_IDS } from '@/config/modelAllowlist'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.log('Fetching videos...')
  const { data: videos, error: videoError } = await supabase
    .from('videos')
    .select('id, transcript, accepted')

  if (videoError) {
    console.error('Failed to load videos:', videoError.message)
    process.exit(1)
  }

  const allowed = await getAllowedModels()
  const recommendedModels = allowed.filter((m) => RECOMMENDED_MODEL_IDS.includes(m.id))

  if (recommendedModels.length === 0) {
    console.error('No recommended models found in gateway list.')
    process.exit(1)
  }

  // Fetch existing predictions to skip duplicates
  const { data: existingPreds, error: predsError } = await supabase
    .from('model_predictions')
    .select('video_id, model_name')
    .in('model_name', recommendedModels.map((m) => m.id))

  if (predsError) {
    console.error('Failed to load existing predictions:', predsError.message)
    process.exit(1)
  }

  const hasPred = new Set(existingPreds?.map((p) => `${p.video_id}:${p.model_name}`) || [])

  let total = 0
  let skipped = 0
  let errors = 0

  for (const video of videos || []) {
    if (!video.transcript) {
      skipped++
      continue
    }

    for (const model of recommendedModels) {
      const key = `${video.id}:${model.id}`
      if (hasPred.has(key)) {
        skipped++
        continue
      }

      try {
        const result = await getModelPrediction(
          { id: model.id, name: model.label, modelId: model.id },
          video.transcript,
          { maxReasonMs: 8000 }
        )

        const { error: insertError } = await supabase
          .from('model_predictions')
          .insert({
            video_id: video.id,
            model_name: model.id,
            prediction: result.prediction,
            confidence: result.confidence || null,
            response_time_ms: result.responseTime,
          })

        if (insertError) {
          throw insertError
        }

        total++
        console.log(
          `[OK] video=${video.id} model=${model.id} pred=${result.prediction} (${result.responseTime}ms)`
        )
      } catch (err: any) {
        errors++
        console.error(
          `[ERR] video=${video.id} model=${model.id} :: ${err?.message || err}`
        )
      }
    }
  }

  console.log('\nDone.')
  console.log(`Inserted: ${total}`)
  console.log(`Skipped (existing/no transcript): ${skipped}`)
  console.log(`Errors: ${errors}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
