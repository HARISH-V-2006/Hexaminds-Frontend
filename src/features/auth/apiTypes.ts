import type { UserRole } from './authTypes'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  role: UserRole
}

export interface OtpSendRequest {
  email: string
}

export interface OtpSendResponse {
  message: string
  otpExpiresAt: string
}

export interface OtpVerifyRequest {
  email: string
  otp: string
}

export interface OtpVerifyResponse {
  success: boolean
  message?: string
  accessToken?: string
  refreshToken?: string
  role?: UserRole
}

export interface RefreshRequest {
  refreshToken: string
}

export interface RefreshResponse {
  success: boolean
  message?: string
  accessToken?: string
  refreshToken?: string
  role?: UserRole
}

export interface LogoutRequest {
  refreshToken: string
}

export interface LogoutResponse {
  success: boolean
  message?: string
}

export interface ApiErrorBody {
  message?: string
  success?: boolean
}

export interface RegisterRequest {
  name: string
  email: string
  phone: string
  password: string
  role: 'customer' | 'provider'
}

export interface RegisterResponse {
  userId: number
  message: string
}

export interface UpdateUserRequest {
  name: string
  phone: string
  address: string
}

export interface UpdateUserResponse {
  success?: boolean
  updated?: boolean
  message?: string
}
