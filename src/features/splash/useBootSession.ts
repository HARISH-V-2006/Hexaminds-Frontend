import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'
import { getHomeRouteForRole } from '@/features/auth/roleRoutes'
import type { BootStatus } from '@/features/auth/authTypes'

interface UseBootSessionResult {
  status: BootStatus
  retry: () => void
}

/** Wait for the splash UI to paint before navigating away. */
function waitForSplashPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

export function useBootSession(): UseBootSessionResult {
  const navigate = useNavigate()
  const restoreSession = useAuthStore((state) => state.restoreSession)
  const [status, setStatus] = useState<BootStatus>('idle')
  const bootingRef = useRef(false)

  const runBoot = useCallback(async () => {
    if (bootingRef.current) {
      return
    }

    bootingRef.current = true
    setStatus('loading')

    try {
      // Restore persisted session from secure client storage.
      // Maps to sih_users + sih_refresh_tokens via prior login flow.
      // No boot API call is required per C01 contract unless backend validation is added.
      await waitForSplashPaint()
      const user = restoreSession()

      if (user) {
        setStatus('authenticated')
        navigate(getHomeRouteForRole(user.role), { replace: true })
      } else {
        // Stay on splash with full branding — unauthenticated is a splash state, not a redirect.
        setStatus('unauthenticated')
      }
    } catch {
      setStatus('error')
    } finally {
      bootingRef.current = false
    }
  }, [navigate, restoreSession])

  const retry = useCallback(() => {
    bootingRef.current = false
    void runBoot()
  }, [runBoot])

  useEffect(() => {
    void runBoot()
  }, [runBoot])

  return { status, retry }
}
