import logo from '@/assets/logo/logo.png'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useTranslation } from 'react-i18next'

export default function Logo() {
  const isDark = useSettingsStore((s) => s.isDark)
  const { t } = useTranslation()

  return (
    <div className="sidebar-logo-container" style={isDark ? undefined : { background: '#fff' }}>
      <img src={logo} alt="logo" className="sidebar-logo" />
      <span className="sidebar-title" style={isDark ? undefined : { color: '#333' }}>{import.meta.env.VITE_APP_TITLE}</span>
    </div>
  )
}
