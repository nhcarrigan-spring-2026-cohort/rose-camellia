import { Link } from 'react-router-dom'
import { PawPrint, MapPin, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PostSummary } from '@/types'
import PostTypeBadge from './PostTypeBadge'

interface PostCardProps {
  post: PostSummary
  isSelected?: boolean
  onClick?: () => void
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export default function PostCard({ post, isSelected, onClick }: PostCardProps) {
  return (
    <Link
      to={`/posts/${post.id}`}
      onClick={onClick}
      className={cn(
        'block bg-white rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden',
        isSelected && 'ring-2 ring-amber-400 shadow-md'
      )}
    >
      {post.resolved && (
        <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-xs font-semibold text-center py-1">
          Reunited ✓
        </div>
      )}
      <div className={cn('flex gap-3 p-3', post.resolved && 'pt-7')}>
        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
          <PawPrint className="h-7 w-7 text-amber-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <PostTypeBadge postType={post.postType} />
          </div>
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-snug">{post.title}</h3>
          {(post.petName || post.petType) && (
            <p className="text-xs text-gray-500 mt-0.5">
              {[post.petName, post.petType].filter(Boolean).join(' · ')}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            {post.location && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{post.location}</span>
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              {formatRelativeDate(post.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
