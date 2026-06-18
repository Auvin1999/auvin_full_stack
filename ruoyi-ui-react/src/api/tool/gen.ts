import request from '@/utils/request'

/** 查询表集合 */
export function listTable(query: Record<string, any>) {
  return request({ url: '/code/gen/list', method: 'get', params: query })
}

/** 查询数据库表 */
export function listDbTable(query: Record<string, any>) {
  return request({ url: '/code/gen/db/list', method: 'get', params: query })
}

/** 查询表详细信息 */
export function getGenTable(tableId: string | number) {
  return request({ url: '/code/gen/' + tableId, method: 'get' })
}

/** 修改代码生成业务 */
export function updateGenTable(data: Record<string, any>) {
  return request({ url: '/code/gen', method: 'put', data })
}

/** 导入表 */
export function importTable(data: Record<string, any>) {
  return request({ url: '/code/gen/importTable', method: 'post', params: data })
}

/** 预览代码 */
export function previewTable(tableId: string | number) {
  return request({ url: '/code/gen/preview/' + tableId, method: 'get' })
}

/** 删除表数据 */
export function delTable(tableId: string | number) {
  return request({ url: '/code/gen/' + tableId, method: 'delete' })
}

/** 生成代码（自定义路径） */
export function genCode(tableName: string) {
  return request({ url: '/code/gen/genCode/' + tableName, method: 'get' })
}

/** 同步数据库 */
export function synchDb(tableName: string) {
  return request({ url: '/code/gen/synchDb/' + tableName, method: 'get' })
}
