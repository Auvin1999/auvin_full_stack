import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme as antdTheme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import enUS from 'antd/locale/en_US'
import { useSettingsStore } from '@/store/useSettingsStore'
import AppRouter from '@/router'

function App() {
  const language = useSettingsStore((s) => s.language)
  const isDark = useSettingsStore((s) => s.isDark)
  const locale = language === 'en-US' ? enUS : zhCN

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: isDark ? {} : { colorPrimary: '#409EFF' },
      }}
    >
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
