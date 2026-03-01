import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { GetPostsQuery, PostType } from '@/types'

interface PostFiltersProps {
  filters: GetPostsQuery
  onChange: (f: GetPostsQuery) => void
}

export default function PostFilters({ filters, onChange }: PostFiltersProps) {
  const [search, setSearch] = useState(filters.search ?? '')

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({ ...filters, search: search || undefined, offset: 0 })
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="flex flex-wrap gap-3 items-end px-4 py-3 border-b border-amber-100 bg-white">
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Search</Label>
        <Input
          placeholder="Search posts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-48"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs">Type</Label>
        <Select
          value={filters.postType ?? 'all'}
          onValueChange={(val) =>
            onChange({ ...filters, postType: val === 'all' ? undefined : (val as PostType), offset: 0 })
          }
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="found">Found</SelectItem>
            <SelectItem value="sighting">Sighting</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs">Pet type</Label>
        <Input
          placeholder="e.g. Dog"
          value={filters.petType ?? ''}
          onChange={(e) =>
            onChange({ ...filters, petType: e.target.value || undefined, offset: 0 })
          }
          className="h-8 w-32"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs">Location</Label>
        <Input
          placeholder="City or area"
          value={filters.location ?? ''}
          onChange={(e) =>
            onChange({ ...filters, location: e.target.value || undefined, offset: 0 })
          }
          className="h-8 w-40"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer text-sm pb-0.5">
        <input
          type="checkbox"
          className="accent-amber-500"
          checked={filters.resolved === true}
          onChange={(e) =>
            onChange({ ...filters, resolved: e.target.checked ? true : undefined, offset: 0 })
          }
        />
        Show resolved
      </label>
    </div>
  )
}
