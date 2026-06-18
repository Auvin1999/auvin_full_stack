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
import { useTranslation } from 'react-i18next'

export default function JobLogIndex() {
  const { t } = useTranslation()
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
    if (!ids.length) { message.warning(t('pleaseSelectData')); return }
    await delJobLog(ids.join(',')); message.success(t('deleteSuccess')); getList()
  }
  const handleClean = async () => { await cleanJobLog(); message.success(t('deleteSuccess')); getList() }

  const columns = [
    { title: t('jobLog.jobLogId'), dataIndex: 'jobLogId', width: 100 },
    { title: t('job.jobName'), dataIndex: 'jobName', width: 180, ellipsis: true },
    { title: t('job.jobGroup'), dataIndex: 'jobGroup', width: 120, render: (v: string) => <DictTag options={dict.sys_job_group || []} value={v} /> },
    { title: t('jobLog.invokeTarget'), dataIndex: 'invokeTarget', width: 200, ellipsis: true },
    { title: t('jobLog.jobMessage'), dataIndex: 'jobMessage', width: 200, ellipsis: true },
    { title: t('jobLog.execStatus'), dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_common_status || []} value={v} /> },
    { title: t('jobLog.execTime'), dataIndex: 'createTime', width: 170, render: (v: string) => parseTime(v) },
    {
      title: t('operation'), width: 100, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <HasPermi permissions={['monitor:job:remove']}>
          <Popconfirm title={t('confirmDelete')} onConfirm={() => handleDelete(record)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>{t('delete')}</Button>
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
            <Form.Item name="jobName" label={t('job.jobName')}><Input placeholder={t('job.jobName')} allowClear /></Form.Item>
            <Form.Item name="jobGroup" label={t('job.jobGroup')}>
              <Select placeholder={t('job.jobGroup')} allowClear style={{ width: 120 }}>{(dict.sys_job_group || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item name="status" label={t('jobLog.execStatus')}>
              <Select placeholder={t('jobLog.execStatus')} allowClear style={{ width: 120 }}>{(dict.sys_common_status || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">{t('search')}</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>{t('reset')}</Button></Space></Form.Item>
          </Form>
        </Card>
      )}
      <Card>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <Space>
            <HasPermi permissions={['monitor:job:remove']}><Popconfirm title={t('confirmDelete')} onConfirm={() => handleDelete()} disabled={!selectedRowKeys.length}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length}>{t('delete')}</Button></Popconfirm></HasPermi>
            <HasPermi permissions={['monitor:job:remove']}><Button type="default" danger icon={<ClearOutlined />} onClick={handleClean}>{t('clean')}</Button></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} />
        </div>
        <Table rowKey="jobLogId" columns={columns} dataSource={dataList} loading={loading} pagination={false} scroll={{ x: 1100 }} rowSelection={{ selectedRowKeys, onChange: (k) => setSelectedRowKeys(k as number[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
    </div>
  )
}
