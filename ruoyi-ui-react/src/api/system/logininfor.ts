import request from '@/utils/request'

/** 查询登录日志列表 */
export function list(query: Record<string, any>) {
  return request({ url: '/system/logininfor/list', method: 'get', params: query })
}

/** 删除登录日志 */
export function delLogininfor(infoId: string | number) {
  return request({ url: '/system/logininfor/' + infoId, method: 'delete' })
}

/** 解锁用户 */
export function unlockLogininfor(userName: string) {
  return request({ url: '/system/logininfor/unlock/' + userName, method: 'get' })
}

/** 清空登录日志 */
export function cleanLogininfor() {
  return request({ url: '/system/logininfor/clean', method: 'delete' })
}
