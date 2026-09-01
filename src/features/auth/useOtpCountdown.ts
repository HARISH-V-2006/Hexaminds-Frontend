import { useEffect, useState } from 'react'

export function useOtpCountdown(expiresAt: string | null) {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(0)
      return
    }

    const update = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
      )
      setSecondsLeft(diff)
    }

    update()
    const interval = window.setInterval(update, 1000)
    return () => window.clearInterval(interval)
  }, [expiresAt])

  const isExpired = expiresAt !== null && secondsLeft <= 0
  const formatted = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`

  return { secondsLeft, isExpired, formatted }
}
