import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleReportPet() {
    if (isAuthenticated) {
      navigate('/posts/new')
    } else {
      navigate(`/login?redirect=${encodeURIComponent('/posts/new')}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-amber-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="text-amber-600 font-bold text-xl hover:text-amber-700 transition-colors">
          Rose Camellia 🐾
        </Link>

        <div className="flex items-center gap-3">
          <Button onClick={handleReportPet} className="bg-amber-500 hover:bg-amber-600 text-white">
            Report a Pet
          </Button>

          {isLoading ? (
            <Skeleton className="h-9 w-24" />
          ) : isAuthenticated && user ? (
            <>
              <Link to={`/users/${user.username}`}>
                <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all">
                  <AvatarFallback className="bg-amber-100 text-amber-700 text-sm font-semibold">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/login?redirect=${encodeURIComponent(location.pathname)}`}>Log in</Link>
              </Button>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
