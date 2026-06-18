import { create } from 'zustand'

interface SettingsState {
  title: string
  theme: string
  sideTheme: string
  showSettings: boolean
  tagsView: boolean
  tagsIcon: boolean
  fixedHeader: boolean
  sidebarLogo: boolean
  dynamicTitle: boolean
  footerVisible: boolean
  footerContent: string
  isDark: boolean
  language: 'zh-CN' | 'en-US'
}

interface SettingsActions {
  changeSetting: (payload: { key: string; value: any }) => void
  setTitle: (title: string) => void
  toggleTheme: () => void
}

// 从 localStorage 恢复设置
function getStoredSettings(): Partial<SettingsState> {
  try {
    const stored = localStorage.getItem('layout-setting')
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

const stored = getStoredSettings()

export const useSettingsStore = create<SettingsState & SettingsActions>((set, get) => ({
  title: '',
  theme: stored.theme || '#409EFF',
  sideTheme: stored.sideTheme || 'theme-dark',
  showSettings: stored.showSettings ?? false,
  tagsView: stored.tagsView ?? true,
  tagsIcon: stored.tagsIcon ?? false,
  fixedHeader: stored.fixedHeader ?? true,
  sidebarLogo: stored.sidebarLogo ?? true,
  dynamicTitle: stored.dynamicTitle ?? false,
  footerVisible: stored.footerVisible ?? true,
  footerContent: 'Copyright © 2019 若依管理系统 All Rights Reserved.',
  isDark: stored.isDark ?? false,
  language: (stored.language as 'zh-CN' | 'en-US') || 'zh-CN',

  changeSetting(payload: { key: string; value: any }) {
    const { key, value } = payload
    if (key in get()) {
      set({ [key]: value } as any)
      // 持久化到 localStorage
      const state = get()
      const toStore: Record<string, any> = {
        theme: state.theme,
        sideTheme: state.sideTheme,
        showSettings: state.showSettings,
        tagsView: state.tagsView,
        tagsIcon: state.tagsIcon,
        fixedHeader: state.fixedHeader,
        sidebarLogo: state.sidebarLogo,
        dynamicTitle: state.dynamicTitle,
        footerVisible: state.footerVisible,
        isDark: state.isDark,
        language: state.language
      }
      toStore[key] = value
      localStorage.setItem('layout-setting', JSON.stringify(toStore))
    }
  },

  setTitle(title: string) {
    set({ title })
    if (get().dynamicTitle) {
      document.title = title ? `${title} - ${import.meta.env.VITE_APP_TITLE}` : import.meta.env.VITE_APP_TITLE
    }
  },

  toggleTheme() {
    const isDark = !get().isDark
    set({ isDark })
    get().changeSetting({ key: 'isDark', value: isDark })
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}))
