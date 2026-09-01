import { z } from 'zod'
import { emailSchema, passwordSchema } from '@/features/auth/authSchemas'

export const registrationStep1Schema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: emailSchema,
    phone: z
      .string()
      .min(1, 'Phone is required')
      .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const registrationStep2Schema = z.object({
  address: z
    .string()
    .min(1, 'Service address is required')
    .min(10, 'Enter a complete service address'),
})

export type RegistrationStep1Values = z.infer<typeof registrationStep1Schema>
export type RegistrationStep2Values = z.infer<typeof registrationStep2Schema>
