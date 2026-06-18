import request from '@/utils/request'

/** 查询菜单列表 */
export function listMenu(query: Record<string, any>) {
  return request({ url: '/system/menu/list', method: 'get', params: query })
}

/** 查询菜单详细 */
export function getMenu(menuId: string | number) {
  return request({ url: '/system/menu/' + menuId, method: 'get' })
}

/** 查询菜单下拉树结构 */
export function treeselect() {
  return request({ url: '/system/menu/treeselect', method: 'get' })
}

/** 查询菜单下拉树结构（角色用） */
export function roleMenuTreeselect(roleId: string | number) {
  return request({ url: '/system/menu/roleMenuTreeselect/' + roleId, method: 'get' })
}

/** 新增菜单 */
export function addMenu(data: Record<string, any>) {
  return request({ url: '/system/menu', method: 'post', data })
}

/** 修改菜单 */
export function updateMenu(data: Record<string, any>) {
  return request({ url: '/system/menu', method: 'put', data })
}

/** 删除菜单 */
export function delMenu(menuId: string | number) {
  return request({ url: '/system/menu/' + menuId, method: 'delete' })
}
