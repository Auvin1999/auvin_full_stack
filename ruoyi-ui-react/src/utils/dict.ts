import { useState, useEffect } from 'react'
import { useDictStore } from '@/store/useDictStore'
import { getDicts } from '@/api/system/dict/data'

interface DictItem {
  label: string
  value: string
  elTagType?: string
  elTagClass?: string
}

/**
 * 获取字典数据（React hook 版本）
 * 用法：const { sys_normal_disable, sys_user_sex } = useDict('sys_normal_disable', 'sys_user_sex')
 */
export function useDict(...args: string[]): Record<string, DictItem[]> {
  const [result, setResult] = useState<Record<string, DictItem[]>>(() => {
    const init: Record<string, DictItem[]> = {}
    args.forEach((dictType) => {
      init[dictType] = []
    })
    return init
  })

  useEffect(() => {
    const dictStore = useDictStore.getState()
    const newState: Record<string, DictItem[]> = {}

    args.forEach((dictType) => {
      // 先从缓存取
      const cached = dictStore.getDict(dictType)
      if (cached) {
        newState[dictType] = cached
      } else {
        newState[dictType] = []
        // 异步加载
        getDicts(dictType).then((res: any) => {
          const data = res.data.map((p: any) => ({
            label: p.dictLabel,
            value: p.dictValue,
            elTagType: p.listClass,
            elTagClass: p.cssClass
          }))
          useDictStore.getState().setDict(dictType, data)
          setResult((prev) => ({ ...prev, [dictType]: data }))
        })
      }
    })

    // 如果全部命中缓存，直接设置
    if (Object.keys(newState).length === args.length) {
      setResult(newState)
    }
  }, args)

  return result
}
