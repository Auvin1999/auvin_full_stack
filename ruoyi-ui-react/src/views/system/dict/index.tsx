import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, Radio, Modal, Space, Card, message, Popconfirm } from 'antd'
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

export default function DictTypeIndex() {
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
  const handleAdd = () => { form.resetFields(); setTitle('添加字典类型'); setOpen(true) }
  const handleUpdate = async (row: any) => {
    form.resetFields(); const res: any = await getType(row.dictId); form.setFieldsValue(res.data || res); setTitle('修改字典类型'); setOpen(true)
  }
  const handleDelete = async (row?: any) => {
    const ids = row ? [row.dictId] : selectedRowKeys
    if (!ids.length) { message.warning('请选择要删除的数据'); return }
    await delType(ids.join(',')); message.success('删除成功'); getList()
  }
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); setSubmitting(true)
      values.dictId ? await updateType(values) : await addType(values)
      message.success(values.dictId ? '修改成功' : '新增成功'); setOpen(false); getList()
    } finally { setSubmitting(false) }
  }
  const handleRefreshCache = async () => {
    await refreshCacheApi(); useDictStore.getState().cleanDict(); message.success('刷新缓存成功')
  }

  const columns = [
    { title: '字典编号', dataIndex: 'dictId', width: 100 },
    { title: '字典名称', dataIndex: 'dictName', width: 200, ellipsis: true },
    {
      title: '字典类型', dataIndex: 'dictType', width: 200, ellipsis: true,
      render: (v: string, record: any) => <a onClick={() => navigate('/system/dict-data/index/' + record.dictId)}>{v}</a>
    },
    { title: '状态', dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_normal_disable || []} value={v} /> },
    { title: '备注', dataIndex: 'remark', width: 150, ellipsis: true },
    { title: '创建时间', dataIndex: 'createTime', width: 170, render: (v: string) => parseTime(v) },
    {
      title: '操作', width: 180, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <HasPermi permissions={['system:dict:edit']}><Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>修改</Button></HasPermi>
          <HasPermi permissions={['system:dict:remove']}><Popconfirm title="确认删除？" onConfirm={() => handleDelete(record)}><Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm></HasPermi>
        </Space>
      )
    }
  ]

  return (
    <div className="app-container">
      {showSearch && (
        <Card style={{ marginBottom: 16 }}>
          <Form form={queryForm} layout="inline" onFinish={handleQuery}>
            <Form.Item name="dictName" label="字典名称"><Input placeholder="请输入字典名称" allowClear /></Form.Item>
            <Form.Item name="dictType" label="字典类型"><Input placeholder="请输入字典类型" allowClear /></Form.Item>
            <Form.Item name="status" label="状态">
              <Select placeholder="字典状态" allowClear style={{ width: 120 }}>{(dict.sys_normal_disable || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">搜索</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>重置</Button></Space></Form.Item>
          </Form>
        </Card>
      )}
      <Card>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <Space>
            <HasPermi permissions={['system:dict:add']}><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button></HasPermi>
            <HasPermi permissions={['system:dict:remove']}><Popconfirm title="确认删除？" onConfirm={() => handleDelete()} disabled={!selectedRowKeys.length}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length}>删除</Button></Popconfirm></HasPermi>
            <HasPermi permissions={['system:dict:edit']}><Button type="default" onClick={handleRefreshCache}>刷新缓存</Button></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} />
        </div>
        <Table rowKey="dictId" columns={columns} dataSource={list} loading={loading} pagination={false} scroll={{ x: 1000 }} rowSelection={{ selectedRowKeys, onChange: (k) => setSelectedRowKeys(k as number[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
      <Modal title={title} open={open} onOk={handleSubmit} onCancel={() => setOpen(false)} confirmLoading={submitting} width={500} destroyOnClose>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="dictId" hidden><Input /></Form.Item>
          <Form.Item name="dictName" label="字典名称" rules={[{ required: true, message: '请输入字典名称' }]}><Input placeholder="请输入字典名称" /></Form.Item>
          <Form.Item name="dictType" label="字典类型" rules={[{ required: true, message: '请输入字典类型' }]}><Input placeholder="请输入字典类型" /></Form.Item>
          <Form.Item name="status" label="状态" initialValue="0"><Radio.Group>{(dict.sys_normal_disable || []).map((i: any) => <Radio key={i.value} value={i.value}>{i.label}</Radio>)}</Radio.Group></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={3} placeholder="请输入备注" /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
