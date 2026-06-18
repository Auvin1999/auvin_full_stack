import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, Radio, Modal, Space, Card, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { listNotice, getNotice, addNotice, updateNotice, delNotice } from '@/api/system/notice'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import DictTag from '@/components/DictTag'
import { useDict } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'

export default function NoticeIndex() {
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
  const handleAdd = () => { form.resetFields(); setTitle('添加公告'); setOpen(true) }
  const handleUpdate = async (row: any) => {
    form.resetFields(); const res: any = await getNotice(row.noticeId); form.setFieldsValue(res.data || res); setTitle('修改公告'); setOpen(true)
  }
  const handleDelete = async (row?: any) => {
    const ids = row ? [row.noticeId] : selectedRowKeys
    if (!ids.length) { message.warning('请选择要删除的数据'); return }
    await delNotice(ids.join(',')); message.success('删除成功'); getList()
  }
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); setSubmitting(true)
      values.noticeId ? await updateNotice(values) : await addNotice(values)
      message.success(values.noticeId ? '修改成功' : '新增成功'); setOpen(false); getList()
    } finally { setSubmitting(false) }
  }

  const columns = [
    { title: '序号', dataIndex: 'noticeId', width: 80 },
    { title: '公告标题', dataIndex: 'noticeTitle', width: 250, ellipsis: true },
    { title: '公告类型', dataIndex: 'noticeType', width: 120, render: (v: string) => <DictTag options={dict.sys_notice_type || []} value={v} /> },
    { title: '状态', dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_notice_status || []} value={v} /> },
    { title: '创建者', dataIndex: 'createBy', width: 120 },
    { title: '创建时间', dataIndex: 'createTime', width: 170, render: (v: string) => parseTime(v) },
    {
      title: '操作', width: 180, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <HasPermi permissions={['system:notice:edit']}><Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>修改</Button></HasPermi>
          <HasPermi permissions={['system:notice:remove']}><Popconfirm title="确认删除？" onConfirm={() => handleDelete(record)}><Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm></HasPermi>
        </Space>
      )
    }
  ]

  return (
    <div className="app-container">
      {showSearch && (
        <Card style={{ marginBottom: 16 }}>
          <Form form={queryForm} layout="inline" onFinish={handleQuery}>
            <Form.Item name="noticeTitle" label="公告标题"><Input placeholder="请输入公告标题" allowClear /></Form.Item>
            <Form.Item name="createBy" label="创建者"><Input placeholder="请输入创建者" allowClear /></Form.Item>
            <Form.Item name="noticeType" label="类型">
              <Select placeholder="公告类型" allowClear style={{ width: 120 }}>{(dict.sys_notice_type || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">搜索</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>重置</Button></Space></Form.Item>
          </Form>
        </Card>
      )}
      <Card>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <Space>
            <HasPermi permissions={['system:notice:add']}><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button></HasPermi>
            <HasPermi permissions={['system:notice:remove']}><Popconfirm title="确认删除？" onConfirm={() => handleDelete()} disabled={!selectedRowKeys.length}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length}>删除</Button></Popconfirm></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} />
        </div>
        <Table rowKey="noticeId" columns={columns} dataSource={list} loading={loading} pagination={false} scroll={{ x: 900 }} rowSelection={{ selectedRowKeys, onChange: (k) => setSelectedRowKeys(k as number[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
      <Modal title={title} open={open} onOk={handleSubmit} onCancel={() => setOpen(false)} confirmLoading={submitting} width={600} destroyOnClose>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="noticeId" hidden><Input /></Form.Item>
          <Form.Item name="noticeTitle" label="公告标题" rules={[{ required: true, message: '请输入公告标题' }]}><Input placeholder="请输入公告标题" /></Form.Item>
          <Form.Item name="noticeType" label="公告类型" rules={[{ required: true, message: '请选择公告类型' }]}>
            <Select placeholder="请选择">{(dict.sys_notice_type || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="0"><Radio.Group>{(dict.sys_notice_status || []).map((i: any) => <Radio key={i.value} value={i.value}>{i.label}</Radio>)}</Radio.Group></Form.Item>
          <Form.Item name="noticeContent" label="内容"><Input.TextArea rows={8} placeholder="请输入内容" /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
