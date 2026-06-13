import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/track/view - Track a page view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, referrer } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get IP address from headers
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : null

    await db.pageView.create({
      data: {
        userId,
        referrer: referrer || null,
        ipAddress,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track view error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
