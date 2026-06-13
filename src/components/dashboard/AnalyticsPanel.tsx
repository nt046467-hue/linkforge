'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Eye, MousePointerClick, TrendingUp, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  color: string
  delay: number
}

function StatCard({ title, value, icon: Icon, color, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="bg-[#1A1A1F] border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-[#8A8A9A]">{title}</p>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: `${color}15` }}
          >
            <Icon className="w-4.5 h-4.5" style={{ color }} />
          </div>
        </div>
        <p className="text-2xl font-bold text-[#F2F2F4]">{value.toLocaleString()}</p>
      </Card>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1A1A1F] border border-border rounded-[8px] px-3 py-2 text-xs shadow-lg">
      <p className="text-[#8A8A9A]">{label}</p>
      <p className="text-[#F2F2F4] font-medium">{payload[0].value} views</p>
    </div>
  )
}

export default function AnalyticsPanel() {
  const { analytics, setAnalytics } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics')
        if (res.ok) {
          const data = await res.json()
          setAnalytics(data)
        }
      } catch {
        // Use defaults from store
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [setAnalytics])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#6C47FF] animate-spin" />
      </div>
    )
  }

  const maxClicks = Math.max(
    ...analytics.topLinks.map((l) => l.clicks),
    1
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F2F2F4]">Analytics</h1>
        <p className="text-sm text-[#8A8A9A] mt-1">
          Track your page views and link performance
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Views"
          value={analytics.totalViews}
          icon={Eye}
          color="#6C47FF"
          delay={0}
        />
        <StatCard
          title="Views (30d)"
          value={analytics.viewsLast30Days}
          icon={TrendingUp}
          color="#00E5BE"
          delay={0.05}
        />
        <StatCard
          title="Total Clicks"
          value={analytics.totalClicks}
          icon={MousePointerClick}
          color="#FFC312"
          delay={0.1}
        />
        <StatCard
          title="CTR"
          value={`${analytics.ctr.toFixed(1)}%`}
          icon={TrendingUp}
          color="#FF6B81"
          delay={0.15}
        />
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="bg-[#1A1A1F] border-border p-5 mb-8">
          <h3 className="text-sm font-medium text-[#F2F2F4] mb-4">
            Daily Views (Last 30 Days)
          </h3>
          {analytics.dailyViews.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[#8A8A9A] text-sm">
              No view data yet. Share your page to start tracking!
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.dailyViews} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#8A8A9A', fontSize: 10 }}
                    tickFormatter={(v: string) => {
                      const d = new Date(v)
                      return `${d.getMonth() + 1}/${d.getDate()}`
                    }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#8A8A9A', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="views" fill="#6C47FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Top Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="bg-[#1A1A1F] border-border p-5">
          <h3 className="text-sm font-medium text-[#F2F2F4] mb-4">
            Top Links by Clicks
          </h3>
          {analytics.topLinks.length === 0 ? (
            <div className="py-8 text-center text-[#8A8A9A] text-sm">
              No click data yet. Add links and share your page!
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.topLinks.map((link, i) => (
                <div key={link.title} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#F2F2F4] flex items-center gap-2">
                      <span className="text-[#8A8A9A] w-5 text-right text-xs">{i + 1}.</span>
                      {link.title}
                    </span>
                    <span className="text-[#8A8A9A] text-xs">
                      {link.clicks.toLocaleString()} clicks
                    </span>
                  </div>
                  <div className="relative h-2 bg-[#0F0F10] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(link.clicks / maxClicks) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background:
                          i === 0
                            ? 'linear-gradient(90deg, #6C47FF, #00E5BE)'
                            : i === 1
                              ? '#6C47FF'
                              : '#6C47FF88',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
