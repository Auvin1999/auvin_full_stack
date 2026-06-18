import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Space, Card, message, Row, Col } from 'antd'
import { SearchOutlined, ReloadOutlined, LogoutOutlined } from '@ant-design/icons'
import { list, forceLogout } from '@/api/monitor/online'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils/ruoyi'
import { useTranslation } from 'react-i18next'
import { confirmAction } from '@/utils/confirm'

export default function OnlineIndex() {
  const { t } = useTranslation()
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
  const handleForceLogout = async (tokenId: string) => { await forceLogout(tokenId); message.success(t('online.forceLogoutSuccess')); getList() }

  // Client-side pagination
  const pageData = allData.slice((queryParams.pageNum - 1) * queryParams.pageSize, queryParams.pageNum * queryParams.pageSize)

  const columns = [
    { title: '#', width: 70, render: (_: any, __: any, index: number) => (queryParams.pageNum - 1) * queryParams.pageSize + index + 1 },
    { title: t('online.tokenId'), dataIndex: 'tokenId', width: 250, ellipsis: true },
    { title: t('online.loginName'), dataIndex: 'userName', width: 120, ellipsis: true },
    { title: t('online.host'), dataIndex: 'ipaddr', width: 150, ellipsis: true },
    { title: t('online.loginTime'), dataIndex: 'loginTime', width: 170, render: (v: string) => parseTime(v) },
    {
      title: t('operation'), width: 100, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Button type="link" size="small" danger icon={<LogoutOutlined />} onClick={() => confirmAction({ content: t('online.forceLogoutConfirm', { name: record.userName }), onOk: () => handleForceLogout(record.tokenId) })}>{t('online.forceLogout')}</Button>
      )
    }
  ]

  return (
    <div className="app-container">
      <Card style={{ marginBottom: 16 }}>
        <Form form={queryForm} onFinish={handleQuery}>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="ipaddr" label={t('online.host')}><Input placeholder={t('online.host')} allowClear /></Form.Item></Col>
            <Col span={8}><Form.Item name="userName" label={t('online.loginName')}><Input placeholder={t('online.loginName')} allowClear /></Form.Item></Col>
            <Col span={8}><Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">{t('search')}</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>{t('reset')}</Button></Space></Form.Item></Col>
          </Row>
        </Form>
      </Card>
      <Card>
        <Table rowKey="tokenId" columns={columns} dataSource={pageData} loading={loading} pagination={false} scroll={{ x: 800 }} />
        <Pagination total={allData.length} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
    </div>
  )
}
