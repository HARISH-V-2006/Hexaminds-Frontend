import type { UserRole } from './authTypes'

const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  customer: '/customer',
  worker: '/worker',
  cooperative_admin: '/cooperative-admin',
}

export const UNAUTHENTICATED_ROUTE = '/login'

export function getHomeRouteForRole(role: UserRole): string {
  return ROLE_HOME_ROUTES[role]
}
