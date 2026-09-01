import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { CoopLogo } from '@/shared/components/CoopLogo'
import { UNAUTHENTICATED_ROUTE } from '@/features/auth/roleRoutes'
import { useBootSession } from './useBootSession'
import './SplashScreen.css'

export function SplashScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { status, retry } = useBootSession()

  const isLoading = status === 'idle' || status === 'loading'
  const isUnauthenticated = status === 'unauthenticated'
  const isError = status === 'error'

  return (
    <div className="splash" role="main">
      <div className="splash__frame">
        <div className="splash__brand" aria-busy={isLoading}>
          <CoopLogo size={96} />
          <h1 className="splash__title">{t('splash.appName')}</h1>
          <p className="splash__tagline">{t('splash.tagline')}</p>
        </div>

        <div className="splash__status" aria-live="polite">
          {isLoading && (
            <div className="splash__loading">
              <Loader2
                className="splash__spinner"
                size={24}
                aria-hidden="true"
              />
              <span className="splash__loading-text">{t('splash.loading')}</span>
            </div>
          )}

          {isUnauthenticated && (
            <div className="splash__unauthenticated">
              <p className="splash__ready">{t('splash.ready')}</p>
              <Button
                variant="primary"
                className="splash__continue"
                onClick={() => navigate(UNAUTHENTICATED_ROUTE)}
              >
                {t('splash.continue')}
              </Button>
            </div>
          )}

          {isError && (
            <div className="splash__error" role="alert">
              <AlertCircle size={24} aria-hidden="true" />
              <div className="splash__error-copy">
                <p className="splash__error-title">{t('splash.errorTitle')}</p>
                <p className="splash__error-message">
                  {t('splash.errorMessage')}
                </p>
              </div>
              <Button
                variant="primary"
                className="splash__retry"
                onClick={retry}
              >
                {t('splash.retry')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
