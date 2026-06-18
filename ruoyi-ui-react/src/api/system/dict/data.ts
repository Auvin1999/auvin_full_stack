import request from '@/utils/request'

/** 查询字典数据详细 */
export function getDicts(dictType: string) {
  return request({
    url: '/system/dict/data/type/' + dictType,
    method: 'get'
  })
}
