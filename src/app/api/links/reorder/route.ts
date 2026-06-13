import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserIdFromRequest } from '@/lib/auth'

// PUT /api/links/reorder - Reorder links
export async function PUT(req: NextRequest) {
  try {
    const userId = await getSessionUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { linkIds } = body as { linkIds: string[] }

    if (!Array.isArray(linkIds)) {
      return NextResponse.json({ error: 'linkIds must be an array' }, { status: 400 })
    }

    // Verify all links belong to user
    const links = await db.link.findMany({
      where: { userId, id: { in: linkIds } },
    })

    if (links.length !== linkIds.length) {
      return NextResponse.json({ error: 'Some links not found' }, { status: 400 })
    }

    // Update positions in a transaction
    await db.$transaction(
      linkIds.map((id, index) =>
        db.link.update({
          where: { id },
          data: { position: index },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder links error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
