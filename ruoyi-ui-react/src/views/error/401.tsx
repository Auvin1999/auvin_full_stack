import { useTranslation } from 'react-i18next'

export default function Error401() {
  const { t } = useTranslation()

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <h1>401</h1>
      <p>{t('error.401')}</p>
    </div>
  )
}
