'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Link2,
  Palette,
  BarChart3,
  Settings,
  Crown,
  LogOut,
  Menu,
  Sparkles,
  X,
  ChevronRight,
  Mail,
  ExternalLink,
  Copy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore, type DashboardTab } from '@/lib/store'
import { toast } from 'sonner'
import LinkManager from './LinkManager'
import DesignCustomizer from './DesignCustomizer'
import AnalyticsPanel from './AnalyticsPanel'
import SettingsPanel from './SettingsPanel'
import UpgradePanel from './UpgradePanel'
import AiGenerator from './AiGenerator'
import MessagesPanel from './MessagesPanel'
import PhonePreview from '@/components/preview/PhonePreview'

interface NavItem {
  id: DashboardTab
  label: string
  icon: React.ElementType
  badge?: string
}

const navItems: NavItem[] = [
  { id: 'links', label: 'Links', icon: Link2 },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'upgrade', label: 'Upgrade', icon: Crown, badge: 'PRO' },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, dashboardTab, setDashboardTab, setView, setUser } = useAppStore()

  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/${user?.username || ''}` : ''

  const copyProfileUrl = () => {
    if (!user) return
    navigator.clipboard.writeText(profileUrl).then(() => {
      toast.success('Profile link copied!')
    }).catch(() => {
      toast.error('Failed to copy')
    })
  }

  const handleNav = (tab: DashboardTab) => {
    setDashboardTab(tab)
    onNavigate?.()
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    setUser(null)
    setView('landing')
    toast.success('Logged out successfully')
  }

  return (
    <div className="flex flex-col h-full">
      {/* User info */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={user?.avatarUrl || undefined} />
            <AvatarFallback className="bg-[#6C47FF]/20 text-[#6C47FF] font-semibold">
              {user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#F2F2F4] truncate">
              {user?.displayName || user?.username || 'User'}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-[#8A8A9A] truncate">@{user?.username || 'username'}</p>
              {user?.plan === 'pro' && (
                <Badge className="bg-[#6C47FF]/20 text-[#6C47FF] border-[#6C47FF]/30 text-[10px] px-1.5 py-0">
                  PRO
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = dashboardTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all relative group ${
                isActive
                  ? 'bg-[#6C47FF]/10 text-[#6C47FF]'
                  : 'text-[#8A8A9A] hover:text-[#F2F2F4] hover:bg-[#1A1A1F]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#00E5BE] rounded-r-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge className="bg-[#6C47FF]/20 text-[#6C47FF] border-[#6C47FF]/30 text-[10px] px-1.5 py-0">
                  {item.badge}
                </Badge>
              )}
              {isActive && (
                <ChevronRight className="w-4 h-4 text-[#6C47FF]/50" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Visit & Share */}
      <div className="px-3 pb-3 space-y-2">
        <a
          href={`/${user?.username || ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-[12px] text-sm font-medium bg-[#00E5BE]/10 text-[#00E5BE] hover:bg-[#00E5BE]/20 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Visit Live Page
        </a>
        <Button
          onClick={copyProfileUrl}
          variant="outline"
          className="w-full border-border text-[#8A8A9A] hover:text-[#F2F2F4] hover:bg-[#1A1A1F] font-medium rounded-[12px] py-2.5 text-sm"
        >
          <Copy className="w-4 h-4 mr-2" />
          Share Link
        </Button>
      </div>

      {/* AI Button */}
      <div className="px-3 pb-3">
        <Button
          onClick={() => handleNav('links')}
          className="w-full gradient-brand text-white font-medium rounded-[20px] py-2.5 text-sm hover:opacity-90 transition-opacity"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          AI Generate
        </Button>
      </div>

      <Separator className="bg-border" />

      {/* Logout */}
      <div className="p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm text-[#8A8A9A] hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  )
}

function TabContent() {
  const { dashboardTab } = useAppStore()
  const [showAi, setShowAi] = useState(false)

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={dashboardTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {dashboardTab === 'links' && <LinkManager onOpenAi={() => setShowAi(true)} />}
          {dashboardTab === 'design' && <DesignCustomizer />}
          {dashboardTab === 'analytics' && <AnalyticsPanel />}
          {dashboardTab === 'settings' && <SettingsPanel />}
          {dashboardTab === 'messages' && <MessagesPanel />}
          {dashboardTab === 'upgrade' && <UpgradePanel />}
        </motion.div>
      </AnimatePresence>

      {/* AI Generator overlay */}
      <AnimatePresence>
        {showAi && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowAi(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <AiGenerator onClose={() => setShowAi(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0F0F10] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-[#0F0F10] flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 bg-[#0F0F10] border-r border-border p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-[#0F0F10] sticky top-0 z-40">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#8A8A9A] hover:text-[#F2F2F4]"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-[#6C47FF]" />
            <span className="font-semibold text-sm">LinkForge</span>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 flex">
          {/* Tab content */}
          <ScrollArea className="flex-1">
            <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
              <TabContent />
            </div>
          </ScrollArea>

          {/* Right panel: Phone Preview */}
          <div className="hidden xl:flex w-[340px] border-l border-border bg-[#0F0F10] items-start justify-center pt-8 sticky top-0 h-screen">
            <PhonePreview />
          </div>
        </div>
      </main>
    </div>
  )
}
