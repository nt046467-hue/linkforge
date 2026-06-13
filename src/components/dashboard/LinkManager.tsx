'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  ExternalLink,
  Sparkles,
  Loader2,
  X,
  Check,
  MousePointerClick,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog'
import { useAppStore, type LinkItem } from '@/lib/store'
import { toast } from 'sonner'

interface LinkManagerProps {
  onOpenAi: () => void
}

interface SortableLinkProps {
  link: LinkItem
  onEdit: (link: LinkItem) => void
  onToggle: (id: string, isActive: boolean) => void
  onDelete: (id: string) => void
}

function SortableLink({ link, onEdit, onToggle, onDelete }: SortableLinkProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`group ${isDragging ? 'z-50' : ''}`}
    >
      <Card
        className={`bg-[#1A1A1F] border-border p-4 transition-all ${
          isDragging
            ? 'border-[#6C47FF]/50 shadow-lg shadow-[#6C47FF]/10'
            : 'hover:border-[#6C47FF]/20'
        } ${!link.isActive ? 'opacity-50' : ''}`}
      >
        <div className="flex items-center gap-3">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-[#8A8A9A] hover:text-[#F2F2F4] transition-colors shrink-0 touch-none"
          >
            <GripVertical className="w-5 h-5" />
          </button>

          {/* Icon/emoji */}
          <div className="w-8 h-8 rounded-lg bg-[#6C47FF]/10 flex items-center justify-center text-sm shrink-0">
            {link.icon || '🔗'}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-[#F2F2F4] truncate">
                {link.title}
              </p>
              {link.category && (
                <Badge
                  variant="outline"
                  className="text-[10px] border-[#8A8A9A]/30 text-[#8A8A9A] px-1.5 py-0"
                >
                  <Tag className="w-2.5 h-2.5 mr-0.5" />
                  {link.category}
                </Badge>
              )}
            </div>
            <p className="text-xs text-[#8A8A9A] truncate flex items-center gap-1">
              <ExternalLink className="w-3 h-3 shrink-0" />
              {link.url}
            </p>
          </div>

          {/* Click count */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-[#8A8A9A] shrink-0">
            <MousePointerClick className="w-3 h-3" />
            <span>{(link as { clickCount?: number }).clickCount ?? 0}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Switch
              checked={link.isActive}
              onCheckedChange={(checked) => onToggle(link.id, checked)}
              className="data-[state=checked]:bg-[#00E5BE] data-[state=unchecked]:bg-[#8A8A9A]/30"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#8A8A9A] hover:text-[#F2F2F4] hover:bg-[#1A1A1F]"
              onClick={() => onEdit(link)}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#8A8A9A] hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(link.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

interface LinkFormData {
  title: string
  url: string
  icon: string
  category: string
}

const emptyForm: LinkFormData = { title: '', url: '', icon: '', category: '' }

export default function LinkManager({ onOpenAi }: LinkManagerProps) {
  const { links, setLinks, addLink, updateLink, removeLink, reorderLinks, user } = useAppStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null)
  const [form, setForm] = useState<LinkFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Fetch links on mount
  useEffect(() => {
    async function fetchLinks() {
      try {
        const res = await fetch('/api/links')
        if (res.ok) {
          const data = await res.json()
          // Normalize: map _count.linkClicks to clickCount for display
          const normalized = data.map((l: Record<string, unknown>) => ({
            id: l.id as string,
            title: l.title as string,
            url: l.url as string,
            icon: (l.icon as string) || undefined,
            thumbnailUrl: (l.thumbnailUrl as string) || undefined,
            position: l.position as number,
            isActive: l.isActive as boolean,
            category: (l.category as string) || undefined,
            clickCount: (l._count as Record<string, number>)?.linkClicks ?? 0,
          }))
          setLinks(normalized)
        }
      } catch {
        // silent fail, use store defaults
      } finally {
        setLoading(false)
      }
    }
    fetchLinks()
  }, [setLinks])

  const handleAdd = () => {
    setEditingLink(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const handleEdit = (link: LinkItem) => {
    setEditingLink(link)
    setForm({
      title: link.title,
      url: link.url,
      icon: link.icon || '',
      category: link.category || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      toast.error('Title and URL are required')
      return
    }

    let urlVal = form.url.trim()
    if (!urlVal.startsWith('http://') && !urlVal.startsWith('https://')) {
      urlVal = 'https://' + urlVal
    }

    setSaving(true)
    try {
      if (editingLink) {
        const res = await fetch(`/api/links/${editingLink.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            url: urlVal,
            icon: form.icon || undefined,
            category: form.category || undefined,
          }),
        })
        if (!res.ok) throw new Error('Failed to update link')
        const updated = await res.json()
        updateLink(editingLink.id, updated)
        toast.success('Link updated')
      } else {
        const res = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            url: urlVal,
            icon: form.icon || undefined,
            category: form.category || undefined,
          }),
        })
        if (!res.ok) throw new Error('Failed to create link')
        const newLink = await res.json()
        addLink(newLink)
        toast.success('Link added')
      }
      setDialogOpen(false)
    } catch {
      toast.error('Failed to save link')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    updateLink(id, { isActive })
    try {
      await fetch(`/api/links/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
    } catch {
      toast.error('Failed to update link')
    }
  }

  const handleDelete = async (id: string) => {
    removeLink(id)
    try {
      await fetch(`/api/links/${id}`, { method: 'DELETE' })
      toast.success('Link deleted')
    } catch {
      toast.error('Failed to delete link')
    }
  }

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = links.findIndex((l) => l.id === active.id)
      const newIndex = links.findIndex((l) => l.id === over.id)
      const reordered = arrayMove(links, oldIndex, newIndex).map((l, i) => ({
        ...l,
        position: i,
      }))

      reorderLinks(reordered)

      try {
        await fetch('/api/links/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkIds: reordered.map((l) => l.id) }),
        })
      } catch {
        toast.error('Failed to save order')
      }
    },
    [links, reorderLinks]
  )

  const sortedLinks = [...links].sort((a, b) => a.position - b.position)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F2F2F4]">Links</h1>
          <p className="text-sm text-[#8A8A9A] mt-1">
            Manage your bio links — drag to reorder
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-[#6C47FF]/30 text-[#6C47FF] hover:bg-[#6C47FF]/10 rounded-[20px]"
            onClick={onOpenAi}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Generate
          </Button>
          <Button
            className="gradient-brand text-white font-medium rounded-[20px] hover:opacity-90 transition-opacity"
            onClick={handleAdd}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Link
          </Button>
        </div>
      </div>

      {/* Link list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#6C47FF] animate-spin" />
        </div>
      ) : sortedLinks.length === 0 ? (
        <Card className="bg-[#1A1A1F] border-border border-dashed p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#6C47FF]/10 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-[#6C47FF]" />
          </div>
          <h3 className="text-lg font-semibold text-[#F2F2F4] mb-2">No links yet</h3>
          <p className="text-sm text-[#8A8A9A] mb-6 max-w-sm mx-auto">
            Add your first link to get started. You can also use AI to generate links based on your profile.
          </p>
          <div className="flex items-center gap-3 justify-center">
            <Button
              className="gradient-brand text-white rounded-[20px] hover:opacity-90"
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
            <Button
              variant="outline"
              className="border-[#6C47FF]/30 text-[#6C47FF] hover:bg-[#6C47FF]/10 rounded-[20px]"
              onClick={onOpenAi}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate
            </Button>
          </div>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortedLinks.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              <AnimatePresence>
                {sortedLinks.map((link) => (
                  <SortableLink
                    key={link.id}
                    link={link}
                    onEdit={handleEdit}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1A1A1F] border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#F2F2F4]">
              {editingLink ? 'Edit Link' : 'Add Link'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-sm text-[#8A8A9A]">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="My Website"
                className="bg-[#0F0F10] border-border rounded-[8px] text-[#F2F2F4] placeholder:text-[#8A8A9A]/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-[#8A8A9A]">URL</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                placeholder="https://example.com"
                className="bg-[#0F0F10] border-border rounded-[8px] text-[#F2F2F4] placeholder:text-[#8A8A9A]/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm text-[#8A8A9A]">Icon (emoji)</Label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                  placeholder="🔗"
                  className="bg-[#0F0F10] border-border rounded-[8px] text-[#F2F2F4] placeholder:text-[#8A8A9A]/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-[#8A8A9A]">Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  placeholder="Social"
                  className="bg-[#0F0F10] border-border rounded-[8px] text-[#F2F2F4] placeholder:text-[#8A8A9A]/50"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-border text-[#8A8A9A] hover:text-[#F2F2F4] rounded-[20px]"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gradient-brand text-white rounded-[20px] hover:opacity-90"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingLink ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Update
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
