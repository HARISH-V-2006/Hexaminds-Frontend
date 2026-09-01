import { apiClient } from '@/shared/api/apiClient'
import type {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  OtpSendRequest,
  OtpSendResponse,
  OtpVerifyRequest,
  OtpVerifyResponse,
  RefreshRequest,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
} from './apiTypes'
import type { AuthSession, AuthUser } from './authTypes'
import { getTokenExpiryMs } from './jwtUtils'
import { isUserRole } from './authTypes'

function buildSession(
  accessToken: string,
  refreshToken: string,
  role: string,
  isEmailVerified: boolean,
): AuthSession {
  if (!isUserRole(role)) {
    throw new Error('Unsupported role returned by server')
  }

  const expiresAt = getTokenExpiryMs(accessToken) ?? Date.now() + 15 * 60 * 1000

  const user: AuthUser = {
    id: 0,
    role,
    is_email_verified: isEmailVerified,
  }

  return {
    user,
    accessToken,
    refreshToken,
    expiresAt,
  }
}

function enrichSessionFromToken(session: AuthSession, accessToken: string): AuthSession {
  try {
    const parts = accessToken.split('.')
    if (parts.length !== 3) {
      return session
    }

    const decoded = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
    ) as { userId?: number }

    if (decoded.userId) {
      return {
        ...session,
        user: { ...session.user, id: decoded.userId },
      }
    }
  } catch {
    /* keep session as-is */
  }

  return session
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthSession> {
    const { data } = await apiClient.post<LoginResponse>(
      '/api/auth/login',
      credentials,
    )

    const session = buildSession(
      data.accessToken,
      data.refreshToken,
      data.role,
      false,
    )

    return enrichSessionFromToken(session, data.accessToken)
  },

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await apiClient.post<RegisterResponse>(
      '/api/auth/register',
      payload,
    )
    return data
  },

  async sendOtp(payload: OtpSendRequest): Promise<OtpSendResponse> {
    const { data } = await apiClient.post<OtpSendResponse>(
      '/api/auth/otp/send',
      payload,
    )
    return data
  },

  async verifyOtp(payload: OtpVerifyRequest): Promise<AuthSession> {
    const { data } = await apiClient.post<OtpVerifyResponse>(
      '/api/auth/otp/verify',
      payload,
    )

    if (!data.success || !data.accessToken || !data.refreshToken || !data.role) {
      throw new Error(data.message ?? 'Invalid or expired OTP')
    }

    const session = buildSession(
      data.accessToken,
      data.refreshToken,
      data.role,
      true,
    )

    return enrichSessionFromToken(session, data.accessToken)
  },

  async refresh(payload: RefreshRequest): Promise<AuthSession> {
    const { data } = await apiClient.post<RefreshResponse>(
      '/api/auth/refresh',
      payload,
    )

    if (!data.success || !data.accessToken || !data.refreshToken || !data.role) {
      throw new Error(data.message ?? 'Invalid or expired refresh token')
    }

    const session = buildSession(
      data.accessToken,
      data.refreshToken,
      data.role,
      false,
    )

    return enrichSessionFromToken(session, data.accessToken)
  },

  async logout(payload: LogoutRequest): Promise<LogoutResponse> {
    const { data } = await apiClient.post<LogoutResponse>(
      '/api/auth/logout',
      payload,
    )
    return data
  },
}

export function getApiErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string
            errors?: Array<{ field?: string; message?: string }>
          }
        }
      }
    ).response

    if (response?.data?.errors?.length) {
      return response.data.errors
        .map((entry) => entry.message)
        .filter(Boolean)
        .join(', ')
    }

    if (response?.data?.message) {
      return response.data.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
