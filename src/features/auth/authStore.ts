import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthSession, AuthUser } from './authTypes'
import { isUserRole } from './authTypes'

const STORAGE_KEY = 'coopserve-auth'

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  setSession: (session: AuthSession) => void
  clearSession: () => void
  restoreSession: () => AuthUser | null
}

function isSessionValid(
  user: AuthUser | null,
  accessToken: string | null,
  refreshToken: string | null,
  expiresAt: number | null,
): boolean {
  if (!user || !accessToken || !refreshToken || !expiresAt) {
    return false
  }

  if (!isUserRole(user.role)) {
    return false
  }

  return expiresAt > Date.now()
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,

      setSession: (session) => {
        set({
          user: session.user,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          expiresAt: session.expiresAt,
        })
      },

      clearSession: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
        })
      },

      restoreSession: () => {
        const { user, accessToken, refreshToken, expiresAt } = get()

        if (!isSessionValid(user, accessToken, refreshToken, expiresAt)) {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
          })
          return null
        }

        return user
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
      }),
    },
  ),
)

export function selectIsAuthenticated(state: AuthState): boolean {
  return isSessionValid(
    state.user,
    state.accessToken,
    state.refreshToken,
    state.expiresAt,
  )
}
