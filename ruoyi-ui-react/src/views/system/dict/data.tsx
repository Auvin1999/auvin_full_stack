import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Table, Button, Form, Input, Select, Radio, Modal, Space, Card, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { listType, getType } from '@/api/system/dict/type'
import { getDicts } from '@/api/system/dict/data'
import request from '@/utils/request'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import DictTag from '@/components/DictTag'
import { useDict } from '@/utils/dict'
import { useTranslation } from 'react-i18next'

export default function DictDataIndex() {
  const { t } = useTranslation()
  const { dictId } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const dict = useDict('sys_normal_disable')
  const [dictType, setDictType] = useState('')
  const [dataList, setDataList] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [queryParams, setQueryParams] = useState<any>({ pageNum: 1, pageSize: 10 })
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 获取字典类型信息
  useEffect(() => {
    if (dictId) {
      getType(dictId).then((res: any) => {
        const data = res.data || res
        setDictType(data.dictType)
      })
    }
  }, [dictId])

  const getList = useCallback(async () => {
    if (!dictType) return
    setLoading(true)
    try {
      const res: any = await request({ url: '/system/dict/data/list', method: 'get', params: { ...queryParams, dictType } })
      setDataList(res.rows || []); setTotal(res.total || 0)
    } finally { setLoading(false) }
  }, [dictType, queryParams])

  useEffect(() => { getList() }, [getList])

  const handlePagination = (page: number, pageSize: number) => { setQueryParams((p: any) => ({ ...p, pageNum: page, pageSize })) }
  const handleAdd = () => { form.resetFields(); form.setFieldsValue({ dictType }); setTitle(t('dictMgmt.addData')); setOpen(true) }
  const handleUpdate = async (row: any) => {
    form.resetFields()
    const res: any = await request({ url: '/system/dict/data/' + row.dictCode, method: 'get' })
    form.setFieldsValue(res.data || res); setTitle(t('dictMgmt.editData')); setOpen(true)
  }
  const handleDelete = async (row?: any) => {
    const ids = row ? [row.dictCode] : selectedRowKeys
    if (!ids.length) { message.warning(t('pleaseSelectData')); return }
    await request({ url: '/system/dict/data/' + ids.join(','), method: 'delete' })
    message.success(t('deleteSuccess')); getList()
  }
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); setSubmitting(true)
      if (values.dictCode) {
        await request({ url: '/system/dict/data', method: 'put', data: values })
      } else {
        await request({ url: '/system/dict/data', method: 'post', data: values })
      }
      message.success(values.dictCode ? t('editSuccess') : t('addSuccess')); setOpen(false); getList()
    } finally { setSubmitting(false) }
  }

  const columns = [
    { title: t('dictMgmt.dictCode'), dataIndex: 'dictCode', width: 100 },
    { title: t('dictMgmt.dictLabel'), dataIndex: 'dictLabel', width: 150 },
    { title: t('dictMgmt.dictValue'), dataIndex: 'dictValue', width: 120 },
    { title: t('dictMgmt.dictSort'), dataIndex: 'dictSort', width: 100 },
    { title: t('status'), dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_normal_disable || []} value={v} /> },
    { title: t('remark'), dataIndex: 'remark', width: 150, ellipsis: true },
    {
      title: t('operation'), width: 180, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <HasPermi permissions={['system:dict:edit']}><Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>{t('edit')}</Button></HasPermi>
          <HasPermi permissions={['system:dict:remove']}><Popconfirm title={t('confirmDelete')} onConfirm={() => handleDelete(record)}><Button type="link" size="small" danger icon={<DeleteOutlined />}>{t('delete')}</Button></Popconfirm></HasPermi>
        </Space>
      )
    }
  ]

  return (
    <div className="app-container">
      <Card>
        <div style={{ display: 'flex', marginBottom: 16, alignItems: 'center', gap: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/system/dict')}>{t('back')}</Button>
          <span style={{ fontWeight: 600 }}>{t('dictMgmt.dictType')}：{dictType}</span>
          <Space style={{ marginLeft: 'auto' }}>
            <HasPermi permissions={['system:dict:add']}><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>{t('add')}</Button></HasPermi>
            <HasPermi permissions={['system:dict:remove']}><Popconfirm title={t('confirmDelete')} onConfirm={() => handleDelete()} disabled={!selectedRowKeys.length}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length}>{t('delete')}</Button></Popconfirm></HasPermi>
          </Space>
        </div>
        <Table rowKey="dictCode" columns={columns} dataSource={dataList} loading={loading} pagination={false} scroll={{ x: 800 }} rowSelection={{ selectedRowKeys, onChange: (k) => setSelectedRowKeys(k as number[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
      <Modal title={title} open={open} onOk={handleSubmit} onCancel={() => setOpen(false)} confirmLoading={submitting} width={500} destroyOnClose>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="dictCode" hidden><Input /></Form.Item>
          <Form.Item name="dictType" hidden><Input /></Form.Item>
          <Form.Item name="dictLabel" label={t('dictMgmt.dictLabel')} rules={[{ required: true, message: t('dictMgmt.dictLabel') }]}><Input placeholder={t('dictMgmt.dictLabel')} /></Form.Item>
          <Form.Item name="dictValue" label={t('dictMgmt.dictValue')} rules={[{ required: true, message: t('dictMgmt.dictValue') }]}><Input placeholder={t('dictMgmt.dictValue')} /></Form.Item>
          <Form.Item name="dictSort" label={t('dictMgmt.dictSort')} rules={[{ required: true, message: t('dictMgmt.dictSort') }]}><Input type="number" placeholder={t('dictMgmt.dictSort')} /></Form.Item>
          <Form.Item name="status" label={t('status')} initialValue="0"><Radio.Group>{(dict.sys_normal_disable || []).map((i: any) => <Radio key={i.value} value={i.value}>{i.label}</Radio>)}</Radio.Group></Form.Item>
          <Form.Item name="remark" label={t('remark')}><Input.TextArea rows={3} placeholder={t('remark')} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
