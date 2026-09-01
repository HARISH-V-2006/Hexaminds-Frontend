import { useTranslation } from 'react-i18next'
import './PlaceholderPage.css'

interface PlaceholderPageProps {
  titleKey: string
}

export function PlaceholderPage({ titleKey }: PlaceholderPageProps) {
  const { t } = useTranslation()

  return (
    <div className="placeholder-page">
      <h1>{t(titleKey)}</h1>
    </div>
  )
}
