import { create } from 'zustand'

export type AppView = 'landing' | 'login' | 'signup' | 'dashboard'
export type DashboardTab = 'links' | 'design' | 'analytics' | 'settings' | 'upgrade' | 'messages'

export interface LinkItem {
  id: string
  title: string
  url: string
  icon?: string
  thumbnailUrl?: string
  position: number
  isActive: boolean
  category?: string
}

export interface User {
  id: string
  email: string
  username: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  plan: string
  aiGenerations: number
}

export interface PageSettings {
  theme: string
  bgColor: string
  bgGradient: string | null
  buttonStyle: string
  font: string
  avatarShape: string
  accentColor: string
}

export interface AnalyticsData {
  totalViews: number
  viewsLast30Days: number
  totalClicks: number
  ctr: number
  dailyViews: { date: string; views: number }[]
  topLinks: { title: string; clicks: number }[]
}

interface AppState {
  // Navigation
  currentView: AppView
  dashboardTab: DashboardTab
  setView: (view: AppView) => void
  setDashboardTab: (tab: DashboardTab) => void

  // Auth
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // Links
  links: LinkItem[]
  setLinks: (links: LinkItem[]) => void
  addLink: (link: LinkItem) => void
  updateLink: (id: string, data: Partial<LinkItem>) => void
  removeLink: (id: string) => void
  reorderLinks: (links: LinkItem[]) => void

  // Page Settings
  pageSettings: PageSettings
  setPageSettings: (settings: Partial<PageSettings>) => void

  // Analytics
  analytics: AnalyticsData
  setAnalytics: (data: Partial<AnalyticsData>) => void

  // AI Generation
  aiLoading: boolean
  setAiLoading: (loading: boolean) => void
  aiResult: Record<string, unknown> | null
  setAiResult: (result: Record<string, unknown> | null) => void

  // Profile preview
  showPreview: boolean
  setShowPreview: (show: boolean) => void
}

const defaultPageSettings: PageSettings = {
  theme: 'dark',
  bgColor: '#0F0F10',
  bgGradient: null,
  buttonStyle: 'rounded',
  font: 'Inter',
  avatarShape: 'circle',
  accentColor: '#6C47FF',
}

const defaultAnalytics: AnalyticsData = {
  totalViews: 0,
  viewsLast30Days: 0,
  totalClicks: 0,
  ctr: 0,
  dailyViews: [],
  topLinks: [],
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'landing',
  dashboardTab: 'links',
  setView: (view) => set({ currentView: view }),
  setDashboardTab: (tab) => set({ dashboardTab: tab }),

  // Auth
  user: null,
  setUser: (user) => set({ user }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  // Links
  links: [],
  setLinks: (links) => set({ links }),
  addLink: (link) => set((state) => ({ links: [...state.links, link] })),
  updateLink: (id, data) =>
    set((state) => ({
      links: state.links.map((l) => (l.id === id ? { ...l, ...data } : l)),
    })),
  removeLink: (id) =>
    set((state) => ({
      links: state.links.filter((l) => l.id !== id),
    })),
  reorderLinks: (links) => set({ links }),

  // Page Settings
  pageSettings: defaultPageSettings,
  setPageSettings: (settings) =>
    set((state) => ({
      pageSettings: { ...state.pageSettings, ...settings },
    })),

  // Analytics
  analytics: defaultAnalytics,
  setAnalytics: (data) =>
    set((state) => ({
      analytics: { ...state.analytics, ...data },
    })),

  // AI Generation
  aiLoading: false,
  setAiLoading: (aiLoading) => set({ aiLoading }),
  aiResult: null,
  setAiResult: (aiResult) => set({ aiResult }),

  // Preview
  showPreview: true,
  setShowPreview: (showPreview) => set({ showPreview }),
}))
