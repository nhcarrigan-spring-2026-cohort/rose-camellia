import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import ErrorMessage from '@/components/shared/ErrorMessage'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const { login, guestLogin } = useAuth()

  const [mode, setMode] = useState<'login' | 'guest'>('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [guestForm, setGuestForm] = useState({ name: '', email: '', contactNumber: '' })
  const [error, setError] = useState<unknown>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await login(loginForm)
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGuestLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await guestLogin({
        name: guestForm.name,
        email: guestForm.email,
        contactNumber: guestForm.contactNumber || undefined,
      })
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-amber-100 shadow-sm p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              required
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1">
            <Label>Password</Label>
            <Input
              type="password"
              required
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          {!!error && mode === 'login' && <ErrorMessage error={error} />}
          <Button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-500">Don't have an account?{' '}</span>
          <Link to="/register" className="text-amber-600 font-medium hover:underline">
            Sign up
          </Link>
        </div>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400">
            or
          </span>
        </div>

        {mode === 'login' ? (
          <Button
            variant="outline"
            className="w-full border-amber-200 text-amber-700"
            onClick={() => { setMode('guest'); setError(null) }}
          >
            Continue as Guest
          </Button>
        ) : (
          <form onSubmit={handleGuestLogin} className="space-y-3">
            <p className="text-sm text-gray-500 text-center">Guest access expires in 24 hours.</p>
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input
                required
                value={guestForm.name}
                onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input
                type="email"
                required
                value={guestForm.email}
                onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1">
              <Label>Phone (optional)</Label>
              <Input
                value={guestForm.contactNumber}
                onChange={(e) => setGuestForm({ ...guestForm, contactNumber: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            {!!error && mode === 'guest' && <ErrorMessage error={error} />}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => { setMode('login'); setError(null) }}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Joining…' : 'Join as Guest'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
