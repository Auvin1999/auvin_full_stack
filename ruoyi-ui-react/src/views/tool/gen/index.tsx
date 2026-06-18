import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, Space, Card, message, Popconfirm, Modal } from 'antd'
import { DeleteOutlined, SearchOutlined, ReloadOutlined, SyncOutlined, CodeOutlined, DownloadOutlined, ImportOutlined } from '@ant-design/icons'
import { listTable, delTable, genCode, synchDb, previewTable, listDbTable, importTable } from '@/api/tool/gen'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import { parseTime } from '@/utils/ruoyi'

export default function GenIndex() {
  const [queryForm] = Form.useForm()
  const [dataList, setDataList] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [queryParams, setQueryParams] = useState<any>({ pageNum: 1, pageSize: 10 })
  const [importOpen, setImportOpen] = useState(false)
  const [dbTableList, setDbTableList] = useState<any[]>([])
  const [dbLoading, setDbLoading] = useState(false)
  const [dbSelectedKeys, setDbSelectedKeys] = useState<string[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<Record<string, string>>({})

  const getList = useCallback(async () => {
    setLoading(true)
    try { const res: any = await listTable(queryParams); setDataList(res.rows || []); setTotal(res.total || 0) } finally { setLoading(false) }
  }, [queryParams])

  useEffect(() => { getList() }, [getList])

  const handleQuery = () => { setQueryParams((p: any) => ({ ...p, ...queryForm.getFieldsValue(), pageNum: 1 })) }
  const resetQuery = () => { queryForm.resetFields(); setQueryParams({ pageNum: 1, pageSize: 10 }) }
  const handlePagination = (page: number, pageSize: number) => { setQueryParams((p: any) => ({ ...p, pageNum: page, pageSize })) }
  const handleDelete = async (row?: any) => {
    const ids = row ? [row.tableId] : selectedRowKeys
    if (!ids.length) { message.warning('请选择要删除的数据'); return }
    await delTable(ids.join(',')); message.success('删除成功'); getList()
  }

  const handleGenCode = async (tableName: string) => {
    await genCode(tableName); message.success('生成成功')
  }

  const handleSynchDb = async (tableName: string) => {
    await synchDb(tableName); message.success('同步成功')
  }

  const handlePreview = async (tableId: number) => {
    try {
      const res: any = await previewTable(tableId)
      setPreviewData(res.data || res)
      setPreviewOpen(true)
    } catch { /* handled */ }
  }

  const handleImportOpen = async () => {
    setDbLoading(true)
    try {
      const res: any = await listDbTable({ pageNum: 1, pageSize: 9999 })
      setDbTableList(res.rows || [])
      setImportOpen(true)
    } finally { setDbLoading(false) }
  }

  const handleImport = async () => {
    if (!dbSelectedKeys.length) { message.warning('请选择要导入的表'); return }
    await importTable({ tables: dbSelectedKeys.join(',') })
    message.success('导入成功'); setImportOpen(false); getList()
  }

  const columns = [
    { title: '序号', width: 70, render: (_: any, __: any, i: number) => (queryParams.pageNum - 1) * queryParams.pageSize + i + 1 },
    { title: '表名称', dataIndex: 'tableName', width: 180, ellipsis: true },
    { title: '表描述', dataIndex: 'tableComment', width: 180, ellipsis: true },
    { title: '实体类名称', dataIndex: 'className', width: 180, ellipsis: true },
    { title: '创建时间', dataIndex: 'createTime', width: 170, render: (v: string) => parseTime(v) },
    { title: '更新时间', dataIndex: 'updateTime', width: 170, render: (v: string) => parseTime(v) },
    {
      title: '操作', width: 350, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <HasPermi permissions={['tool:gen:preview']}><Button type="link" size="small" icon={<CodeOutlined />} onClick={() => handlePreview(record.tableId)}>预览</Button></HasPermi>
          <HasPermi permissions={['tool:gen:edit']}><Button type="link" size="small" onClick={() => window.open(`/tool/gen-edit?tableId=${record.tableId}`, '_blank')}>编辑</Button></HasPermi>
          <HasPermi permissions={['tool:gen:remove']}><Popconfirm title="确认删除？" onConfirm={() => handleDelete(record)}><Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm></HasPermi>
          <HasPermi permissions={['tool:gen:edit']}><Button type="link" size="small" icon={<SyncOutlined />} onClick={() => handleSynchDb(record.tableName)}>同步</Button></HasPermi>
          <HasPermi permissions={['tool:gen:edit']}><Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => handleGenCode(record.tableName)}>生成</Button></HasPermi>
        </Space>
      )
    }
  ]

  return (
    <div className="app-container">
      {showSearch && (
        <Card style={{ marginBottom: 16 }}>
          <Form form={queryForm} layout="inline" onFinish={handleQuery}>
            <Form.Item name="tableName" label="表名称"><Input placeholder="请输入表名称" allowClear /></Form.Item>
            <Form.Item name="tableComment" label="表描述"><Input placeholder="请输入表描述" allowClear /></Form.Item>
            <Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">搜索</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>重置</Button></Space></Form.Item>
          </Form>
        </Card>
      )}
      <Card>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <Space>
            <HasPermi permissions={['tool:gen:import']}><Button type="primary" icon={<ImportOutlined />} onClick={handleImportOpen} loading={dbLoading}>导入</Button></HasPermi>
            <HasPermi permissions={['tool:gen:remove']}><Popconfirm title="确认删除？" onConfirm={() => handleDelete()} disabled={!selectedRowKeys.length}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length}>删除</Button></Popconfirm></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} />
        </div>
        <Table rowKey="tableId" columns={columns} dataSource={dataList} loading={loading} pagination={false} scroll={{ x: 1200 }} rowSelection={{ selectedRowKeys, onChange: (k) => setDbSelectedKeys(k as string[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>

      {/* 导入表弹窗 */}
      <Modal title="导入表" open={importOpen} onOk={handleImport} onCancel={() => setImportOpen(false)} width={700} destroyOnClose>
        <Table rowKey="tableName" columns={[
          { title: '表名称', dataIndex: 'tableName', width: 200 },
          { title: '表描述', dataIndex: 'tableComment', width: 200 },
          { title: '创建时间', dataIndex: 'createTime', width: 170, render: (v: string) => parseTime(v) },
          { title: '更新时间', dataIndex: 'updateTime', width: 170, render: (v: string) => parseTime(v) },
        ]} dataSource={dbTableList} pagination={false} size="small" rowSelection={{ selectedRowKeys: dbSelectedKeys, onChange: (k) => setDbSelectedKeys(k as string[]) }} />
      </Modal>

      {/* 预览代码弹窗 */}
      <Modal title="代码预览" open={previewOpen} onCancel={() => setPreviewOpen(false)} footer={null} width={900} destroyOnClose>
        {Object.entries(previewData).map(([key, value]) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <h4 style={{ marginBottom: 8 }}>{key}</h4>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 300, overflow: 'auto', fontSize: 12 }}>{value}</pre>
          </div>
        ))}
      </Modal>
    </div>
  )
}
