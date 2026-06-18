import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, Radio, InputNumber, Modal, Space, Card, message, Row, Col } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { confirmDelete } from '@/utils/confirm'
import { listPost, getPost, addPost, updatePost, delPost } from '@/api/system/post'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import DictTag from '@/components/DictTag'
import { useDict } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'

export default function PostIndex() {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()
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
    try { const res: any = await listPost(queryParams); setList(res.rows || []); setTotal(res.total || 0) } finally { setLoading(false) }
  }, [queryParams])

  useEffect(() => { getList() }, [getList])

  const handleQuery = () => { setQueryParams((p: any) => ({ ...p, ...queryForm.getFieldsValue(), pageNum: 1 })) }
  const resetQuery = () => { queryForm.resetFields(); setQueryParams({ pageNum: 1, pageSize: 10 }) }
  const handlePagination = (page: number, pageSize: number) => { setQueryParams((p: any) => ({ ...p, pageNum: page, pageSize })) }
  const handleAdd = () => { form.resetFields(); setTitle(t('postMgmt.addPost')); setOpen(true) }
  const handleUpdate = async (row: any) => {
    form.resetFields(); const res: any = await getPost(row.postId); form.setFieldsValue(res.data || res); setTitle(t('postMgmt.editPost')); setOpen(true)
  }
  const handleDelete = async (row?: any) => {
    const ids = row ? [row.postId] : selectedRowKeys
    if (!ids.length) { message.warning(t('pleaseSelectData')); return }
    await delPost(ids.join(',')); message.success(t('deleteSuccess')); getList()
  }
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); setSubmitting(true)
      values.postId ? await updatePost(values) : await addPost(values)
      message.success(values.postId ? t('editSuccess') : t('addSuccess')); setOpen(false); getList()
    } finally { setSubmitting(false) }
  }

  const columns = [
    { title: t('postMgmt.postId'), dataIndex: 'postId', width: 80 },
    { title: t('postMgmt.postCode'), dataIndex: 'postCode', width: 150 },
    { title: t('postMgmt.postName'), dataIndex: 'postName', width: 150 },
    { title: t('postMgmt.postSort'), dataIndex: 'postSort', width: 100 },
    { title: t('status'), dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_normal_disable || []} value={v} /> },
    { title: t('createTime'), dataIndex: 'createTime', width: 170, render: (v: string) => parseTime(v) },
    {
      title: t('operation'), width: 180, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <HasPermi permissions={['system:post:edit']}><Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>{t('edit')}</Button></HasPermi>
          <HasPermi permissions={['system:post:remove']}><Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete({ onOk: () => handleDelete(record) })}>{t('delete')}</Button></HasPermi>
        </Space>
      )
    }
  ]

  return (
    <div className="app-container">
      <Card style={{ marginBottom: showSearch ? 16 : 0 }}>
        <div style={{ height: showSearch ? 'auto' : 0, overflow: 'hidden' }}>
          <Form form={queryForm} onFinish={handleQuery}>
            <Row gutter={16}>
              <Col span={8}><Form.Item name="postCode" label={t('postMgmt.postCode')}><Input placeholder={t('postMgmt.postCode')} allowClear /></Form.Item></Col>
              <Col span={8}><Form.Item name="postName" label={t('postMgmt.postName')}><Input placeholder={t('postMgmt.postName')} allowClear /></Form.Item></Col>
              <Col span={8}><Form.Item name="status" label={t('status')}>
                <Select placeholder={t('status')} allowClear style={{ width: '100%' }}>
                  {(dict.sys_normal_disable || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}
                </Select>
              </Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}><Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">{t('search')}</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>{t('reset')}</Button></Space></Form.Item></Col>
            </Row>
          </Form>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
          <Space>
            <HasPermi permissions={['system:post:add']}><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>{t('add')}</Button></HasPermi>
            <HasPermi permissions={['system:post:remove']}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length} onClick={() => { if (selectedRowKeys.length) confirmDelete({ onOk: () => handleDelete() }) }}>{t('delete')}</Button></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} exportUrl="/system/post/export" exportParams={queryParams} exportFilename="岗位数据.xlsx" />
        </div>
      </Card>
      <Card>
        <Table rowKey="postId" columns={columns} dataSource={list} loading={loading} pagination={false} scroll={{ x: 900 }} rowSelection={{ selectedRowKeys, onChange: (k) => setSelectedRowKeys(k as number[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
      <Modal title={title} open={open} onOk={handleSubmit} onCancel={() => setOpen(false)} confirmLoading={submitting} width={500} destroyOnHidden>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="postId" hidden><Input /></Form.Item>
          <Form.Item name="postName" label={t('postMgmt.postName')} rules={[{ required: true, message: t('postMgmt.postName') }]}><Input placeholder={t('postMgmt.postName')} /></Form.Item>
          <Form.Item name="postCode" label={t('postMgmt.postCode')} rules={[{ required: true, message: t('postMgmt.postCode') }]}><Input placeholder={t('postMgmt.postCode')} /></Form.Item>
          <Form.Item name="postSort" label={t('postMgmt.postSort')} rules={[{ required: true, message: t('postMgmt.postSort') }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="status" label={t('status')} initialValue="0">
            <Radio.Group>{(dict.sys_normal_disable || []).map((i: any) => <Radio key={i.value} value={i.value}>{i.label}</Radio>)}</Radio.Group>
          </Form.Item>
          <Form.Item name="remark" label={t('remark')}><Input.TextArea rows={3} placeholder={t('remark')} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
