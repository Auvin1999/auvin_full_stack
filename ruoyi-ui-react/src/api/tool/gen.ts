import request from '@/utils/request'

/** 查询表集合 */
export function listTable(query: Record<string, any>) {
  return request({ url: '/gen/list', method: 'get', params: query })
}

/** 查询数据库表 */
export function listDbTable(query: Record<string, any>) {
  return request({ url: '/gen/db/list', method: 'get', params: query })
}

/** 查询表详细信息 */
export function getGenTable(tableId: string | number) {
  return request({ url: '/gen/' + tableId, method: 'get' })
}

/** 修改代码生成业务 */
export function updateGenTable(data: Record<string, any>) {
  return request({ url: '/gen', method: 'put', data })
}

/** 导入表 */
export function importTable(data: Record<string, any>) {
  return request({ url: '/gen/importTable', method: 'post', params: data })
}

/** 预览代码 */
export function previewTable(tableId: string | number) {
  return request({ url: '/gen/preview/' + tableId, method: 'get' })
}

/** 删除表数据 */
export function delTable(tableId: string | number) {
  return request({ url: '/gen/' + tableId, method: 'delete' })
}

/** 生成代码（自定义路径） */
export function genCode(tableName: string) {
  return request({ url: '/gen/genCode/' + tableName, method: 'get' })
}

/** 同步数据库 */
export function synchDb(tableName: string) {
  return request({ url: '/gen/synchDb/' + tableName, method: 'get' })
}
