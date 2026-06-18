import { Button, Tooltip, Space, message } from 'antd'
import { SearchOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { download } from '@/utils/request'

interface RightToolbarProps {
  showSearch: boolean
  onToggleSearch: () => void
  onRefresh: () => void
  /** 导出接口 URL，如 '/system/user/export' */
  exportUrl?: string
  /** 导出时携带的查询参数 */
  exportParams?: Record<string, any>
  /** 导出文件名 */
  exportFilename?: string
}

export default function RightToolbar({
  showSearch,
  onToggleSearch,
  onRefresh,
  exportUrl,
  exportParams,
  exportFilename = 'export.xlsx',
}: RightToolbarProps) {
  const { t } = useTranslation()

  const handleExport = () => {
    if (!exportUrl) return
    download(exportUrl, exportParams || {}, exportFilename)
  }

  return (
    <Space style={{ marginLeft: 'auto' }}>
      <Tooltip title={showSearch ? t('close') : t('search')}>
        <Button icon={<SearchOutlined />} onClick={onToggleSearch} />
      </Tooltip>
      <Tooltip title={t('refresh')}>
        <Button icon={<ReloadOutlined />} onClick={onRefresh} />
      </Tooltip>
      {exportUrl && (
        <Tooltip title={t('export')}>
          <Button icon={<DownloadOutlined />} onClick={handleExport} />
        </Tooltip>
      )}
    </Space>
  )
}
