'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, AlertCircle, Loader2 } from 'lucide-react'

interface PublicLink {
  id: string
  title: string
  url: string
  icon?: string
  thumbnailUrl?: string
  category?: string
}

interface PublicUser {
  id: string
  username: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
}

interface PublicSettings {
  theme: string
  bgColor: string
  bgGradient: string | null
  buttonStyle: string
  font: string
  avatarShape: string
  accentColor: string
}

const fontMap: Record<string, string> = {
  Inter: "'Inter', sans-serif",
  Syne: "'Syne', sans-serif",
  'Space Grotesk': "'Space Grotesk', sans-serif",
  'DM Sans': "'DM Sans', sans-serif",
}

const themeStyles: Record<string, { bg: string; text: string; linkBg: string; linkText: string; linkBorder: string; linkHover: string }> = {
  minimal: { bg: '#ffffff', text: '#1a1a1a', linkBg: '#f5f5f5', linkText: '#1a1a1a', linkBorder: '#e5e5e5', linkHover: '#eeeeee' },
  dark: { bg: '#0F0F10', text: '#F2F2F4', linkBg: 'rgba(255,255,255,0.06)', linkText: '#F2F2F4', linkBorder: 'rgba(255,255,255,0.08)', linkHover: 'rgba(255,255,255,0.12)' },
  gradient: { bg: 'linear-gradient(135deg, #6C47FF 0%, #00E5BE 100%)', text: '#ffffff', linkBg: 'rgba(255,255,255,0.2)', linkText: '#ffffff', linkBorder: 'rgba(255,255,255,0.3)', linkHover: 'rgba(255,255,255,0.3)' },
  glass: { bg: 'rgba(26, 26, 31, 0.6)', text: '#F2F2F4', linkBg: 'rgba(255,255,255,0.08)', linkText: '#F2F2F4', linkBorder: 'rgba(255,255,255,0.1)', linkHover: 'rgba(255,255,255,0.15)' },
  retro: { bg: '#FFF8E7', text: '#2D2D2D', linkBg: '#F0E6CE', linkText: '#2D2D2D', linkBorder: '#D4C5A0', linkHover: '#E8DAB8' },
}

function getButtonRadius(style: string): string {
  switch (style) {
    case 'pill': return '9999px'
    case 'square': return '4px'
    case 'outline': return '12px'
    default: return '12px'
  }
}

