import { create } from 'zustand'

export interface TagView {
  path: string
  name?: string
  title?: string
  meta?: {
    title?: string
    noCache?: boolean
    affix?: boolean
    icon?: string
    activeMenu?: string
  }
  fullPath?: string
  query?: Record<string, any>
}

interface TagsViewState {
  visitedViews: TagView[]
  cachedViews: string[]
  iframeViews: TagView[]
}

interface TagsViewActions {
  addView: (view: TagView) => void
  addVisitedView: (view: TagView) => void
  addCachedView: (view: TagView) => void
  addIframeView: (view: TagView) => void
  delView: (view: TagView) => { visitedViews: TagView[]; cachedViews: string[] }
  delVisitedView: (view: TagView) => TagView[]
  delIframeView: (view: TagView) => TagView[]
  delCachedView: (view: TagView) => string[]
  delOthersViews: (view: TagView) => { visitedViews: TagView[]; cachedViews: string[] }
  delOthersVisitedViews: (view: TagView) => TagView[]
  delOthersCachedViews: (view: TagView) => string[]
  delAllViews: () => { visitedViews: TagView[]; cachedViews: string[] }
  delAllVisitedViews: () => TagView[]
  delAllCachedViews: () => string[]
  updateVisitedView: (view: TagView) => void
  delRightTags: (view: TagView) => { visitedViews: TagView[]; cachedViews: string[] }
  delLeftTags: (view: TagView) => { visitedViews: TagView[]; cachedViews: string[] }
}

export const useTagsViewStore = create<TagsViewState & TagsViewActions>((set, get) => ({
  visitedViews: [],
  cachedViews: [],
  iframeViews: [],

  addView(view: TagView) {
    get().addVisitedView(view)
    get().addCachedView(view)
  },

  addVisitedView(view: TagView) {
    const { visitedViews } = get()
    if (visitedViews.some((v) => v.path === view.path)) return
    visitedViews.push({
      ...view,
      title: view.meta?.title || view.title || 'no-name'
    })
    set({ visitedViews: [...visitedViews] })
  },

  addCachedView(view: TagView) {
    const { cachedViews } = get()
    if (!view.name || view.meta?.noCache) return
    if (cachedViews.includes(view.name)) return
    cachedViews.push(view.name)
    set({ cachedViews: [...cachedViews] })
  },

  addIframeView(view: TagView) {
    const { iframeViews } = get()
    if (iframeViews.some((v) => v.path === view.path)) return
    iframeViews.push(view)
    set({ iframeViews: [...iframeViews] })
  },

  delView(view: TagView) {
    const visitedViews = get().delVisitedView(view)
    const cachedViews = get().delCachedView(view)
    return { visitedViews, cachedViews }
  },

  delVisitedView(view: TagView) {
    const { visitedViews, iframeViews } = get()
    set({
      visitedViews: visitedViews.filter((v) => v.path !== view.path),
      iframeViews: iframeViews.filter((v) => v.path !== view.path)
    })
    return get().visitedViews
  },

  delIframeView(view: TagView) {
    const newViews = get().iframeViews.filter((v) => v.path !== view.path)
    set({ iframeViews: newViews })
    return newViews
  },

  delCachedView(view: TagView) {
    if (!view.name) return get().cachedViews
    const newCached = get().cachedViews.filter((name) => name !== view.name)
    set({ cachedViews: newCached })
    return newCached
  },

  delOthersViews(view: TagView) {
    const visitedViews = get().delOthersVisitedViews(view)
    const cachedViews = get().delOthersCachedViews(view)
    return { visitedViews, cachedViews }
  },

  delOthersVisitedViews(view: TagView) {
    const { visitedViews, iframeViews } = get()
    set({
      visitedViews: visitedViews.filter(
        (v) => v.meta?.affix || v.path === view.path
      ),
      iframeViews: iframeViews.filter((v) => v.path === view.path)
    })
    return get().visitedViews
  },

  delOthersCachedViews(view: TagView) {
    if (!view.name) {
      set({ cachedViews: [] })
      return []
    }
    set({ cachedViews: [view.name] })
    return [view.name]
  },

  delAllViews() {
    const visitedViews = get().delAllVisitedViews()
    const cachedViews = get().delAllCachedViews()
    return { visitedViews, cachedViews }
  },

  delAllVisitedViews() {
    const { visitedViews } = get()
    set({
      visitedViews: visitedViews.filter((v) => v.meta?.affix),
      iframeViews: []
    })
    return get().visitedViews
  },

  delAllCachedViews() {
    set({ cachedViews: [] })
    return []
  },

  updateVisitedView(view: TagView) {
    const { visitedViews } = get()
    const idx = visitedViews.findIndex((v) => v.path === view.path)
    if (idx !== -1) {
      visitedViews[idx] = { ...visitedViews[idx], ...view }
      set({ visitedViews: [...visitedViews] })
    }
  },

  delRightTags(view: TagView) {
    const { visitedViews, cachedViews } = get()
    const idx = visitedViews.findIndex((v) => v.path === view.path)
    if (idx === -1) return { visitedViews: get().visitedViews, cachedViews: get().cachedViews }

    const newVisited = visitedViews.filter(
      (v, i) => i <= idx || v.meta?.affix
    )
    const removedNames = visitedViews
      .filter((v, i) => i > idx && !v.meta?.affix)
      .map((v) => v.name)
      .filter(Boolean) as string[]
    const newCached = cachedViews.filter((n) => !removedNames.includes(n))

    set({
      visitedViews: newVisited,
      cachedViews: newCached,
      iframeViews: get().iframeViews.filter((v) => newVisited.some((nv) => nv.path === v.path))
    })
    return { visitedViews: newVisited, cachedViews: newCached }
  },

  delLeftTags(view: TagView) {
    const { visitedViews, cachedViews } = get()
    const idx = visitedViews.findIndex((v) => v.path === view.path)
    if (idx === -1) return { visitedViews: get().visitedViews, cachedViews: get().cachedViews }

    const newVisited = visitedViews.filter(
      (v, i) => i >= idx || v.meta?.affix
    )
    const removedNames = visitedViews
      .filter((v, i) => i < idx && !v.meta?.affix)
      .map((v) => v.name)
      .filter(Boolean) as string[]
    const newCached = cachedViews.filter((n) => !removedNames.includes(n))

    set({
      visitedViews: newVisited,
      cachedViews: newCached,
      iframeViews: get().iframeViews.filter((v) => newVisited.some((nv) => nv.path === v.path))
    })
    return { visitedViews: newVisited, cachedViews: newCached }
  }
}))
