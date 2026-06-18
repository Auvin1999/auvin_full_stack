import { Card } from 'antd'
import { useTranslation } from 'react-i18next'

export default function UserProfile() {
  const { t } = useTranslation()
  return (
    <div>
      <Card title={t('navbar.profile')}>
        <p>{t('navbar.profile')}（{t('register.placeholder')}）</p>
      </Card>
    </div>
  )
}
