import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import ErrorMessage from '@/components/shared/ErrorMessage'
import { useCommentsQuery, useCreateCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation } from '@/hooks/queries/useComments'
import { useAuth } from '@/context/AuthContext'
import type { Comment } from '@/types'

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  return `${Math.floor(diffH / 24)}d ago`
}

function CommentItem({ comment, postId }: { comment: Comment; postId: string }) {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const updateMutation = useUpdateCommentMutation(comment.id, postId)
  const deleteMutation = useDeleteCommentMutation(postId)

  const isOwn = user && user.username === comment.authorUsername

  async function handleSave() {
    await updateMutation.mutateAsync({ content: editContent })
    setEditing(false)
  }

  async function handleDelete() {
    await deleteMutation.mutateAsync(comment.id)
    setDeleteOpen(false)
  }

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-800">
            {comment.User?.name ?? comment.authorUsername ?? 'Anonymous'}
          </span>
          {comment.User?.isGuest && (
            <Badge variant="outline" className="text-xs py-0">Guest</Badge>
          )}
          <span className="text-xs text-gray-400">{formatRelativeDate(comment.createdAt)}</span>
        </div>
        {isOwn && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(!editing)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={2}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleSave} disabled={updateMutation.isPending}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setEditing(false); setEditContent(comment.content) }}>
              Cancel
            </Button>
          </div>
          {updateMutation.error && <ErrorMessage error={updateMutation.error} />}
        </div>
      ) : (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete comment?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

export default function CommentSection({ postId }: { postId: string }) {
  const { user, isAuthenticated } = useAuth()
  const { data: comments, isLoading } = useCommentsQuery(postId)
  const createMutation = useCreateCommentMutation()
  const [content, setContent] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    await createMutation.mutateAsync({ postId, content, authorUsername: user?.username })
    setContent('')
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Comments</h3>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading comments…</p>
      ) : comments && comments.length > 0 ? (
        <div className="divide-y divide-amber-100">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} postId={postId} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 py-4 text-center">No comments yet. Be the first!</p>
      )}

      <Separator className="my-4" />

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment…"
            rows={3}
          />
          {createMutation.error && <ErrorMessage error={createMutation.error} />}
          <Button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white"
            disabled={createMutation.isPending || !content.trim()}
          >
            {createMutation.isPending ? 'Posting…' : 'Post Comment'}
          </Button>
        </form>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-sm text-amber-700">
            <Link to="/login" className="font-semibold underline hover:text-amber-900">Log in</Link>{' '}
            to leave a comment.
          </p>
        </div>
      )}
    </div>
  )
}
