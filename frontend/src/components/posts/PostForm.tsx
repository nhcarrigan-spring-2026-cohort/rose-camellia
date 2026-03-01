import { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { parseApiError } from '@/api/errors'
import ErrorMessage from '@/components/shared/ErrorMessage'
import type { CreatePostRequest, PostType, PetSize } from '@/types'

const OSM_TILE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

interface PostFormProps {
  initialValues?: Partial<CreatePostRequest>
  onSubmit: (data: CreatePostRequest) => Promise<void>
  isLoading: boolean
  submitLabel: string
  error?: unknown
}

const postTypeConfig = [
  { type: 'lost' as PostType, label: 'Lost', description: 'My pet is missing', border: 'border-red-300 bg-red-50', selected: 'border-red-500 ring-2 ring-red-300' },
  { type: 'found' as PostType, label: 'Found', description: 'I found a pet', border: 'border-green-300 bg-green-50', selected: 'border-green-500 ring-2 ring-green-300' },
  { type: 'sighting' as PostType, label: 'Sighting', description: 'I spotted a pet', border: 'border-blue-300 bg-blue-50', selected: 'border-blue-500 ring-2 ring-blue-300' },
]

function PinDropHandler({ onDrop }: { onDrop: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onDrop(e.latlng.lat, e.latlng.lng) })
  return null
}

// Only pick fields that belong in CreatePostRequest — prevents PostDetail extras
// like `comments`, `hasVerification`, `resolved`, `updatedAt` from leaking into
// the submit payload and crashing Prisma with "Unknown argument" errors.
const FORM_FIELDS: (keyof CreatePostRequest)[] = [
  'postType', 'title', 'description', 'location', 'lostFoundDate',
  'authorUsername', 'petName', 'petType', 'breed', 'color', 'size',
  'latitude', 'longitude', 'contactEmail', 'contactPhone', 'reward',
]

function pickFormFields(values: Partial<Record<string, unknown>>): Partial<CreatePostRequest> {
  const result: Partial<CreatePostRequest> = {}
  for (const key of FORM_FIELDS) {
    if (key in values && values[key] !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result[key] = values[key] as any
    }
  }
  // <input type="date"> requires YYYY-MM-DD; backend returns full ISO datetime
  if (typeof result.lostFoundDate === 'string' && result.lostFoundDate.includes('T')) {
    result.lostFoundDate = result.lostFoundDate.split('T')[0]
  }
  return result
}

