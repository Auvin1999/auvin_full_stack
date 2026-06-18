import { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  CloseOutlined,
  ReloadOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons'
import i18n from '@/i18n'
import { useTagsViewStore, type TagView } from '@/store/useTagsViewStore'
import { useSettingsStore } from '@/store/useSettingsStore'

// 后端菜单中文标题 → i18n key（与 Sidebar 保持一致）
const titleI18nMap: Record<string, string> = {
  '系统管理': 'menu.system', '系统监控': 'menu.monitor', '系统工具': 'menu.tool',
  '用户管理': 'menu.user', '角色管理': 'menu.role', '菜单管理': 'menu.menu',
  '部门管理': 'menu.dept', '字典管理': 'menu.dict', '字典数据': 'menu.dictData',
  '参数设置': 'menu.config', '参数管理': 'menu.config', '通知公告': 'menu.notice',
  '岗位管理': 'menu.post', '操作日志': 'menu.operlog', '登录日志': 'menu.logininfor',
  '定时任务': 'menu.job', '调度日志': 'menu.jobLog', '在线用户': 'menu.online',
  '代码生成': 'menu.gen', '表单构建': 'menu.build', '个人中心': 'menu.profile',
  '首页': 'navbar.home', '服务监控': 'menu.monitor', '若依官网': 'menu.ruoyiHome',
}

function translateTitle(title?: string): string {
  if (!title) return ''
  const key = titleI18nMap[title]
  if (key) {
    const translated = i18n.t(key)
    return translated !== key ? translated : title
  }
  return title
}

export default function TagsView() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const language = useSettingsStore((s) => s.language)
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

  // 初始化首页标签（affix），语言切换时更新
  useEffect(() => {
    addView({ path: '/', title: t('navbar.home'), meta: { title: t('navbar.home'), icon: 'dashboard', affix: true } })
  }, [language])

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
            {translateTitle(view.meta?.title) || view.title || 'no-name'}
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
            <ReloadOutlined /> {t('tagsView.refreshPage')}
          </div>
          {!isAffix && (
            <div className="context-menu-item" onClick={handleCloseCurrent}>
              <CloseOutlined /> {t('tagsView.closeCurrent')}
            </div>
          )}
          <div className="context-menu-item" onClick={handleCloseOthers}>
            <CloseCircleOutlined /> {t('tagsView.closeOthers')}
          </div>
          {!isFirstView && (
            <div className="context-menu-item" onClick={handleCloseLeft}>
              <ArrowLeftOutlined /> {t('tagsView.closeLeft')}
            </div>
          )}
          {!isLastView && (
            <div className="context-menu-item" onClick={handleCloseRight}>
              <ArrowRightOutlined /> {t('tagsView.closeRight')}
            </div>
          )}
          <div className="context-menu-item" onClick={handleCloseAll}>
            <MinusCircleOutlined /> {t('tagsView.closeAll')}
          </div>
        </div>
      )}
    </div>
  )
}
