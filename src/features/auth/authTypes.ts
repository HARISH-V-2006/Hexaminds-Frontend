export type UserRole = 'customer' | 'worker' | 'cooperative_admin'

/** Maps to sih_users(id, role, is_email_verified) */
export interface AuthUser {
  id: number
  role: UserRole
  is_email_verified: boolean
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export type BootStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error'

export const USER_ROLES: readonly UserRole[] = [
  'customer',
  'worker',
  'cooperative_admin',
] as const

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value)
}
