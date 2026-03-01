import { CircleMarker, Tooltip } from 'react-leaflet'
import type { PostSummary } from '@/types'

const fillColors: Record<string, string> = {
  lost: '#ef4444',
  found: '#22c55e',
  sighting: '#3b82f6',
}

interface PostMarkerProps {
  post: PostSummary
  isSelected: boolean
  onClick: () => void
}

export default function PostMarker({ post, isSelected, onClick }: PostMarkerProps) {
  return (
    <CircleMarker
      center={[post.latitude!, post.longitude!]}
      radius={isSelected ? 14 : 10}
      pathOptions={{
        fillColor: fillColors[post.postType],
        fillOpacity: 1,
        color: isSelected ? '#f59e0b' : 'white',
        weight: isSelected ? 3 : 2,
      }}
      eventHandlers={{ click: onClick }}
    >
      <Tooltip>{post.title}</Tooltip>
    </CircleMarker>
  )
}
