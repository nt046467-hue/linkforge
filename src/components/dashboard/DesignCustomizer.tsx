'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useAppStore, type PageSettings } from '@/lib/store'
import { toast } from 'sonner'

interface ThemeOption {
  id: string
  label: string
  preview: { bg: string; text: string; linkBg: string }
}

const themes: ThemeOption[] = [
  { id: 'minimal', label: 'Minimal', preview: { bg: '#ffffff', text: '#1a1a1a', linkBg: '#f5f5f5' } },
  { id: 'dark', label: 'Dark', preview: { bg: '#0F0F10', text: '#F2F2F4', linkBg: 'rgba(255,255,255,0.06)' } },
  { id: 'gradient', label: 'Gradient', preview: { bg: 'linear-gradient(135deg, #6C47FF, #00E5BE)', text: '#ffffff', linkBg: 'rgba(255,255,255,0.2)' } },
  { id: 'glass', label: 'Glass', preview: { bg: 'rgba(26, 26, 31, 0.6)', text: '#F2F2F4', linkBg: 'rgba(255,255,255,0.08)' } },
  { id: 'retro', label: 'Retro', preview: { bg: '#FFF8E7', text: '#2D2D2D', linkBg: '#F0E6CE' } },
]

interface ButtonStyleOption {
  id: string
  label: string
  radius: string
}

const buttonStyles: ButtonStyleOption[] = [
  { id: 'rounded', label: 'Rounded', radius: '12px' },
  { id: 'pill', label: 'Pill', radius: '9999px' },
  { id: 'square', label: 'Square', radius: '4px' },
  { id: 'outline', label: 'Outline', radius: '12px' },
]

const fonts = [
  { id: 'Inter', label: 'Inter', sample: 'Aa' },
  { id: 'Syne', label: 'Syne', sample: 'Aa' },
  { id: 'Space Grotesk', label: 'Space Grotesk', sample: 'Aa' },
  { id: 'DM Sans', label: 'DM Sans', sample: 'Aa' },
]

const avatarShapes = [
  { id: 'circle', label: 'Circle', radius: '50%' },
  { id: 'square', label: 'Square', radius: '4px' },
  { id: 'rounded', label: 'Rounded', radius: '16px' },
]

const accentColors = [
  '#6C47FF', '#00E5BE', '#FF6B81', '#FFC312', '#3742FA', '#FF4757',
  '#2ED573', '#1E90FF', '#A855F7', '#F97316',
]

