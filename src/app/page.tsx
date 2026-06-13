'use client'

import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import LandingPage from '@/components/landing/LandingPage'
import AuthForms from '@/components/auth/AuthForms'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { toast } from 'sonner'

export default function Home() {
  const currentView = useAppStore((s) => s.currentView)
  const setView = useAppStore((s) => s.setView)
  const setUser = useAppStore((s) => s.setUser)
  const user = useAppStore((s) => s.user)
  const setLinks = useAppStore((s) => s.setLinks)
  const setPageSettings = useAppStore((s) => s.setPageSettings)
  const sessionChecked = useRef(false)

  // Restore session on page load (only once)
  useEffect(() => {
    if (sessionChecked.current) return
    sessionChecked.current = true

    const restoreSession = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) return

        const data = await res.json()
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            username: data.user.username,
            displayName: data.user.displayName,
            bio: data.user.bio,
            avatarUrl: data.user.avatarUrl,
            plan: data.user.plan,
            aiGenerations: data.user.aiGenerations,
          })

          // Restore links
          if (data.user.links) {
            setLinks(
              data.user.links.map((l: Record<string, unknown>) => ({
                id: l.id as string,
                title: l.title as string,
                url: l.url as string,
                icon: l.icon as string | undefined,
                thumbnailUrl: l.thumbnailUrl as string | undefined,
                position: l.position as number,
                isActive: l.isActive as boolean,
                category: l.category as string | undefined,
              }))
            )
          }

          // Restore page settings
          if (data.user.pageSetting) {
            setPageSettings({
              theme: data.user.pageSetting.theme,
              bgColor: data.user.pageSetting.bgColor,
              bgGradient: data.user.pageSetting.bgGradient,
              buttonStyle: data.user.pageSetting.buttonStyle,
              font: data.user.pageSetting.font,
              avatarShape: data.user.pageSetting.avatarShape,
              accentColor: data.user.pageSetting.accentColor,
            })
          }

          setView('dashboard')
        }
      } catch {
        // Not logged in — stay on current view
      }
    }

    restoreSession()
  }, [setUser, setView, setLinks, setPageSettings])

  // Handle Stripe redirect callbacks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const stripeSuccess = params.get('stripe_success')
    const stripeCancel = params.get('stripe_cancel')

    if (stripeSuccess && user) {
      setUser({ ...user, plan: 'pro' })
      toast.success('Welcome to Pro! Your payment was successful.')
      window.history.replaceState({}, '', '/')
    }

    if (stripeCancel) {
      toast.error('Payment was cancelled. No charges were made.')
      window.history.replaceState({}, '', '/')
    }
  }, [user, setUser])

  switch (currentView) {
    case 'landing':
      return <LandingPage />
    case 'login':
    case 'signup':
      return <AuthForms />
    case 'dashboard':
      return <DashboardLayout />
    default:
      return <LandingPage />
  }
}
