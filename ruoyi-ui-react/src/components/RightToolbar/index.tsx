import { Button, Tooltip, Space } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'

interface RightToolbarProps {
  showSearch: boolean
  onToggleSearch: () => void
  onRefresh: () => void
}

export default function RightToolbar({ showSearch, onToggleSearch, onRefresh }: RightToolbarProps) {
  return (
    <Space style={{ marginLeft: 'auto' }}>
      <Tooltip title={showSearch ? '隐藏搜索' : '显示搜索'}>
        <Button icon={<SearchOutlined />} onClick={onToggleSearch} />
      </Tooltip>
      <Tooltip title="刷新">
        <Button icon={<ReloadOutlined />} onClick={onRefresh} />
      </Tooltip>
    </Space>
  )
}
