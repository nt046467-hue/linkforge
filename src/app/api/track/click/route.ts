import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/track/click - Track a link click
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { linkId, referrer } = body

    if (!linkId) {
      return NextResponse.json(
        { error: 'linkId is required' },
        { status: 400 }
      )
    }

    // Verify link exists
    const link = await db.link.findUnique({ where: { id: linkId } })
    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    // Get IP address from headers
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : null

    await db.linkClick.create({
      data: {
        linkId,
        referrer: referrer || null,
        ipAddress,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track click error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
