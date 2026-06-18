import { lazy, Suspense, useEffect, useState, useCallback } from 'react'
import { useRoutes, useLocation, useNavigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/store/useUserStore'
import { usePermissionStore, type AppRouteObject } from '@/store/usePermissionStore'
import Layout from '@/layout'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

// 懒加载页面
const Login = lazy(() => import('@/views/login'))
const Register = lazy(() => import('@/views/register'))
const Index = lazy(() => import('@/views/index'))
const Error404 = lazy(() => import('@/views/error/404'))
const Error401 = lazy(() => import('@/views/error/401'))
const Redirect = lazy(() => import('@/views/redirect'))
const UserProfile = lazy(() => import('@/views/system/user/profile'))

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    加载中...
  </div>
)

/** 常量路由（不需要权限） */
export const constantRoutes: AppRouteObject[] = [
  {
    path: '/redirect/:path(.*)',
    element: <Redirect />,
  },
  {
    path: '/login',
    element: <Login />,
    hidden: true,
  },
  {
    path: '/register',
    element: <Register />,
    hidden: true,
  },
  {
    path: '/401',
    element: <Error401 />,
    hidden: true,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <Index />,
        meta: { title: '首页', icon: 'dashboard' },
      },
    ],
  },
  {
    path: '/user',
    element: <Layout />,
    hidden: true,
    children: [
      {
        path: 'profile/:activeTab?',
        element: <UserProfile />,
        meta: { title: '个人中心', icon: 'user' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)',
    element: <Error404 />,
    hidden: true,
  },
]

/**
 * 将 AppRouteObject 转换为 React Router 的 RouteObject
 */
function toRouteObjects(routes: AppRouteObject[]): RouteObject[] {
  return routes.map((route) => {
    const { Component, children, hidden, meta, redirect, ...rest } = route

    const routeObj: RouteObject = {
      ...rest,
      element: Component ? (
        <Suspense fallback={<Loading />}>
          <Component />
        </Suspense>
      ) : route.element,
    }

    if (children) {
      routeObj.children = toRouteObjects(children)
    }

    return routeObj
  })
}

/** 预计算的常量路由（避免重复转换） */
const constantRouteObjects = toRouteObjects(constantRoutes)

/**
 * AuthGuard: 路由守卫 + 动态路由初始化
 *
 * useRoutes 必须在每次渲染中都调用（Rules of Hooks），
 * 所以拆成两层：外层始终调用 hooks，内层根据状态渲染。
 */
function AuthGuard() {
  const location = useLocation()
  const navigate = useNavigate()
  const { token, roles, getInfo } = useUserStore()
  const { generateRoutes, sidebarRouters } = usePermissionStore()
  const [ready, setReady] = useState(false)
  const [dynamicRoutes, setDynamicRoutes] = useState<RouteObject[]>([])

  const hasToken = !!token
  const whiteList = ['/login', '/register']
  const isWhitelist = whiteList.includes(location.pathname)
  const routesLoaded = sidebarRouters.length > 0 || dynamicRoutes.length > 0

  const activeRoutes = !hasToken
    ? constantRouteObjects
    : dynamicRoutes.length > 0
      ? dynamicRoutes
      : constantRouteObjects

  const element = useRoutes(activeRoutes)

  const initRoutes = useCallback(async () => {
    NProgress.start()
    try {
      await getInfo()
      const asyncRoutes = await generateRoutes()
      const allRoutes = [...constantRouteObjects, ...toRouteObjects(asyncRoutes)]
      setDynamicRoutes(allRoutes)
    } catch (e) {
      console.error('路由初始化失败', e)
    } finally {
      setReady(true)
      NProgress.done()
    }
  }, [getInfo, generateRoutes])

  useEffect(() => {
    const path = location.pathname

    if (hasToken) {
      if (path === '/login') {
        navigate('/', { replace: true })
      } else if (!routesLoaded && !ready) {
        // 有 token 但路由未加载（首次登录或刷新），初始化路由
        initRoutes()
      } else if (!ready) {
        setReady(true)
      }
    } else {
      if (!isWhitelist) {
        navigate(`/login?redirect=${path}`, { replace: true })
      }
      if (!ready) setReady(true)
    }
  }, [location.pathname, hasToken, routesLoaded])

  // 未就绪且有 token → 加载中
  if (hasToken && !ready) {
    return <Loading />
  }

  // 无 token 且不在白名单 → 空（useEffect 已触发跳转）
  if (!hasToken && !isWhitelist) {
    return null
  }

  return element
}

/** 路由入口 */
export default function AppRouter() {
  return <AuthGuard />
}
