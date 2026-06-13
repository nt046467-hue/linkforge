'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Loader2,
  X,
  Check,
  Wand2,
  User,
  FileText,
  Link2,
  Palette,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

interface AiGeneratorProps {
  onClose: () => void
}

interface AiResult {
  display_name?: string
  bio?: string
  tagline?: string
  suggested_links?: Array<{ title: string; url: string; icon: string }>
  theme_recommendation?: string
  accent_color?: string
}

export default function AiGenerator({ onClose }: AiGeneratorProps) {
  const { user, aiLoading, setAiLoading, aiResult, setAiResult, setUser, setPageSettings, addLink, links } = useAppStore()
  const [prompt, setPrompt] = useState('')

  const generationsUsed = user?.aiGenerations || 0
  const maxGenerations = user?.plan === 'pro' ? Infinity : 3
  const canGenerate = user?.plan === 'pro' || generationsUsed < 3

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe yourself first')
      return
    }

    if (!canGenerate) {
      toast.error('You\'ve used all your AI generations this month. Upgrade to Pro for unlimited!')
      return
    }

    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Generation failed')
      }

      const data = await res.json()
      setAiResult(data.result)
      toast.success('AI generation complete!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleApplyAll = async () => {
    if (!aiResult) return

    try {
      const typed = aiResult as AiResult

      // Apply display name and bio together
      if (user) {
        setUser({
          ...user,
          displayName: typed.display_name ? String(typed.display_name) : user.displayName,
          bio: typed.bio ? String(typed.bio) : user.bio,
        })
      }

      // Apply theme recommendation
      if (typed.theme_recommendation) {
        setPageSettings({ theme: String(typed.theme_recommendation) })
      }

      // Apply accent color
      if (typed.accent_color) {
        setPageSettings({ accentColor: String(typed.accent_color) })
      }

      // Apply suggested links
      if (aiResult.suggested_links && Array.isArray(aiResult.suggested_links)) {
        for (const link of aiResult.suggested_links) {
          try {
            const res = await fetch('/api/links', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: link.title,
                url: link.url,
                icon: link.icon || undefined,
              }),
            })
            if (res.ok) {
              const newLink = await res.json()
              addLink(newLink)
            }
          } catch {
            // Skip failed links
          }
        }
      }

      // Save user settings
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: aiResult.display_name || user?.displayName,
          bio: aiResult.bio || user?.bio,
          theme: aiResult.theme_recommendation,
          accentColor: aiResult.accent_color,
        }),
      })

      toast.success('All changes applied!')
      onClose()
    } catch {
      toast.error('Failed to apply some changes')
    }
  }

  const result = aiResult as AiResult | null

  return (
    <Card className="bg-[#1A1A1F] border-border p-6 max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6C47FF]/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#6C47FF]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#F2F2F4]">AI Generator</h2>
            <p className="text-xs text-[#8A8A9A]">Describe yourself and let AI build your page</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A8A9A] hover:text-[#F2F2F4] hover:bg-[#0F0F10] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Usage counter */}
      <div className="flex items-center gap-2 mb-4">
        <Badge
          variant="outline"
          className={`text-xs ${
            canGenerate
              ? 'border-[#00E5BE]/30 text-[#00E5BE]'
              : 'border-destructive/30 text-destructive'
          }`}
        >
          {user?.plan === 'pro'
            ? 'Unlimited generations'
            : `${3 - generationsUsed}/3 AI generations used this month`}
        </Badge>
        {user?.plan !== 'pro' && (
          <button
            onClick={() => useAppStore.getState().setDashboardTab('upgrade')}
            className="text-xs text-[#6C47FF] hover:underline"
          >
            Upgrade for unlimited
          </button>
        )}
      </div>

      {/* Prompt input */}
      <div className="space-y-3 mb-6">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe yourself... e.g., 'I'm a freelance designer who loves minimalism, photography, and travel. I run a YouTube channel and sell digital products.'"
          rows={4}
          className="bg-[#0F0F10] border-border rounded-[12px] text-[#F2F2F4] placeholder:text-[#8A8A9A]/50 resize-none"
        />
        <Button
          className="w-full gradient-brand text-white font-medium rounded-[20px] py-5 hover:opacity-90 transition-opacity"
          onClick={handleGenerate}
          disabled={aiLoading || !canGenerate}
        >
          {aiLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate with AI
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#6C47FF]" />
            <span className="text-sm font-medium text-[#F2F2F4]">AI Results</span>
          </div>

          {/* Display Name */}
          {result.display_name && (
            <div className="bg-[#0F0F10] rounded-[12px] p-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-3.5 h-3.5 text-[#6C47FF]" />
                <span className="text-xs text-[#8A8A9A]">Display Name</span>
              </div>
              <p className="text-sm text-[#F2F2F4] font-medium">{result.display_name}</p>
            </div>
          )}

          {/* Bio */}
          {result.bio && (
            <div className="bg-[#0F0F10] rounded-[12px] p-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-3.5 h-3.5 text-[#6C47FF]" />
                <span className="text-xs text-[#8A8A9A]">Bio</span>
              </div>
              <p className="text-sm text-[#F2F2F4]">{result.bio}</p>
            </div>
          )}

          {/* Tagline */}
          {result.tagline && (
            <div className="bg-[#0F0F10] rounded-[12px] p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-[#8A8A9A]">💬 Tagline</span>
              </div>
              <p className="text-sm text-[#F2F2F4] italic">&ldquo;{result.tagline}&rdquo;</p>
            </div>
          )}

          {/* Suggested Links */}
          {result.suggested_links && result.suggested_links.length > 0 && (
            <div className="bg-[#0F0F10] rounded-[12px] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="w-3.5 h-3.5 text-[#6C47FF]" />
                <span className="text-xs text-[#8A8A9A]">Suggested Links</span>
              </div>
              <div className="space-y-2">
                {result.suggested_links.map((link, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-[#F2F2F4]"
                  >
                    <span>{link.icon || '🔗'}</span>
                    <span className="font-medium">{link.title}</span>
                    <span className="text-xs text-[#8A8A9A] truncate">
                      {link.url}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Theme Recommendation */}
          {(result.theme_recommendation || result.accent_color) && (
            <div className="bg-[#0F0F10] rounded-[12px] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-3.5 h-3.5 text-[#6C47FF]" />
                <span className="text-xs text-[#8A8A9A]">Theme Recommendation</span>
              </div>
              <div className="flex items-center gap-3">
                {result.theme_recommendation && (
                  <Badge
                    variant="outline"
                    className="border-[#6C47FF]/30 text-[#6C47FF]"
                  >
                    {result.theme_recommendation}
                  </Badge>
                )}
                {result.accent_color && (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ background: result.accent_color }}
                    />
                    <span className="text-xs text-[#8A8A9A]">
                      {result.accent_color}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Apply button */}
          <Button
            className="w-full rounded-[20px] py-5 font-semibold bg-[#00E5BE] text-[#0F0F10] hover:bg-[#00E5BE]/90 transition-colors"
            onClick={handleApplyAll}
          >
            <Check className="w-4 h-4 mr-2" />
            Apply All Changes
          </Button>
        </motion.div>
      )}
    </Card>
  )
}