export default function PublicProfilePage() {
  const params = useParams()
  const username = params.username as string

  const [user, setUser] = useState<PublicUser | null>(null)
  const [links, setLinks] = useState<PublicLink[]>([])
  const [settings, setSettings] = useState<PublicSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewTracked, setViewTracked] = useState(false)

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile/${username}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError('User not found')
          } else {
            setError('Failed to load profile')
          }
          return
        }
        const data = await res.json()
        setUser(data.user)
        setLinks(data.links)
        setSettings(data.settings)
      } catch {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    if (username) fetchProfile()
  }, [username])

  // Track page view
  const trackView = useCallback(async () => {
    if (!user || viewTracked) return
    try {
      await fetch('/api/track/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, referrer: document.referrer || null }),
      })
      setViewTracked(true)
    } catch {}
  }, [user, viewTracked])

  useEffect(() => {
    if (user && !viewTracked) {
      trackView()
    }
  }, [user, viewTracked, trackView])

  // Handle link click with tracking
  const handleLinkClick = async (link: PublicLink) => {
    try {
      await fetch('/api/track/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: link.id, referrer: document.referrer || null }),
      })
    } catch {}
    // Open link
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F10]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#6C47FF] animate-spin" />
          <p className="text-[#8A8A9A] text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !user || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F10]">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <AlertCircle className="w-12 h-12 text-[#8A8A9A]" />
          <h1 className="text-xl font-semibold text-[#F2F2F4]">
            {error === 'User not found' ? 'Page Not Found' : 'Something Went Wrong'}
          </h1>
          <p className="text-[#8A8A9A] text-sm max-w-sm">
            {error === 'User not found'
              ? `The user "@${username}" doesn't exist or hasn't set up their page yet.`
              : 'We couldn\'t load this profile. Please try again later.'}
          </p>
          <a
            href="/"
            className="mt-4 text-[#6C47FF] hover:underline text-sm font-medium"
          >
            Go to LinkForge
          </a>
        </div>
      </div>
    )
  }

  const theme = themeStyles[settings.theme] || themeStyles.dark
  const fontFamily = fontMap[settings.font] || fontMap.Inter
  const buttonRadius = getButtonRadius(settings.buttonStyle)
  const isGradientBg = settings.theme === 'gradient' || settings.bgGradient

  // Group links by category
  const categories = links.reduce<Record<string, PublicLink[]>>((acc, link) => {
    const cat = link.category || 'Links'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(link)
    return acc
  }, {})
  const hasCategories = Object.keys(categories).length > 1 || (Object.keys(categories)[0] && Object.keys(categories)[0] !== 'Links')

  return (
    <div
      className="min-h-screen flex items-start justify-center"
      style={{
        background: isGradientBg
          ? settings.bgGradient || theme.bg
          : settings.bgColor || theme.bg,
        fontFamily,
        color: theme.text,
      }}
    >
      <div className="w-full max-w-lg mx-auto px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-24 h-24 flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-lg"
            style={{
              borderRadius:
                settings.avatarShape === 'circle'
                  ? '50%'
                  : settings.avatarShape === 'square'
                    ? '8px'
                    : '20px',
              background: `linear-gradient(135deg, ${settings.accentColor}, ${settings.accentColor}88)`,
            }}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName || 'Avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              (user.displayName?.[0] || user.username[0] || '?').toUpperCase()
            )}
          </motion.div>

          {/* Name, Bio, Username */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-center mt-5"
          >
            <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
              {user.displayName || user.username}
            </h1>
            {user.bio && (
              <p className="mt-2 text-sm opacity-70 max-w-sm" style={{ color: theme.text }}>
                {user.bio}
              </p>
            )}
            <p className="mt-1.5 text-sm opacity-50" style={{ color: theme.text }}>
              @{user.username}
            </p>
          </motion.div>

          {/* Links */}
          <div className="w-full mt-8">
            <AnimatePresence>
              {links.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Link2 className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: theme.text }} />
                  <p className="text-sm opacity-40" style={{ color: theme.text }}>
                    No links yet
                  </p>
                </motion.div>
              ) : hasCategories ? (
                // Grouped by category
                Object.entries(categories).map(([category, catLinks], catIdx) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + catIdx * 0.1 }}
                    className="mb-6"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-40 mb-3 px-1" style={{ color: theme.text }}>
                      {category}
                    </p>
                    <div className="space-y-3">
                      {catLinks.map((link, i) => (
                        <motion.button
                          key={link.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: 0.3 + catIdx * 0.1 + i * 0.05 }}
                          onClick={() => handleLinkClick(link)}
                          className="w-full py-3.5 px-5 text-sm font-medium cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 group"
                          style={{
                            background: settings.buttonStyle === 'outline' ? 'transparent' : theme.linkBg,
                            color: settings.buttonStyle === 'outline' ? settings.accentColor : theme.linkText,
                            borderRadius: buttonRadius,
                            border: settings.buttonStyle === 'outline'
                              ? `1.5px solid ${settings.accentColor}`
                              : `1px solid ${theme.linkBorder}`,
                          }}
                          onMouseEnter={(e) => {
                            if (settings.buttonStyle !== 'outline') {
                              e.currentTarget.style.background = theme.linkHover
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (settings.buttonStyle !== 'outline') {
                              e.currentTarget.style.background = theme.linkBg
                            }
                          }}
                        >
                          {/* Thumbnail or Icon */}
                          {link.thumbnailUrl ? (
                            <img src={link.thumbnailUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                          ) : link.icon ? (
                            <span className="text-lg shrink-0">{link.icon}</span>
                          ) : null}
                          <span className="flex-1 text-left">{link.title}</span>
                          <svg className="w-4 h-4 opacity-30 group-hover:opacity-60 transition-opacity shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                          </svg>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ))
              ) : (
                // Flat list
                <div className="space-y-3">
                  {links.map((link, i) => (
                    <motion.button
                      key={link.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.3 + i * 0.05 }}
                      onClick={() => handleLinkClick(link)}
                      className="w-full py-3.5 px-5 text-sm font-medium cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 group"
                      style={{
                        background: settings.buttonStyle === 'outline' ? 'transparent' : theme.linkBg,
                        color: settings.buttonStyle === 'outline' ? settings.accentColor : theme.linkText,
                        borderRadius: buttonRadius,
                        border: settings.buttonStyle === 'outline'
                          ? `1.5px solid ${settings.accentColor}`
                          : `1px solid ${theme.linkBorder}`,
                      }}
                      onMouseEnter={(e) => {
                        if (settings.buttonStyle !== 'outline') {
                          e.currentTarget.style.background = theme.linkHover
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (settings.buttonStyle !== 'outline') {
                          e.currentTarget.style.background = theme.linkBg
                        }
                      }}
                    >
                      {/* Thumbnail or Icon */}
                      {link.thumbnailUrl ? (
                        <img src={link.thumbnailUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      ) : link.icon ? (
                        <span className="text-lg shrink-0">{link.icon}</span>
                      ) : null}
                      <span className="flex-1 text-left">{link.title}</span>
                      <svg className="w-4 h-4 opacity-30 group-hover:opacity-60 transition-opacity shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </motion.button>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer branding */}
          <div className="mt-12 flex items-center gap-1.5 opacity-25 hover:opacity-40 transition-opacity">
            <Link2 className="w-3.5 h-3.5" style={{ color: theme.text }} />
            <a href="/" className="text-xs font-medium" style={{ color: theme.text }}>
              LinkForge
            </a>
          </div>
        </motion.div>
      </div>

      {/* Glass theme background blur effect */}
      {settings.theme === 'glass' && (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6C47FF]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00E5BE]/15 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#FF6B6B]/10 rounded-full blur-[100px]" />
        </div>
      )}
    </div>
  )
}
