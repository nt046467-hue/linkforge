'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Zap, Crown, Sparkles, Loader2, ShieldCheck, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

const proFeatures = [
  { name: 'Links', free: '5', pro: 'Unlimited' },
  { name: 'AI Generations', free: '3/month', pro: 'Unlimited' },
  { name: 'Themes', free: '2', pro: 'All + Custom CSS' },
  { name: 'Analytics', free: 'Basic', pro: 'Advanced + Export' },
  { name: 'Custom Domain', free: false, pro: true },
  { name: 'Remove Branding', free: false, pro: true },
  { name: 'Priority Support', free: false, pro: true },
  { name: 'Early Access', free: false, pro: true },
]

export default function UpgradePanel() {
  const { user, setUser } = useAppStore()
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null)

  const isPro = user?.plan === 'pro'

  const handleUpgrade = async (planType: 'monthly' | 'yearly') => {
    if (isPro) return

    setLoading(planType)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to start checkout')
        return
      }

      if (data.demoMode) {
        // Demo mode — no real Stripe, just upgrade directly
        if (user) {
          setUser({ ...user, plan: 'pro' })
        }
        toast.success('🎉 Pro plan activated! (Demo mode — no payment processed)')
        return
      }

      if (data.url) {
        // Real Stripe checkout — redirect user
        window.location.href = data.url
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#6C47FF]/10 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-[#6C47FF]" />
          </div>
          <h1 className="text-3xl font-bold text-[#F2F2F4]">
            {isPro ? "You're a Pro!" : 'Upgrade to Pro'}
          </h1>
          <p className="text-[#8A8A9A] mt-2 max-w-md mx-auto">
            {isPro
              ? 'You have access to all Pro features. Thanks for your support!'
              : 'Unlock the full power of LinkForge with Pro features'}
          </p>
        </motion.div>
      </div>

      {/* Pro badge if already pro */}
      {isPro && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto mb-8"
        >
          <Card className="gradient-brand p-6 text-center">
            <ShieldCheck className="w-12 h-12 text-white mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Pro Plan Active</h3>
            <p className="text-white/80 text-sm">
              You have unlimited links, AI generations, and all premium features.
            </p>
          </Card>
        </motion.div>
      )}

      {/* Pricing cards */}
      {!isPro && (
        <div className="grid md:grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto">
          {/* Monthly */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="bg-[#1A1A1F] border-border p-8 h-full flex flex-col hover:border-[#6C47FF]/30 transition-colors">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#F2F2F4]">Monthly</h3>
                <p className="text-[#8A8A9A] text-sm mt-1">Billed monthly</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-[#F2F2F4]">$5</span>
                <span className="text-[#8A8A9A]">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {proFeatures.slice(0, 5).map((f) => (
                  <li key={f.name} className="flex items-center gap-2 text-sm text-[#8A8A9A]">
                    <Check className="w-4 h-4 text-[#00E5BE] shrink-0" />
                    <span>{f.name}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full rounded-[20px] py-5 font-semibold gradient-brand text-white glow-primary hover:opacity-90 transition-opacity"
                onClick={() => handleUpgrade('monthly')}
                disabled={loading !== null}
              >
                {loading === 'monthly' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Choose Monthly
                  </>
                )}
              </Button>
            </Card>
          </motion.div>

          {/* Yearly */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="bg-[#1A1A1F] border-[#6C47FF]/30 p-8 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0">
                <div className="bg-[#00E5BE] text-[#0F0F10] text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                  SAVE 33%
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#F2F2F4]">Yearly</h3>
                <p className="text-[#8A8A9A] text-sm mt-1">Billed annually</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-[#F2F2F4]">$40</span>
                <span className="text-[#8A8A9A]">/year</span>
                <p className="text-sm text-[#00E5BE] mt-1">Just $3.33/month</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {proFeatures.map((f) => (
                  <li key={f.name} className="flex items-center gap-2 text-sm text-[#8A8A9A]">
                    <Check className="w-4 h-4 text-[#00E5BE] shrink-0" />
                    <span>{f.name}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full rounded-[20px] py-5 font-semibold gradient-brand text-white glow-primary hover:opacity-90 transition-opacity"
                onClick={() => handleUpgrade('yearly')}
                disabled={loading !== null}
              >
                {loading === 'yearly' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Choose Yearly
                  </>
                )}
              </Button>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Feature comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="bg-[#1A1A1F] border-border p-6">
          <h3 className="text-lg font-semibold text-[#F2F2F4] mb-4 text-center">
            Full Feature Comparison
          </h3>
          <div className="space-y-0">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 pb-3 border-b border-border">
              <div className="text-sm text-[#8A8A9A]">Feature</div>
              <div className="text-sm text-center font-medium text-[#8A8A9A]">Free</div>
              <div className="text-sm text-center font-medium text-[#6C47FF]">Pro</div>
            </div>
            {/* Rows */}
            {proFeatures.map((f, i) => (
              <div
                key={f.name}
                className={`grid grid-cols-3 gap-4 py-3 ${
                  i < proFeatures.length - 1 ? 'border-b border-border/50' : ''
                }`}
              >
                <div className="text-sm text-[#F2F2F4]">{f.name}</div>
                <div className="text-sm text-center text-[#8A8A9A]">
                  {typeof f.free === 'boolean' ? (
                    f.free ? (
                      <Check className="w-4 h-4 text-[#00E5BE] mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-[#8A8A9A]/40 mx-auto" />
                    )
                  ) : (
                    f.free
                  )}
                </div>
                <div className="text-sm text-center text-[#F2F2F4] font-medium">
                  {typeof f.pro === 'boolean' ? (
                    f.pro ? (
                      <Check className="w-4 h-4 text-[#00E5BE] mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-[#8A8A9A]/40 mx-auto" />
                    )
                  ) : (
                    f.pro
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Payment info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-8 text-center space-y-3"
      >
        <div className="flex items-center justify-center gap-4 text-xs text-[#8A8A9A]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00E5BE]" />
            Secure payments
          </span>
          <span className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-[#00E5BE]" />
            Powered by Stripe
          </span>
        </div>
        <Badge
          variant="outline"
          className="border-[#6C47FF]/30 text-[#6C47FF] px-4 py-1.5 text-xs"
        >
          <Sparkles className="w-3 h-3 mr-1.5" />
          {process.env.NODE_ENV === 'production'
            ? 'Live payments enabled'
            : 'Test mode — no real charges during alpha'}
        </Badge>
      </motion.div>
    </div>
  )
}
