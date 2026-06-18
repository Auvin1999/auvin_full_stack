import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, Space, Card, message, Popconfirm } from 'antd'
import { DeleteOutlined, SearchOutlined, ReloadOutlined, ClearOutlined, UnlockOutlined } from '@ant-design/icons'
import { list, delLogininfor, cleanLogininfor, unlockLogininfor } from '@/api/system/logininfor'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import DictTag from '@/components/DictTag'
import { useDict } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'

export default function LogininforIndex() {
  const [queryForm] = Form.useForm()
  const dict = useDict('sys_common_status')
  const [dataList, setDataList] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [queryParams, setQueryParams] = useState<any>({ pageNum: 1, pageSize: 10 })

  const getList = useCallback(async () => {
    setLoading(true)
    try { const res: any = await list(queryParams); setDataList(res.rows || []); setTotal(res.total || 0) } finally { setLoading(false) }
  }, [queryParams])

  useEffect(() => { getList() }, [getList])

  const handleQuery = () => { setQueryParams((p: any) => ({ ...p, ...queryForm.getFieldsValue(), pageNum: 1 })) }
  const resetQuery = () => { queryForm.resetFields(); setQueryParams({ pageNum: 1, pageSize: 10 }) }
  const handlePagination = (page: number, pageSize: number) => { setQueryParams((p: any) => ({ ...p, pageNum: page, pageSize })) }
  const handleDelete = async (row?: any) => {
    const ids = row ? [row.infoId] : selectedRowKeys
    if (!ids.length) { message.warning('请选择要删除的数据'); return }
    await delLogininfor(ids.join(',')); message.success('删除成功'); getList()
  }
  const handleClean = async () => { await cleanLogininfor(); message.success('清空成功'); getList() }
  const handleUnlock = async (userName: string) => { await unlockLogininfor(userName); message.success('用户 ' + userName + ' 解锁成功') }

  const columns = [
    { title: '访问编号', dataIndex: 'infoId', width: 100 },
    { title: '用户名称', dataIndex: 'userName', width: 130, sorter: true },
    { title: '登录状态', dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_common_status || []} value={v} /> },
    { title: '描述', dataIndex: 'msg', width: 250, ellipsis: true },
    { title: '访问时间', dataIndex: 'accessTime', width: 170, render: (v: string) => parseTime(v), sorter: true },
    {
      title: '操作', width: 80, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <HasPermi permissions={['system:logininfor:unlock']}>
          <Popconfirm title={`确认解锁用户 ${record.userName}？`} onConfirm={() => handleUnlock(record.userName)}>
            <Button type="link" size="small" icon={<UnlockOutlined />}>解锁</Button>
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
            <Form.Item name="ipaddr" label="登录地址"><Input placeholder="请输入登录地址" allowClear /></Form.Item>
            <Form.Item name="userName" label="用户名称"><Input placeholder="请输入用户名称" allowClear /></Form.Item>
            <Form.Item name="status" label="登录状态">
              <Select placeholder="登录状态" allowClear style={{ width: 120 }}>{(dict.sys_common_status || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">搜索</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>重置</Button></Space></Form.Item>
          </Form>
        </Card>
      )}
      <Card>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <Space>
            <HasPermi permissions={['system:logininfor:remove']}><Popconfirm title="确认删除？" onConfirm={() => handleDelete()} disabled={!selectedRowKeys.length}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length}>删除</Button></Popconfirm></HasPermi>
            <HasPermi permissions={['system:logininfor:remove']}><Button type="default" danger icon={<ClearOutlined />} onClick={handleClean}>清空</Button></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} />
        </div>
        <Table rowKey="infoId" columns={columns} dataSource={dataList} loading={loading} pagination={false} scroll={{ x: 800 }} rowSelection={{ selectedRowKeys, onChange: (k) => setSelectedRowKeys(k as number[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
    </div>
  )
}
