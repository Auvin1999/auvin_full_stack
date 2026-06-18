import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, Radio, Modal, Space, Card, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { listType, getType, addType, updateType, delType, refreshCache as refreshCacheApi } from '@/api/system/dict/type'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import DictTag from '@/components/DictTag'
import { useDict } from '@/utils/dict'
import { useDictStore } from '@/store/useDictStore'
import { parseTime } from '@/utils/ruoyi'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { confirmDelete } from '@/utils/confirm'

export default function DictTypeIndex() {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()
  const navigate = useNavigate()
  const dict = useDict('sys_normal_disable')
  const [list, setList] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [queryParams, setQueryParams] = useState<any>({ pageNum: 1, pageSize: 10 })
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const getList = useCallback(async () => {
    setLoading(true)
    try { const res: any = await listType(queryParams); setList(res.rows || []); setTotal(res.total || 0) } finally { setLoading(false) }
  }, [queryParams])

  useEffect(() => { getList() }, [getList])

  const handleQuery = () => { setQueryParams((p: any) => ({ ...p, ...queryForm.getFieldsValue(), pageNum: 1 })) }
  const resetQuery = () => { queryForm.resetFields(); setQueryParams({ pageNum: 1, pageSize: 10 }) }
  const handlePagination = (page: number, pageSize: number) => { setQueryParams((p: any) => ({ ...p, pageNum: page, pageSize })) }
  const handleAdd = () => { form.resetFields(); setTitle(t('dictMgmt.addType')); setOpen(true) }
  const handleUpdate = async (row: any) => {
    form.resetFields(); const res: any = await getType(row.dictId); form.setFieldsValue(res.data || res); setTitle(t('dictMgmt.editType')); setOpen(true)
  }
  const handleDelete = async (row?: any) => {
    const ids = row ? [row.dictId] : selectedRowKeys
    if (!ids.length) { message.warning(t('pleaseSelectData')); return }
    await delType(ids.join(',')); message.success(t('deleteSuccess')); getList()
  }
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); setSubmitting(true)
      values.dictId ? await updateType(values) : await addType(values)
      message.success(values.dictId ? t('editSuccess') : t('addSuccess')); setOpen(false); getList()
    } finally { setSubmitting(false) }
  }
  const handleRefreshCache = async () => {
    await refreshCacheApi(); useDictStore.getState().cleanDict(); message.success(t('refreshCache'))
  }

  const columns = [
    { title: t('dictMgmt.dictId'), dataIndex: 'dictId', width: 100 },
    { title: t('dictMgmt.dictName'), dataIndex: 'dictName', width: 200, ellipsis: true },
    {
      title: t('dictMgmt.dictType'), dataIndex: 'dictType', width: 200, ellipsis: true,
      render: (v: string, record: any) => <a onClick={() => navigate('/system/dict-data/index/' + record.dictId)}>{v}</a>
    },
    { title: t('status'), dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_normal_disable || []} value={v} /> },
    { title: t('remark'), dataIndex: 'remark', width: 150, ellipsis: true },
    { title: t('createTime'), dataIndex: 'createTime', width: 170, render: (v: string) => parseTime(v) },
    {
      title: t('operation'), width: 180, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <HasPermi permissions={['system:dict:edit']}><Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>{t('edit')}</Button></HasPermi>
          <HasPermi permissions={['system:dict:remove']}><Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete({ onOk: () => handleDelete(record) })}>{t('delete')}</Button></HasPermi>
        </Space>
      )
    }
  ]

  return (
    <div className="app-container">
      {showSearch && (
        <Card style={{ marginBottom: 16 }}>
          <Form form={queryForm} layout="inline" onFinish={handleQuery}>
            <Form.Item name="dictName" label={t('dictMgmt.dictName')}><Input placeholder={t('dictMgmt.dictName')} allowClear /></Form.Item>
            <Form.Item name="dictType" label={t('dictMgmt.dictType')}><Input placeholder={t('dictMgmt.dictType')} allowClear /></Form.Item>
            <Form.Item name="status" label={t('status')}>
              <Select placeholder={t('status')} allowClear style={{ width: 120 }}>{(dict.sys_normal_disable || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">{t('search')}</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>{t('reset')}</Button></Space></Form.Item>
          </Form>
        </Card>
      )}
      <Card>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <Space>
            <HasPermi permissions={['system:dict:add']}><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>{t('add')}</Button></HasPermi>
            <HasPermi permissions={['system:dict:remove']}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length} onClick={() => { if (selectedRowKeys.length) confirmDelete({ onOk: () => handleDelete() }) }}>{t('delete')}</Button></HasPermi>
            <HasPermi permissions={['system:dict:edit']}><Button type="default" onClick={handleRefreshCache}>{t('refreshCache')}</Button></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} exportUrl="/system/dict/type/export" exportParams={queryParams} exportFilename="字典数据.xlsx" />
        </div>
        <Table rowKey="dictId" columns={columns} dataSource={list} loading={loading} pagination={false} scroll={{ x: 1000 }} rowSelection={{ selectedRowKeys, onChange: (k) => setSelectedRowKeys(k as number[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
      <Modal title={title} open={open} onOk={handleSubmit} onCancel={() => setOpen(false)} confirmLoading={submitting} width={500} destroyOnClose>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="dictId" hidden><Input /></Form.Item>
          <Form.Item name="dictName" label={t('dictMgmt.dictName')} rules={[{ required: true, message: t('dictMgmt.dictName') }]}><Input placeholder={t('dictMgmt.dictName')} /></Form.Item>
          <Form.Item name="dictType" label={t('dictMgmt.dictType')} rules={[{ required: true, message: t('dictMgmt.dictType') }]}><Input placeholder={t('dictMgmt.dictType')} /></Form.Item>
          <Form.Item name="status" label={t('status')} initialValue="0"><Radio.Group>{(dict.sys_normal_disable || []).map((i: any) => <Radio key={i.value} value={i.value}>{i.label}</Radio>)}</Radio.Group></Form.Item>
          <Form.Item name="remark" label={t('remark')}><Input.TextArea rows={3} placeholder={t('remark')} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
