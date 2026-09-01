import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRef, useState, useEffect } from 'react'
import { AlertCircle, Loader2, WifiOff } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { TextField } from '@/shared/components/TextField'
import { CoopLogo } from '@/shared/components/CoopLogo'
import { useAuthStore } from '@/features/auth/authStore'
import {
  authService,
  getApiErrorMessage,
} from '@/features/auth/authService'
import {
  DEMO_CREDENTIALS,
  loginFormSchema,
  otpEmailFormSchema,
  otpVerifyFormSchema,
  type LoginFormValues,
  type OtpEmailFormValues,
  type OtpVerifyFormValues,
} from '@/features/auth/authSchemas'
import { useOtpCountdown } from '@/features/auth/useOtpCountdown'
import { getHomeRouteForRole } from '@/features/auth/roleRoutes'
import './LoginScreen.css'

type AuthMode = 'login' | 'otp'
type OtpStep = 'email' | 'verify'

export function LoginScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const submittingRef = useRef(false)

  const [mode, setMode] = useState<AuthMode>('login')
  const [otpStep, setOtpStep] = useState<OtpStep>('email')
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  const { isExpired, formatted } = useOtpCountdown(otpExpiresAt)

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

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  })

  const otpEmailForm = useForm<OtpEmailFormValues>({
    resolver: zodResolver(otpEmailFormSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  })

  const otpVerifyForm = useForm<OtpVerifyFormValues>({
    resolver: zodResolver(otpVerifyFormSchema),
    defaultValues: { email: '', otp: '' },
    mode: 'onTouched',
  })

  const handleAuthSuccess = (role: string) => {
    if (role === 'customer' || role === 'worker' || role === 'cooperative_admin') {
      navigate(getHomeRouteForRole(role), { replace: true })
    }
  }

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (session) => {
      setSession(session)
      handleAuthSuccess(session.user.role)
    },
    onError: (error) => {
      setApiError(getApiErrorMessage(error))
    },
  })

  const sendOtpMutation = useMutation({
    mutationFn: authService.sendOtp,
    onSuccess: (data, variables) => {
      setOtpExpiresAt(data.otpExpiresAt)
      setOtpStep('verify')
      otpVerifyForm.setValue('email', variables.email)
      setApiError(null)
    },
    onError: (error) => {
      setApiError(getApiErrorMessage(error))
    },
  })

  const verifyOtpMutation = useMutation({
    mutationFn: authService.verifyOtp,
    onSuccess: (session) => {
      setSession(session)
      handleAuthSuccess(session.user.role)
    },
    onError: (error) => {
      setApiError(getApiErrorMessage(error))
    },
  })

  const isBusy =
    loginMutation.isPending ||
    sendOtpMutation.isPending ||
    verifyOtpMutation.isPending

  const guardSubmit = (action: () => void) => {
    if (submittingRef.current || isBusy) {
      return
    }

    if (!navigator.onLine) {
      setIsOffline(true)
      setApiError(t('auth.errors.offline'))
      return
    }

    setIsOffline(false)
    setApiError(null)
    submittingRef.current = true

    try {
      action()
    } finally {
      window.setTimeout(() => {
        submittingRef.current = false
      }, 300)
    }
  }

  const onPasswordLogin = loginForm.handleSubmit((values) => {
    guardSubmit(() => loginMutation.mutate(values))
  })

  const onSendOtp = otpEmailForm.handleSubmit((values) => {
    guardSubmit(() => sendOtpMutation.mutate(values))
  })

  const onVerifyOtp = otpVerifyForm.handleSubmit((values) => {
    if (isExpired) {
      setApiError(t('auth.errors.otpExpired'))
      return
    }

    guardSubmit(() => verifyOtpMutation.mutate(values))
  })

  const onDemoLogin = () => {
    loginForm.setValue('email', DEMO_CREDENTIALS.email)
    loginForm.setValue('password', DEMO_CREDENTIALS.password)
    setMode('login')
    guardSubmit(() => loginMutation.mutate(DEMO_CREDENTIALS))
  }

  const onResendOtp = () => {
    const email = otpVerifyForm.getValues('email')
    if (!email) {
      return
    }

    guardSubmit(() => sendOtpMutation.mutate({ email }))
  }

  const switchMode = (next: AuthMode) => {
    setMode(next)
    setApiError(null)
    setOtpStep('email')
    setOtpExpiresAt(null)
  }

  return (
    <div className="login-screen">
      <div className="login-screen__container">
        <header className="login-screen__header">
          <CoopLogo size={64} />
          <h1 className="login-screen__title">{t('auth.title')}</h1>
          <p className="login-screen__subtitle">{t('auth.subtitle')}</p>
        </header>

        <div className="login-screen__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`login-screen__tab ${mode === 'login' ? 'login-screen__tab--active' : ''}`}
              onClick={() => switchMode('login')}
            >
              {t('auth.tabs.password')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'otp'}
              className={`login-screen__tab ${mode === 'otp' ? 'login-screen__tab--active' : ''}`}
              onClick={() => switchMode('otp')}
            >
              {t('auth.tabs.otp')}
            </button>
          </div>

        <div className="login-screen__card">
          {isOffline && (
            <div className="login-screen__banner login-screen__banner--warning" role="status">
              <WifiOff size={18} aria-hidden="true" />
              <span>{t('auth.errors.offline')}</span>
            </div>
          )}

          {apiError && (
            <div className="login-screen__banner login-screen__banner--error" role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{apiError}</span>
            </div>
          )}

          {mode === 'login' && (
            <form className="login-screen__form" onSubmit={onPasswordLogin} noValidate>
              <TextField
                label={t('auth.fields.email')}
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                disabled={isBusy}
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register('email')}
              />
              <TextField
                label={t('auth.fields.password')}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={isBusy}
                error={loginForm.formState.errors.password?.message}
                {...loginForm.register('password')}
              />

              <Button
                type="submit"
                variant="primary"
                className="login-screen__submit"
                disabled={isBusy}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="login-screen__btn-icon" size={20} aria-hidden="true" />
                    {t('auth.actions.loggingIn')}
                  </>
                ) : (
                  t('auth.actions.login')
                )}
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="login-screen__demo"
                disabled={isBusy}
                onClick={onDemoLogin}
              >
                {t('auth.actions.demoLogin')}
              </Button>
            </form>
          )}

          {mode === 'otp' && otpStep === 'email' && (
            <form className="login-screen__form" onSubmit={onSendOtp} noValidate>
              <TextField
                label={t('auth.fields.email')}
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                disabled={isBusy}
                error={otpEmailForm.formState.errors.email?.message}
                {...otpEmailForm.register('email')}
              />

              <Button
                type="submit"
                variant="primary"
                className="login-screen__submit"
                disabled={isBusy}
              >
                {sendOtpMutation.isPending ? (
                  <>
                    <Loader2 className="login-screen__btn-icon" size={20} aria-hidden="true" />
                    {t('auth.actions.sendingOtp')}
                  </>
                ) : (
                  t('auth.actions.continue')
                )}
              </Button>
            </form>
          )}

          {mode === 'otp' && otpStep === 'verify' && (
            <form className="login-screen__form" onSubmit={onVerifyOtp} noValidate>
              <p className="login-screen__otp-info">
                {t('auth.otp.sentTo', {
                  email: otpVerifyForm.watch('email'),
                })}
              </p>

              {otpExpiresAt && !isExpired && (
                <p className="login-screen__otp-timer" role="timer">
                  {t('auth.otp.expiresIn', { time: formatted })}
                </p>
              )}

              {isExpired && (
                <p className="login-screen__otp-expired" role="alert">
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
                error={otpVerifyForm.formState.errors.otp?.message}
                {...otpVerifyForm.register('otp')}
              />

              <Button
                type="submit"
                variant="primary"
                className="login-screen__submit"
                disabled={isBusy || isExpired}
              >
                {verifyOtpMutation.isPending ? (
                  <>
                    <Loader2 className="login-screen__btn-icon" size={20} aria-hidden="true" />
                    {t('auth.actions.verifying')}
                  </>
                ) : (
                  t('auth.actions.verifyOtp')
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="login-screen__resend"
                disabled={isBusy || sendOtpMutation.isPending}
                onClick={onResendOtp}
              >
                {sendOtpMutation.isPending
                  ? t('auth.actions.sendingOtp')
                  : t('auth.actions.resendOtp')}
              </Button>

              <button
                type="button"
                className="login-screen__back"
                onClick={() => {
                  setOtpStep('email')
                  setOtpExpiresAt(null)
                  setApiError(null)
                }}
              >
                {t('auth.actions.changeEmail')}
              </button>
            </form>
          )}

        </div>

        <footer className="login-screen__footer">
          <p className="login-screen__register-prompt">
            {t('auth.register.prompt')}{' '}
            <Link className="login-screen__link" to="/register">
              {t('auth.actions.register')}
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
