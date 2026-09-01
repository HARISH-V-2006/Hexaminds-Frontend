import { z } from 'zod'

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address')

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')

export const otpSchema = z
  .string()
  .min(1, 'OTP is required')
  .regex(/^\d{6}$/, 'Enter the 6-digit OTP')

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const otpEmailFormSchema = z.object({
  email: emailSchema,
})

export const otpVerifyFormSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
})

export const registerFormSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name is too short'),
  email: emailSchema,
  phone: z
    .string()
    .min(1, 'Phone is required')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
export type OtpEmailFormValues = z.infer<typeof otpEmailFormSchema>
export type OtpVerifyFormValues = z.infer<typeof otpVerifyFormSchema>
export type RegisterFormValues = z.infer<typeof registerFormSchema>

export const DEMO_CREDENTIALS: LoginFormValues = {
  email: 'riya@example.com',
  password: 'StrongPass123',
}
