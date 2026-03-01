import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import PageWrapper from '@/components/layout/PageWrapper'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import PostCard from '@/components/shared/PostCard'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import EditProfileForm from '@/components/users/EditProfileForm'
import ChangePasswordForm from '@/components/users/ChangePasswordForm'
import { useUserProfileQuery, useDeleteUserMutation } from '@/hooks/queries/useUser'
import { useAuth } from '@/context/AuthContext'
import { Trash2 } from 'lucide-react'

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: profile, isLoading, error } = useUserProfileQuery(username!)
  const deleteMutation = useDeleteUserMutation(username!)

  const isOwnProfile = isAuthenticated && user?.username === username

  async function handleDeleteAccount() {
    await deleteMutation.mutateAsync()
    logout()
    navigate('/')
  }

  if (isLoading) return <LoadingSpinner fullPage />
  if (error) return <PageWrapper><ErrorMessage error={error} /></PageWrapper>
  if (!profile) return null

  return (
    <PageWrapper>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 text-center space-y-3">
            <Avatar className="h-20 w-20 mx-auto">
              <AvatarFallback className="bg-amber-100 text-amber-700 text-2xl font-bold">
                {profile.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-sm text-gray-400">@{profile.username}</p>
            </div>
            <p className="text-xs text-gray-400">
              Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            {profile.isGuest && (
              <span className="inline-block bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">Guest</span>
            )}
          </div>

          {isOwnProfile && (
            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 space-y-4">
              <div className="text-sm space-y-1">
                <p className="text-gray-500">Email: <span className="text-gray-700">{profile.email}</span></p>
                {profile.contactNumber && (
                  <p className="text-gray-500">Phone: <span className="text-gray-700">{profile.contactNumber}</span></p>
                )}
              </div>

              <Separator />
              <EditProfileForm profile={profile} />

              {!profile.isGuest && (
                <>
                  <Separator />
                  <ChangePasswordForm username={profile.username} />
                </>
              )}

              <Separator />
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 w-full"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete Account
              </Button>
            </div>
          )}
        </div>

        {/* Posts grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {isOwnProfile ? 'Your Posts' : `${profile.name}'s Posts`}
          </h2>
          {profile.Post.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No posts yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {profile.Post.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete your account?"
        description="This will permanently delete your account and all your posts. This cannot be undone."
        confirmLabel="Delete Account"
        onConfirm={handleDeleteAccount}
        isLoading={deleteMutation.isPending}
      />
    </PageWrapper>
  )
}
