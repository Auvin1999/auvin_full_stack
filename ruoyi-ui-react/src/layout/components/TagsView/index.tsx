import { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import {
  CloseOutlined,
  ReloadOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons'
import { useTagsViewStore, type TagView } from '@/store/useTagsViewStore'

export default function TagsView() {
  const location = useLocation()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    visitedViews,
    addView,
    delView,
    delOthersViews,
    delAllViews,
    delLeftTags,
    delRightTags,
  } = useTagsViewStore()

  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; view: TagView | null }>({
    visible: false, x: 0, y: 0, view: null,
  })

  // 初始化首页标签（affix）
  useEffect(() => {
    addView({ path: '/', title: '首页', meta: { title: '首页', icon: 'dashboard', affix: true } })
  }, [])

  // 路由变化时添加标签
  useEffect(() => {
    const title = document.title.split(' - ')[0] || location.pathname
    addView({
      path: location.pathname,
      title,
      fullPath: location.pathname + location.search,
      meta: { title },
    })
    // 自动滚动到当前标签
    scrollToActiveTag()
  }, [location.pathname])

  const scrollToActiveTag = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const activeTag = container.querySelector('.tags-view-item.active')
    if (activeTag) {
      activeTag.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [])

  const handleClose = (view: TagView) => {
    const { visitedViews } = delView(view)
    if (location.pathname === view.path) {
      const lastView = visitedViews[visitedViews.length - 1]
      navigate(lastView ? lastView.path : '/')
    }
  }

  // 右键菜单
  const handleContextMenu = (e: React.MouseEvent, view: TagView) => {
    e.preventDefault()
    // 边界检测，防止菜单溢出
    const x = Math.min(e.clientX, window.innerWidth - 180)
    setContextMenu({ visible: true, x, y: e.clientY, view })
  }

  const closeContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }

  // 点击空白处关闭右键菜单
  useEffect(() => {
    const handler = () => closeContextMenu()
    if (contextMenu.visible) {
      document.addEventListener('click', handler)
      return () => document.removeEventListener('click', handler)
    }
  }, [contextMenu.visible])

  const handleRefreshPage = () => {
    closeContextMenu()
    // 简单刷新：重新导航到当前路径
    const path = location.pathname
    navigate('/redirect' + path)
  }

  const handleCloseCurrent = () => {
    if (!contextMenu.view) return
    closeContextMenu()
    handleClose(contextMenu.view)
  }

  const handleCloseOthers = () => {
    if (!contextMenu.view) return
    closeContextMenu()
    const { visitedViews } = delOthersViews(contextMenu.view)
    if (!visitedViews.find((v) => v.path === location.pathname)) {
      navigate(contextMenu.view.path)
    }
  }

  const handleCloseLeft = () => {
    if (!contextMenu.view) return
    closeContextMenu()
    delLeftTags(contextMenu.view)
    if (!visitedViews.find((v) => v.path === contextMenu.view!.path)) return
    if (location.pathname !== contextMenu.view.path) {
      navigate(contextMenu.view.path)
    }
  }

  const handleCloseRight = () => {
    if (!contextMenu.view) return
    closeContextMenu()
    delRightTags(contextMenu.view)
    if (!visitedViews.find((v) => v.path === contextMenu.view!.path)) return
    if (location.pathname !== contextMenu.view.path) {
      navigate(contextMenu.view.path)
    }
  }

  const handleCloseAll = () => {
    closeContextMenu()
    const { visitedViews } = delAllViews()
    const affixViews = visitedViews.filter((v) => v.meta?.affix)
    if (affixViews.length > 0) {
      navigate(affixViews[affixViews.length - 1].path)
    } else {
      navigate('/')
    }
  }

  // 判断选中标签在列表中的位置
  const getSelectedIndex = () => {
    if (!contextMenu.view) return -1
    return visitedViews.findIndex((v) => v.path === contextMenu.view!.path)
  }

  const selectedIndex = getSelectedIndex()
  const isFirstView = selectedIndex <= 0
  const isLastView = selectedIndex === visitedViews.length - 1
  const isAffix = contextMenu.view?.meta?.affix === true

  return (
    <div className="tags-view-container" onClick={closeContextMenu}>
      <div className="tags-view-wrapper" ref={containerRef}>
        {visitedViews.map((view) => (
          <span
            key={view.path}
            className={`tags-view-item ${location.pathname === view.path ? 'active' : ''}`}
            onClick={() => navigate(view.path)}
            onContextMenu={(e) => handleContextMenu(e, view)}
            onMouseDown={(e) => {
              // 中键关闭
              if (e.button === 1 && !view.meta?.affix) {
                e.preventDefault()
                handleClose(view)
              }
            }}
          >
            {view.meta?.title || view.title || 'no-name'}
            {!view.meta?.affix && (
              <CloseOutlined
                className="tag-close-icon"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClose(view)
                }}
              />
            )}
          </span>
        ))}
      </div>

      {/* 右键菜单 */}
      {contextMenu.visible && (
        <div
          className="tags-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y, position: 'fixed', zIndex: 3000 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="context-menu-item" onClick={handleRefreshPage}>
            <ReloadOutlined /> 刷新页面
          </div>
          {!isAffix && (
            <div className="context-menu-item" onClick={handleCloseCurrent}>
              <CloseOutlined /> 关闭当前
            </div>
          )}
          <div className="context-menu-item" onClick={handleCloseOthers}>
            <CloseCircleOutlined /> 关闭其他
          </div>
          {!isFirstView && (
            <div className="context-menu-item" onClick={handleCloseLeft}>
              <ArrowLeftOutlined /> 关闭左侧
            </div>
          )}
          {!isLastView && (
            <div className="context-menu-item" onClick={handleCloseRight}>
              <ArrowRightOutlined /> 关闭右侧
            </div>
          )}
          <div className="context-menu-item" onClick={handleCloseAll}>
            <MinusCircleOutlined /> 全部关闭
          </div>
        </div>
      )}
    </div>
  )
}
