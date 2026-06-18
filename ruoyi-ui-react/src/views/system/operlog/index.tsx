import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, Modal, Space, Card, message, Popconfirm, Descriptions } from 'antd'
import { DeleteOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, ClearOutlined } from '@ant-design/icons'
import { list, delOperlog, cleanOperlog } from '@/api/system/operlog'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import DictTag from '@/components/DictTag'
import { useDict } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'

export default function OperlogIndex() {
  const [queryForm] = Form.useForm()
  const dict = useDict('sys_oper_type', 'sys_common_status')
  const [dataList, setDataList] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [queryParams, setQueryParams] = useState<any>({ pageNum: 1, pageSize: 10 })
  const [detailOpen, setDetailOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<any>(null)

  const getList = useCallback(async () => {
    setLoading(true)
    try { const res: any = await list(queryParams); setDataList(res.rows || []); setTotal(res.total || 0) } finally { setLoading(false) }
  }, [queryParams])

  useEffect(() => { getList() }, [getList])

  const handleQuery = () => { setQueryParams((p: any) => ({ ...p, ...queryForm.getFieldsValue(), pageNum: 1 })) }
  const resetQuery = () => { queryForm.resetFields(); setQueryParams({ pageNum: 1, pageSize: 10 }) }
  const handlePagination = (page: number, pageSize: number) => { setQueryParams((p: any) => ({ ...p, pageNum: page, pageSize })) }
  const handleDelete = async (row?: any) => {
    const ids = row ? [row.operId] : selectedRowKeys
    if (!ids.length) { message.warning('请选择要删除的数据'); return }
    await delOperlog(ids.join(',')); message.success('删除成功'); getList()
  }
  const handleClean = async () => { await cleanOperlog(); message.success('清空成功'); getList() }
  const handleDetail = (row: any) => { setCurrentRow(row); setDetailOpen(true) }

  const columns = [
    { title: '日志编号', dataIndex: 'operId', width: 100 },
    { title: '系统模块', dataIndex: 'title', width: 150, ellipsis: true },
    { title: '操作类型', dataIndex: 'businessType', width: 100, render: (v: string) => <DictTag options={dict.sys_oper_type || []} value={v} /> },
    { title: '请求方式', dataIndex: 'requestMethod', width: 100 },
    { title: '操作人员', dataIndex: 'operName', width: 120, sorter: true },
    { title: '操作地址', dataIndex: 'operIp', width: 140 },
    { title: '操作状态', dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_common_status || []} value={v} /> },
    { title: '操作日期', dataIndex: 'operTime', width: 170, render: (v: string) => parseTime(v), sorter: true },
    { title: '消耗时间', dataIndex: 'costTime', width: 110, render: (v: number) => v + '毫秒', sorter: true },
    {
      title: '操作', width: 100, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <HasPermi permissions={['system:operlog:query']}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>详情</Button>
        </HasPermi>
      )
    }
  ]

  return (
    <div className="app-container">
      {showSearch && (
        <Card style={{ marginBottom: 16 }}>
          <Form form={queryForm} layout="inline" onFinish={handleQuery}>
            <Form.Item name="title" label="系统模块"><Input placeholder="请输入系统模块" allowClear /></Form.Item>
            <Form.Item name="operName" label="操作人员"><Input placeholder="请输入操作人员" allowClear /></Form.Item>
            <Form.Item name="businessType" label="操作类型">
              <Select placeholder="操作类型" allowClear style={{ width: 120 }}>{(dict.sys_oper_type || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item name="status" label="操作状态">
              <Select placeholder="操作状态" allowClear style={{ width: 120 }}>{(dict.sys_common_status || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">搜索</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>重置</Button></Space></Form.Item>
          </Form>
        </Card>
      )}
      <Card>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <Space>
            <HasPermi permissions={['system:operlog:remove']}><Popconfirm title="确认删除？" onConfirm={() => handleDelete()} disabled={!selectedRowKeys.length}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length}>删除</Button></Popconfirm></HasPermi>
            <HasPermi permissions={['system:operlog:remove']}><Button type="default" danger icon={<ClearOutlined />} onClick={handleClean}>清空</Button></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} />
        </div>
        <Table rowKey="operId" columns={columns} dataSource={dataList} loading={loading} pagination={false} scroll={{ x: 1200 }} rowSelection={{ selectedRowKeys, onChange: (k) => setSelectedRowKeys(k as number[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
      <Modal title="操作日志详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={700}>
        {currentRow && (
          <Descriptions bordered column={2} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="操作模块">{currentRow.title}</Descriptions.Item>
            <Descriptions.Item label="操作类型"><DictTag options={dict.sys_oper_type || []} value={currentRow.businessType} /></Descriptions.Item>
            <Descriptions.Item label="请求方式">{currentRow.requestMethod}</Descriptions.Item>
            <Descriptions.Item label="操作人员">{currentRow.operName}</Descriptions.Item>
            <Descriptions.Item label="操作地址">{currentRow.operIp}</Descriptions.Item>
            <Descriptions.Item label="操作状态"><DictTag options={dict.sys_common_status || []} value={currentRow.status} /></Descriptions.Item>
            <Descriptions.Item label="操作时间" span={2}>{parseTime(currentRow.operTime)}</Descriptions.Item>
            <Descriptions.Item label="请求URL" span={2}>{currentRow.operUrl}</Descriptions.Item>
            <Descriptions.Item label="请求参数" span={2}><pre style={{ maxHeight: 200, overflow: 'auto', margin: 0 }}>{currentRow.operParam}</pre></Descriptions.Item>
            <Descriptions.Item label="返回参数" span={2}><pre style={{ maxHeight: 200, overflow: 'auto', margin: 0 }}>{currentRow.jsonResult}</pre></Descriptions.Item>
            {currentRow.errorMsg && <Descriptions.Item label="错误信息" span={2}><pre style={{ color: 'red', margin: 0 }}>{currentRow.errorMsg}</pre></Descriptions.Item>}
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
