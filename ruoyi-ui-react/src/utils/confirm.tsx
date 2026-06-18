import { Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import i18n from '@/i18n'

interface ConfirmOptions {
  title?: string
  content?: string
  onOk: () => void | Promise<void>
  onCancel?: () => void
}

/**
 * 统一的删除确认弹窗（居中 Modal，带警告图标）
 */
export function confirmDelete(options: ConfirmOptions) {
  Modal.confirm({
    title: options.title || i18n.t('request.systemPrompt'),
    content: options.content || i18n.t('confirmDelete'),
    icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
    centered: true,
    okText: i18n.t('confirm'),
    cancelText: i18n.t('cancel'),
    okButtonProps: { danger: true },
    onOk: options.onOk,
    onCancel: options.onCancel,
  })
}

/**
 * 通用操作确认弹窗
 */
export function confirmAction(options: ConfirmOptions) {
  Modal.confirm({
    title: options.title || i18n.t('request.systemPrompt'),
    content: options.content,
    icon: <ExclamationCircleOutlined style={{ color: '#1890ff' }} />,
    centered: true,
    okText: i18n.t('confirm'),
    cancelText: i18n.t('cancel'),
    onOk: options.onOk,
    onCancel: options.onCancel,
  })
}
