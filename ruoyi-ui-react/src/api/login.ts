import request from '@/utils/request'

/** 登录 */
export function login(username: string, password: string, code: string, uuid: string) {
  return request({
    url: '/auth/login',
    headers: { isToken: false, repeatSubmit: false },
    method: 'post',
    data: { username, password, code, uuid }
  })
}

/** 注册 */
export function register(data: Record<string, any>) {
  return request({
    url: '/auth/register',
    headers: { isToken: false },
    method: 'post',
    data
  })
}

/** 刷新方法 */
export function refreshToken() {
  return request({
    url: '/auth/refresh',
    method: 'post'
  })
}

/** 获取用户详细信息 */
export function getInfo() {
  return request({
    url: '/system/user/getInfo',
    method: 'get'
  })
}

/** 退出 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'delete'
  })
}

/** 获取验证码 */
export function getCodeImg() {
  return request({
    url: '/code',
    method: 'get',
    headers: { isToken: false },
    timeout: 20000
  })
}

/** 获取路由 */
export function getRouters() {
  return request({
    url: '/getRouters',
    method: 'get'
  })
}
