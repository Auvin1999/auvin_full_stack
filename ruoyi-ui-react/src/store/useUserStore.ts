import { create } from 'zustand'
import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

interface UserState {
  token: string
  id: number
  name: string
  nickName: string
  avatar: string
  roles: string[]
  permissions: string[]
}

interface UserActions {
  setToken: (token: string) => void
  setId: (id: number) => void
  setName: (name: string) => void
  setNickName: (nickName: string) => void
  setAvatar: (avatar: string) => void
  setRoles: (roles: string[]) => void
  setPermissions: (permissions: string[]) => void
  login: (userInfo: { username: string; password: string; code: string; uuid: string }) => Promise<any>
  getInfo: () => Promise<any>
  logOut: () => Promise<any>
}

export const useUserStore = create<UserState & UserActions>((set) => ({
  token: Cookies.get(TokenKey) || '',
  id: 0,
  name: '',
  nickName: '',
  avatar: '',
  roles: [],
  permissions: [],

  setToken(token: string) {
    set({ token })
    Cookies.set(TokenKey, token)
  },

  setId(id: number) {
    set({ id })
  },

  setName(name: string) {
    set({ name })
  },

  setNickName(nickName: string) {
    set({ nickName })
  },

  setAvatar(avatar: string) {
    set({ avatar })
  },

  setRoles(roles: string[]) {
    set({ roles })
  },

  setPermissions(permissions: string[]) {
    set({ permissions })
  },

  async login(userInfo) {
    // 延迟导入避免循环依赖
    const { login } = await import('@/api/login')
    const res = await login(userInfo.username, userInfo.password, userInfo.code, userInfo.uuid)
    const data = res as any
    // 设置 token 过期时间
    const expiresIn = data.expires_in
    Cookies.set('Admin-Expires-In', expiresIn)
    set({ token: data.access_token })
    Cookies.set(TokenKey, data.access_token)
    return data
  },

  async getInfo() {
    const { getInfo } = await import('@/api/login')
    const res = await getInfo()
    const data = res as any
    const user = data.user
    const roles = data.roles && data.roles.length > 0 ? data.roles : ['ROLE_DEFAULT']

    set({
      id: user.userId,
      name: user.userName,
      nickName: user.nickName,
      avatar: user.avatar,
      roles,
      permissions: data.permissions || []
    })
    return data
  },

  async logOut() {
    try {
      const { logout } = await import('@/api/login')
      await logout()
    } catch {
      // ignore logout API error
    }
    set({
      token: '',
      roles: [],
      permissions: []
    })
    Cookies.remove(TokenKey)
    Cookies.remove('Admin-Expires-In')
  }
}))
