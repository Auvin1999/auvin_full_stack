import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

// 从 localStorage 读取语言设置
function getStoredLang(): string {
  try {
    const stored = localStorage.getItem('layout-setting')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.language || 'zh-CN'
    }
  } catch { /* ignore */ }
  return 'zh-CN'
}

i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': { translation: zhCN },
    'en-US': { translation: enUS },
  },
  lng: getStoredLang(),
  fallbackLng: 'zh-CN',
  interpolation: { escapeValue: false },
})

export default i18n
