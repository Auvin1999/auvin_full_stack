import { useTranslation } from 'react-i18next'

export default function Register() {
  const { t } = useTranslation()

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>{t('register.title')}</h2>
    </div>
  )
}
