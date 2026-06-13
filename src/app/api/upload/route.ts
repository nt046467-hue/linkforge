import { NextRequest, NextResponse } from 'next/server'
import { getSessionUserIdFromRequest } from '@/lib/auth'

// POST /api/upload - Upload an image (avatar) via Cloudinary
export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be less than 5MB' }, { status: 400 })
    }

    // Use Cloudinary for file storage (works on Vercel serverless)
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      // Fallback: return a placeholder if Cloudinary is not configured
      return NextResponse.json({
        error: 'Image upload not configured. Add CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET to your environment variables.',
      }, { status: 500 })
    }

    // Upload to Cloudinary via their unsigned upload API
    const cloudinaryForm = new FormData()
    cloudinaryForm.append('file', file)
    cloudinaryForm.append('upload_preset', uploadPreset)
    cloudinaryForm.append('folder', 'linkforge/avatars')
    cloudinaryForm.append('public_id', `avatar_${userId}`)
    cloudinaryForm.append('overwrite', 'true')

    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: cloudinaryForm,
    })

    if (!cloudRes.ok) {
      const err = await cloudRes.json()
      console.error('Cloudinary upload error:', err)
      return NextResponse.json({ error: 'Image upload failed' }, { status: 500 })
    }

    const cloudData = await cloudRes.json()
    const url = cloudData.secure_url

    // Update user avatar in DB
    const { db } = await import('@/lib/db')
    await db.user.update({
      where: { id: userId },
      data: { avatarUrl: url },
    })

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
