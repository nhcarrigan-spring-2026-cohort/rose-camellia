import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '@/components/layout/PageWrapper'
import PostForm from '@/components/posts/PostForm'
import ImageUploadZone from '@/components/posts/ImageUploadZone'
import VerificationCodeModal from '@/components/posts/VerificationCodeModal'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { useCreatePostMutation } from '@/hooks/queries/usePosts'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { imagesApi } from '@/api/images.api'
import type { CreatePostRequest } from '@/types'

export default function CreatePostPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [verificationCode, setVerificationCode] = useState<string | null>(null)
  const [createdPostId, setCreatedPostId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<unknown>(null)

  const createMutation = useCreatePostMutation()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent('/posts/new')}`, { replace: true })
    }
  }, [isAuthenticated, authLoading])

  if (authLoading) return <LoadingSpinner fullPage />
  if (!isAuthenticated) return null

  // Once a post is created, unmount the form (and its Leaflet map) entirely
  // so the verification code modal has a clean backdrop with no z-index conflicts.
  if (createdPostId && verificationCode) {
    return (
      <VerificationCodeModal
        code={verificationCode}
        postId={createdPostId}
        onClose={() => navigate(`/posts/${createdPostId}`)}
      />
    )
  }

  async function handleSubmit(data: CreatePostRequest) {
    setSubmitError(null)
    try {
      const postData = { ...data, authorUsername: user!.username }
      const response = await createMutation.mutateAsync(postData)

      if (pendingFiles.length > 0) {
        const results = await Promise.allSettled(
          pendingFiles.map((f, i) =>
            imagesApi.upload({ image: f, postId: response.id, isPrimary: i === 0 })
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

      setCreatedPostId(response.id)
      if (response.verificationCode) {
        setVerificationCode(response.verificationCode)
      } else {
        navigate(`/posts/${response.id}`)
      }
    } catch (err) {
      setSubmitError(err)
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Report a Pet</h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Photos (Optional)</h2>
          <ImageUploadZone files={pendingFiles} onChange={setPendingFiles} />
        </div>

        <PostForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          submitLabel="Create Post"
          error={submitError}
        />
      </div>

    </PageWrapper>
  )
}
