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

export default function DictDataIndex() {
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
  const handleAdd = () => { form.resetFields(); form.setFieldsValue({ dictType }); setTitle('添加字典数据'); setOpen(true) }
  const handleUpdate = async (row: any) => {
    form.resetFields()
    const res: any = await request({ url: '/system/dict/data/' + row.dictCode, method: 'get' })
    form.setFieldsValue(res.data || res); setTitle('修改字典数据'); setOpen(true)
  }
  const handleDelete = async (row?: any) => {
    const ids = row ? [row.dictCode] : selectedRowKeys
    if (!ids.length) { message.warning('请选择要删除的数据'); return }
    await request({ url: '/system/dict/data/' + ids.join(','), method: 'delete' })
    message.success('删除成功'); getList()
  }
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); setSubmitting(true)
      if (values.dictCode) {
        await request({ url: '/system/dict/data', method: 'put', data: values })
      } else {
        await request({ url: '/system/dict/data', method: 'post', data: values })
      }
      message.success(values.dictCode ? '修改成功' : '新增成功'); setOpen(false); getList()
    } finally { setSubmitting(false) }
  }

  const columns = [
    { title: '字典编码', dataIndex: 'dictCode', width: 100 },
    { title: '字典标签', dataIndex: 'dictLabel', width: 150 },
    { title: '字典键值', dataIndex: 'dictValue', width: 120 },
    { title: '字典排序', dataIndex: 'dictSort', width: 100 },
    { title: '状态', dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_normal_disable || []} value={v} /> },
    { title: '备注', dataIndex: 'remark', width: 150, ellipsis: true },
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
      <Card>
        <div style={{ display: 'flex', marginBottom: 16, alignItems: 'center', gap: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/system/dict')}>返回</Button>
          <span style={{ fontWeight: 600 }}>字典类型：{dictType}</span>
          <Space style={{ marginLeft: 'auto' }}>
            <HasPermi permissions={['system:dict:add']}><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button></HasPermi>
            <HasPermi permissions={['system:dict:remove']}><Popconfirm title="确认删除？" onConfirm={() => handleDelete()} disabled={!selectedRowKeys.length}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length}>删除</Button></Popconfirm></HasPermi>
          </Space>
        </div>
        <Table rowKey="dictCode" columns={columns} dataSource={dataList} loading={loading} pagination={false} scroll={{ x: 800 }} rowSelection={{ selectedRowKeys, onChange: (k) => setSelectedRowKeys(k as number[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
      <Modal title={title} open={open} onOk={handleSubmit} onCancel={() => setOpen(false)} confirmLoading={submitting} width={500} destroyOnClose>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="dictCode" hidden><Input /></Form.Item>
          <Form.Item name="dictType" hidden><Input /></Form.Item>
          <Form.Item name="dictLabel" label="字典标签" rules={[{ required: true, message: '请输入字典标签' }]}><Input placeholder="请输入字典标签" /></Form.Item>
          <Form.Item name="dictValue" label="字典键值" rules={[{ required: true, message: '请输入字典键值' }]}><Input placeholder="请输入字典键值" /></Form.Item>
          <Form.Item name="dictSort" label="字典排序" rules={[{ required: true, message: '请输入排序' }]}><Input type="number" placeholder="请输入排序" /></Form.Item>
          <Form.Item name="status" label="状态" initialValue="0"><Radio.Group>{(dict.sys_normal_disable || []).map((i: any) => <Radio key={i.value} value={i.value}>{i.label}</Radio>)}</Radio.Group></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={3} placeholder="请输入备注" /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
