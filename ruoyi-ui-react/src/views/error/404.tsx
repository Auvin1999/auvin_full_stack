import { useTranslation } from 'react-i18next'

export default function Error404() {
  const { t } = useTranslation()

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <h1>404</h1>
      <p>{t('error.404')}</p>
    </div>
  )
}
