import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

/** ParentView: 嵌套菜单的中间层容器 */
export default function ParentView() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Outlet />
    </Suspense>
  )
}
