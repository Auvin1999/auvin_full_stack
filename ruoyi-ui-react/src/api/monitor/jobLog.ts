import request from '@/utils/request'

/** 查询调度日志列表 */
export function listJobLog(query: Record<string, any>) {
  return request({ url: '/schedule/job/log/list', method: 'get', params: query })
}

/** 删除调度日志 */
export function delJobLog(jobLogId: string | number) {
  return request({ url: '/schedule/job/log/' + jobLogId, method: 'delete' })
}

/** 清空调度日志 */
export function cleanJobLog() {
  return request({ url: '/schedule/job/log/clean', method: 'delete' })
}
