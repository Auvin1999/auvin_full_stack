import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, Space, Card, message, Popconfirm } from 'antd'
import { DeleteOutlined, SearchOutlined, ReloadOutlined, ClearOutlined } from '@ant-design/icons'
import { listJobLog, delJobLog, cleanJobLog } from '@/api/monitor/jobLog'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import DictTag from '@/components/DictTag'
import { useDict } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'

export default function JobLogIndex() {
  const [queryForm] = Form.useForm()
  const dict = useDict('sys_common_status', 'sys_job_group')
  const [dataList, setDataList] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [queryParams, setQueryParams] = useState<any>({ pageNum: 1, pageSize: 10 })

  const getList = useCallback(async () => {
    setLoading(true)
    try { const res: any = await listJobLog(queryParams); setDataList(res.rows || []); setTotal(res.total || 0) } finally { setLoading(false) }
  }, [queryParams])

  useEffect(() => { getList() }, [getList])

  const handleQuery = () => { setQueryParams((p: any) => ({ ...p, ...queryForm.getFieldsValue(), pageNum: 1 })) }
  const resetQuery = () => { queryForm.resetFields(); setQueryParams({ pageNum: 1, pageSize: 10 }) }
  const handlePagination = (page: number, pageSize: number) => { setQueryParams((p: any) => ({ ...p, pageNum: page, pageSize })) }
  const handleDelete = async (row?: any) => {
    const ids = row ? [row.jobLogId] : selectedRowKeys
    if (!ids.length) { message.warning('请选择要删除的数据'); return }
    await delJobLog(ids.join(',')); message.success('删除成功'); getList()
  }
  const handleClean = async () => { await cleanJobLog(); message.success('清空成功'); getList() }

  const columns = [
    { title: '日志编号', dataIndex: 'jobLogId', width: 100 },
    { title: '任务名称', dataIndex: 'jobName', width: 180, ellipsis: true },
    { title: '任务组名', dataIndex: 'jobGroup', width: 120, render: (v: string) => <DictTag options={dict.sys_job_group || []} value={v} /> },
    { title: '调用目标字符串', dataIndex: 'invokeTarget', width: 200, ellipsis: true },
    { title: '日志信息', dataIndex: 'jobMessage', width: 200, ellipsis: true },
    { title: '执行状态', dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_common_status || []} value={v} /> },
    { title: '执行时间', dataIndex: 'createTime', width: 170, render: (v: string) => parseTime(v) },
    {
      title: '操作', width: 100, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <HasPermi permissions={['monitor:job:remove']}>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </HasPermi>
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
            <Form.Item name="status" label="执行状态">
              <Select placeholder="执行状态" allowClear style={{ width: 120 }}>{(dict.sys_common_status || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">搜索</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>重置</Button></Space></Form.Item>
          </Form>
        </Card>
      )}
      <Card>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <Space>
            <HasPermi permissions={['monitor:job:remove']}><Popconfirm title="确认删除？" onConfirm={() => handleDelete()} disabled={!selectedRowKeys.length}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length}>删除</Button></Popconfirm></HasPermi>
            <HasPermi permissions={['monitor:job:remove']}><Button type="default" danger icon={<ClearOutlined />} onClick={handleClean}>清空</Button></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} />
        </div>
        <Table rowKey="jobLogId" columns={columns} dataSource={dataList} loading={loading} pagination={false} scroll={{ x: 1100 }} rowSelection={{ selectedRowKeys, onChange: (k) => setSelectedRowKeys(k as number[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
    </div>
  )
}
