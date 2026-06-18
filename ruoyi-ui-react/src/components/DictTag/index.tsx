import { Tag } from 'antd'

interface DictTagProps {
  options: Array<{ label: string; value: string; elTagType?: string }>
  value: string | number
}

const tagColorMap: Record<string, string> = {
  '': 'default',
  'success': 'success',
  'warning': 'warning',
  'danger': 'error',
  'info': 'processing',
}

export default function DictTag({ options, value }: DictTagProps) {
  const matched = options.find((opt) => opt.value === '' + value)
  if (!matched) {
    return <span>{value}</span>
  }
  const color = tagColorMap[matched.elTagType || ''] || 'default'
  return <Tag color={color}>{matched.label}</Tag>
}
