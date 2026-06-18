import request from '@/utils/request'

/** 查询公告列表 */
export function listNotice(query: Record<string, any>) {
  return request({ url: '/system/notice/list', method: 'get', params: query })
}

/** 查询公告详细 */
export function getNotice(noticeId: string | number) {
  return request({ url: '/system/notice/' + noticeId, method: 'get' })
}

/** 新增公告 */
export function addNotice(data: Record<string, any>) {
  return request({ url: '/system/notice', method: 'post', data })
}

/** 修改公告 */
export function updateNotice(data: Record<string, any>) {
  return request({ url: '/system/notice', method: 'put', data })
}

/** 删除公告 */
export function delNotice(noticeId: string | number) {
  return request({ url: '/system/notice/' + noticeId, method: 'delete' })
}
