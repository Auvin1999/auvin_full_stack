import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, Radio, Modal, Space, Card, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { listNotice, getNotice, addNotice, updateNotice, delNotice } from '@/api/system/notice'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import DictTag from '@/components/DictTag'
import { useDict } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { useTranslation } from 'react-i18next'
import { confirmDelete } from '@/utils/confirm'

export default function NoticeIndex() {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()
  const dict = useDict('sys_notice_type', 'sys_notice_status')
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
    try { const res: any = await listNotice(queryParams); setList(res.rows || []); setTotal(res.total || 0) } finally { setLoading(false) }
  }, [queryParams])

  useEffect(() => { getList() }, [getList])

  const handleQuery = () => { setQueryParams((p: any) => ({ ...p, ...queryForm.getFieldsValue(), pageNum: 1 })) }
  const resetQuery = () => { queryForm.resetFields(); setQueryParams({ pageNum: 1, pageSize: 10 }) }
  const handlePagination = (page: number, pageSize: number) => { setQueryParams((p: any) => ({ ...p, pageNum: page, pageSize })) }
  const handleAdd = () => { form.resetFields(); setTitle(t('noticeMgmt.addNotice')); setOpen(true) }
  const handleUpdate = async (row: any) => {
    form.resetFields(); const res: any = await getNotice(row.noticeId); form.setFieldsValue(res.data || res); setTitle(t('noticeMgmt.editNotice')); setOpen(true)
  }
  const handleDelete = async (row?: any) => {
    const ids = row ? [row.noticeId] : selectedRowKeys
    if (!ids.length) { message.warning(t('pleaseSelectData')); return }
    await delNotice(ids.join(',')); message.success(t('deleteSuccess')); getList()
  }
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); setSubmitting(true)
      values.noticeId ? await updateNotice(values) : await addNotice(values)
      message.success(values.noticeId ? t('editSuccess') : t('addSuccess')); setOpen(false); getList()
    } finally { setSubmitting(false) }
  }

  const columns = [
    { title: t('noticeMgmt.noticeId'), dataIndex: 'noticeId', width: 80 },
    { title: t('noticeMgmt.noticeTitle'), dataIndex: 'noticeTitle', width: 250, ellipsis: true },
    { title: t('noticeMgmt.noticeType'), dataIndex: 'noticeType', width: 120, render: (v: string) => <DictTag options={dict.sys_notice_type || []} value={v} /> },
    { title: t('status'), dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_notice_status || []} value={v} /> },
    { title: t('createBy'), dataIndex: 'createBy', width: 120 },
    { title: t('createTime'), dataIndex: 'createTime', width: 170, render: (v: string) => parseTime(v) },
    {
      title: t('operation'), width: 180, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <HasPermi permissions={['system:notice:edit']}><Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>{t('edit')}</Button></HasPermi>
          <HasPermi permissions={['system:notice:remove']}><Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete({ onOk: () => handleDelete(record) })}>{t('delete')}</Button></HasPermi>
        </Space>
      )
    }
  ]

  return (
    <div className="app-container">
      {showSearch && (
        <Card style={{ marginBottom: 16 }}>
          <Form form={queryForm} layout="inline" onFinish={handleQuery}>
            <Form.Item name="noticeTitle" label={t('noticeMgmt.noticeTitle')}><Input placeholder={t('noticeMgmt.noticeTitle')} allowClear /></Form.Item>
            <Form.Item name="createBy" label={t('createBy')}><Input placeholder={t('createBy')} allowClear /></Form.Item>
            <Form.Item name="noticeType" label={t('noticeMgmt.noticeType')}>
              <Select placeholder={t('noticeMgmt.noticeType')} allowClear style={{ width: 120 }}>{(dict.sys_notice_type || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">{t('search')}</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>{t('reset')}</Button></Space></Form.Item>
          </Form>
        </Card>
      )}
      <Card>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <Space>
            <HasPermi permissions={['system:notice:add']}><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>{t('add')}</Button></HasPermi>
            <HasPermi permissions={['system:notice:remove']}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length} onClick={() => { if (selectedRowKeys.length) confirmDelete({ onOk: () => handleDelete() }) }}>{t('delete')}</Button></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} exportUrl="/system/notice/export" exportParams={queryParams} exportFilename="公告数据.xlsx" />
        </div>
        <Table rowKey="noticeId" columns={columns} dataSource={list} loading={loading} pagination={false} scroll={{ x: 900 }} rowSelection={{ selectedRowKeys, onChange: (k) => setSelectedRowKeys(k as number[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
      <Modal title={title} open={open} onOk={handleSubmit} onCancel={() => setOpen(false)} confirmLoading={submitting} width={600} destroyOnClose>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="noticeId" hidden><Input /></Form.Item>
          <Form.Item name="noticeTitle" label={t('noticeMgmt.noticeTitle')} rules={[{ required: true, message: t('noticeMgmt.noticeTitle') }]}><Input placeholder={t('noticeMgmt.noticeTitle')} /></Form.Item>
          <Form.Item name="noticeType" label={t('noticeMgmt.noticeType')} rules={[{ required: true, message: t('noticeMgmt.noticeType') }]}>
            <Select placeholder={t('pleaseSelect')}>{(dict.sys_notice_type || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="status" label={t('status')} initialValue="0"><Radio.Group>{(dict.sys_notice_status || []).map((i: any) => <Radio key={i.value} value={i.value}>{i.label}</Radio>)}</Radio.Group></Form.Item>
          <Form.Item name="noticeContent" label={t('noticeMgmt.noticeContent')}><Input.TextArea rows={8} placeholder={t('noticeMgmt.noticeContent')} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
