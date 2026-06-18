import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, Radio, Modal, Space, Card, message, Popconfirm, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, CaretRightOutlined } from '@ant-design/icons'
import { listJob, getJob, addJob, updateJob, delJob, changeJobStatus, runJob } from '@/api/monitor/job'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import DictTag from '@/components/DictTag'
import { useDict } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'

export default function JobIndex() {
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()
  const dict = useDict('sys_job_group', 'sys_normal_disable')
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
    try { const res: any = await listJob(queryParams); setList(res.rows || []); setTotal(res.total || 0) } finally { setLoading(false) }
  }, [queryParams])

  useEffect(() => { getList() }, [getList])

  const handleQuery = () => { setQueryParams((p: any) => ({ ...p, ...queryForm.getFieldsValue(), pageNum: 1 })) }
  const resetQuery = () => { queryForm.resetFields(); setQueryParams({ pageNum: 1, pageSize: 10 }) }
  const handlePagination = (page: number, pageSize: number) => { setQueryParams((p: any) => ({ ...p, pageNum: page, pageSize })) }
  const handleAdd = () => { form.resetFields(); setTitle('添加任务'); setOpen(true) }
  const handleUpdate = async (row: any) => {
    form.resetFields(); const res: any = await getJob(row.jobId); form.setFieldsValue(res.data || res); setTitle('修改任务'); setOpen(true)
  }
  const handleDelete = async (row?: any) => {
    const ids = row ? [row.jobId] : selectedRowKeys
    if (!ids.length) { message.warning('请选择要删除的数据'); return }
    await delJob(ids.join(',')); message.success('删除成功'); getList()
  }
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); setSubmitting(true)
      values.jobId ? await updateJob(values) : await addJob(values)
      message.success(values.jobId ? '修改成功' : '新增成功'); setOpen(false); getList()
    } finally { setSubmitting(false) }
  }
  const handleStatusChange = async (row: any) => {
    const newStatus = row.status === '0' ? '1' : '0'
    await changeJobStatus(row.jobId, newStatus); message.success('状态修改成功'); getList()
  }
  const handleRun = async (row: any) => {
    await runJob(row.jobId, row.jobGroup); message.success('执行成功')
  }

  const columns = [
    { title: '任务编号', dataIndex: 'jobId', width: 100 },
    { title: '任务名称', dataIndex: 'jobName', width: 200, ellipsis: true },
    { title: '任务组名', dataIndex: 'jobGroup', width: 120, render: (v: string) => <DictTag options={dict.sys_job_group || []} value={v} /> },
    { title: '调用目标字符串', dataIndex: 'invokeTarget', width: 200, ellipsis: true },
    { title: 'cron执行表达式', dataIndex: 'cronExpression', width: 150 },
    { title: '状态', dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_normal_disable || []} value={v} /> },
    {
      title: '操作', width: 280, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <HasPermi permissions={['monitor:job:changeStatus']}><Button type="link" size="small" onClick={() => handleStatusChange(record)}>{record.status === '0' ? '暂停' : '恢复'}</Button></HasPermi>
          <HasPermi permissions={['monitor:job:edit']}><Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>修改</Button></HasPermi>
          <HasPermi permissions={['monitor:job:remove']}><Popconfirm title="确认删除？" onConfirm={() => handleDelete(record)}><Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm></HasPermi>
          <HasPermi permissions={['monitor:job:changeStatus']}><Button type="link" size="small" icon={<CaretRightOutlined />} onClick={() => handleRun(record)}>执行一次</Button></HasPermi>
        </Space>
      )
    }
  ]

  return (
    <div className="app-container">
      {showSearch && (
        <Card style={{ marginBottom: 16 }}>
          <Form form={queryForm} layout="inline" onFinish={handleQuery}>
            <Form.Item name="jobName" label="任务名称"><Input placeholder="请输入任务名称" allowClear /></Form.Item>
            <Form.Item name="jobGroup" label="任务组名">
              <Select placeholder="请选择" allowClear style={{ width: 120 }}>{(dict.sys_job_group || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select placeholder="任务状态" allowClear style={{ width: 120 }}>{(dict.sys_normal_disable || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">搜索</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>重置</Button></Space></Form.Item>
          </Form>
        </Card>
      )}
      <Card>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <Space>
            <HasPermi permissions={['monitor:job:add']}><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button></HasPermi>
            <HasPermi permissions={['monitor:job:remove']}><Popconfirm title="确认删除？" onConfirm={() => handleDelete()} disabled={!selectedRowKeys.length}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length}>删除</Button></Popconfirm></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} />
        </div>
        <Table rowKey="jobId" columns={columns} dataSource={list} loading={loading} pagination={false} scroll={{ x: 1200 }} rowSelection={{ selectedRowKeys, onChange: (k) => setSelectedRowKeys(k as number[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
      <Modal title={title} open={open} onOk={handleSubmit} onCancel={() => setOpen(false)} confirmLoading={submitting} width={600} destroyOnClose>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="jobId" hidden><Input /></Form.Item>
          <Form.Item name="jobName" label="任务名称" rules={[{ required: true, message: '请输入任务名称' }]}><Input placeholder="请输入任务名称" /></Form.Item>
          <Form.Item name="jobGroup" label="任务分组" rules={[{ required: true, message: '请选择任务分组' }]}>
            <Select placeholder="请选择">{(dict.sys_job_group || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="invokeTarget" label="调用方法" rules={[{ required: true, message: '请输入调用方法' }]}><Input placeholder="请输入调用方法字符串" /></Form.Item>
          <Form.Item name="cronExpression" label="cron表达式" rules={[{ required: true, message: '请输入cron表达式' }]}><Input placeholder="请输入cron表达式" /></Form.Item>
          <Form.Item name="status" label="状态" initialValue="0"><Radio.Group>{(dict.sys_normal_disable || []).map((i: any) => <Radio key={i.value} value={i.value}>{i.label}</Radio>)}</Radio.Group></Form.Item>
          <Form.Item name="misfirePolicy" label="执行策略" initialValue="1"><Radio.Group><Radio value="1">立即执行</Radio><Radio value="2">执行一次</Radio><Radio value="3">放弃执行</Radio></Radio.Group></Form.Item>
          <Form.Item name="concurrent" label="是否并发" initialValue="1"><Radio.Group><Radio value="1">允许</Radio><Radio value="0">禁止</Radio></Radio.Group></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
