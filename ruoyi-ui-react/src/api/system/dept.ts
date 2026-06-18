import request from '@/utils/request'

/** 查询部门列表 */
export function listDept(query: Record<string, any>) {
  return request({ url: '/system/dept/list', method: 'get', params: query })
}

/** 查询部门列表（排除指定节点） */
export function listDeptExcludeChild(deptId: string | number) {
  return request({ url: '/system/dept/list/exclude/' + deptId, method: 'get' })
}

/** 查询部门详细 */
export function getDept(deptId: string | number) {
  return request({ url: '/system/dept/' + deptId, method: 'get' })
}

/** 新增部门 */
export function addDept(data: Record<string, any>) {
  return request({ url: '/system/dept', method: 'post', data })
}

/** 修改部门 */
export function updateDept(data: Record<string, any>) {
  return request({ url: '/system/dept', method: 'put', data })
}

/** 删除部门 */
export function delDept(deptId: string | number) {
  return request({ url: '/system/dept/' + deptId, method: 'delete' })
}
