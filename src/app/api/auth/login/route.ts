import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSession } from '@/lib/auth'

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email/username and password are required' }, { status: 400 })
    }

    // Find user by email OR username
    let user = await db.user.findUnique({ where: { email } })
    if (!user) {
      // Try finding by username
      user = await db.user.findUnique({ where: { username: email } })
    }
    if (!user) {
      return NextResponse.json({ error: 'Invalid email/username or password' }, { status: 401 })
    }

    // Verify password
    const crypto = await import('crypto')
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password + (process.env.NEXTAUTH_SECRET || 'linkforge-secret'))
      .digest('hex')

    if (user.password !== hashedPassword) {
      return NextResponse.json({ error: 'Invalid email/username or password' }, { status: 401 })
    }

    // Create session
    const token = await createSession(user.id)

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
        aiGenerations: user.aiGenerations,
      },
    })

    response.cookies.set('linkforge_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
