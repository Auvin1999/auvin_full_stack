import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Breadcrumb, Dropdown, Avatar, Space, Tooltip, Badge } from 'antd'
import type { MenuProps } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  ExpandOutlined,
  CompressOutlined,
  BulbOutlined,
  BulbFilled,
} from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebar, toggleSideBar } = useAppStore()
  const { name, nickName, avatar, logOut } = useUserStore()
  const { isDark, toggleTheme } = useSettingsStore()

  const [isFullscreen, setIsFullscreen] = useState(false)

  // 全屏切换
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

  // 动态面包屑
  const breadcrumbItems = [{ title: <a onClick={() => navigate('/')}>首页</a> }]
  const pathParts = location.pathname.split('/').filter(Boolean)
  const nameMap: Record<string, string> = {
    system: '系统管理', user: '用户管理', role: '角色管理', menu: '菜单管理',
    dept: '部门管理', dict: '字典管理', config: '参数设置', notice: '通知公告',
    post: '岗位管理', operlog: '操作日志', logininfor: '登录日志',
    monitor: '系统监控', job: '定时任务', online: '在线用户',
    tool: '系统工具', gen: '代码生成', build: '表单构建',
    'dict-data': '字典数据', profile: '个人中心',
  }
  pathParts.forEach((part, index) => {
    const title = nameMap[part] || part
    if (index < pathParts.length - 1) {
      breadcrumbItems.push({ title: <span>{title}</span> })
    } else {
      breadcrumbItems.push({ title: <span style={{ color: '#333' }}>{title}</span> })
    }
  })

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/user/profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
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
        <Tooltip title="全屏">
          <div className="right-menu-item" onClick={toggleFullscreen}>
            {isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
          </div>
        </Tooltip>

        <Tooltip title={isDark ? '浅色模式' : '深色模式'}>
          <div className="right-menu-item" onClick={toggleTheme}>
            {isDark ? <BulbFilled style={{ color: '#faad14' }} /> : <BulbOutlined />}
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
