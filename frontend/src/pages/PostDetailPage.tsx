import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import { ArrowLeft, Pencil, CheckCircle, Trash2, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import PageWrapper from '@/components/layout/PageWrapper'
import PostTypeBadge from '@/components/shared/PostTypeBadge'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import ImageGallery from '@/components/shared/ImageGallery'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import CommentSection from '@/components/posts/CommentSection'
import VerifyOwnershipForm from '@/components/posts/VerifyOwnershipForm'
import { usePostDetailQuery, useDeletePostMutation, useResolvePostMutation, useVerificationCodeQuery } from '@/hooks/queries/usePosts'
import { useAuth } from '@/context/AuthContext'

const OSM_TILE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [showVerifCode, setShowVerifCode] = useState(false)

  const { data: post, isLoading, error } = usePostDetailQuery(id!)
  const deleteMutation = useDeletePostMutation()
  const resolveMutation = useResolvePostMutation(id!)
  const verifCodeQuery = useVerificationCodeQuery(
    id!,
    user?.username ?? '',
  )

  if (isLoading) return <LoadingSpinner fullPage />
  if (error) return <PageWrapper><ErrorMessage error={error} /></PageWrapper>
  if (!post) return null

  const isOwner = isAuthenticated && user?.username === post.authorUsername

  async function handleDelete() {
    await deleteMutation.mutateAsync(id!)
    navigate('/')
  }

  async function handleResolve() {
    await resolveMutation.mutateAsync()
  }

  return (
    <PageWrapper>
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-800 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery postId={id!} />

          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <PostTypeBadge postType={post.postType} />
              {post.resolved && (
                <Alert className="border-green-200 bg-green-50 py-1 px-3 inline-flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <AlertDescription className="text-green-700 text-sm">Reunited!</AlertDescription>
                </Alert>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
            <p className="text-gray-600 whitespace-pre-wrap">{post.description}</p>

            {/* Pet details */}
            {(post.petName || post.petType || post.breed || post.color || post.size) && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Pet Details</h3>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {post.petName && <><dt className="text-gray-500">Name</dt><dd className="font-medium">{post.petName}</dd></>}
                  {post.petType && <><dt className="text-gray-500">Type</dt><dd className="font-medium">{post.petType}</dd></>}
                  {post.breed && <><dt className="text-gray-500">Breed</dt><dd className="font-medium">{post.breed}</dd></>}
                  {post.color && <><dt className="text-gray-500">Color</dt><dd className="font-medium">{post.color}</dd></>}
                  {post.size && <><dt className="text-gray-500">Size</dt><dd className="font-medium capitalize">{post.size}</dd></>}
                </dl>
              </div>
            )}

            {/* Location & date */}
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Location:</span> {post.location}</p>
              <p><span className="font-medium">Date:</span> {new Date(post.lostFoundDate).toLocaleDateString()}</p>
            </div>

            {/* Contact */}
            {(post.contactEmail || post.contactPhone || post.reward) && (
              <div className="bg-white border border-amber-100 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Contact Information</h3>
                <div className="text-sm space-y-1">
                  {post.contactEmail && <p><span className="text-gray-500">Email:</span> {post.contactEmail}</p>}
                  {post.contactPhone && <p><span className="text-gray-500">Phone:</span> {post.contactPhone}</p>}
                  {post.reward && <p><span className="text-gray-500">Reward:</span> <span className="text-green-700 font-medium">{post.reward}</span></p>}
                </div>
              </div>
            )}

            {/* Owner actions */}
            {isOwner && (
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/posts/${id}/edit`}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Link>
                </Button>
                {!post.resolved && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                    onClick={handleResolve}
                    disabled={resolveMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {resolveMutation.isPending ? 'Resolving…' : 'Mark Resolved'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
                {post.postType === 'lost' && post.hasVerification && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={() => setShowVerifCode(true)}
                  >
                    <Key className="h-4 w-4 mr-1" /> View Verification Code
                  </Button>
                )}
              </div>
            )}
          </div>

          <Separator />
          <CommentSection postId={id!} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {post.latitude != null && post.longitude != null && (
            <div className="rounded-xl overflow-hidden border border-amber-100 shadow-sm" style={{ height: 200 }}>
              <MapContainer
                center={[post.latitude, post.longitude]}
                zoom={14}
                zoomControl={false}
                scrollWheelZoom={false}
                dragging={false}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer url={OSM_TILE} />
                <CircleMarker
                  center={[post.latitude, post.longitude]}
                  radius={10}
                  pathOptions={{ fillColor: '#f59e0b', fillOpacity: 1, color: 'white', weight: 2 }}
                />
              </MapContainer>
            </div>
          )}

          <VerifyOwnershipForm postId={id!} hasVerification={post.hasVerification} />
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this post?"
        description="This will permanently delete the post and all its comments and images."
        confirmLabel="Delete Post"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* View verification code dialog */}
      {showVerifCode && isOwner && (
        <Dialog open onOpenChange={setShowVerifCode}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Your Verification Code</DialogTitle>
            </DialogHeader>
            {verifCodeQuery.isLoading ? (
              <div className="flex justify-center py-6"><LoadingSpinner /></div>
            ) : verifCodeQuery.error ? (
              <ErrorMessage error={verifCodeQuery.error} />
            ) : verifCodeQuery.data ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-3">Share this with the finder to verify ownership:</p>
                <p className="font-mono text-4xl font-bold tracking-widest text-amber-700">
                  {verifCodeQuery.data.verificationCode}
                </p>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      )}
    </PageWrapper>
  )
}
