import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import type { PostSummary } from '@/types'
import PostMarker from './PostMarker'

const OSM_TILE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

function FlyToSelected({ post }: { post: PostSummary | undefined }) {
  const map = useMap()
  useEffect(() => {
    if (post?.latitude != null && post?.longitude != null) {
      map.flyTo([post.latitude, post.longitude], 13, { duration: 0.8 })
    }
  }, [post, map])
  return null
}

interface PostMapProps {
  posts: PostSummary[]
  selectedPostId?: string
  onSelectPost: (id: string) => void
}

export default function PostMap({ posts, selectedPostId, onSelectPost }: PostMapProps) {
  const mappablePosts = posts.filter((p) => p.latitude != null && p.longitude != null)
  const selectedPost = mappablePosts.find((p) => p.id === selectedPostId)

  return (
    <MapContainer
      center={[39.5, -98.5]}
      zoom={4}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer url={OSM_TILE} attribution={OSM_ATTR} />
      <FlyToSelected post={selectedPost} />
      {mappablePosts.map((post) => (
        <PostMarker
          key={post.id}
          post={post}
          isSelected={post.id === selectedPostId}
          onClick={() => onSelectPost(post.id)}
        />
      ))}
    </MapContainer>
  )
}
