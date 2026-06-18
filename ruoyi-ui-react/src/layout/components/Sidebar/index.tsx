import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  SettingOutlined,
  MonitorOutlined,
  ToolOutlined,
  UserOutlined,
  TeamOutlined,
  MenuOutlined,
  ApartmentOutlined,
  BookOutlined,
  FileTextOutlined,
  BellOutlined,
  KeyOutlined,
  FileSearchOutlined,
  LoginOutlined,
  DesktopOutlined,
  ScheduleOutlined,
  CodeOutlined,
  FormOutlined,
} from '@ant-design/icons'
import { usePermissionStore, type AppRouteObject } from '@/store/usePermissionStore'
import { useAppStore } from '@/store/useAppStore'
import Logo from './Logo'

// 图标映射表
const iconMap: Record<string, React.ReactNode> = {
  'dashboard': <DashboardOutlined />,
  'system': <SettingOutlined />,
  'monitor': <MonitorOutlined />,
  'tool': <ToolOutlined />,
  'user': <UserOutlined />,
  'peoples': <TeamOutlined />,
  'tree': <MenuOutlined />,
  'dept': <ApartmentOutlined />,
  'dict': <BookOutlined />,
  'post': <FileTextOutlined />,
  'notice': <BellOutlined />,
  'log': <KeyOutlined />,
  'operlog': <FileSearchOutlined />,
  'logininfor': <LoginOutlined />,
  'job': <ScheduleOutlined />,
  'online': <DesktopOutlined />,
  'server': <DesktopOutlined />,
  'code': <CodeOutlined />,
  'build': <FormOutlined />,
  'config': <SettingOutlined />,
  'edit': <FormOutlined />,
}

function getIcon(icon?: string): React.ReactNode {
  if (!icon) return undefined
  return iconMap[icon] || <SettingOutlined />
}

type MenuItem = Required<MenuProps>['items'][number]

function buildMenuItems(routes: AppRouteObject[], parentPath = ''): MenuItem[] {
  const items: MenuItem[] = []

  routes.forEach((route) => {
    if (route.hidden) return

    const fullPath = route.path?.startsWith('/')
      ? route.path
      : parentPath + '/' + (route.path || '')

    if (route.children && route.children.length > 0) {
      // 有子路由的菜单项
      const visibleChildren = route.children.filter((c) => !c.hidden)

      if (visibleChildren.length === 1) {
        // 只有一个可见子路由时，直接显示子路由
        const child = visibleChildren[0]
        const childPath = child.path?.startsWith('/')
          ? child.path
          : fullPath + '/' + (child.path || '')

        items.push({
          key: childPath,
          icon: getIcon(child.meta?.icon || route.meta?.icon),
          label: child.meta?.title || route.meta?.title,
        })
      } else if (visibleChildren.length > 1) {
        items.push({
          key: fullPath,
          icon: getIcon(route.meta?.icon),
          label: route.meta?.title,
          children: buildMenuItems(route.children, fullPath),
        })
      }
    } else {
      items.push({
        key: fullPath,
        icon: getIcon(route.meta?.icon),
        label: route.meta?.title,
      })
    }
  })

  return items
}

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarRouters } = usePermissionStore()
  const { sidebar } = useAppStore()

  const menuItems = useMemo(() => buildMenuItems(sidebarRouters), [sidebarRouters])

  const selectedKeys = useMemo(() => {
    return [location.pathname]
  }, [location.pathname])

  const openKeys = useMemo(() => {
    const path = location.pathname
    const parts = path.split('/').filter(Boolean)
    const keys: string[] = []
    for (let i = 1; i < parts.length; i++) {
      keys.push('/' + parts.slice(0, i).join('/'))
    }
    return keys
  }, [location.pathname])

  if (sidebar.hide) return null

  return (
    <div className="sidebar-container">
      <Logo />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={openKeys}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ borderRight: 0, height: 'calc(100vh - 50px)', overflow: 'auto' }}
      />
    </div>
  )
}
