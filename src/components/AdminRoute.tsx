import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/ui/skeleton'

export function AdminRoute() {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="space-y-3 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
