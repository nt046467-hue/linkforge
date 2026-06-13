import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserIdFromRequest } from '@/lib/auth'

// PUT /api/links/[id] - Update a link
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    // Verify ownership
    const existing = await db.link.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // Validate URL if being updated
    if (body.url !== undefined) {
      try {
        const parsed = new URL(body.url)
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          return NextResponse.json({ error: 'URL must start with http:// or https://' }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
      }
    }

    const link = await db.link.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.url !== undefined && { url: body.url }),
        ...(body.icon !== undefined && { icon: body.icon }),
        ...(body.thumbnailUrl !== undefined && { thumbnailUrl: body.thumbnailUrl }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.position !== undefined && { position: body.position }),
      },
      include: { _count: { select: { linkClicks: true } } },
    })

    return NextResponse.json(link)
  } catch (error) {
    console.error('Update link error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/links/[id] - Delete a link
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const existing = await db.link.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    await db.link.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete link error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
