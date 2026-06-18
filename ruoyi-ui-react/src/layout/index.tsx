import { useEffect, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import TagsView from './components/TagsView'
import AppMain from './components/AppMain'
import './index.css'

const MOBILE_BREAKPOINT = 992

export default function Layout() {
  const { sidebar, device, closeSideBar, toggleDevice } = useAppStore()
  const { tagsView } = useSettingsStore()

  // 响应式：窗口宽度变化时切换设备类型
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT
      if (isMobile) {
        toggleDevice('mobile')
        closeSideBar({ withoutAnimation: true })
      } else {
        toggleDevice('desktop')
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={`app-wrapper ${sidebar.hide ? 'hideSidebar' : ''} ${sidebar.opened ? '' : 'closeSidebar'} ${device === 'mobile' ? 'mobile' : ''}`}>
      {/* 移动端遮罩 */}
      {device === 'mobile' && sidebar.opened && (
        <div className="drawer-bg" onClick={() => closeSideBar({ withoutAnimation: false })} />
      )}

      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="main-container" style={sidebar.hide ? { marginLeft: 0 } : undefined}>
        <div className={sidebar.opened ? 'fixed-header' : 'fixed-header fixed-header-collapsed'}>
          <Navbar />
          {tagsView && <TagsView />}
        </div>
        <AppMain />
      </div>
    </div>
  )
}
