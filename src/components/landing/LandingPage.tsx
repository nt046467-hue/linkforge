'use client'

import { motion } from 'framer-motion'
import {
  Sparkles,
  Palette,
  BarChart3,
  Globe,
  Smartphone,
  Link2,
  ArrowRight,
  Check,
  X,
  Zap,
  UserPlus,
  Share2,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import Link from 'next/link'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered',
    description: 'Let AI generate your bio, links, and design. Just describe yourself and watch the magic happen.',
  },
  {
    icon: Palette,
    title: 'Beautiful Themes',
    description: 'Choose from stunning themes or customize every pixel. Dark, Glass, Gradient, Minimal, and more.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track views, clicks, and CTR. Know exactly how your audience interacts with your links.',
  },
  {
    icon: Globe,
    title: 'Custom Domains',
    description: 'Use your own domain for a professional touch. link.yourdomain.com is just a DNS record away.',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Built for the way people actually browse. Every page looks perfect on any screen size.',
  },
  {
    icon: Link2,
    title: 'One Link',
    description: 'One link to rule them all. Replace your social media bio with a single, powerful link page.',
  },
]

const steps = [
  {
    icon: UserPlus,
    title: 'Sign Up',
    description: 'Create your account in seconds. No credit card required.',
    step: '01',
  },
  {
    icon: Sparkles,
    title: 'Customize with AI',
    description: 'Describe yourself and let AI build your perfect page.',
    step: '02',
  },
  {
    icon: Share2,
    title: 'Share Your Link',
    description: 'Add it to your socials and watch your audience grow.',
    step: '03',
  },
]

const proFeatures = [
  { name: 'Links', free: '5', pro: 'Unlimited' },
  { name: 'AI Generations', free: '3/month', pro: 'Unlimited' },
  { name: 'Themes', free: '2', pro: 'All + Custom' },
  { name: 'Analytics', free: 'Basic', pro: 'Advanced' },
  { name: 'Custom Domain', free: false, pro: true },
  { name: 'Remove Branding', free: false, pro: true },
  { name: 'Priority Support', free: false, pro: true },
]

