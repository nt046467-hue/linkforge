'use client'

import { useState, useEffect } from 'react'
import { Mail, MailOpen, Trash2, RefreshCw, Inbox, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function MessagesPanel() {
  const user = useAppStore((s) => s.user)
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isForbidden, setIsForbidden] = useState(false)

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/contact')
      if (res.status === 403) {
        setIsForbidden(true)
        setMessages([])
        return
      }
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setMessages(data.messages || [])
    } catch {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true }),
      })
      if (!res.ok) throw new Error()
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)))
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  const deleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setMessages((prev) => prev.filter((m) => m.id !== id))
      if (selectedId === id) setSelectedId(null)
      toast.success('Message deleted')
    } catch {
      toast.error('Failed to delete message')
    }
  }

  const selectedMessage = messages.find((m) => m.id === selectedId)

  const unreadCount = messages.filter((m) => !m.isRead).length

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Non-admin users see a restricted view
  if (isForbidden) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Messages</h2>
          <p className="text-[#8A8A9A] mt-1">Contact form submissions</p>
        </div>
        <Card className="bg-[#1A1A1F] border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#6C47FF]/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#6C47FF]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Admin Only</h3>
          <p className="text-[#8A8A9A] text-sm max-w-md mx-auto">
            This section is only available to the LinkForge admin. Contact messages from the public contact form will appear here.
          </p>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Messages</h2>
            <p className="text-[#8A8A9A] mt-1">Loading...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-[#1A1A1F] rounded-xl p-4 h-20" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Messages</h2>
          <p className="text-[#8A8A9A] mt-1">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchMessages}
          className="border-[#8A8A9A]/30 text-[#8A8A9A] hover:text-[#F2F2F4] hover:bg-[#1A1A1F]"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Messages */}
      {messages.length === 0 ? (
        <Card className="bg-[#1A1A1F] border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#6C47FF]/10 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-[#6C47FF]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
          <p className="text-[#8A8A9A] text-sm max-w-md mx-auto">
            When people submit the contact form, their messages will appear here. You can read, manage, and delete them from this panel.
          </p>
        </Card>
      ) : (
        <div className="flex gap-4 min-h-[500px]">
          {/* Message List */}
          <div className={`${selectedId ? 'hidden sm:block' : ''} w-full sm:w-80 shrink-0 space-y-2 overflow-y-auto max-h-[600px]`}>
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => {
                  setSelectedId(msg.id)
                  if (!msg.isRead) markAsRead(msg.id)
                }}
                className={`w-full text-left p-3 rounded-xl transition-colors ${
                  selectedId === msg.id
                    ? 'bg-[#6C47FF]/10 border border-[#6C47FF]/20'
                    : 'bg-[#1A1A1F] border border-transparent hover:border-[#8A8A9A]/20'
                } ${!msg.isRead ? 'ring-1 ring-[#6C47FF]/30' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    !msg.isRead ? 'bg-[#6C47FF]/20 text-[#6C47FF]' : 'bg-[#8A8A9A]/10 text-[#8A8A9A]'
                  }`}>
                    {msg.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate ${!msg.isRead ? 'font-semibold text-[#F2F2F4]' : 'text-[#8A8A9A]'}`}>
                        {msg.name}
                      </p>
                      {!msg.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#6C47FF] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#8A8A9A] truncate">{msg.subject}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-[#8A8A9A]/50" />
                      <p className="text-[10px] text-[#8A8A9A]/50">{formatDate(msg.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Message Detail */}
          {selectedMessage ? (
            <Card className="flex-1 bg-[#1A1A1F] border-border p-6 overflow-y-auto max-h-[600px]">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#6C47FF]/10 flex items-center justify-center text-[#6C47FF] font-bold">
                    {selectedMessage.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedMessage.name}</h3>
                    <p className="text-sm text-[#8A8A9A]">{selectedMessage.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedMessage.isRead ? 'secondary' : 'default'} className="text-xs">
                    {selectedMessage.isRead ? 'Read' : 'Unread'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#8A8A9A] hover:text-destructive h-8 w-8"
                    onClick={() => deleteMessage(selectedMessage.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator className="bg-border mb-4" />

              <h4 className="text-lg font-semibold mb-1">{selectedMessage.subject}</h4>
              <p className="text-xs text-[#8A8A9A] mb-4">
                {new Date(selectedMessage.createdAt).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>

              <div className="text-[#8A8A9A] leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </div>

              <Separator className="bg-border my-4" />

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#8A8A9A]/30 text-[#8A8A9A] hover:text-destructive hover:bg-destructive/10"
                  onClick={() => deleteMessage(selectedMessage.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#8A8A9A]/30 text-[#8A8A9A] hover:text-[#F2F2F4]"
                  onClick={() => setSelectedId(null)}
                >
                  Back to List
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="hidden sm:flex flex-1 bg-[#1A1A1F] border-border items-center justify-center">
              <div className="text-center">
                <MailOpen className="w-12 h-12 text-[#8A8A9A]/30 mx-auto mb-3" />
                <p className="text-[#8A8A9A] text-sm">Select a message to read</p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
