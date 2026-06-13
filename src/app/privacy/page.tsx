'use client'

import { Link2, ArrowLeft, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0F0F10] text-[#F2F2F4]">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-[#0F0F10]/80 backdrop-blur-xl z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-[#8A8A9A] hover:text-[#F2F2F4]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#6C47FF]" />
            <h1 className="text-lg font-semibold">Privacy Policy</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-8">
          <div>
            <p className="text-sm text-[#8A8A9A]">Last updated: June 2026</p>
          </div>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">1. Information We Collect</h2>
            <p className="text-[#8A8A9A] leading-relaxed mb-4">
              When you create an account on LinkForge, we collect your email address, username, display name, and password (stored as a hashed value). If you choose to upload a profile photo or customize your page, that data is also stored. We collect only the minimum information necessary to provide our service.
            </p>
            <p className="text-[#8A8A9A] leading-relaxed">
              When visitors view your LinkForge page, we automatically collect anonymous analytics data including page views, click counts, referrer information, and IP addresses. This data is used solely to provide you with analytics about your page performance and is not shared with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">2. How We Use Your Information</h2>
            <p className="text-[#8A8A9A] leading-relaxed mb-4">
              Your account information is used to create and maintain your LinkForge profile and bio link page. Your email address may be used to send important service notifications, such as security alerts or significant changes to our platform. We will never sell your personal information to third parties.
            </p>
            <p className="text-[#8A8A9A] leading-relaxed">
              Analytics data collected from page visitors is processed to generate aggregated statistics displayed in your dashboard. This helps you understand your audience and optimize your link page for better engagement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">3. Data Storage and Security</h2>
            <p className="text-[#8A8A9A] leading-relaxed mb-4">
              Your data is stored securely using industry-standard practices. Passwords are never stored in plain text — they are hashed using SHA-256 with a secret salt before being saved to our database. Session tokens are generated using HMAC-SHA256 and transmitted via secure, HTTP-only cookies.
            </p>
            <p className="text-[#8A8A9A] leading-relaxed">
              We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction. However, no method of electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">4. Third-Party Services</h2>
            <p className="text-[#8A8A9A] leading-relaxed mb-4">
              LinkForge uses Stripe for payment processing when you upgrade to the Pro plan. Stripe handles your payment information directly and we do not store your credit card details. Stripe&apos;s privacy policy can be found at stripe.com/privacy.
            </p>
            <p className="text-[#8A8A9A] leading-relaxed">
              We may use AI services to power the link generation feature. When you use the AI generator, your prompt is sent to our AI provider for processing. We do not use your AI prompts to train models or share them with third parties beyond what is necessary to generate your content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">5. Your Rights</h2>
            <p className="text-[#8A8A9A] leading-relaxed mb-4">
              You have the right to access, correct, or delete your personal data at any time. You can update your profile information directly from the Settings panel in your dashboard. If you wish to delete your account and all associated data, you can contact us through our contact form.
            </p>
            <p className="text-[#8A8A9A] leading-relaxed">
              Upon account deletion, all your personal data, links, page settings, and analytics will be permanently removed from our systems within 30 days, except where we are required to retain certain information by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">6. Cookies</h2>
            <p className="text-[#8A8A9A] leading-relaxed">
              LinkForge uses a minimal number of cookies. We use a single HTTP-only session cookie to maintain your logged-in state. This cookie does not contain personal information — it holds an encrypted session token that expires after 30 days. We do not use tracking cookies, advertising cookies, or share cookie data with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">7. Changes to This Policy</h2>
            <p className="text-[#8A8A9A] leading-relaxed">
              We may update this Privacy Policy from time to time. When we make changes, we will update the &quot;Last updated&quot; date at the top of this page and notify you via email for significant changes. Your continued use of LinkForge after any changes constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">8. Contact Us</h2>
            <p className="text-[#8A8A9A] leading-relaxed">
              If you have any questions about this Privacy Policy or your data, please reach out to us through our{' '}
              <Link href="/contact" className="text-[#6C47FF] hover:underline">Contact page</Link>.
              We are committed to addressing your concerns and ensuring your privacy is protected.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-[#6C47FF]" />
            <span className="font-semibold">LinkForge</span>
          </div>
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
