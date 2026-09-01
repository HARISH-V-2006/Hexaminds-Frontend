import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore, selectIsAuthenticated } from './authStore'
import { getHomeRouteForRole } from './roleRoutes'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: Array<'customer' | 'worker' | 'cooperative_admin'>
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomeRouteForRole(user.role)} replace />
  }

  return children
}

interface GuestRouteProps {
  children: ReactNode
}

export function GuestRoute({ children }: GuestRouteProps) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (isAuthenticated && user) {
    return <Navigate to={getHomeRouteForRole(user.role)} replace />
  }

  return children
}
