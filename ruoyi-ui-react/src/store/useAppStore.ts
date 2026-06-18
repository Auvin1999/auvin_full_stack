import { create } from 'zustand'
import Cookies from 'js-cookie'

interface SidebarState {
  opened: boolean
  withoutAnimation: boolean
  hide: boolean
}

interface AppState {
  sidebar: SidebarState
  device: 'desktop' | 'mobile'
  size: 'default' | 'small' | 'large'
}

interface AppActions {
  toggleSideBar: (withoutAnimation?: boolean) => void
  closeSideBar: (payload: { withoutAnimation: boolean }) => void
  toggleDevice: (device: 'desktop' | 'mobile') => void
  setSize: (size: 'default' | 'small' | 'large') => void
  toggleSideBarHide: (status: boolean) => void
}

const sidebarStatus = Cookies.get('sidebarStatus')
const initialOpened = sidebarStatus ? sidebarStatus === '1' : true

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  sidebar: {
    opened: initialOpened,
    withoutAnimation: false,
    hide: false
  },
  device: 'desktop',
  size: (Cookies.get('size') as 'default' | 'small' | 'large') || 'default',

  toggleSideBar(withoutAnimation?: boolean) {
    const { sidebar } = get()
    if (sidebar.hide) return
    const opened = !sidebar.opened
    Cookies.set('sidebarStatus', opened ? '1' : '0')
    set({
      sidebar: {
        ...sidebar,
        opened,
        withoutAnimation: !!withoutAnimation
      }
    })
  },

  closeSideBar(payload: { withoutAnimation: boolean }) {
    const { sidebar } = get()
    Cookies.set('sidebarStatus', '0')
    set({
      sidebar: {
        ...sidebar,
        opened: false,
        withoutAnimation: payload.withoutAnimation
      }
    })
  },

  toggleDevice(device) {
    set({ device })
  },

  setSize(size) {
    Cookies.set('size', size)
    set({ size })
  },

  toggleSideBarHide(status) {
    set((state) => ({
      sidebar: { ...state.sidebar, hide: status }
    }))
  }
}))
