import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSession, getSessionUserId } from '@/lib/auth'

// POST /api/auth/register - Create account
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, username, password, displayName } = body

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'Email, username, and password are required' }, { status: 400 })
    }

    if (username.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json({ error: 'Username can only contain letters, numbers, underscores, and hyphens' }, { status: 400 })
    }

    // Block reserved usernames that conflict with app routes
    const RESERVED_USERNAMES = [
      'api', 'admin', 'dashboard', 'login', 'signup', 'register', 'logout',
      'settings', 'profile', 'upgrade', 'pro', 'free', 'pricing', 'about',
      'contact', 'privacy', 'terms', 'help', 'support', 'linkforge', 'www',
      'mail', 'email', 'static', 'assets', 'public', 'upload', 'uploads',
      'track', 'analytics', 'stripe', 'webhook', 'og', 'robots', 'sitemap',
    ]
    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
      return NextResponse.json({ error: 'This username is reserved. Please choose another.' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check if email exists
    const existingEmail = await db.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Check if username exists
    const existingUsername = await db.user.findUnique({ where: { username } })
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    // Hash password
    const crypto = await import('crypto')
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password + (process.env.NEXTAUTH_SECRET || 'linkforge-secret'))
      .digest('hex')

    // Create user
    const user = await db.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        displayName: displayName || null,
        plan: 'free',
        aiGenerations: 0,
      },
    })

    // Create default page settings
    await db.pageSetting.create({
      data: {
        userId: user.id,
        theme: 'dark',
        bgColor: '#0F0F10',
        buttonStyle: 'rounded',
        font: 'Inter',
        avatarShape: 'circle',
        accentColor: '#6C47FF',
      },
    })

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
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/auth/register?check=username&value=xxx - Check availability
export async function GET(req: NextRequest) {
  const check = req.nextUrl.searchParams.get('check')
  const value = req.nextUrl.searchParams.get('value')

  if (check === 'username' && value) {
    const existing = await db.user.findUnique({ where: { username: value } })
    return NextResponse.json({ available: !existing })
  }

  if (check === 'email' && value) {
    const existing = await db.user.findUnique({ where: { email: value } })
    return NextResponse.json({ available: !existing })
  }

  return NextResponse.json({ error: 'Invalid check parameter' }, { status: 400 })
}
