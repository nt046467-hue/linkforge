import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserIdFromRequest } from '@/lib/auth'

// GET /api/settings - Get user's page settings
export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await db.pageSetting.findUnique({
      where: { userId },
    })

    if (!settings) {
      // Create default settings
      const defaultSettings = await db.pageSetting.create({
        data: {
          userId,
          theme: 'dark',
          bgColor: '#0F0F10',
          buttonStyle: 'rounded',
          font: 'Inter',
          avatarShape: 'circle',
          accentColor: '#6C47FF',
        },
      })
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/settings - Update user's page settings and/or profile
export async function PUT(req: NextRequest) {
  try {
    const userId = await getSessionUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Update profile if profile fields are present
    if (body.displayName !== undefined || body.bio !== undefined || body.avatarUrl !== undefined) {
      await db.user.update({
        where: { id: userId },
        data: {
          ...(body.displayName !== undefined && { displayName: body.displayName }),
          ...(body.bio !== undefined && { bio: body.bio }),
          ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
        },
      })
    }

    // Update page settings
    const settingsData: Record<string, unknown> = {}
    const settingsFields = ['theme', 'bgColor', 'bgGradient', 'buttonStyle', 'font', 'avatarShape', 'accentColor']

    for (const field of settingsFields) {
      if (body[field] !== undefined) {
        settingsData[field] = body[field]
      }
    }

    if (Object.keys(settingsData).length > 0) {
      await db.pageSetting.upsert({
        where: { userId },
        update: settingsData,
        create: {
          userId,
          theme: settingsData.theme as string || 'dark',
          bgColor: settingsData.bgColor as string || '#0F0F10',
          bgGradient: settingsData.bgGradient as string || null,
          buttonStyle: settingsData.buttonStyle as string || 'rounded',
          font: settingsData.font as string || 'Inter',
          avatarShape: settingsData.avatarShape as string || 'circle',
          accentColor: settingsData.accentColor as string || '#6C47FF',
        },
      })
    }

    // Return updated user
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { pageSetting: true },
    })

    return NextResponse.json({
      user: user ? {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
        aiGenerations: user.aiGenerations,
      } : null,
      settings: user?.pageSetting || null,
    })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
