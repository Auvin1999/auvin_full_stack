import { create } from 'zustand'

interface DictItem {
  label: string
  value: string
  elTagType?: string
  elTagClass?: string
}

interface DictState {
  dict: Record<string, DictItem[]>
  getDict: (dictType: string) => DictItem[] | undefined
  setDict: (dictType: string, data: DictItem[]) => void
  removeDict: (dictType: string) => void
  cleanDict: () => void
}

export const useDictStore = create<DictState>((set, get) => ({
  dict: {},

  getDict(dictType: string) {
    return get().dict[dictType]
  },

  setDict(dictType: string, data: DictItem[]) {
    set((state) => ({
      dict: { ...state.dict, [dictType]: data }
    }))
  },

  removeDict(dictType: string) {
    set((state) => {
      const newDict = { ...state.dict }
      delete newDict[dictType]
      return { dict: newDict }
    })
  },

  cleanDict() {
    set({ dict: {} })
  }
}))
