import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Loader2, WifiOff } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { TextField } from '@/shared/components/TextField'
import {
  RegistrationFooterLink,
  RegistrationLayout,
} from './RegistrationLayout'
import {
  registrationStep1Schema,
  type RegistrationStep1Values,
} from './registrationSchemas'
import { useRegistrationDraftStore } from './registrationDraftStore'
import { authService, getApiErrorMessage } from '@/features/auth/authService'
import { useAuthStore } from '@/features/auth/authStore'
import { otpVerifyFormSchema, type OtpVerifyFormValues } from '@/features/auth/authSchemas'
import { useOtpCountdown } from '@/features/auth/useOtpCountdown'
import './RegistrationLayout.css'

type RegistrationPhase = 'account' | 'otp'

export function RegistrationStep1Screen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const setDraft = useRegistrationDraftStore((state) => state.setDraft)
  const submittingRef = useRef(false)

  const [phase, setPhase] = useState<RegistrationPhase>('account')
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  const { isExpired, formatted } = useOtpCountdown(otpExpiresAt)

  const form = useForm<RegistrationStep1Values>({
    resolver: zodResolver(registrationStep1Schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  })

  const otpForm = useForm<OtpVerifyFormValues>({
    resolver: zodResolver(otpVerifyFormSchema),
    defaultValues: { email: '', otp: '' },
    mode: 'onTouched',
  })

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (_data, variables) => {
      setDraft({
        name: variables.name,
        email: variables.email,
        phone: variables.phone,
      })
      otpForm.setValue('email', variables.email)
      setPhase('otp')
      setApiError(null)
      // OTP is sent by register; fetch expiry for countdown via resend endpoint metadata.
      void authService.sendOtp({ email: variables.email }).then((otpData) => {
        setOtpExpiresAt(otpData.otpExpiresAt)
      }).catch(() => {
        setOtpExpiresAt(new Date(Date.now() + 10 * 60 * 1000).toISOString())
      })
    },
    onError: (error) => {
      setApiError(getApiErrorMessage(error))
    },
  })

  const verifyOtpMutation = useMutation({
    mutationFn: authService.verifyOtp,
    onSuccess: (session) => {
      setSession(session)
      navigate('/register/address', { replace: true })
    },
    onError: (error) => {
      setApiError(getApiErrorMessage(error))
    },
  })

  const resendOtpMutation = useMutation({
    mutationFn: authService.sendOtp,
    onSuccess: (data) => {
      setOtpExpiresAt(data.otpExpiresAt)
      setApiError(null)
    },
    onError: (error) => {
      setApiError(getApiErrorMessage(error))
    },
  })

  const isBusy =
    registerMutation.isPending ||
    verifyOtpMutation.isPending ||
    resendOtpMutation.isPending

  const onSubmitAccount = form.handleSubmit((values) => {
    if (submittingRef.current || isBusy) {
      return
    }

    if (!navigator.onLine) {
      setIsOffline(true)
      setApiError(t('auth.errors.offline'))
      return
    }

    submittingRef.current = true
    setIsOffline(false)
    setApiError(null)

    registerMutation.mutate(
      {
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: 'customer',
      },
      {
        onSettled: () => {
          submittingRef.current = false
        },
      },
    )
  })

  const onSubmitOtp = otpForm.handleSubmit((values) => {
    if (submittingRef.current || isBusy || isExpired) {
      if (isExpired) {
        setApiError(t('auth.errors.otpExpired'))
      }
      return
    }

    if (!navigator.onLine) {
      setIsOffline(true)
      setApiError(t('auth.errors.offline'))
      return
    }

    submittingRef.current = true
    setIsOffline(false)
    setApiError(null)

    verifyOtpMutation.mutate(values, {
      onSettled: () => {
        submittingRef.current = false
      },
    })
  })

  return (
    <RegistrationLayout
      step={1}
      title={
        phase === 'account'
          ? t('registration.step1.title')
          : t('registration.step1.otpTitle')
      }
      subtitle={
        phase === 'account'
          ? t('registration.step1.subtitle')
          : t('registration.step1.otpSubtitle')
      }
      footer={
        <RegistrationFooterLink
          prompt={t('registration.haveAccount')}
          linkText={t('auth.actions.login')}
          to="/login"
        />
      }
    >
      {isOffline && (
        <div className="registration__banner registration__banner--warning" role="status">
          <WifiOff size={18} aria-hidden="true" />
          <span>{t('auth.errors.offline')}</span>
        </div>
      )}

      {apiError && (
        <div className="registration__banner registration__banner--error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{apiError}</span>
        </div>
      )}

      {phase === 'account' ? (
        <form className="registration__form" onSubmit={onSubmitAccount} noValidate>
          <TextField
            label={t('auth.fields.name')}
            type="text"
            autoComplete="name"
            disabled={isBusy}
            error={form.formState.errors.name?.message}
            {...form.register('name')}
          />
          <TextField
            label={t('auth.fields.email')}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            disabled={isBusy}
            error={form.formState.errors.email?.message}
            {...form.register('email')}
          />
          <TextField
            label={t('auth.fields.phone')}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="9876543210"
            disabled={isBusy}
            error={form.formState.errors.phone?.message}
            {...form.register('phone')}
          />
          <TextField
            label={t('auth.fields.password')}
            type="password"
            autoComplete="new-password"
            disabled={isBusy}
            error={form.formState.errors.password?.message}
            {...form.register('password')}
          />
          <TextField
            label={t('registration.fields.confirmPassword')}
            type="password"
            autoComplete="new-password"
            disabled={isBusy}
            error={form.formState.errors.confirmPassword?.message}
            {...form.register('confirmPassword')}
          />

          <div className="registration__sticky">
            <Button
              type="submit"
              variant="primary"
              className="registration__submit"
              disabled={isBusy}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="registration__btn-icon" size={20} aria-hidden="true" />
                  {t('registration.actions.creatingAccount')}
                </>
              ) : (
                t('registration.actions.continue')
              )}
            </Button>
          </div>
        </form>
      ) : (
        <form className="registration__form" onSubmit={onSubmitOtp} noValidate>
          <p className="registration__otp-info">
            {t('auth.otp.sentTo', { email: otpForm.watch('email') })}
          </p>

          {otpExpiresAt && !isExpired && (
            <p className="registration__otp-timer" role="timer">
              {t('auth.otp.expiresIn', { time: formatted })}
            </p>
          )}

          {isExpired && (
            <p className="registration__otp-expired" role="alert">
              {t('auth.errors.otpExpired')}
            </p>
          )}

          <TextField
            label={t('auth.fields.otp')}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            disabled={isBusy || isExpired}
            error={otpForm.formState.errors.otp?.message}
            {...otpForm.register('otp')}
          />

          <div className="registration__sticky">
            <Button
              type="submit"
              variant="primary"
              className="registration__submit"
              disabled={isBusy || isExpired}
            >
              {verifyOtpMutation.isPending ? (
                <>
                  <Loader2 className="registration__btn-icon" size={20} aria-hidden="true" />
                  {t('auth.actions.verifying')}
                </>
              ) : (
                t('registration.actions.verifyAndContinue')
              )}
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="registration__resend"
            disabled={isBusy}
            onClick={() => {
              const email = otpForm.getValues('email')
              if (email) {
                resendOtpMutation.mutate({ email })
              }
            }}
          >
            {resendOtpMutation.isPending
              ? t('auth.actions.sendingOtp')
              : t('auth.actions.resendOtp')}
          </Button>

          <button
            type="button"
            className="registration__back"
            onClick={() => {
              setPhase('account')
              setApiError(null)
            }}
          >
            {t('registration.actions.backToDetails')}
          </button>
        </form>
      )}
    </RegistrationLayout>
  )
}
