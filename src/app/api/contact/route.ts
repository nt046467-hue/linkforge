import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth'

// POST /api/contact - Submit a contact message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (name.length > 100) {
      return NextResponse.json({ error: 'Name must be under 100 characters' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (subject.length > 200) {
      return NextResponse.json({ error: 'Subject must be under 200 characters' }, { status: 400 })
    }

    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message must be under 5000 characters' }, { status: 400 })
    }

    await db.contactMessage.create({
      data: { name, email, subject, message },
    })

    return NextResponse.json({ success: true, message: 'Message sent successfully!' })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

// GET /api/contact - List contact messages (admin only)
export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (Nabin - the app owner)
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.username !== 'nabin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Fetch messages error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// PATCH /api/contact - Mark message as read
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.username !== 'nabin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { id, isRead } = body

    if (!id) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
    }

    await db.contactMessage.update({
      where: { id },
      data: { isRead: isRead ?? true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update message error:', error)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}

// DELETE /api/contact - Delete a message
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.username !== 'nabin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
    }

    await db.contactMessage.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete message error:', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
