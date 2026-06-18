import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CloseOutlined } from '@ant-design/icons'
import { useTagsViewStore, type TagView } from '@/store/useTagsViewStore'

export default function TagsView() {
  const location = useLocation()
  const navigate = useNavigate()
  const { visitedViews, addView, delView } = useTagsViewStore()

  useEffect(() => {
    const view: TagView = {
      path: location.pathname,
      title: document.title.split(' - ')[0] || location.pathname,
      fullPath: location.pathname + location.search,
      meta: { title: document.title.split(' - ')[0] || location.pathname }
    }
    addView(view)
  }, [location.pathname])

  const handleClose = (view: TagView) => {
    const { visitedViews } = delView(view)
    if (location.pathname === view.path) {
      // 关闭的是当前页，跳转到最后一个标签
      const lastView = visitedViews[visitedViews.length - 1]
      if (lastView) {
        navigate(lastView.path)
      } else {
        navigate('/')
      }
    }
  }

  return (
    <div className="tags-view-container">
      <div className="tags-view-wrapper">
        {visitedViews.map((view) => (
          <span
            key={view.path}
            className={`tags-view-item ${location.pathname === view.path ? 'active' : ''}`}
            onClick={() => navigate(view.path)}
          >
            {view.meta?.title || view.title || 'no-name'}
            <CloseOutlined
              style={{ marginLeft: 4, fontSize: 12 }}
              onClick={(e) => {
                e.stopPropagation()
                handleClose(view)
              }}
            />
          </span>
        ))}
      </div>
    </div>
  )
}
