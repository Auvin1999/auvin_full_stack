import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Breadcrumb, Dropdown, Avatar, Space, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  ExpandOutlined,
  CompressOutlined,
  BulbOutlined,
  BulbFilled,
  GlobalOutlined,
} from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebar, toggleSideBar } = useAppStore()
  const { name, nickName, avatar, logOut } = useUserStore()
  const { isDark, toggleTheme, language } = useSettingsStore()

  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const handleLogout = async () => {
    await logOut()
    navigate('/login')
  }

  const handleLanguageChange = () => {
    const next = language === 'zh-CN' ? 'en-US' : 'zh-CN'
    useSettingsStore.getState().changeSetting({ key: 'language', value: next })
    i18n.changeLanguage(next)
  }

  // 动态面包屑（用 i18n key）
  const breadcrumbItems = [{ title: <a onClick={() => navigate('/')}>{t('navbar.home')}</a> }]
  const pathParts = location.pathname.split('/').filter(Boolean)
  const nameMap: Record<string, string> = {
    system: t('menu.system'), user: t('menu.user'), role: t('menu.role'), menu: t('menu.menu'),
    dept: t('menu.dept'), dict: t('menu.dict'), config: t('menu.config'), notice: t('menu.notice'),
    post: t('menu.post'), operlog: t('menu.operlog'), logininfor: t('menu.logininfor'),
    monitor: t('menu.monitor'), job: t('menu.job'), online: t('menu.online'),
    tool: t('menu.tool'), gen: t('menu.gen'), build: t('menu.build'),
    'dict-data': t('menu.dictData'), profile: t('menu.profile'),
  }
  pathParts.forEach((part, index) => {
    const title = nameMap[part] || part
    breadcrumbItems.push({ title: <span>{title}</span> })
  })

  const dropdownItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: t('navbar.profile'), onClick: () => navigate('/user/profile') },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: t('navbar.logout'), onClick: handleLogout },
  ]

  return (
    <div className="navbar">
      <div className="hamburger-container" onClick={() => toggleSideBar()}>
        {sidebar.opened ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
      </div>

      <div className="breadcrumb-container">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="right-menu">
        <Tooltip title={isFullscreen ? t('navbar.exitFullscreen') : t('navbar.fullscreen')}>
          <div className="right-menu-item" onClick={toggleFullscreen}>
            {isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
          </div>
        </Tooltip>

        <Tooltip title={isDark ? t('navbar.lightMode') : t('navbar.darkMode')}>
          <div className="right-menu-item" onClick={toggleTheme}>
            {isDark ? <BulbFilled style={{ color: '#faad14' }} /> : <BulbOutlined />}
          </div>
        </Tooltip>

        <Tooltip title={t('navbar.switchLang')}>
          <div className="right-menu-item" onClick={handleLanguageChange}>
            <GlobalOutlined />
            <span style={{ fontSize: 12, marginLeft: 4 }}>{language === 'zh-CN' ? '中' : 'EN'}</span>
          </div>
        </Tooltip>

        <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
          <div className="right-menu-item">
            <Space>
              <Avatar size="small" src={avatar || undefined} icon={<UserOutlined />} />
              <span>{nickName || name}</span>
            </Space>
          </div>
        </Dropdown>
      </div>
    </div>
  )
}