export default function DesignCustomizer() {
  const { pageSettings, setPageSettings, user } = useAppStore()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          if (data) {
            setPageSettings({
              theme: data.theme || 'dark',
              bgColor: data.bgColor || '#0F0F10',
              bgGradient: data.bgGradient || null,
              buttonStyle: data.buttonStyle || 'rounded',
              font: data.font || 'Inter',
              avatarShape: data.avatarShape || 'circle',
              accentColor: data.accentColor || '#6C47FF',
            })
          }
        }
      } catch {
        // Use defaults from store
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [setPageSettings])

  const saveSettings = useCallback(
    async (updates: Partial<PageSettings>) => {
      const newSettings = { ...pageSettings, ...updates }
      setPageSettings(updates)
      setSaving(true)
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSettings),
        })
        if (!res.ok) throw new Error()
      } catch {
        toast.error('Failed to save settings')
      } finally {
        setSaving(false)
      }
    },
    [pageSettings, setPageSettings]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#6C47FF] animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F2F2F4]">Design</h1>
          <p className="text-sm text-[#8A8A9A] mt-1">
            Customize the look and feel of your page
          </p>
        </div>
        {saving && (
          <div className="flex items-center gap-2 text-sm text-[#8A8A9A]">
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* Theme Picker */}
        <section>
          <Label className="text-sm font-medium text-[#F2F2F4] mb-3 block">
            Theme
          </Label>
          <div className="grid grid-cols-5 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => saveSettings({ theme: theme.id, bgColor: theme.id === 'dark' ? '#0F0F10' : theme.id === 'minimal' ? '#ffffff' : theme.id === 'retro' ? '#FFF8E7' : pageSettings.bgColor })}
                className={`relative rounded-[12px] overflow-hidden border-2 transition-all ${
                  pageSettings.theme === theme.id
                    ? 'border-[#6C47FF] scale-[1.02]'
                    : 'border-border hover:border-[#8A8A9A]/30'
                }`}
              >
                <div
                  className="aspect-[9/16] p-2 flex flex-col items-center gap-1"
                  style={{ background: theme.preview.bg }}
                >
                  <div
                    className="w-6 h-6 rounded-full mt-2"
                    style={{
                      background: pageSettings.accentColor,
                      borderRadius:
                        pageSettings.avatarShape === 'circle'
                          ? '50%'
                          : pageSettings.avatarShape === 'square'
                            ? '2px'
                            : '8px',
                    }}
                  />
                  <div
                    className="w-12 h-1.5 rounded-full"
                    style={{ background: theme.preview.text, opacity: 0.5 }}
                  />
                  <div
                    className="w-16 h-3 rounded"
                    style={{ background: theme.preview.linkBg }}
                  />
                  <div
                    className="w-16 h-3 rounded"
                    style={{ background: theme.preview.linkBg }}
                  />
                </div>
                {pageSettings.theme === theme.id && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-[#6C47FF] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <p className="text-[10px] text-center py-1 text-[#8A8A9A] bg-[#1A1A1F]">
                  {theme.label}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Background Color */}
        <section>
          <Label className="text-sm font-medium text-[#F2F2F4] mb-3 block">
            Background Color
          </Label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="color"
                value={pageSettings.bgColor}
                onChange={(e) => saveSettings({ bgColor: e.target.value })}
                className="w-10 h-10 rounded-[8px] border border-border cursor-pointer bg-transparent"
              />
            </div>
            <Input
              value={pageSettings.bgColor}
              onChange={(e) => saveSettings({ bgColor: e.target.value })}
              className="bg-[#0F0F10] border-border rounded-[8px] text-[#F2F2F4] w-32 font-mono text-sm"
            />
          </div>
        </section>

        {/* Button Style */}
        <section>
          <Label className="text-sm font-medium text-[#F2F2F4] mb-3 block">
            Button Style
          </Label>
          <div className="grid grid-cols-4 gap-3">
            {buttonStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => saveSettings({ buttonStyle: style.id })}
                className={`relative p-4 rounded-[12px] border-2 transition-all flex flex-col items-center gap-2 ${
                  pageSettings.buttonStyle === style.id
                    ? 'border-[#6C47FF] bg-[#6C47FF]/5'
                    : 'border-border bg-[#1A1A1F] hover:border-[#8A8A9A]/30'
                }`}
              >
                <div
                  className="w-full py-1.5 text-center text-xs font-medium"
                  style={{
                    background: style.id === 'outline' ? 'transparent' : pageSettings.accentColor,
                    color: '#fff',
                    borderRadius: style.radius,
                    border: style.id === 'outline' ? `1.5px solid ${pageSettings.accentColor}` : 'none',
                  }}
                >
                  {style.label}
                </div>
                {pageSettings.buttonStyle === style.id && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#6C47FF] rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Font */}
        <section>
          <Label className="text-sm font-medium text-[#F2F2F4] mb-3 block">
            Font
          </Label>
          <div className="grid grid-cols-4 gap-3">
            {fonts.map((font) => (
              <button
                key={font.id}
                onClick={() => saveSettings({ font: font.id })}
                className={`p-4 rounded-[12px] border-2 transition-all text-center ${
                  pageSettings.font === font.id
                    ? 'border-[#6C47FF] bg-[#6C47FF]/5'
                    : 'border-border bg-[#1A1A1F] hover:border-[#8A8A9A]/30'
                }`}
              >
                <span className="text-2xl text-[#F2F2F4] block mb-1">{font.sample}</span>
                <span className="text-[10px] text-[#8A8A9A]">{font.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Avatar Shape */}
        <section>
          <Label className="text-sm font-medium text-[#F2F2F4] mb-3 block">
            Avatar Shape
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {avatarShapes.map((shape) => (
              <button
                key={shape.id}
                onClick={() => saveSettings({ avatarShape: shape.id })}
                className={`p-4 rounded-[12px] border-2 transition-all flex flex-col items-center gap-2 ${
                  pageSettings.avatarShape === shape.id
                    ? 'border-[#6C47FF] bg-[#6C47FF]/5'
                    : 'border-border bg-[#1A1A1F] hover:border-[#8A8A9A]/30'
                }`}
              >
                <div
                  className="w-10 h-10"
                  style={{
                    background: pageSettings.accentColor,
                    borderRadius: shape.radius,
                  }}
                />
                <span className="text-xs text-[#8A8A9A]">{shape.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Accent Color */}
        <section>
          <Label className="text-sm font-medium text-[#F2F2F4] mb-3 block">
            Accent Color
          </Label>
          <div className="flex flex-wrap gap-3">
            {accentColors.map((color) => (
              <button
                key={color}
                onClick={() => saveSettings({ accentColor: color })}
                className={`w-9 h-9 rounded-[8px] transition-all flex items-center justify-center ${
                  pageSettings.accentColor === color
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0F0F10] scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ background: color }}
              >
                {pageSettings.accentColor === color && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </button>
            ))}
            <div className="relative">
              <input
                type="color"
                value={pageSettings.accentColor}
                onChange={(e) => saveSettings({ accentColor: e.target.value })}
                className="w-9 h-9 rounded-[8px] border border-border cursor-pointer bg-transparent"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
