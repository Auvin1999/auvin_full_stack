import request from '@/utils/request'

/** 查询角色列表 */
export function listRole(query: Record<string, any>) {
  return request({
    url: '/system/role/list',
    method: 'get',
    params: query
  })
}

/** 查询角色详细 */
export function getRole(roleId: string | number) {
  return request({
    url: '/system/role/' + roleId,
    method: 'get'
  })
}

/** 新增角色 */
export function addRole(data: Record<string, any>) {
  return request({
    url: '/system/role',
    method: 'post',
    data
  })
}

/** 修改角色 */
export function updateRole(data: Record<string, any>) {
  return request({
    url: '/system/role',
    method: 'put',
    data
  })
}

/** 角色数据权限 */
export function dataScope(data: Record<string, any>) {
  return request({
    url: '/system/role/dataScope',
    method: 'put',
    data
  })
}

/** 角色状态修改 */
export function changeRoleStatus(roleId: string | number, status: string) {
  return request({
    url: '/system/role/changeStatus',
    method: 'put',
    data: { roleId, status }
  })
}

/** 删除角色 */
export function delRole(roleId: string | number) {
  return request({
    url: '/system/role/' + roleId,
    method: 'delete'
  })
}

/** 查询已分配用户列表 */
export function allocatedUserList(query: Record<string, any>) {
  return request({
    url: '/system/role/authUser/allocatedList',
    method: 'get',
    params: query
  })
}

/** 查询未分配用户列表 */
export function unallocatedUserList(query: Record<string, any>) {
  return request({
    url: '/system/role/authUser/unallocatedList',
    method: 'get',
    params: query
  })
}

/** 取消用户授权角色 */
export function authUserCancel(data: Record<string, any>) {
  return request({
    url: '/system/role/authUser/cancel',
    method: 'put',
    data
  })
}

/** 批量取消用户授权角色 */
export function authUserCancelAll(data: { roleId: string | number; userIds: string }) {
  return request({
    url: '/system/role/authUser/cancelAll',
    method: 'put',
    params: data
  })
}

/** 授权用户选择 */
export function authUserSelectAll(data: { roleId: string | number; userIds: string }) {
  return request({
    url: '/system/role/authUser/selectAll',
    method: 'put',
    params: data
  })
}

/** 查询角色菜单树结构 */
export function deptTreeSelect(roleId: string | number) {
  return request({
    url: '/system/role/deptTree/' + roleId,
    method: 'get'
  })
}
