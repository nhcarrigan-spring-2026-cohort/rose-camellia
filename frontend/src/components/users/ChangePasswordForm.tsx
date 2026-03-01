import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ErrorMessage from '@/components/shared/ErrorMessage'
import { useChangePasswordMutation } from '@/hooks/queries/useUser'
import { useToast } from '@/hooks/use-toast'

export default function ChangePasswordForm({ username }: { username: string }) {
  const { toast } = useToast()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' })
  const mutation = useChangePasswordMutation(username)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await mutation.mutateAsync(form)
    setForm({ currentPassword: '', newPassword: '' })
    toast({ title: 'Password changed', description: 'Your password has been updated.' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      <h3 className="font-semibold text-gray-800">Change Password</h3>
      <div className="space-y-1">
        <Label>Current Password</Label>
        <Input
          type="password"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          required
        />
      </div>
      <div className="space-y-1">
        <Label>New Password</Label>
        <Input
          type="password"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          required
          minLength={8}
        />
      </div>
      {mutation.error && <ErrorMessage error={mutation.error} />}
      <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white" disabled={mutation.isPending}>
        {mutation.isPending ? 'Updating…' : 'Change Password'}
      </Button>
    </form>
  )
}
