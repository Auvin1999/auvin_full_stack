import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, Space, Card, message, DatePicker, Row, Col } from 'antd'
import dayjs from 'dayjs'
import { DeleteOutlined, SearchOutlined, ReloadOutlined, ClearOutlined, UnlockOutlined } from '@ant-design/icons'
import { list, delLogininfor, cleanLogininfor, unlockLogininfor } from '@/api/system/logininfor'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import DictTag from '@/components/DictTag'
import { useDict } from '@/utils/dict'
import { parseTime, addDateRange } from '@/utils/ruoyi'
import { useTranslation } from 'react-i18next'
import { confirmDelete, confirmAction } from '@/utils/confirm'

export default function LogininforIndex() {
  const { t } = useTranslation()
  const [queryForm] = Form.useForm()
  const dict = useDict('sys_common_status')
  const [dataList, setDataList] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [queryParams, setQueryParams] = useState<any>({ pageNum: 1, pageSize: 10 })
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
    const ids = row ? [row.infoId] : selectedRowKeys
    if (!ids.length) { message.warning(t('pleaseSelectData')); return }
    await delLogininfor(ids.join(',')); message.success(t('deleteSuccess')); getList()
  }
  const handleClean = async () => { await cleanLogininfor(); message.success(t('deleteSuccess')); getList() }
  const handleUnlock = async (userName: string) => { await unlockLogininfor(userName); message.success(t('logininfor.unlockSuccess', { name: userName })) }

  const columns = [
    { title: t('logininfor.infoId'), dataIndex: 'infoId', width: 100 },
    { title: t('logininfor.userName'), dataIndex: 'userName', width: 130, sorter: true },
    { title: t('logininfor.loginStatus'), dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_common_status || []} value={v} /> },
    { title: t('logininfor.description'), dataIndex: 'msg', width: 250, ellipsis: true },
    { title: t('logininfor.accessTime'), dataIndex: 'accessTime', width: 170, render: (v: string) => parseTime(v), sorter: true },
    {
      title: t('operation'), width: 80, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <HasPermi permissions={['system:logininfor:unlock']}>
          <Button type="link" size="small" icon={<UnlockOutlined />} onClick={() => confirmAction({ content: t('logininfor.unlockConfirm', { name: record.userName }), onOk: () => handleUnlock(record.userName) })}>{t('logininfor.unlock')}</Button>
        </HasPermi>
      )
    }
  ]

  return (
    <div className="app-container">
      <Card style={{ marginBottom: showSearch ? 16 : 0 }}>
        <div style={{ height: showSearch ? 'auto' : 0, overflow: 'hidden' }}>
          <Form form={queryForm} onFinish={handleQuery}>
            <Row gutter={16}>
              <Col span={8}><Form.Item name="ipaddr" label={t('logininfor.loginAddress')}><Input placeholder={t('logininfor.loginAddress')} allowClear /></Form.Item></Col>
              <Col span={8}><Form.Item name="userName" label={t('logininfor.userName')}><Input placeholder={t('logininfor.userName')} allowClear /></Form.Item></Col>
              <Col span={8}><Form.Item name="status" label={t('logininfor.loginStatus')}>
                <Select placeholder={t('logininfor.loginStatus')} allowClear style={{ width: '100%' }}>{(dict.sys_common_status || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
              </Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}><Form.Item label={t('logininfor.accessTime')}>
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
              <Col span={16}><Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">{t('search')}</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>{t('reset')}</Button></Space></Form.Item></Col>
            </Row>
          </Form>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
          <Space>
            <HasPermi permissions={['system:logininfor:remove']}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length} onClick={() => { if (selectedRowKeys.length) confirmDelete({ onOk: () => handleDelete() }) }}>{t('delete')}</Button></HasPermi>
            <HasPermi permissions={['system:logininfor:remove']}><Button type="default" danger icon={<ClearOutlined />} onClick={handleClean}>{t('clean')}</Button></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} exportUrl="/system/logininfor/export" exportParams={queryParams} exportFilename="登录日志.xlsx" />
        </div>
      </Card>
      <Card>
        <Table rowKey="infoId" columns={columns} dataSource={dataList} loading={loading} pagination={false} scroll={{ x: 800 }} rowSelection={{ selectedRowKeys, onChange: (k) => setSelectedRowKeys(k as number[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
    </div>
  )
}
