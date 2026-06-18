import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, Modal, Space, Card, message, Descriptions, DatePicker, Row, Col } from 'antd'
import dayjs from 'dayjs'
import { DeleteOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, ClearOutlined } from '@ant-design/icons'
import { list, delOperlog, cleanOperlog } from '@/api/system/operlog'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import DictTag from '@/components/DictTag'
import { useDict } from '@/utils/dict'
import { parseTime, addDateRange } from '@/utils/ruoyi'
import { useTranslation } from 'react-i18next'
import { confirmDelete } from '@/utils/confirm'

export default function OperlogIndex() {
  const { t } = useTranslation()
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
  const [dateRange, setDateRange] = useState<string[]>([])

  const getList = useCallback(async () => {
    setLoading(true)
    try { const res: any = await list(addDateRange(queryParams, dateRange)); setDataList(res.rows || []); setTotal(res.total || 0) } finally { setLoading(false) }
  }, [queryParams, dateRange])

  useEffect(() => { getList() }, [getList])

  const handleQuery = () => { setQueryParams((p: any) => ({ ...p, ...queryForm.getFieldsValue(), pageNum: 1 })) }
  const resetQuery = () => { setDateRange([]); queryForm.resetFields(); setQueryParams({ pageNum: 1, pageSize: 10 }) }
  const handlePagination = (page: number, pageSize: number) => { setQueryParams((p: any) => ({ ...p, pageNum: page, pageSize })) }
  const handleDelete = async (row?: any) => {
    const ids = row ? [row.operId] : selectedRowKeys
    if (!ids.length) { message.warning(t('pleaseSelectData')); return }
    await delOperlog(ids.join(',')); message.success(t('deleteSuccess')); getList()
  }
  const handleClean = async () => { await cleanOperlog(); message.success(t('deleteSuccess')); getList() }
  const handleDetail = (row: any) => { setCurrentRow(row); setDetailOpen(true) }

  const columns = [
    { title: t('operlog.operId'), dataIndex: 'operId', width: 100 },
    { title: t('operlog.title'), dataIndex: 'title', width: 150, ellipsis: true },
    { title: t('operlog.businessType'), dataIndex: 'businessType', width: 100, render: (v: string) => <DictTag options={dict.sys_oper_type || []} value={v} /> },
    { title: t('operlog.requestMethod'), dataIndex: 'requestMethod', width: 100 },
    { title: t('operlog.operName'), dataIndex: 'operName', width: 120, sorter: true },
    { title: t('operlog.operIp'), dataIndex: 'operIp', width: 140 },
    { title: t('status'), dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_common_status || []} value={v} /> },
    { title: t('operlog.operTime'), dataIndex: 'operTime', width: 170, render: (v: string) => parseTime(v), sorter: true },
    { title: t('operlog.costTime'), dataIndex: 'costTime', width: 110, render: (v: number) => t('operlog.milliseconds', { time: v }), sorter: true },
    {
      title: t('operation'), width: 100, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <HasPermi permissions={['system:operlog:query']}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>{t('detail')}</Button>
        </HasPermi>
      )
    }
  ]

  return (
    <div className="app-container">
      <Card style={{ marginBottom: 16 }}>
        {showSearch && (
          <Form form={queryForm} onFinish={handleQuery}>
            <Row gutter={16}>
              <Col span={8}><Form.Item name="title" label={t('operlog.title')}><Input placeholder={t('operlog.title')} allowClear /></Form.Item></Col>
              <Col span={8}><Form.Item name="operName" label={t('operlog.operName')}><Input placeholder={t('operlog.operName')} allowClear /></Form.Item></Col>
              <Col span={8}><Form.Item name="businessType" label={t('operlog.businessType')}>
                <Select placeholder={t('operlog.businessType')} allowClear style={{ width: '100%' }}>{(dict.sys_oper_type || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
              </Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}><Form.Item name="status" label={t('status')}>
                <Select placeholder={t('status')} allowClear style={{ width: '100%' }}>{(dict.sys_common_status || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
              </Form.Item></Col>
              <Col span={8}><Form.Item label={t('operlog.operTime')}>
                <DatePicker.RangePicker
                  showTime
                  value={dateRange.length === 2 ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : undefined}
                  onChange={(dates) => {
                    if (dates) {
                      setDateRange([dates[0]!.format('YYYY-MM-DD HH:mm:ss'), dates[1]!.format('YYYY-MM-DD HH:mm:ss')])
                    } else {
                      setDateRange([])
                    }
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item></Col>
              <Col span={8}><Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">{t('search')}</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>{t('reset')}</Button></Space></Form.Item></Col>
            </Row>
          </Form>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: showSearch ? '1px solid #f0f0f0' : 'none', paddingTop: showSearch ? 12 : 0 }}>
          <Space>
            <HasPermi permissions={['system:operlog:remove']}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length} onClick={() => { if (selectedRowKeys.length) confirmDelete({ onOk: () => handleDelete() }) }}>{t('delete')}</Button></HasPermi>
            <HasPermi permissions={['system:operlog:remove']}><Button type="default" danger icon={<ClearOutlined />} onClick={handleClean}>{t('clean')}</Button></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} exportUrl="/system/operlog/export" exportParams={queryParams} exportFilename="操作日志.xlsx" />
        </div>
      </Card>
      <Card>
        <Table rowKey="operId" columns={columns} dataSource={dataList} loading={loading} pagination={false} scroll={{ x: 1200 }} rowSelection={{ selectedRowKeys, onChange: (k) => setSelectedRowKeys(k as number[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
      <Modal title={t('operlog.detail')} open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={700}>
        {currentRow && (
          <Descriptions bordered column={2} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label={t('operlog.title')}>{currentRow.title}</Descriptions.Item>
            <Descriptions.Item label={t('operlog.businessType')}><DictTag options={dict.sys_oper_type || []} value={currentRow.businessType} /></Descriptions.Item>
            <Descriptions.Item label={t('operlog.requestMethod')}>{currentRow.requestMethod}</Descriptions.Item>
            <Descriptions.Item label={t('operlog.operName')}>{currentRow.operName}</Descriptions.Item>
            <Descriptions.Item label={t('operlog.operIp')}>{currentRow.operIp}</Descriptions.Item>
            <Descriptions.Item label={t('status')}><DictTag options={dict.sys_common_status || []} value={currentRow.status} /></Descriptions.Item>
            <Descriptions.Item label={t('operlog.operTime')} span={2}>{parseTime(currentRow.operTime)}</Descriptions.Item>
            <Descriptions.Item label={t('operlog.operUrl')} span={2}>{currentRow.operUrl}</Descriptions.Item>
            <Descriptions.Item label={t('operlog.operParam')} span={2}><pre style={{ maxHeight: 200, overflow: 'auto', margin: 0 }}>{currentRow.operParam}</pre></Descriptions.Item>
            <Descriptions.Item label={t('operlog.jsonResult')} span={2}><pre style={{ maxHeight: 200, overflow: 'auto', margin: 0 }}>{currentRow.jsonResult}</pre></Descriptions.Item>
            {currentRow.errorMsg && <Descriptions.Item label={t('operlog.errorMsg')} span={2}><pre style={{ color: 'red', margin: 0 }}>{currentRow.errorMsg}</pre></Descriptions.Item>}
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
