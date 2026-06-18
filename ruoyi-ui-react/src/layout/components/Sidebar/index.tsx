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
import i18n from '@/i18n'
import { usePermissionStore, type AppRouteObject } from '@/store/usePermissionStore'
import { useAppStore } from '@/store/useAppStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { isExternal } from '@/utils/validate'
import Logo from './Logo'

// 后端菜单中文标题 → i18n key 映射
const titleI18nMap: Record<string, string> = {
  '系统管理': 'menu.system',
  '系统监控': 'menu.monitor',
  '系统工具': 'menu.tool',
  '用户管理': 'menu.user',
  '角色管理': 'menu.role',
  '菜单管理': 'menu.menu',
  '部门管理': 'menu.dept',
  '字典管理': 'menu.dict',
  '字典数据': 'menu.dictData',
  '参数设置': 'menu.config',
  '参数管理': 'menu.config',
  '通知公告': 'menu.notice',
  '岗位管理': 'menu.post',
  '操作日志': 'menu.operlog',
  '登录日志': 'menu.logininfor',
  '定时任务': 'menu.job',
  '调度日志': 'menu.jobLog',
  '在线用户': 'menu.online',
  '代码生成': 'menu.gen',
  '表单构建': 'menu.build',
  '个人中心': 'menu.profile',
  '首页': 'navbar.home',
  '服务监控': 'menu.monitor',
  '若依官网': 'menu.ruoyiHome',
}

/** 将后端标题翻译为当前语言 */
function translateTitle(title?: string): string {
  if (!title) return ''
  const key = titleI18nMap[title]
  if (key) {
    const translated = i18n.t(key)
    // i18n.t() 在找不到 key 时返回 key 本身，此时回退到原中文
    return translated !== key ? translated : title
  }
  return title
}

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

/**
 * 判断是否为外部链接（http/https 开头）
 */
function isExternalLink(path?: string): boolean {
  return !!path && isExternal(path)
}

/**
 * 构造菜单项
 *
 * 关键逻辑：
 * - 路由的 meta.link 存在且为外链 → key 使用外链地址，点击新标签打开
 * - 路由的 component 为 InnerLink → key 使用 meta.link，点击在 iframe 中嵌入
 * - 其他 → key 使用路由路径，点击走 React Router
 */
function buildMenuItems(routes: AppRouteObject[], parentPath = ''): MenuItem[] {
  const items: MenuItem[] = []

  routes.forEach((route) => {
    if (route.hidden) return

    const fullPath = route.path?.startsWith('/')
      ? route.path
      : parentPath + '/' + (route.path || '')

    // 判断链接目标：优先使用 meta.link
    const linkTarget = route.meta?.link
    const isExt = isExternalLink(linkTarget)

    if (route.children && route.children.length > 0) {
      const visibleChildren = route.children.filter((c) => !c.hidden)

      if (visibleChildren.length === 1) {
        const child = visibleChildren[0]
        const childPath = child.path?.startsWith('/')
          ? child.path
          : fullPath + '/' + (child.path || '')

        const childLink = child.meta?.link
        const childIsExt = isExternalLink(childLink)

        // 单个子路由：使用子路由的 key
        const menuKey = childIsExt ? `@ext:${childLink}` : childPath

        items.push({
          key: menuKey,
          icon: getIcon(child.meta?.icon || route.meta?.icon),
          label: translateTitle(child.meta?.title || route.meta?.title),
        })
      } else if (visibleChildren.length > 1) {
        // 多个子路由：递归构造
        items.push({
          key: isExt ? `@ext:${linkTarget}` : fullPath,
          icon: getIcon(route.meta?.icon),
          label: translateTitle(route.meta?.title),
          children: buildMenuItems(route.children, fullPath),
        })
      }
    } else {
      // 叶子节点
      const menuKey = isExt ? `@ext:${linkTarget}` : fullPath
      items.push({
        key: menuKey,
        icon: getIcon(route.meta?.icon),
        label: translateTitle(route.meta?.title),
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
  const { isDark, language } = useSettingsStore()

  const menuItems = useMemo(() => buildMenuItems(sidebarRouters), [sidebarRouters, language])

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

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('@ext:')) {
      // 外部链接：新标签打开
      window.open(key.replace('@ext:', ''), '_blank', 'noopener')
    } else {
      navigate(key)
    }
  }

  if (sidebar.hide) return null

  return (
    <div className="sidebar-container" style={isDark ? undefined : { backgroundColor: '#fff' }}>
      <Logo />
      <Menu
        theme={isDark ? 'dark' : 'light'}
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={openKeys}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0, height: 'calc(100vh - 50px)', overflow: 'auto' }}
      />
    </div>
  )
}
