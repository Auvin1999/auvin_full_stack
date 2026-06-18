import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, TreeSelect, Radio, InputNumber, Modal, Space, Card, message, Popconfirm, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { listMenu, getMenu, addMenu, updateMenu, delMenu } from '@/api/system/menu'
import { HasPermi } from '@/components/Permission'
import RightToolbar from '@/components/RightToolbar'
import { handleTree } from '@/utils/ruoyi'

export default function MenuIndex() {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showSearch, setShowSearch] = useState(true)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([])

  const getList = useCallback(async (query?: any) => {
    setLoading(true)
    try {
      const res: any = await listMenu(query || {})
      const data = handleTree(res.data || res.rows || [], 'menuId')
      setList(data)
      setExpandedRowKeys(data.map((d: any) => d.menuId))
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { getList() }, [getList])

  const handleQuery = () => { getList(queryForm.getFieldsValue()) }
  const resetQuery = () => { queryForm.resetFields(); getList() }
  const handleAdd = async (row?: any) => {
    form.resetFields()
    if (row) form.setFieldsValue({ parentId: row.menuId })
    setTitle(t('menuMgmt.addMenu')); setOpen(true)
  }
  const handleUpdate = async (row: any) => {
    form.resetFields(); const res: any = await getMenu(row.menuId); form.setFieldsValue(res.data || res); setTitle(t('menuMgmt.editMenu')); setOpen(true)
  }
  const handleDelete = async (row: any) => { await delMenu(row.menuId); message.success(t('deleteSuccess')); getList() }
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); setSubmitting(true)
      values.menuId ? await updateMenu(values) : await addMenu(values)
      message.success(values.menuId ? t('editSuccess') : t('addSuccess')); setOpen(false); getList()
    } finally { setSubmitting(false) }
  }

  const buildTreeData = (data: any[]): any[] => {
    return [{ title: t('menuMgmt.parentMenu'), value: 0, key: 0, children: data.map((item) => ({
      title: item.menuName, value: item.menuId, key: item.menuId,
      children: item.children ? buildTreeData(item.children) : []
    }))}]
  }

  const menuType = Form.useWatch('menuType', form)

  const columns = [
    { title: t('menuMgmt.menuName'), dataIndex: 'menuName', width: 200 },
    { title: t('menuMgmt.icon'), dataIndex: 'icon', width: 100 },
    { title: t('menuMgmt.sort'), dataIndex: 'orderNum', width: 80 },
    { title: t('menuMgmt.perms'), dataIndex: 'perms', width: 180, ellipsis: true },
    { title: t('menuMgmt.component'), dataIndex: 'component', width: 180, ellipsis: true },
    { title: t('status'), dataIndex: 'status', width: 80, render: (v: string) => v === '0' ? t('normal') : t('disabled') },
    { title: t('createTime'), dataIndex: 'createTime', width: 170 },
    {
      title: t('operation'), width: 250, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <HasPermi permissions={['system:menu:add']}><Button type="link" size="small" icon={<PlusOutlined />} onClick={() => handleAdd(record)}>{t('add')}</Button></HasPermi>
          <HasPermi permissions={['system:menu:edit']}><Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>{t('edit')}</Button></HasPermi>
          <HasPermi permissions={['system:menu:remove']}><Popconfirm title={t('confirmDelete')} onConfirm={() => handleDelete(record)}><Button type="link" size="small" danger icon={<DeleteOutlined />}>{t('delete')}</Button></Popconfirm></HasPermi>
        </Space>
      )
    }
  ]

  return (
    <div className="app-container">
      {showSearch && (
        <Card style={{ marginBottom: 16 }}>
          <Form form={queryForm} layout="inline" onFinish={handleQuery}>
            <Form.Item name="menuName" label={t('menuMgmt.menuName')}><Input placeholder={t('menuMgmt.menuName')} allowClear /></Form.Item>
            <Form.Item name="status" label={t('status')}><Select placeholder={t('status')} allowClear style={{ width: 120 }}><Select.Option value="0">正常</Select.Option><Select.Option value="1">停用</Select.Option></Select></Form.Item>
            <Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">{t('search')}</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>{t('reset')}</Button></Space></Form.Item>
          </Form>
        </Card>
      )}
      <Card>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <Space><HasPermi permissions={['system:menu:add']}><Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>{t('add')}</Button></HasPermi></Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} />
        </div>
        <Table rowKey="menuId" columns={columns} dataSource={list} loading={loading} pagination={false} scroll={{ x: 1100 }}
          expandable={{ expandedRowKeys, onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as React.Key[]) }} />
      </Card>
      <Modal title={title} open={open} onOk={handleSubmit} onCancel={() => setOpen(false)} confirmLoading={submitting} width={600} destroyOnClose>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="menuId" hidden><Input /></Form.Item>
          <Form.Item name="parentId" label={t('menuMgmt.parentMenu')}><TreeSelect placeholder={t('menuMgmt.parentMenu')} allowClear treeData={buildTreeData(list)} treeDefaultExpandAll /></Form.Item>
          <Form.Item name="menuType" label={t('menuMgmt.menuType')} initialValue="M"><Radio.Group><Radio value="M">{t('menuMgmt.directory')}</Radio><Radio value="C">{t('menuMgmt.menu')}</Radio><Radio value="F">{t('menuMgmt.button')}</Radio></Radio.Group></Form.Item>
          <Form.Item name="menuName" label={t('menuMgmt.menuName')} rules={[{ required: true, message: t('menuMgmt.menuName') }]}><Input placeholder={t('menuMgmt.menuName')} /></Form.Item>
          <Form.Item name="icon" label={t('menuMgmt.icon')}><Input placeholder={t('menuMgmt.icon')} /></Form.Item>
          <Form.Item name="orderNum" label={t('menuMgmt.sort')} initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          {menuType !== 'F' && <Form.Item name="path" label={t('menuMgmt.routePath')}><Input placeholder={t('menuMgmt.routePath')} /></Form.Item>}
          {menuType === 'C' && <Form.Item name="component" label={t('menuMgmt.component')}><Input placeholder={t('menuMgmt.component')} /></Form.Item>}
          {menuType !== 'M' && <Form.Item name="perms" label={t('menuMgmt.perms')}><Input placeholder={t('menuMgmt.perms')} /></Form.Item>}
          <Form.Item name="status" label={t('status')} initialValue="0"><Radio.Group><Radio value="0">{t('normal')}</Radio><Radio value="1">{t('disabled')}</Radio></Radio.Group></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
