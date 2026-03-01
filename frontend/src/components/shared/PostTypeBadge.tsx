import { Badge } from '@/components/ui/badge'
import type { PostType } from '@/types'

const config: Record<PostType, { label: string; className: string }> = {
  lost:     { label: 'Lost',     className: 'bg-red-100 text-red-700 border-red-200' },
  found:    { label: 'Found',    className: 'bg-green-100 text-green-700 border-green-200' },
  sighting: { label: 'Sighting', className: 'bg-blue-100 text-blue-700 border-blue-200' },
}

export default function PostTypeBadge({ postType }: { postType: PostType }) {
  const { label, className } = config[postType]
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}
