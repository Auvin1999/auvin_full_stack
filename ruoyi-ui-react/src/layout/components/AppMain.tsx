import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

export default function AppMain() {
  return (
    <section className="app-main">
      <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}>加载中...</div>}>
        <Outlet />
      </Suspense>
    </section>
  )
}
