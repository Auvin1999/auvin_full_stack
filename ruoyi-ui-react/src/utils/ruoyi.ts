/** 通用js方法封装处理 */

interface FormatObj {
  y: number
  m: number
  d: number
  h: number
  i: number
  s: number
  a: number
}

/**
 * 日期格式化
 */
export function parseTime(time?: Date | string | number | null, pattern?: string): string | null {
  if (!time) {
    return null
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
  let date: Date

  if (typeof time === 'object') {
    date = time
  } else {
    let timeVal: string | number = time
    if (typeof timeVal === 'string' && /^[0-9]+$/.test(timeVal)) {
      timeVal = parseInt(timeVal)
    } else if (typeof timeVal === 'string') {
      timeVal = timeVal.replace(/-/gm, '/').replace('T', ' ').replace(/\.[\d]{3}/gm, '')
    }
    if (typeof timeVal === 'number' && timeVal.toString().length === 10) {
      timeVal = timeVal * 1000
    }
    date = new Date(timeVal)
  }

  const formatObj: FormatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }

  const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key: string) => {
    let value: number | string = formatObj[key as keyof FormatObj]
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value as number]
    }
    if (result.length > 0 && (value as number) < 10) {
      value = '0' + value
    }
    return String(value || 0)
  })
  return timeStr
}

/**
 * 添加日期范围
 */
export function addDateRange(
  params: Record<string, any>,
  dateRange?: string[],
  propName?: string
): Record<string, any> {
  const search = { ...params }
  search.params = typeof search.params === 'object' && search.params !== null && !Array.isArray(search.params)
    ? { ...search.params }
    : {}
  const range = Array.isArray(dateRange) ? dateRange : []
  if (typeof propName === 'undefined') {
    search.params['beginTime'] = range[0]
    search.params['endTime'] = range[1]
  } else {
    search.params['begin' + propName] = range[0]
    search.params['end' + propName] = range[1]
  }
  return search
}

/**
 * 回显数据字典
 */
export function selectDictLabel(
  datas: Array<{ value: string; label: string }>,
  value: string | number | undefined
): string {
  if (value === undefined) {
    return ''
  }
  const actions: string[] = []
  Object.keys(datas).some((key) => {
    if (datas[Number(key)].value === '' + value) {
      actions.push(datas[Number(key)].label)
      return true
    }
  })
  if (actions.length === 0) {
    actions.push(String(value))
  }
  return actions.join('')
}

/**
 * 回显数据字典（字符串、数组）
 */
export function selectDictLabels(
  datas: Array<{ value: string; label: string }>,
  value?: string | string[],
  separator?: string
): string {
  if (value === undefined || (typeof value === 'string' && value.length === 0)) {
    return ''
  }
  const currentSeparator = separator === undefined ? ',' : separator
  const strValue = Array.isArray(value) ? value.join(',') : value
  const actions: string[] = []
  const temp = strValue.split(currentSeparator)
  temp.forEach((val) => {
    let match = false
    Object.keys(datas).some((key) => {
      if (datas[Number(key)].value === '' + val) {
        actions.push(datas[Number(key)].label + currentSeparator)
        match = true
      }
    })
    if (!match) {
      actions.push(val + currentSeparator)
    }
  })
  return actions.join('').substring(0, actions.join('').length - 1)
}

/**
 * 转换字符串，undefined/null等转化为""
 */
export function parseStrEmpty(str?: string | null): string {
  if (!str || str === 'undefined' || str === 'null') {
    return ''
  }
  return str
}

/**
 * 数据合并
 */
export function mergeRecursive(source: Record<string, any>, target: Record<string, any>): Record<string, any> {
  for (const p in target) {
    try {
      if (target[p].constructor === Object) {
        source[p] = mergeRecursive(source[p], target[p])
      } else {
        source[p] = target[p]
      }
    } catch {
      source[p] = target[p]
    }
  }
  return source
}

/**
 * 构造树型结构数据
 */
export function handleTree(
  data: any[],
  id?: string,
  parentId?: string,
  children?: string
): any[] {
  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  }

  const childrenListMap: Record<string, any> = {}
  const tree: any[] = []

  for (const d of data) {
    const idVal = d[config.id]
    childrenListMap[idVal] = d
    if (!d[config.childrenList]) {
      d[config.childrenList] = []
    }
  }

  for (const d of data) {
    const parentIdVal = d[config.parentId]
    const parentObj = childrenListMap[parentIdVal]
    if (!parentObj) {
      tree.push(d)
    } else {
      parentObj[config.childrenList].push(d)
    }
  }
  return tree
}

/**
 * 参数处理
 */
export function tansParams(params: Record<string, any>): string {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    const part = encodeURIComponent(propName) + '='
    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
            const paramsKey = propName + '[' + key + ']'
            const subPart = encodeURIComponent(paramsKey) + '='
            result += subPart + encodeURIComponent(value[key]) + '&'
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&'
      }
    }
  }
  return result
}

/**
 * 返回项目路径
 */
export function getNormalPath(p: string): string {
  if (p.length === 0 || !p || p === 'undefined') {
    return p
  }
  let res = p.replace('//', '/')
  if (res[res.length - 1] === '/') {
    return res.slice(0, res.length - 1)
  }
  return res
}

/**
 * 验证是否为blob格式
 */
export function blobValidate(data: { type?: string }): boolean {
  return data.type !== 'application/json'
}
