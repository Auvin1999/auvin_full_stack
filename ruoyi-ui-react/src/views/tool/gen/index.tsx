import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, Space, Card, message, Modal, Row, Col } from 'antd'
import { DeleteOutlined, SearchOutlined, ReloadOutlined, SyncOutlined, CodeOutlined, DownloadOutlined, ImportOutlined } from '@ant-design/icons'
import { listTable, delTable, genCode, synchDb, previewTable, listDbTable, importTable } from '@/api/tool/gen'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import { parseTime } from '@/utils/ruoyi'
import { useTranslation } from 'react-i18next'
import { confirmDelete } from '@/utils/confirm'

export default function GenIndex() {
  const { t } = useTranslation()
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
    if (!ids.length) { message.warning(t('pleaseSelectData')); return }
    await delTable(ids.join(',')); message.success(t('deleteSuccess')); getList()
  }

  const handleGenCode = async (tableName: string) => {
    await genCode(tableName); message.success(t('gen.generateSuccess'))
  }

  const handleSynchDb = async (tableName: string) => {
    await synchDb(tableName); message.success(t('gen.syncSuccess'))
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
    if (!dbSelectedKeys.length) { message.warning(t('pleaseSelectData')); return }
    await importTable({ tables: dbSelectedKeys.join(',') })
    message.success(t('gen.importSuccess')); setImportOpen(false); getList()
  }

  const columns = [
    { title: '#', width: 70, render: (_: any, __: any, i: number) => (queryParams.pageNum - 1) * queryParams.pageSize + i + 1 },
    { title: t('gen.tableName'), dataIndex: 'tableName', width: 180, ellipsis: true },
    { title: t('gen.tableComment'), dataIndex: 'tableComment', width: 180, ellipsis: true },
    { title: t('gen.className'), dataIndex: 'className', width: 180, ellipsis: true },
    { title: t('createTime'), dataIndex: 'createTime', width: 170, render: (v: string) => parseTime(v) },
    { title: t('createTime'), dataIndex: 'updateTime', width: 170, render: (v: string) => parseTime(v) },
    {
      title: t('operation'), width: 350, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <HasPermi permissions={['tool:gen:preview']}><Button type="link" size="small" icon={<CodeOutlined />} onClick={() => handlePreview(record.tableId)}>{t('gen.preview')}</Button></HasPermi>
          <HasPermi permissions={['tool:gen:edit']}><Button type="link" size="small" onClick={() => window.open(`/tool/gen-edit?tableId=${record.tableId}`, '_blank')}>{t('edit')}</Button></HasPermi>
          <HasPermi permissions={['tool:gen:remove']}><Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete({ onOk: () => handleDelete(record) })}>{t('delete')}</Button></HasPermi>
          <HasPermi permissions={['tool:gen:edit']}><Button type="link" size="small" icon={<SyncOutlined />} onClick={() => handleSynchDb(record.tableName)}>{t('gen.sync')}</Button></HasPermi>
          <HasPermi permissions={['tool:gen:edit']}><Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => handleGenCode(record.tableName)}>{t('gen.generate')}</Button></HasPermi>
        </Space>
      )
    }
  ]

  return (
    <div className="app-container">
      <Card style={{ marginBottom: showSearch ? 16 : 0 }}>
        <div style={{ height: showSearch ? 'auto' : 0, overflow: 'hidden' }}>
          <Form form={queryForm} onFinish={handleQuery}>
            <Row gutter={16}>
              <Col span={8}><Form.Item name="tableName" label={t('gen.tableName')}><Input placeholder={t('gen.tableName')} allowClear /></Form.Item></Col>
              <Col span={8}><Form.Item name="tableComment" label={t('gen.tableComment')}><Input placeholder={t('gen.tableComment')} allowClear /></Form.Item></Col>
              <Col span={8}><Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">{t('search')}</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>{t('reset')}</Button></Space></Form.Item></Col>
            </Row>
          </Form>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
          <Space>
            <HasPermi permissions={['tool:gen:import']}><Button type="primary" icon={<ImportOutlined />} onClick={handleImportOpen} loading={dbLoading}>{t('import')}</Button></HasPermi>
            <HasPermi permissions={['tool:gen:remove']}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length} onClick={() => { if (selectedRowKeys.length) confirmDelete({ onOk: () => handleDelete() }) }}>{t('delete')}</Button></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} />
        </div>
      </Card>
      <Card>
        <Table rowKey="tableId" columns={columns} dataSource={dataList} loading={loading} pagination={false} scroll={{ x: 1200 }} rowSelection={{ selectedRowKeys, onChange: (k) => setDbSelectedKeys(k as string[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>

      {/* 导入表弹窗 */}
      <Modal title={t('gen.importTable')} open={importOpen} onOk={handleImport} onCancel={() => setImportOpen(false)} width={700} destroyOnHidden>
        <Table rowKey="tableName" columns={[
          { title: t('gen.tableName'), dataIndex: 'tableName', width: 200 },
          { title: t('gen.tableComment'), dataIndex: 'tableComment', width: 200 },
          { title: t('createTime'), dataIndex: 'createTime', width: 170, render: (v: string) => parseTime(v) },
          { title: t('createTime'), dataIndex: 'updateTime', width: 170, render: (v: string) => parseTime(v) },
        ]} dataSource={dbTableList} pagination={false} size="small" rowSelection={{ selectedRowKeys: dbSelectedKeys, onChange: (k) => setDbSelectedKeys(k as string[]) }} />
      </Modal>

      {/* 预览代码弹窗 */}
      <Modal title={t('gen.codePreview')} open={previewOpen} onCancel={() => setPreviewOpen(false)} footer={null} width={900} destroyOnHidden>
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
