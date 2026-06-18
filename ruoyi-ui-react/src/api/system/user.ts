import request from '@/utils/request'
import { parseStrEmpty } from '@/utils/ruoyi'

/** 查询用户列表 */
export function listUser(query: Record<string, any>) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query
  })
}

/** 查询用户详细 */
export function getUser(userId: string | number) {
  return request({
    url: '/system/user/' + parseStrEmpty(String(userId)),
    method: 'get'
  })
}

/** 新增用户 */
export function addUser(data: Record<string, any>) {
  return request({
    url: '/system/user',
    method: 'post',
    data
  })
}

/** 修改用户 */
export function updateUser(data: Record<string, any>) {
  return request({
    url: '/system/user',
    method: 'put',
    data
  })
}

/** 删除用户 */
export function delUser(userId: string | number) {
  return request({
    url: '/system/user/' + userId,
    method: 'delete'
  })
}

/** 用户密码重置 */
export function resetUserPwd(userId: string | number, password: string) {
  return request({
    url: '/system/user/resetPwd',
    method: 'put',
    data: { userId, password }
  })
}

/** 用户状态修改 */
export function changeUserStatus(userId: string | number, status: string) {
  return request({
    url: '/system/user/changeStatus',
    method: 'put',
    data: { userId, status }
  })
}

/** 查询用户个人信息 */
export function getUserProfile() {
  return request({
    url: '/system/user/profile',
    method: 'get'
  })
}

/** 修改用户个人信息 */
export function updateUserProfile(data: Record<string, any>) {
  return request({
    url: '/system/user/profile',
    method: 'put',
    data
  })
}

/** 用户密码修改 */
export function updateUserPwd(oldPassword: string, newPassword: string) {
  return request({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    params: { oldPassword, newPassword }
  })
}

/** 用户头像上传 */
export function uploadAvatar(data: FormData) {
  return request({
    url: '/system/user/profile/avatar',
    method: 'post',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data
  })
}

/** 查询授权角色 */
export function getAuthRole(userId: string | number) {
  return request({
    url: '/system/user/authRole/' + userId,
    method: 'get'
  })
}

/** 用户授权角色 */
export function updateAuthRole(data: { userId: string | number; roleIds: string }) {
  return request({
    url: '/system/user/authRole',
    method: 'put',
    params: data
  })
}

/** 查询部门下拉树结构 */
export function deptTreeSelect() {
  return request({
    url: '/system/user/deptTree',
    method: 'get'
  })
}
