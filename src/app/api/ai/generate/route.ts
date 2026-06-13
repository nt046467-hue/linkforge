import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserIdFromRequest } from '@/lib/auth'
import ZAI from 'z-ai-web-dev-sdk'

// POST /api/ai/generate - Generate AI content
export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check generation limits
    if (user.plan !== 'pro' && user.aiGenerations >= 3) {
      return NextResponse.json(
        { error: 'AI generation limit reached. Upgrade to Pro for unlimited generations.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const systemPrompt = `You are a creative assistant for LinkForge, a bio link builder. Given a user's description of themselves, generate:
1. A catchy display_name (max 30 chars)
2. A compelling bio/tagline (max 160 chars)
3. A short tagline/motto (max 60 chars)
4. 3-5 suggested links with title, url, and emoji icon
5. A theme recommendation from: minimal, dark, gradient, glass, retro
6. An accent color as hex code

Respond ONLY with valid JSON in this exact format:
{
  "display_name": "...",
  "bio": "...",
  "tagline": "...",
  "suggested_links": [
    {"title": "...", "url": "https://...", "icon": "🔗"}
  ],
  "theme_recommendation": "dark",
  "accent_color": "#6C47FF"
}`

    // Use z-ai-web-dev-sdk for AI generation
    const zai = await ZAI.create()
    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
    })

    // Parse the AI response
    let result
    try {
      const content = response.choices?.[0]?.message?.content || ''
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch {
      // Fallback result
      result = {
        display_name: user.displayName || user.username,
        bio: prompt.slice(0, 160),
        tagline: 'Creative soul',
        suggested_links: [
          { title: 'My Website', url: 'https://example.com', icon: '🌐' },
          { title: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
          { title: 'YouTube', url: 'https://youtube.com', icon: '📺' },
        ],
        theme_recommendation: 'dark',
        accent_color: '#6C47FF',
      }
    }

    // Increment AI generations counter
    await db.user.update({
      where: { id: userId },
      data: { aiGenerations: { increment: 1 } },
    })

    return NextResponse.json({
      result,
      generationsUsed: user.aiGenerations + 1,
    })
  } catch (error) {
    console.error('AI generate error:', error)
    return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 500 })
  }
}
