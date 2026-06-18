/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 页面标题 */
  readonly VITE_APP_TITLE: string
  /** 开发/生产环境标识 */
  readonly VITE_APP_ENV: string
  /** API 基础路径 */
  readonly VITE_APP_BASE_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
