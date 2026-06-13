'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'

const fontMap: Record<string, string> = {
  Inter: "'Inter', sans-serif",
  Syne: "'Syne', sans-serif",
  'Space Grotesk': "'Space Grotesk', sans-serif",
  'DM Sans': "'DM Sans', sans-serif",
}

const themeStyles: Record<string, { bg: string; text: string; linkBg: string; linkText: string; linkBorder: string }> = {
  minimal: { bg: '#ffffff', text: '#1a1a1a', linkBg: '#f5f5f5', linkText: '#1a1a1a', linkBorder: '#e5e5e5' },
  dark: { bg: '#0F0F10', text: '#F2F2F4', linkBg: 'rgba(255,255,255,0.06)', linkText: '#F2F2F4', linkBorder: 'rgba(255,255,255,0.08)' },
  gradient: { bg: 'linear-gradient(135deg, #6C47FF 0%, #00E5BE 100%)', text: '#ffffff', linkBg: 'rgba(255,255,255,0.2)', linkText: '#ffffff', linkBorder: 'rgba(255,255,255,0.3)' },
  glass: { bg: 'rgba(26, 26, 31, 0.6)', text: '#F2F2F4', linkBg: 'rgba(255,255,255,0.08)', linkText: '#F2F2F4', linkBorder: 'rgba(255,255,255,0.1)' },
  retro: { bg: '#FFF8E7', text: '#2D2D2D', linkBg: '#F0E6CE', linkText: '#2D2D2D', linkBorder: '#D4C5A0' },
}

function getButtonRadius(style: string): string {
  switch (style) {
    case 'pill': return '9999px'
    case 'square': return '4px'
    case 'outline': return '12px'
    default: return '12px'
  }
}

export default function PhonePreview() {
  const { user, links, pageSettings } = useAppStore()

  const activeLinks = useMemo(
    () => [...links].filter((l) => l.isActive).sort((a, b) => a.position - b.position),
    [links]
  )

  const theme = themeStyles[pageSettings.theme] || themeStyles.dark
  const fontFamily = fontMap[pageSettings.font] || fontMap.Inter
  const buttonRadius = getButtonRadius(pageSettings.buttonStyle)
  const isGradientBg = pageSettings.theme === 'gradient' || pageSettings.bgGradient

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs text-[#8A8A9A] mb-3 font-medium uppercase tracking-wider">
        Live Preview
      </p>
      <div className="w-[260px] phone-frame bg-[#1A1A1F] p-3 relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#0F0F10] rounded-b-2xl z-10" />

        {/* Screen content */}
        <div
          className="mt-6 rounded-[20px] overflow-hidden min-h-[420px] max-h-[500px] overflow-y-auto"
          style={{
            background: isGradientBg
              ? pageSettings.bgGradient || theme.bg
              : pageSettings.bgColor || theme.bg,
            fontFamily,
          }}
        >
          <div className="flex flex-col items-center px-5 py-6 gap-3">
            {/* Avatar */}
            <AnimatePresence mode="wait">
              <motion.div
                key={pageSettings.avatarShape + (user?.avatarUrl || 'default')}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-16 h-16 flex items-center justify-center text-xl font-bold text-white overflow-hidden"
                style={{
                  borderRadius:
                    pageSettings.avatarShape === 'circle'
                      ? '50%'
                      : pageSettings.avatarShape === 'square'
                        ? '4px'
                        : '16px',
                  background: `linear-gradient(135deg, ${pageSettings.accentColor}, ${pageSettings.accentColor}88)`,
                }}
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (user?.displayName?.[0] || user?.username?.[0] || '?').toUpperCase()
                )}
              </motion.div>
            </AnimatePresence>

            {/* Name & Bio */}
            <div className="text-center">
              <p className="font-semibold text-sm" style={{ color: theme.text }}>
                {user?.displayName || 'Your Name'}
              </p>
              {user?.bio && (
                <p className="text-xs mt-1 opacity-70" style={{ color: theme.text }}>
                  {user.bio}
                </p>
              )}
              <p className="text-[10px] mt-1 opacity-50" style={{ color: theme.text }}>
                @{user?.username || 'username'}
              </p>
            </div>

            {/* Links */}
            <div className="w-full space-y-2 mt-2">
              <AnimatePresence>
                {activeLinks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-6"
                  >
                    <Link2
                      className="w-6 h-6 mx-auto mb-2 opacity-30"
                      style={{ color: theme.text }}
                    />
                    <p className="text-xs opacity-40" style={{ color: theme.text }}>
                      Add links to see them here
                    </p>
                  </motion.div>
                ) : (
                  activeLinks.map((link, i) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                      className="w-full py-2 px-4 text-center text-xs font-medium cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background:
                          pageSettings.buttonStyle === 'outline'
                            ? 'transparent'
                            : theme.linkBg,
                        color:
                          pageSettings.buttonStyle === 'outline'
                            ? pageSettings.accentColor
                            : theme.linkText,
                        borderRadius: buttonRadius,
                        border:
                          pageSettings.buttonStyle === 'outline'
                            ? `1.5px solid ${pageSettings.accentColor}`
                            : `1px solid ${theme.linkBorder}`,
                      }}
                    >
                      {link.icon && <span className="mr-1.5">{link.icon}</span>}
                      {link.title}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer branding */}
            <div className="mt-4 flex items-center gap-1 opacity-30">
              <Link2 className="w-3 h-3" style={{ color: theme.text }} />
              <span className="text-[9px]" style={{ color: theme.text }}>
                LinkForge
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-2 flex justify-center">
          <div className="w-24 h-1 bg-[#8A8A9A]/30 rounded-full" />
        </div>
      </div>
    </div>
  )
}
