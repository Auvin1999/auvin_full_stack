import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function AppMain() {
  const { t } = useTranslation()
  return (
    <section className="app-main">
      <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}>{t('loading')}</div>}>
        <Outlet />
      </Suspense>
    </section>
  )
}