export default function PostForm({ initialValues, onSubmit, isLoading, submitLabel, error }: PostFormProps) {
  const picked = initialValues ? pickFormFields(initialValues as Partial<Record<string, unknown>>) : {}

  const [form, setForm] = useState<Partial<CreatePostRequest>>({
    postType: 'lost',
    title: '',
    description: '',
    location: '',
    lostFoundDate: new Date().toISOString().split('T')[0],
    ...picked,
  })

  const fieldErrors = error ? parseApiError(error).fieldErrors : {}

  function set<K extends keyof CreatePostRequest>(key: K, value: CreatePostRequest[K] | undefined) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(form as CreatePostRequest)
  }

  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? (
      <p className="text-sm text-red-500 mt-1">{fieldErrors[field]}</p>
    ) : null

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Post Type */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Post Type *</h2>
        <div className="grid grid-cols-3 gap-3">
          {postTypeConfig.map(({ type, label, description, border, selected }) => (
            <button
              key={type}
              type="button"
              onClick={() => set('postType', type)}
              className={cn(
                'p-4 rounded-xl border-2 text-left transition-all',
                form.postType === type ? selected : border
              )}
            >
              <p className="font-semibold">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </button>
          ))}
        </div>
        <FieldError field="postType" />
      </section>

      {/* Pet Info */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Pet Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Pet Name</Label>
            <Input value={form.petName ?? ''} onChange={(e) => set('petName', e.target.value || undefined)} placeholder="e.g. Buddy" />
            <FieldError field="petName" />
          </div>
          <div className="space-y-1">
            <Label>Pet Type</Label>
            <Input value={form.petType ?? ''} onChange={(e) => set('petType', e.target.value || undefined)} placeholder="e.g. Dog, Cat" />
            <FieldError field="petType" />
          </div>
          <div className="space-y-1">
            <Label>Breed</Label>
            <Input value={form.breed ?? ''} onChange={(e) => set('breed', e.target.value || undefined)} placeholder="e.g. Golden Retriever" />
            <FieldError field="breed" />
          </div>
          <div className="space-y-1">
            <Label>Color</Label>
            <Input value={form.color ?? ''} onChange={(e) => set('color', e.target.value || undefined)} placeholder="e.g. Brown and white" />
            <FieldError field="color" />
          </div>
          <div className="space-y-1">
            <Label>Size</Label>
            <Select value={form.size ?? ''} onValueChange={(v) => set('size', (v || undefined) as PetSize | undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="extra-large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
            <FieldError field="size" />
          </div>
        </div>
      </section>

      {/* Incident Details */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Incident Details</h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Title *</Label>
            <Input
              required
              value={form.title ?? ''}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Lost golden retriever near Central Park"
            />
            <FieldError field="title" />
          </div>
          <div className="space-y-1">
            <Label>Description *</Label>
            <Textarea
              required
              value={form.description ?? ''}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe the pet's appearance, behavior, collar color, etc."
              rows={4}
            />
            <FieldError field="description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Location *</Label>
              <Input
                required
                value={form.location ?? ''}
                onChange={(e) => set('location', e.target.value)}
                placeholder="e.g. Central Park, New York"
              />
              <FieldError field="location" />
            </div>
            <div className="space-y-1">
              <Label>Date *</Label>
              <Input
                required
                type="date"
                value={form.lostFoundDate ?? ''}
                onChange={(e) => set('lostFoundDate', e.target.value)}
              />
              <FieldError field="lostFoundDate" />
            </div>
          </div>
        </div>
      </section>

      {/* Location Pin */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Location Pin (Optional)</h2>
        <p className="text-sm text-gray-500">Click the map to drop a pin at the exact location.</p>
        <div className="rounded-xl overflow-hidden border border-amber-200" style={{ height: 300 }}>
          <MapContainer
            center={form.latitude != null && form.longitude != null ? [form.latitude, form.longitude] : [39.5, -98.5]}
            zoom={form.latitude != null ? 13 : 4}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer url={OSM_TILE} attribution={OSM_ATTR} />
            <PinDropHandler onDrop={(lat, lng) => { set('latitude', lat); set('longitude', lng) }} />
            {form.latitude != null && form.longitude != null && (
              <CircleMarker
                center={[form.latitude, form.longitude]}
                radius={10}
                pathOptions={{ fillColor: '#f59e0b', fillOpacity: 1, color: 'white', weight: 2 }}
              />
            )}
          </MapContainer>
        </div>
        {form.latitude != null && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Pin: {form.latitude.toFixed(5)}, {form.longitude?.toFixed(5)}</span>
            <button
              type="button"
              onClick={() => { set('latitude', undefined); set('longitude', undefined) }}
              className="text-red-500 hover:underline"
            >
              Clear pin
            </button>
          </div>
        )}
      </section>

      {/* Contact */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Contact Information (Optional)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Contact Email</Label>
            <Input type="email" value={form.contactEmail ?? ''} onChange={(e) => set('contactEmail', e.target.value || undefined)} placeholder="your@email.com" />
            <FieldError field="contactEmail" />
          </div>
          <div className="space-y-1">
            <Label>Contact Phone</Label>
            <Input value={form.contactPhone ?? ''} onChange={(e) => set('contactPhone', e.target.value || undefined)} placeholder="(555) 123-4567" />
            <FieldError field="contactPhone" />
          </div>
          <div className="space-y-1">
            <Label>Reward</Label>
            <Input value={form.reward ?? ''} onChange={(e) => set('reward', e.target.value || undefined)} placeholder="e.g. $500 reward" />
            <FieldError field="reward" />
          </div>
        </div>
      </section>

      {!!error && <ErrorMessage error={error} />}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
        size="lg"
      >
        {isLoading ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
