'use client'

import { useState } from 'react'
import { Link2, ArrowLeft, Mail, User, MessageSquare, Send, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to send message')
        return
      }

      setSent(true)
      toast.success('Message sent successfully!')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
            <Mail className="w-5 h-5 text-[#6C47FF]" />
            <h1 className="text-lg font-semibold">Contact Us</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Left: Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
              <p className="text-[#8A8A9A] leading-relaxed">
                Have a question, feedback, or need help with LinkForge? We would love to hear from you. Fill out the form and we will get back to you as soon as possible.
              </p>
            </div>

            <div className="space-y-4">
              <Card className="bg-[#1A1A1F] border-border p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6C47FF]/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#6C47FF]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-[#8A8A9A]">support@linkforge.app</p>
                </div>
              </Card>

              <Card className="bg-[#1A1A1F] border-border p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00E5BE]/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-[#00E5BE]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Response Time</p>
                  <p className="text-sm text-[#8A8A9A]">Within 48 hours</p>
                </div>
              </Card>

              <Card className="bg-[#1A1A1F] border-border p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6C47FF]/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-[#6C47FF]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Developer</p>
                  <p className="text-sm text-[#8A8A9A]">Nabin Thapa</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Right: Form */}
          <div className="md:col-span-3">
            <Card className="bg-[#1A1A1F] border-border p-6 sm:p-8">
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-[#00E5BE]/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-[#00E5BE]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                  <p className="text-[#8A8A9A] mb-6">
                    Thank you for reaching out. We will get back to you within 48 hours.
                  </p>
                  <Button
                    onClick={() => setSent(false)}
                    variant="outline"
                    className="border-[#8A8A9A]/30 text-[#F2F2F4] hover:bg-[#0F0F10]"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F10] border border-border text-[#F2F2F4] placeholder:text-[#8A8A9A]/50 focus:outline-none focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF]/30 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F10] border border-border text-[#F2F2F4] placeholder:text-[#8A8A9A]/50 focus:outline-none focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF]/30 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="What is this about?"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F10] border border-border text-[#F2F2F4] placeholder:text-[#8A8A9A]/50 focus:outline-none focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF]/30 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Message</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us more..."
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F10] border border-border text-[#F2F2F4] placeholder:text-[#8A8A9A]/50 focus:outline-none focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF]/30 transition-colors resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full gradient-brand text-white font-semibold rounded-xl py-5 hover:opacity-90 transition-opacity"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </Card>
          </div>
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
