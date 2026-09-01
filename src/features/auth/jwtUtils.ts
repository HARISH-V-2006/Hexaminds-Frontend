interface AccessTokenPayload {
  userId?: number
  email?: string
  role?: string
  exp?: number
}

export function decodeAccessToken(token: string): AccessTokenPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded) as AccessTokenPayload
  } catch {
    return null
  }
}

export function getTokenExpiryMs(token: string): number | null {
  const payload = decodeAccessToken(token)
  if (!payload?.exp) {
    return null
  }

  return payload.exp * 1000
}
