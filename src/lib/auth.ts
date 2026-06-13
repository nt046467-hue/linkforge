import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const SESSION_SECRET = process.env.NEXTAUTH_SECRET || 'linkforge-secret-key-2024'

// Simple session token: base64(userId:timestamp:hmac)
export async function createSession(userId: string): Promise<string> {
  const timestamp = Date.now().toString()
  const payload = `${userId}:${timestamp}`

  const crypto = await import('crypto')
  const hmac = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex')

  const token = Buffer.from(`${payload}:${hmac}`).toString('base64')
  return token
}

export async function verifySession(token: string): Promise<string | null> {
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const [userId, timestamp, hmac] = decoded.split(':')

    if (!userId || !timestamp || !hmac) return null

    // Check token age (30 days)
    const tokenAge = Date.now() - parseInt(timestamp)
    if (tokenAge > 30 * 24 * 60 * 60 * 1000) return null

    // Verify HMAC
    const crypto = await import('crypto')
    const expectedHmac = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(`${userId}:${timestamp}`)
      .digest('hex')

    if (hmac !== expectedHmac) return null

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return null

    return userId
  } catch {
    return null
  }
}

export async function getSessionUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('linkforge_session')?.value
    if (!token) return null
    return await verifySession(token)
  } catch {
    return null
  }
}

export async function getSessionUserIdFromRequest(req: NextRequest): Promise<string | null> {
  try {
    const token = req.cookies.get('linkforge_session')?.value
    if (!token) return null
    return await verifySession(token)
  } catch {
    return null
  }
}
