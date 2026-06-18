import { create } from 'zustand'
import { lazy } from 'react'
import { getRouters } from '@/api/menu'

// 后端菜单数据结构
interface BackendRoute {
  name: string
  path: string
  hidden: boolean
  redirect?: string
  component: string
  meta: {
    title: string
    icon: string
    noCache?: boolean
    link?: string
    activeMenu?: string
    breadcrumb?: boolean
  }
  children?: BackendRoute[]
}

// React Router 兼容的路由对象（含菜单元数据）
export interface AppRouteObject {
  path?: string
  element?: React.ReactNode
  // 自定义字段：组件类型，用于动态路由渲染
  Component?: React.LazyExoticComponent<React.ComponentType<any>>
  redirect?: string
  hidden?: boolean
  meta?: {
    title: string
    icon: string
    noCache?: boolean
    link?: string
    activeMenu?: string
    breadcrumb?: boolean
    affix?: boolean
  }
  children?: AppRouteObject[]
}

interface PermissionState {
  routes: AppRouteObject[]
  addRoutes: AppRouteObject[]
  defaultRoutes: AppRouteObject[]
  topbarRouters: AppRouteObject[]
  sidebarRouters: AppRouteObject[]
}

interface PermissionActions {
  setRoutes: (routes: AppRouteObject[]) => void
  setDefaultRoutes: (routes: AppRouteObject[]) => void
  setTopbarRoutes: (routes: AppRouteObject[]) => void
  setSidebarRouters: (routes: AppRouteObject[]) => void
  generateRoutes: () => Promise<AppRouteObject[]>
}

// 组件映射
const Layout = lazy(() => import('@/layout'))
const ParentView = lazy(() => import('@/components/ParentView'))
const InnerLink = lazy(() => import('@/layout/components/InnerLink'))

/**
 * 动态加载视图组件
 */
const viewModules = import.meta.glob('@/views/**/*.tsx')

function loadView(view: string): React.LazyExoticComponent<React.ComponentType<any>> | undefined {
  const key = `/src/views/${view}.tsx`
  if (viewModules[key]) {
    return lazy(viewModules[key] as () => Promise<{ default: React.ComponentType<any> }>)
  }
  const indexKey = `/src/views/${view}/index.tsx`
  if (viewModules[indexKey]) {
    return lazy(viewModules[indexKey] as () => Promise<{ default: React.ComponentType<any> }>)
  }
  console.warn(`[router] view not found: ${view}`)
  return undefined
}

/**
 * 将后端路由转换为 AppRouteObject
 */
function filterAsyncRouter(
  routes: BackendRoute[],
  lastRouter?: AppRouteObject,
  type?: boolean
): AppRouteObject[] {
  const res: AppRouteObject[] = []

  routes.forEach((route) => {
    const tmp: AppRouteObject = {
      path: route.path,
      hidden: route.hidden,
      redirect: route.redirect,
      meta: route.meta,
    }

    if (type && route.children) {
      route.children = filterChildren(route.children, route)
    }

    if (route.component === 'Layout') {
      tmp.Component = Layout
    } else if (route.component === 'ParentView') {
      tmp.Component = ParentView
    } else if (route.component === 'InnerLink') {
      tmp.Component = InnerLink
    } else {
      tmp.Component = loadView(route.component)
    }

    if (route.children) {
      tmp.children = filterAsyncRouter(route.children, tmp, type)
    }

    res.push(tmp)
  })

  return res
}

/**
 * 过滤子路由，将 ParentView 的子路由提升
 */
function filterChildren(
  children: BackendRoute[],
  lastRouter?: BackendRoute
): BackendRoute[] {
  const res: BackendRoute[] = []

  children.forEach((child) => {
    if (child.component === 'ParentView' && child.children) {
      child.children.forEach((grandChild) => {
        grandChild.path = child.path + '/' + grandChild.path
        if (lastRouter) {
          grandChild.path = lastRouter.path + '/' + grandChild.path
        }
        res.push(grandChild)
      })
    } else {
      res.push(child)
    }
  })

  return res
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export const usePermissionStore = create<PermissionState & PermissionActions>((set) => ({
  routes: [],
  addRoutes: [],
  defaultRoutes: [],
  topbarRouters: [],
  sidebarRouters: [],

  setRoutes(routes) {
    set({ addRoutes: routes, routes: [] })
  },

  setDefaultRoutes(routes) {
    set({ defaultRoutes: routes })
  },

  setTopbarRoutes(routes) {
    set({ topbarRouters: routes })
  },

  setSidebarRouters(routes) {
    set({ sidebarRouters: routes })
  },

  async generateRoutes() {
    const res = await getRouters()
    const data = (res as any).data as BackendRoute[]

    const sidebarData = deepClone(data)
    const rewriteData = deepClone(data)
    const defaultData = deepClone(data)

    const sidebarRoutes = filterAsyncRouter(sidebarData)
    const rewriteRoutes = filterAsyncRouter(rewriteData, undefined, true)
    const defaultRoutes = filterAsyncRouter(defaultData)

    // 补充路径前缀 /
    const addSlash = (routes: AppRouteObject[], parentPath = ''): AppRouteObject[] => {
      return routes.map((r) => {
        const route = { ...r }
        if (route.path && !route.path.startsWith('/')) {
          route.path = parentPath ? `${parentPath}/${route.path}` : `/${route.path}`
        }
        if (route.children) {
          route.children = addSlash(route.children, route.path)
        }
        return route
      })
    }

    const finalSidebar = addSlash(sidebarRoutes)
    const finalRewrite = addSlash(rewriteRoutes)
    const finalDefault = addSlash(defaultRoutes)

    set({
      sidebarRouters: finalSidebar,
      defaultRoutes: finalDefault,
      addRoutes: finalRewrite,
      routes: finalRewrite
    })

    return finalRewrite
  }
}))
