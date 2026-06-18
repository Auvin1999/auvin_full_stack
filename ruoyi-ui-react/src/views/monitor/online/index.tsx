import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Space, Card, message, Popconfirm } from 'antd'
import { SearchOutlined, ReloadOutlined, LogoutOutlined } from '@ant-design/icons'
import { list, forceLogout } from '@/api/monitor/online'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils/ruoyi'

export default function OnlineIndex() {
  const [queryForm] = Form.useForm()
  const [allData, setAllData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [queryParams, setQueryParams] = useState<any>({ pageNum: 1, pageSize: 10 })
  const [filter, setFilter] = useState<any>({})

  const getList = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await list({ ...filter, pageNum: 1, pageSize: 9999 })
      setAllData(res.rows || res.data || [])
    } finally { setLoading(false) }
  }, [filter])

  useEffect(() => { getList() }, [getList])

  const handleQuery = () => { setFilter(queryForm.getFieldsValue()); setQueryParams((p: any) => ({ ...p, pageNum: 1 })) }
  const resetQuery = () => { queryForm.resetFields(); setFilter({}); setQueryParams({ pageNum: 1, pageSize: 10 }) }
  const handlePagination = (page: number, pageSize: number) => { setQueryParams((p: any) => ({ ...p, pageNum: page, pageSize })) }
  const handleForceLogout = async (tokenId: string) => { await forceLogout(tokenId); message.success('强退成功'); getList() }

  // 客户端分页
  const pageData = allData.slice((queryParams.pageNum - 1) * queryParams.pageSize, queryParams.pageNum * queryParams.pageSize)

  const columns = [
    { title: '序号', width: 70, render: (_: any, __: any, index: number) => (queryParams.pageNum - 1) * queryParams.pageSize + index + 1 },
    { title: '会话编号', dataIndex: 'tokenId', width: 250, ellipsis: true },
    { title: '登录名称', dataIndex: 'userName', width: 120, ellipsis: true },
    { title: '主机', dataIndex: 'ipaddr', width: 150, ellipsis: true },
    { title: '登录时间', dataIndex: 'loginTime', width: 170, render: (v: string) => parseTime(v) },
    {
      title: '操作', width: 100, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Popconfirm title={`确认强退用户 ${record.userName}？`} onConfirm={() => handleForceLogout(record.tokenId)}>
          <Button type="link" size="small" danger icon={<LogoutOutlined />}>强退</Button>
        </Popconfirm>
      )
    }
  ]

  return (
    <div className="app-container">
      <Card style={{ marginBottom: 16 }}>
        <Form form={queryForm} layout="inline" onFinish={handleQuery}>
          <Form.Item name="ipaddr" label="登录地址"><Input placeholder="请输入登录地址" allowClear /></Form.Item>
          <Form.Item name="userName" label="用户名称"><Input placeholder="请输入用户名称" allowClear /></Form.Item>
          <Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">搜索</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>重置</Button></Space></Form.Item>
        </Form>
      </Card>
      <Card>
        <Table rowKey="tokenId" columns={columns} dataSource={pageData} loading={loading} pagination={false} scroll={{ x: 800 }} />
        <Pagination total={allData.length} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
    </div>
  )
}
