import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ErrorMessage from '@/components/shared/ErrorMessage'
import { useAuth } from '@/context/AuthContext'

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>
      {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </li>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
  })
  const [error, setError] = useState<unknown>(null)
  const [isLoading, setIsLoading] = useState(false)

  const pw = form.password
  const rules = {
    minLength: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    digit: /\d/.test(pw),
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError(new Error('Passwords do not match'))
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      await register({
        username: form.username,
        name: form.name,
        email: form.email,
        password: form.password,
        contactNumber: form.contactNumber || undefined,
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl border border-amber-100 shadow-sm p-8 space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">Join the community to report lost pets</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Username *</Label>
              <Input
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="petlover42"
              />
            </div>
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Email *</Label>
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <Label>Password *</Label>
            <Input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
            {form.password && (
              <ul className="mt-2 space-y-0.5">
                <PasswordRule met={rules.minLength} label="At least 8 characters" />
                <PasswordRule met={rules.uppercase} label="One uppercase letter" />
                <PasswordRule met={rules.lowercase} label="One lowercase letter" />
                <PasswordRule met={rules.digit} label="One number" />
              </ul>
            )}
          </div>

          <div className="space-y-1">
            <Label>Confirm Password *</Label>
            <Input
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1">
            <Label>Phone (optional)</Label>
            <Input
              value={form.contactNumber}
              onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>

          {!!error && <ErrorMessage error={error} />}

          <Button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
