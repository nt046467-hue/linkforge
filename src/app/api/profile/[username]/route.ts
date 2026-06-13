import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/profile/[username] - Public profile data (no auth required)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    const user = await db.user.findUnique({
      where: { username },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
          select: {
            id: true,
            title: true,
            url: true,
            icon: true,
            thumbnailUrl: true,
            category: true,
          },
        },
        pageSetting: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
      },
      links: user.links,
      settings: user.pageSetting || {
        theme: 'dark',
        bgColor: '#0F0F10',
        bgGradient: null,
        buttonStyle: 'rounded',
        font: 'Inter',
        avatarShape: 'circle',
        accentColor: '#6C47FF',
      },
    })
  } catch (error) {
    console.error('Public profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
