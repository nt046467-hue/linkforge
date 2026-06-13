import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getSessionUserId } from '@/lib/auth'

// GET /api/auth/me - Get current user from session
// Returns { user: null } when not authenticated (instead of 401) to avoid console errors
export async function GET() {
  try {
    const userId = await getSessionUserId()

    if (!userId) {
      return NextResponse.json({ user: null })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        links: {
          orderBy: { position: 'asc' },
        },
        pageSetting: true,
        _count: {
          select: {
            pageViews: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ user: null })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ user: null })
  }
}
