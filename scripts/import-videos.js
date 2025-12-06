const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Video data
const videoData = `
New Story	https://www.youtube.com/watch?v=vtdm40KJyO4	Yes
Reducto	https://www.youtube.com/watch?v=VGXkghBFtL0	Yes
	https://www.youtube.com/watch?v=zEG7cXEW9J8	No
	https://www.youtube.com/watch?v=KJNDZCZ5Twk	No
Superside	https://www.youtube.com/watch?v=jtPwiSURTW0	Yes
	https://www.youtube.com/watch?v=8Yat0xCmC4M	No
	https://www.youtube.com/watch?v=aXiu5zdQnTw	No
	https://www.youtube.com/watch?v=8zjMvvKu8mI	No
	https://www.youtube.com/watch?v=sfnUjzb-EPE	No
Bulletin	https://www.youtube.com/watch?v=wdU1-dra7Zs	Yes
	https://www.youtube.com/watch?v=sXiIRC31z-E	No
	https://www.youtube.com/watch?v=rqe4GsIohMc	No
	https://www.youtube.com/watch?v=75LDtNjpMY8	No
	https://www.youtube.com/watch?v=j6JXsndgd4Q	No
	https://www.youtube.com/watch?v=c6rafET_Y6M	No
	https://www.youtube.com/watch?v=YK2X4P8Cshc	No
	https://www.youtube.com/watch?v=JJaRNxnl-gc	No
	https://www.youtube.com/watch?v=TUShPmc6sh0	No
	https://www.youtube.com/watch?v=kZYaE8xg4cM	No
	https://www.youtube.com/watch?v=isSnBsVsYsA	No
	https://www.youtube.com/watch?v=45fNbwNTcto	No
	https://www.youtube.com/watch?v=yP1ej0ZKxP4	No
	https://www.youtube.com/watch?v=ksmfCtHW7hs	No
	https://www.youtube.com/watch?v=wwk3iPfITJE	No
La Bringue	https://www.youtube.com/watch?v=dl6qqGuOrCE	Yes
	https://www.youtube.com/watch?v=dl6qqGuOrCE	No
	https://www.youtube.com/watch?v=QymSQWlI3oA	No
	https://www.youtube.com/watch?v=M89kJoLnsgc	No
	https://www.youtube.com/watch?v=jXnl2GLqQ3c	No
	https://www.youtube.com/watch?v=_ngSmmB-yi8	No
	https://www.youtube.com/watch?v=lY3hoi1eizM	No
	https://www.youtube.com/watch?v=Cs728xns3RI	No
	https://www.youtube.com/watch?v=5jHvQDKSICM	No
	https://www.youtube.com/watch?v=wxyTupz3Kic	No
Dench.com	https://www.youtube.com/watch?v=8UR4NMlxsDc	Yes
	https://www.youtube.com/watch?v=zAHEBOLq--A	No
	https://www.youtube.com/watch?v=grIwnpFZu4k	No
	https://www.youtube.com/watch?v=WgH-2UFRm6E	No
	https://www.youtube.com/watch?v=R6mArwEhm_k	No
	https://www.youtube.com/watch?v=HNsuzndWHsU	No
	https://www.youtube.com/watch?v=XZTb6DdOReQ	No
Remade	https://www.youtube.com/watch?v=q_HIpz3pVRc	Yes
	https://www.youtube.com/watch?v=frkf94ZgBBU	No
Keywords AI	https://www.youtube.com/watch?v=BxjmoN6LhqM	Yes
Zaymo	https://www.youtube.com/watch?v=Esj5FmQj-uQ	Yes
Clearly AI	https://www.youtube.com/watch?v=jzgX_wo7hUY	Yes
	https://www.youtube.com/watch?v=HA9rJiemzrU	No
	https://www.youtube.com/watch?v=b_u6sgtPKWs	No
	https://www.youtube.com/watch?v=22mHJ8n3oCk	No
Weave	https://www.youtube.com/watch?v=rpyvQJGcQGw	Yes
	https://www.youtube.com/watch?v=pw5IObxW8yQ	No
	https://www.youtube.com/watch?v=of1NyuLWiBI	No
	https://www.youtube.com/watch?v=2ISHGyuyhXM	No
Mintlify	https://www.youtube.com/watch?v=OAhXFeENW3g	Yes
Downtobid	https://www.youtube.com/watch?v=O6Vc9QKZjI8	Yes
Kater AI	https://www.youtube.com/watch?v=pmIEkxRreXU	 Yes
	https://www.youtube.com/watch?v=TZoprxGzzMM	No
	https://www.youtube.com/watch?v=kz6IFPuHwTs	No
Anja Health	https://www.youtube.com/watch?v=hpe5JHF4RNU	Yes
	https://www.youtube.com/watch?v=42dSSiw30BU	No
	https://www.youtube.com/watch?v=KE4zqLEXQys	No
	https://www.youtube.com/watch?v=R_8OjkAUW6Y	No
	https://www.youtube.com/watch?v=G9xXvHmTrz8	No
	https://www.youtube.com/watch?v=KF9VRp5J_uY	No
	https://www.youtube.com/watch?v=K5rRrlfMsyo	No
	https://www.youtube.com/watch?v=dpNrqJQoO-8	No
	https://www.youtube.com/watch?v=M8ewbfiABFI	No
	https://www.youtube.com/watch?v=CciBjoTaZIc	No
	https://www.youtube.com/watch?v=KrkjR8D9LcM	No
Artisan AI	https://www.youtube.com/watch?v=LlYe-he1knQ	Yes
	https://www.youtube.com/watch?v=noVHLJTbMQ0	No
	https://www.youtube.com/watch?v=m9dgMBiT5tw	No
	https://www.youtube.com/watch?v=FtmvGMGKOoU	No
	https://www.youtube.com/watch?v=JdKzTQ1gbtE	No
	https://www.youtube.com/watch?v=gmCkNdMsCgg	No
CamelAI	https://www.youtube.com/watch?v=NoJOEQVz81M	Yes
	https://www.youtube.com/watch?v=AZeEjofpWks	No
	https://www.youtube.com/watch?v=9F59pssPTbY	No
Vendease	https://www.youtube.com/watch?v=wKXsdMzEJ-o	Yes
	https://www.youtube.com/watch?v=Lpw0soGZVas	No
	https://www.youtube.com/watch?v=YkIWep43Mlo	No
	https://www.youtube.com/watch?v=9m00YAoKeBo	No
	https://www.youtube.com/watch?v=lPEvhXbu2II	No
	https://www.youtube.com/watch?v=klZAELzCA2E	No
	https://www.youtube.com/watch?v=xoZHX1RX8os	No
Poliglota	https://www.youtube.com/watch?v=YgWFOduMevk	Yes
	https://www.youtube.com/watch?v=0eCmiIciPa4	No
	https://www.youtube.com/watch?v=qlXkwuoKusU	No
	https://www.youtube.com/watch?v=GkS3rcy-ku8	No
	https://www.youtube.com/watch?v=1At6OtR_2QA	No
	https://www.youtube.com/watch?v=RBcIdJsmLkA	No
	https://www.youtube.com/watch?v=_8uQbS0whLc	No
Lollipuff	https://www.youtube.com/watch?v=yO8ctjbiIzM	Yes
	https://www.youtube.com/watch?v=Kwyd5jrm66E	No
Zenefits	https://www.youtube.com/watch?v=-S83fysRwn4	Yes
Teespring	https://www.youtube.com/watch?v=Ipf247AmhiI	Yes
WayUp	https://www.youtube.com/watch?v=4nxrkPtR348	Yes
Flip	https://www.youtube.com/watch?v=N5cBGeRMxms	Yes
	https://www.youtube.com/watch?v=wPJKShbYrC4	No
	https://www.youtube.com/watch?v=ypN1F1KxxWM	No
	https://www.youtube.com/watch?v=XAzK-vAi1yc	No
`

