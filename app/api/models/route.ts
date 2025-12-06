import { NextResponse } from 'next/server'
import { getAllowedModels } from '@/lib/gatewayModels'

export async function GET() {
  try {
    const models = await getAllowedModels()
    return NextResponse.json({ models })
  } catch (error: any) {
    console.error('Failed to load models from Gateway:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to load models' },
      { status: 500 }
    )
  }
}
