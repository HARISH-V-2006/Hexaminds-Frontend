import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  Loader2,
  MapPin,
  Navigation,
  WifiOff,
} from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { TextArea } from '@/shared/components/TextArea'
import { RegistrationLayout } from './RegistrationLayout'
import {
  registrationStep2Schema,
  type RegistrationStep2Values,
} from './registrationSchemas'
import { useRegistrationDraftStore } from './registrationDraftStore'
import { userService } from './userService'
import { getApiErrorMessage } from '@/features/auth/authService'
import { getHomeRouteForRole } from '@/features/auth/roleRoutes'
import { useAuthStore } from '@/features/auth/authStore'
import { locationService } from '@/shared/location/locationService'
import { LocationServiceError } from '@/shared/location/types'
import { reverseGeocode } from '@/shared/location/reverseGeocode'
import './RegistrationLayout.css'

type LocationUiState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'permission_denied'
  | 'unavailable'

export function RegistrationStep2Screen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const draft = useRegistrationDraftStore((state) => state.draft)
  const clearDraft = useRegistrationDraftStore((state) => state.clearDraft)
  const user = useAuthStore((state) => state.user)
  const submittingRef = useRef(false)

  const [apiError, setApiError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [locationState, setLocationState] = useState<LocationUiState>('idle')
  const [addressMode, setAddressMode] = useState<'gps' | 'manual'>('manual')

  const form = useForm<RegistrationStep2Values>({
    resolver: zodResolver(registrationStep2Schema),
    defaultValues: { address: '' },
    mode: 'onTouched',
  })

  useEffect(() => {
    if (!draft) {
      navigate('/register', { replace: true })
    }
  }, [draft, navigate])

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

  const updateProfileMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => {
      clearDraft()
      if (user?.role) {
        navigate(getHomeRouteForRole(user.role), { replace: true })
      } else {
        navigate('/customer', { replace: true })
      }
    },
    onError: (error) => {
      setApiError(getApiErrorMessage(error))
    },
  })

  const isBusy = updateProfileMutation.isPending || locationState === 'loading'

  const handleUseCurrentLocation = async () => {
    if (submittingRef.current || locationState === 'loading') {
      return
    }

    if (!navigator.onLine) {
      setIsOffline(true)
      setApiError(t('auth.errors.offline'))
      return
    }

    if (!locationService.isSupported()) {
      setLocationState('unavailable')
      setAddressMode('manual')
      return
    }

    setLocationState('loading')
    setApiError(null)
    setAddressMode('gps')

    try {
      const position = await locationService.getCurrentPosition()
      const suggestedAddress = await reverseGeocode(position)

      if (suggestedAddress) {
        form.setValue('address', suggestedAddress, { shouldValidate: true })
      }

      setLocationState('success')
    } catch (error) {
      if (error instanceof LocationServiceError) {
        if (error.code === 'permission_denied') {
          setLocationState('permission_denied')
        } else {
          setLocationState('unavailable')
        }
      } else {
        setLocationState('unavailable')
      }

      setAddressMode('manual')
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    if (!draft || submittingRef.current || updateProfileMutation.isPending) {
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

    updateProfileMutation.mutate(
      {
        name: draft.name,
        phone: draft.phone,
        address: values.address,
      },
      {
        onSettled: () => {
          submittingRef.current = false
        },
      },
    )
  })

  if (!draft) {
    return null
  }

  const aside = (
    <>
      <h2 className="registration__aside-title">{t('registration.step2.asideTitle')}</h2>
      <p className="registration__location-note">{t('registration.step2.locationHelp')}</p>
      <p className="registration__location-note">{t('registration.step2.gpsDisclaimer')}</p>
      <div className="registration__location-actions">
        <Button
          type="button"
          variant="secondary"
          className="registration__location-btn"
          disabled={isBusy}
          onClick={() => void handleUseCurrentLocation()}
        >
          {locationState === 'loading' ? (
            <>
              <Loader2 className="registration__btn-icon" size={18} aria-hidden="true" />
              {t('registration.actions.locating')}
            </>
          ) : (
            <>
              <Navigation size={18} aria-hidden="true" />
              {t('registration.actions.useCurrentLocation')}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="registration__location-btn"
          disabled={isBusy}
          onClick={() => {
            setAddressMode('manual')
            setLocationState('idle')
          }}
        >
          <MapPin size={18} aria-hidden="true" />
          {t('registration.actions.enterManually')}
        </Button>
      </div>

      {locationState === 'success' && addressMode === 'gps' && (
        <p className="registration__location-status registration__location-status--success" role="status">
          {t('registration.step2.locationDetected')}
        </p>
      )}

      {locationState === 'permission_denied' && (
        <p className="registration__location-status registration__location-status--error" role="alert">
          {t('registration.step2.permissionDenied')}
        </p>
      )}

      {locationState === 'unavailable' && (
        <p className="registration__location-status registration__location-status--error" role="alert">
          {t('registration.step2.locationUnavailable')}
        </p>
      )}
    </>
  )

  return (
    <RegistrationLayout
      step={2}
      title={t('registration.step2.title')}
      subtitle={t('registration.step2.subtitle')}
      aside={aside}
    >
      <form className="registration__form" onSubmit={onSubmit} noValidate>
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

        <div className="registration__banner registration__banner--info" role="note">
          <MapPin size={18} aria-hidden="true" />
          <span>{t('registration.step2.addressNote')}</span>
        </div>

        <TextArea
          label={t('registration.fields.address')}
          autoComplete="street-address"
          placeholder={t('registration.fields.addressPlaceholder')}
          disabled={isBusy}
          hint={t('registration.step2.addressHint')}
          error={form.formState.errors.address?.message}
          {...form.register('address')}
        />

        <div className="registration__sticky">
          <Button
            type="submit"
            variant="primary"
            className="registration__submit"
            disabled={isBusy}
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="registration__btn-icon" size={20} aria-hidden="true" />
                {t('registration.actions.saving')}
              </>
            ) : (
              t('registration.actions.completeRegistration')
            )}
          </Button>
        </div>
      </form>
    </RegistrationLayout>
  )
}
