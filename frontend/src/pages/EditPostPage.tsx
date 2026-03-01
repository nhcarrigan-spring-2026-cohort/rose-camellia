import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageWrapper from '@/components/layout/PageWrapper'
import PostForm from '@/components/posts/PostForm'
import ImageUploadZone from '@/components/posts/ImageUploadZone'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import { Trash2, Star } from 'lucide-react'
import { usePostDetailQuery, useUpdatePostMutation } from '@/hooks/queries/usePosts'
import { useImagesQuery, useDeleteImageMutation, useSetPrimaryImageMutation } from '@/hooks/queries/useImages'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { imagesApi } from '@/api/images.api'
import type { CreatePostRequest } from '@/types'

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [submitError, setSubmitError] = useState<unknown>(null)

  const { data: post, isLoading: postLoading, error: postError } = usePostDetailQuery(id!)
  const { data: images } = useImagesQuery(id!)
  const updateMutation = useUpdatePostMutation(id!)
  const deleteImageMutation = useDeleteImageMutation(id!)
  const setPrimaryMutation = useSetPrimaryImageMutation(id!)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/posts/${id}/edit`)}`, { replace: true })
    }
  }, [isAuthenticated, authLoading])

  useEffect(() => {
    if (post && user && post.authorUsername !== user.username) {
      navigate(`/posts/${id}`)
    }
  }, [post, user])

  if (authLoading || postLoading) return <LoadingSpinner fullPage />
  if (postError) return <PageWrapper><ErrorMessage error={postError} /></PageWrapper>
  if (!post) return null
  if (!isAuthenticated) return null

  async function handleSubmit(data: CreatePostRequest) {
    setSubmitError(null)
    try {
      await updateMutation.mutateAsync(data)

      if (pendingFiles.length > 0) {
        const results = await Promise.allSettled(
          pendingFiles.map((f, i) =>
            imagesApi.upload({ image: f, postId: id!, isPrimary: !images?.length && i === 0 })
          )
        )
        const failed = results.filter((r) => r.status === 'rejected').length
        if (failed > 0) {
          toast({
            title: 'Some images failed to upload',
            description: `${failed} image(s) could not be uploaded.`,
            variant: 'destructive',
          })
        }
      }

      navigate(`/posts/${id}`)
    } catch (err) {
      setSubmitError(err)
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Post</h1>

        {/* Existing images */}
        {images && images.length > 0 && (
          <div className="mb-6 space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">Current Images</h2>
            <div className="flex flex-wrap gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.url}
                    alt=""
                    className="h-24 w-24 object-cover rounded-xl border border-amber-200"
                  />
                  {img.isPrimary && (
                    <span className="absolute top-1 left-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      Primary
                    </span>
                  )}
                  <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryMutation.mutate(img.id)}
                        className="bg-amber-500 text-white rounded p-0.5"
                        title="Set as primary"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteImageMutation.mutate(img.id)}
                      className="bg-red-500 text-white rounded p-0.5"
                      title="Delete image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New image upload */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Add More Photos</h2>
          <ImageUploadZone files={pendingFiles} onChange={setPendingFiles} />
        </div>

        <PostForm
          initialValues={post}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
          submitLabel="Save Changes"
          error={submitError}
        />
      </div>
    </PageWrapper>
  )
}
