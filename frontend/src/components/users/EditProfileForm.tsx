import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ErrorMessage from '@/components/shared/ErrorMessage'
import { useUpdateUserMutation } from '@/hooks/queries/useUser'
import { useToast } from '@/hooks/use-toast'
import type { UserProfile } from '@/types'

export default function EditProfileForm({ profile }: { profile: UserProfile }) {
  const { toast } = useToast()
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    contactNumber: profile.contactNumber ?? '',
  })
  const mutation = useUpdateUserMutation(profile.username)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await mutation.mutateAsync({
      name: form.name,
      email: form.email,
      contactNumber: form.contactNumber || undefined,
    })
    toast({ title: 'Profile updated', description: 'Your profile has been saved.' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      <h3 className="font-semibold text-gray-800">Edit Profile</h3>
      <div className="space-y-1">
        <Label>Name</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="space-y-1">
        <Label>Email</Label>
        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="space-y-1">
        <Label>Phone (optional)</Label>
        <Input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
      </div>
      {mutation.error && <ErrorMessage error={mutation.error} />}
      <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white" disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  )
}
