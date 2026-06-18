import request from '@/utils/request'

/** 查询定时任务列表 */
export function listJob(query: Record<string, any>) {
  return request({ url: '/schedule/job/list', method: 'get', params: query })
}

/** 查询定时任务详细 */
export function getJob(jobId: string | number) {
  return request({ url: '/schedule/job/' + jobId, method: 'get' })
}

/** 新增定时任务 */
export function addJob(data: Record<string, any>) {
  return request({ url: '/schedule/job', method: 'post', data })
}

/** 修改定时任务 */
export function updateJob(data: Record<string, any>) {
  return request({ url: '/schedule/job', method: 'put', data })
}

/** 删除定时任务 */
export function delJob(jobId: string | number) {
  return request({ url: '/schedule/job/' + jobId, method: 'delete' })
}

/** 任务状态修改 */
export function changeJobStatus(jobId: string | number, status: string) {
  return request({ url: '/schedule/job/changeStatus', method: 'put', data: { jobId, status } })
}

/** 定时任务立即执行一次 */
export function runJob(jobId: string | number, jobGroup: string) {
  return request({ url: '/schedule/job/run', method: 'put', data: { jobId, jobGroup } })
}
