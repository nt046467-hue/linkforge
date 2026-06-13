'use client'

import { Link2, ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TermsPage() {
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
            <FileText className="w-5 h-5 text-[#6C47FF]" />
            <h1 className="text-lg font-semibold">Terms of Service</h1>
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
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">1. Acceptance of Terms</h2>
            <p className="text-[#8A8A9A] leading-relaxed mb-4">
              By accessing and using LinkForge, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing LinkForge. These terms apply to all visitors, users, and others who access or use the service.
            </p>
            <p className="text-[#8A8A9A] leading-relaxed">
              LinkForge is a product developed and maintained by Nabin Thapa. By using this service, you enter into an agreement with the developer and agree to abide by the rules and guidelines outlined in this document.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">2. Description of Service</h2>
            <p className="text-[#8A8A9A] leading-relaxed mb-4">
              LinkForge is an AI-powered bio link and micro-landing page builder that allows users to create personalized link-in-bio pages. The service includes features such as customizable themes, link management, analytics tracking, AI-powered content generation, and optional Pro plan upgrades.
            </p>
            <p className="text-[#8A8A9A] leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any part of the service at any time, including the availability of any feature, database, or content, with reasonable notice to users when possible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">3. User Accounts</h2>
            <p className="text-[#8A8A9A] leading-relaxed mb-4">
              To use LinkForge, you must create an account by providing a valid email address, username, and password. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
            </p>
            <p className="text-[#8A8A9A] leading-relaxed">
              You agree not to create accounts with usernames that are offensive, misleading, or that impersonate others. We reserve the right to suspend or terminate accounts that violate these terms, including but not limited to accounts involved in spam, fraud, or abuse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">4. User Content</h2>
            <p className="text-[#8A8A9A] leading-relaxed mb-4">
              You retain ownership of all content you create and publish on LinkForge, including links, bios, profile information, and any AI-generated content you choose to apply to your page. By publishing content on LinkForge, you grant us a limited, non-exclusive license to display and serve that content as part of the service.
            </p>
            <p className="text-[#8A8A9A] leading-relaxed">
              You are solely responsible for ensuring that your content complies with all applicable laws and does not infringe on the rights of others. We are not liable for any content posted by users and reserve the right to remove content that violates these terms or is otherwise objectionable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">5. Prohibited Uses</h2>
            <p className="text-[#8A8A9A] leading-relaxed mb-3">
              You agree not to use LinkForge for any of the following purposes:
            </p>
            <ul className="text-[#8A8A9A] space-y-2 list-disc list-inside ml-4">
              <li>Publishing illegal, harmful, threatening, abusive, or defamatory content</li>
              <li>Distributing malware, phishing links, or other harmful software</li>
              <li>Impersonating others or misrepresenting your identity</li>
              <li>Spamming or sending unsolicited messages</li>
              <li>Attempting to gain unauthorized access to other users&apos; accounts or our systems</li>
              <li>Using the service to violate any local, state, national, or international law</li>
              <li>Interfering with or disrupting the service or servers connected to the service</li>
              <li>Using automated tools to scrape or collect data from the service without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">6. Free and Pro Plans</h2>
            <p className="text-[#8A8A9A] leading-relaxed mb-4">
              LinkForge offers a free plan with basic features and a Pro plan at $5/month or $40/year. The free plan includes up to 5 links, 3 AI generations per month, 2 themes, and basic analytics. The Pro plan includes unlimited links, unlimited AI generations, all themes, advanced analytics, custom domain support, and the ability to remove LinkForge branding.
            </p>
            <p className="text-[#8A8A9A] leading-relaxed">
              Pro plan payments are processed securely through Stripe. Subscriptions renew automatically at the end of each billing period unless cancelled. You may cancel your subscription at any time, and you will retain Pro features until the end of your current billing period. No partial refunds are provided for unused portions of a billing period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">7. Intellectual Property</h2>
            <p className="text-[#8A8A9A] leading-relaxed">
              The LinkForge platform, including its design, code, branding, and original content, is owned by Nabin Thapa and protected by intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of our service without prior written consent. User-created content remains the property of the respective users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">8. Limitation of Liability</h2>
            <p className="text-[#8A8A9A] leading-relaxed mb-4">
              LinkForge is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, timely, secure, or error-free. We are not responsible for any loss of data, revenue, or other damages arising from your use of the service.
            </p>
            <p className="text-[#8A8A9A] leading-relaxed">
              In no event shall LinkForge or its developer be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising out of or related to your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">9. Changes to Terms</h2>
            <p className="text-[#8A8A9A] leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to this page. We will make reasonable efforts to notify users of significant changes via email or through the service. Your continued use of LinkForge after any modifications constitutes your acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#F2F2F4]">10. Contact</h2>
            <p className="text-[#8A8A9A] leading-relaxed">
              If you have questions about these Terms of Service, please reach out through our{' '}
              <Link href="/contact" className="text-[#6C47FF] hover:underline">Contact page</Link>.
              We will do our best to respond to your inquiry within 48 hours.
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