function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

function parseVideoData(data) {
  const lines = data.trim().split('\n')
  const videos = []
  
  for (const line of lines) {
    if (!line.trim()) continue
    
    const parts = line.split('\t').map(p => p.trim())
    
    if (parts.length < 2) continue
    
    const name = parts[0] || null
    const url = parts[1]
    const acceptedStr = (parts[2] || 'no').toLowerCase()
    
    const youtubeId = extractYouTubeId(url)
    if (!youtubeId) {
      console.warn(`Skipping invalid URL: ${url}`)
      continue
    }
    
    const accepted = acceptedStr.includes('yes')
    
    videos.push({
      name,
      youtubeId,
      accepted,
    })
  }
  
  return videos
}

async function importVideos() {
  console.log('Parsing video data...')
  const videos = parseVideoData(videoData)
  console.log(`Found ${videos.length} videos to import\n`)
  
  let successCount = 0
  let skipCount = 0
  let errorCount = 0
  
  for (const video of videos) {
    try {
      // Check if video already exists
      const { data: existing } = await supabase
        .from('videos')
        .select('id')
        .eq('youtube_id', video.youtubeId)
        .single()
      
      if (existing) {
        console.log(`⏭️  Skipping ${video.youtubeId} (already exists)`)
        skipCount++
        continue
      }
      
      // Insert video
      const { error } = await supabase
        .from('videos')
        .insert({
          youtube_id: video.youtubeId,
          title: video.name,
          accepted: video.accepted,
          submitted_by: 'system',
          transcript: null,
          raw_transcript: null,
        })
      
      if (error) {
        console.error(`❌ Error inserting ${video.youtubeId}:`, error.message)
        errorCount++
      } else {
        const status = video.accepted ? 'YES' : 'NO'
        const nameDisplay = video.name || 'Unnamed'
        console.log(`✅ ${status} - ${nameDisplay} (${video.youtubeId})`)
        successCount++
      }
    } catch (error) {
      console.error(`❌ Error processing ${video.youtubeId}:`, error.message)
      errorCount++
    }
  }
  
  console.log(`\n📊 Import Summary:`)
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ⏭️  Skipped: ${skipCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`   📹 Total: ${videos.length}`)
}

importVideos().catch(console.error)