export default function LandingPage() {
  const setView = useAppStore((s) => s.setView)

  return (
    <div className="min-h-screen bg-[#0F0F10] text-[#F2F2F4] overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 pb-16">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6C47FF]/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00E5BE]/8 rounded-full blur-[128px]" />
        </div>

        <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6C47FF]/10 border border-[#6C47FF]/20 text-sm text-[#6C47FF]">
                <Star className="w-3.5 h-3.5" />
                Now in Public Alpha
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight"
            >
              Build Your Perfect{' '}
              <span className="gradient-brand-text">Link-in-Bio</span> Page in 30
              Seconds
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg sm:text-xl text-[#8A8A9A] max-w-xl mx-auto lg:mx-0"
            >
              AI-powered bio link builder that creates stunning, high-converting
              pages. Just describe yourself and let AI do the rest.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="gradient-brand text-white font-semibold px-8 py-6 rounded-[20px] text-base glow-primary hover:opacity-90 transition-opacity"
                onClick={() => setView('signup')}
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-[#8A8A9A]/30 text-[#F2F2F4] hover:bg-[#1A1A1F] rounded-[20px] px-8 py-6"
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                See How It Works
              </Button>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className="mt-4 text-sm text-[#8A8A9A]"
            >
              No credit card required. Free forever plan available.
            </motion.p>
          </motion.div>

          {/* Right: Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:flex justify-center"
          >
            <div className="animate-float">
              <div className="w-[280px] phone-frame bg-[#1A1A1F] p-4 relative">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#0F0F10] rounded-b-2xl" />

                <div className="mt-8 flex flex-col items-center gap-4">
                  {/* Avatar placeholder */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6C47FF] to-[#00E5BE] flex items-center justify-center text-white text-2xl font-bold">
                    N
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-[#F2F2F4]">Nabin Thapa</p>
                    <p className="text-sm text-[#8A8A9A]">Developer & Creator</p>
                  </div>

                  {/* Mock links */}
                  {['Portfolio', 'YouTube', 'Twitter', 'Shop', 'Newsletter'].map(
                    (label, i) => (
                      <div
                        key={label}
                        className="w-full py-2.5 px-4 rounded-xl text-center text-sm font-medium transition-all"
                        style={{
                          background:
                            i === 0
                              ? 'linear-gradient(135deg, #6C47FF, #00E5BE)'
                              : 'rgba(255,255,255,0.06)',
                          color: i === 0 ? '#fff' : '#F2F2F4',
                          animationDelay: `${i * 0.1}s`,
                        }}
                      >
                        {label}
                      </div>
                    )
                  )}
                </div>

                {/* Bottom bar */}
                <div className="mt-6 flex justify-center">
                  <div className="w-28 h-1 bg-[#8A8A9A]/30 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold"
            >
              How It <span className="gradient-brand-text">Works</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-[#8A8A9A] text-lg max-w-2xl mx-auto"
            >
              Three simple steps to your perfect link-in-bio page
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {steps.map((step) => (
              <motion.div key={step.step} variants={fadeInUp}>
                <Card className="bg-[#1A1A1F] border-border p-8 text-center relative overflow-hidden group hover:border-[#6C47FF]/30 transition-colors">
                  <div className="absolute top-4 right-4 text-5xl font-bold text-[#6C47FF]/10">
                    {step.step}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-[#6C47FF]/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#6C47FF]/20 transition-colors">
                    <step.icon className="w-7 h-7 text-[#6C47FF]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-[#8A8A9A]">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 bg-[#1A1A1F]/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold"
            >
              Everything You <span className="gradient-brand-text">Need</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-[#8A8A9A] text-lg max-w-2xl mx-auto"
            >
              Powerful features to make your link page stand out from the crowd
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card className="bg-[#1A1A1F] border-border p-6 group hover:border-[#6C47FF]/30 transition-colors h-full">
                  <div className="w-12 h-12 rounded-xl bg-[#6C47FF]/10 flex items-center justify-center mb-4 group-hover:bg-[#6C47FF]/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-[#6C47FF]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-[#8A8A9A] text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold"
            >
              Simple <span className="gradient-brand-text">Pricing</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-[#8A8A9A] text-lg"
            >
              Start free, upgrade when you need more
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-8"
          >
            {/* Free Plan */}
            <motion.div variants={fadeInUp}>
              <Card className="bg-[#1A1A1F] border-border p-8 h-full">
                <h3 className="text-2xl font-bold mb-1">Free</h3>
                <p className="text-[#8A8A9A] mb-6">Perfect to get started</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-[#8A8A9A]">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {proFeatures.map((f) => (
                    <li key={f.name} className="flex items-center gap-3 text-sm">
                      {f.free !== false ? (
                        <Check className="w-4 h-4 text-[#00E5BE] shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-[#8A8A9A]/50 shrink-0" />
                      )}
                      <span className="text-[#8A8A9A]">
                        {f.name} — {typeof f.free === 'string' ? f.free : '—'}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full rounded-[20px] py-5 border-[#8A8A9A]/30 text-[#F2F2F4] hover:bg-[#1A1A1F]"
                  onClick={() => setView('signup')}
                >
                  Get Started Free
                </Button>
              </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div variants={fadeInUp}>
              <Card className="bg-[#1A1A1F] border-[#6C47FF]/30 p-8 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0">
                  <div className="bg-[#6C47FF] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                    POPULAR
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">Pro</h3>
                <p className="text-[#8A8A9A] mb-6">For creators who mean business</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold">$5</span>
                  <span className="text-[#8A8A9A]">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {proFeatures.map((f) => (
                    <li key={f.name} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-[#00E5BE] shrink-0" />
                      <span>
                        {f.name} —{' '}
                        <span className="text-[#F2F2F4] font-medium">
                          {typeof f.pro === 'string' ? f.pro : 'Included'}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full rounded-[20px] py-5 gradient-brand text-white font-semibold glow-primary hover:opacity-90 transition-opacity"
                  onClick={() => setView('signup')}
                >
                  Upgrade to Pro
                  <Zap className="ml-2 w-4 h-4" />
                </Button>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeInUp}>
            <Card className="gradient-brand p-12 sm:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgY3g9IjIwIiBjeT0iMjAiIHI9IjEiLz48L2c+PC9zdmc+')] opacity-50" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Claim Your Username Free
                </h2>
                <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                  Join thousands of creators who already use LinkForge.
                  Your perfect link page is just a click away.
                </p>
                <Button
                  size="lg"
                  className="bg-white text-[#6C47FF] font-semibold px-8 py-6 rounded-[20px] text-base hover:bg-white/90 transition-colors"
                  onClick={() => setView('signup')}
                >
                  Get Your Link Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-[#6C47FF]" />
            <span className="font-semibold">LinkForge</span>
          </div>
          <p className="text-sm text-[#8A8A9A]">
            Built with{' '}
            <span className="gradient-brand-text font-medium">LinkForge</span>
          </p>
          <div className="flex gap-6 text-sm text-[#8A8A9A]">
            <Link href="/privacy" className="hover:text-[#F2F2F4] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#F2F2F4] transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-[#F2F2F4] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
