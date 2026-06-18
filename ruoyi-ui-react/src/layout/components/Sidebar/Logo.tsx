import logo from '@/assets/logo/logo.png'
import { useSettingsStore } from '@/store/useSettingsStore'

export default function Logo() {
  const isDark = useSettingsStore((s) => s.isDark)

  return (
    <div className="sidebar-logo-container" style={isDark ? undefined : { background: '#fff' }}>
      <img src={logo} alt="logo" className="sidebar-logo" />
      <span className="sidebar-title" style={isDark ? undefined : { color: '#333' }}>若依管理系统</span>
    </div>
  )
}
