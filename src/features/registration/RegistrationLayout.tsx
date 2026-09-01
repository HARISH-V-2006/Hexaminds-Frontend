import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { CoopLogo } from '@/shared/components/CoopLogo'
import './RegistrationLayout.css'

interface RegistrationLayoutProps {
  step: 1 | 2
  title: string
  subtitle: string
  children: ReactNode
  aside?: ReactNode
  footer?: ReactNode
}

export function RegistrationLayout({
  step,
  title,
  subtitle,
  children,
  aside,
  footer,
}: RegistrationLayoutProps) {
  const { t } = useTranslation()

  return (
    <div className="registration">
      <div className="registration__container">
        <header className="registration__header">
          <CoopLogo size={56} />
          <p className="registration__step">
            {t('registration.stepLabel', { current: step, total: 2 })}
          </p>
          <h1 className="registration__title">{title}</h1>
          <p className="registration__subtitle">{subtitle}</p>
        </header>

        <div className={`registration__body ${aside ? 'registration__body--split' : ''}`}>
          <div className="registration__main">{children}</div>
          {aside && <aside className="registration__aside">{aside}</aside>}
        </div>

        {footer}
      </div>
    </div>
  )
}

export function RegistrationFooterLink({
  prompt,
  linkText,
  to,
}: {
  prompt: string
  linkText: string
  to: string
}) {
  return (
    <footer className="registration__footer">
      <p>
        {prompt}{' '}
        <Link className="registration__link" to={to}>
          {linkText}
        </Link>
      </p>
    </footer>
  )
}
