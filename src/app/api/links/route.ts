import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserIdFromRequest } from '@/lib/auth'

// GET /api/links - List all links for current user
export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const links = await db.link.findMany({
      where: { userId },
      orderBy: { position: 'asc' },
      include: { _count: { select: { linkClicks: true } } },
    })

    return NextResponse.json(links)
  } catch (error) {
    console.error('Get links error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/links - Create a new link
export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, url, icon, thumbnailUrl, category } = body

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 })
    }

    // Validate URL — only allow http/https to prevent XSS via javascript: protocol
    try {
      const parsed = new URL(url)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return NextResponse.json({ error: 'URL must start with http:// or https://' }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Get current max position
    const maxPosition = await db.link.aggregate({
      where: { userId },
      _max: { position: true },
    })

    const position = (maxPosition._max.position ?? -1) + 1

    const link = await db.link.create({
      data: {
        userId,
        title,
        url,
        icon: icon || null,
        thumbnailUrl: thumbnailUrl || null,
        category: category || null,
        position,
        isActive: true,
      },
      include: { _count: { select: { linkClicks: true } } },
    })

    return NextResponse.json(link, { status: 201 })
  } catch (error) {
    console.error('Create link error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
