'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Save, Camera, User, Mail, AtSign, FileText, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

export default function SettingsPanel() {
  const { user, setUser, isLoading, setIsLoading } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        displayName: user.displayName || '',
        bio: user.bio || '',
      })
      setAvatarPreview(user.avatarUrl || null)
    }
  }, [user])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      let avatarUrl = user?.avatarUrl || null

      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData()
        formData.append('file', avatarFile)
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          avatarUrl = uploadData.url
        }
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: form.displayName || null,
          bio: form.bio || null,
          avatarUrl,
        }),
      })

      if (!res.ok) throw new Error('Failed to save')

      const data = await res.json()
      setUser(data.user)
      toast.success('Settings saved!')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F2F2F4]">Settings</h1>
          <p className="text-sm text-[#8A8A9A] mt-1">Manage your profile and account</p>
        </div>
        <Button
          className="gradient-brand text-white font-medium rounded-[20px] hover:opacity-90 transition-opacity"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-[#1A1A1F] border-border p-6">
            <Label className="text-sm font-medium text-[#F2F2F4] mb-4 block">
              Profile Photo
            </Label>
            <div className="flex items-center gap-5">
              <div className="relative group">
                <Avatar className="w-20 h-20 border-2 border-border group-hover:border-[#6C47FF]/30 transition-colors">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="bg-[#6C47FF]/20 text-[#6C47FF] text-2xl font-bold">
                    {user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-sm text-[#F2F2F4]">
                  {avatarPreview ? 'Change photo' : 'Upload a photo'}
                </p>
                <p className="text-xs text-[#8A8A9A] mt-1">
                  Recommended: 400x400px, max 5MB
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-[#1A1A1F] border-border p-6">
            <Label className="text-sm font-medium text-[#F2F2F4] mb-4 block">
              Profile Information
            </Label>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm text-[#8A8A9A]">
                  Display Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
                  <Input
                    id="displayName"
                    value={form.displayName}
                    onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                    placeholder="Your display name"
                    className="pl-10 bg-[#0F0F10] border-border rounded-[8px] text-[#F2F2F4] placeholder:text-[#8A8A9A]/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm text-[#8A8A9A]">
                  Bio
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-[#8A8A9A]" />
                  <Textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell the world about yourself..."
                    rows={3}
                    className="pl-10 bg-[#0F0F10] border-border rounded-[8px] text-[#F2F2F4] placeholder:text-[#8A8A9A]/50 resize-none"
                  />
                </div>
                <p className="text-xs text-[#8A8A9A] text-right">
                  {form.bio.length}/160
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Account Info (read-only) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-[#1A1A1F] border-border p-6">
            <Label className="text-sm font-medium text-[#F2F2F4] mb-4 block">
              Account
            </Label>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-[#8A8A9A]">Username</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
                  <Input
                    value={user?.username || ''}
                    readOnly
                    className="pl-10 bg-[#0F0F10] border-border rounded-[8px] text-[#8A8A9A] cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-[#8A8A9A]">Username cannot be changed after creation</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-[#8A8A9A]">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
                  <Input
                    value={user?.email || ''}
                    readOnly
                    className="pl-10 bg-[#0F0F10] border-border rounded-[8px] text-[#8A8A9A] cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-[#8A8A9A]">Plan</Label>
                <div className="flex items-center gap-3">
                  <Badge
                    className={`py-1.5 px-3 ${
                      user?.plan === 'pro'
                        ? 'bg-[#6C47FF]/20 text-[#6C47FF] border-[#6C47FF]/30'
                        : 'bg-[#1A1A1F] text-[#8A8A9A] border-border'
                    }`}
                  >
                    {user?.plan === 'pro' ? (
                      <Crown className="w-3.5 h-3.5 mr-1.5" />
                    ) : null}
                    {user?.plan === 'pro' ? 'Pro' : 'Free'}
                  </Badge>
                  {user?.plan !== 'pro' && (
                    <button
                      onClick={() => useAppStore.getState().setDashboardTab('upgrade')}
                      className="text-xs text-[#6C47FF] hover:underline"
                    >
                      Upgrade to Pro
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
