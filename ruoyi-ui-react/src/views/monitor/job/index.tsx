import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, Radio, Modal, Space, Card, message, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, CaretRightOutlined } from '@ant-design/icons'
import { listJob, getJob, addJob, updateJob, delJob, changeJobStatus, runJob } from '@/api/monitor/job'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import DictTag from '@/components/DictTag'
import { useDict } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { useTranslation } from 'react-i18next'
import { confirmDelete } from '@/utils/confirm'

export default function JobIndex() {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()
  const dict = useDict('sys_job_group', 'sys_normal_disable')
  const [list, setList] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [queryParams, setQueryParams] = useState<any>({ pageNum: 1, pageSize: 10 })
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const getList = useCallback(async () => {
    setLoading(true)
    try { const res: any = await listJob(queryParams); setList(res.rows || []); setTotal(res.total || 0) } finally { setLoading(false) }
  }, [queryParams])

  useEffect(() => { getList() }, [getList])

  const handleQuery = () => { setQueryParams((p: any) => ({ ...p, ...queryForm.getFieldsValue(), pageNum: 1 })) }
  const resetQuery = () => { queryForm.resetFields(); setQueryParams({ pageNum: 1, pageSize: 10 }) }
  const handlePagination = (page: number, pageSize: number) => { setQueryParams((p: any) => ({ ...p, pageNum: page, pageSize })) }
  const handleAdd = () => { form.resetFields(); setTitle(t('job.addJob')); setOpen(true) }
  const handleUpdate = async (row: any) => {
    form.resetFields(); const res: any = await getJob(row.jobId); form.setFieldsValue(res.data || res); setTitle(t('job.editJob')); setOpen(true)
  }
  const handleDelete = async (row?: any) => {
    const ids = row ? [row.jobId] : selectedRowKeys
    if (!ids.length) { message.warning(t('pleaseSelectData')); return }
    await delJob(ids.join(',')); message.success(t('deleteSuccess')); getList()
  }
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); setSubmitting(true)
      values.jobId ? await updateJob(values) : await addJob(values)
      message.success(values.jobId ? t('editSuccess') : t('addSuccess')); setOpen(false); getList()
    } finally { setSubmitting(false) }
  }
  const handleStatusChange = async (row: any) => {
    const newStatus = row.status === '0' ? '1' : '0'
    await changeJobStatus(row.jobId, newStatus); message.success(t('editSuccess')); getList()
  }
  const handleRun = async (row: any) => {
    await runJob(row.jobId, row.jobGroup); message.success(t('editSuccess'))
  }

  const columns = [
    { title: t('job.jobId'), dataIndex: 'jobId', width: 100 },
    { title: t('job.jobName'), dataIndex: 'jobName', width: 200, ellipsis: true },
    { title: t('job.jobGroup'), dataIndex: 'jobGroup', width: 120, render: (v: string) => <DictTag options={dict.sys_job_group || []} value={v} /> },
    { title: t('job.invokeTarget'), dataIndex: 'invokeTarget', width: 200, ellipsis: true },
    { title: t('job.cronExpression'), dataIndex: 'cronExpression', width: 150 },
    { title: t('status'), dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_normal_disable || []} value={v} /> },
    {
      title: t('operation'), width: 280, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <HasPermi permissions={['monitor:job:changeStatus']}><Button type="link" size="small" onClick={() => handleStatusChange(record)}>{record.status === '0' ? t('job.pause') : t('job.resume')}</Button></HasPermi>
          <HasPermi permissions={['monitor:job:edit']}><Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>{t('edit')}</Button></HasPermi>
          <HasPermi permissions={['monitor:job:remove']}><Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete({ onOk: () => handleDelete(record) })}>{t('delete')}</Button></HasPermi>
          <HasPermi permissions={['monitor:job:changeStatus']}><Button type="link" size="small" icon={<CaretRightOutlined />} onClick={() => handleRun(record)}>{t('job.runOnce')}</Button></HasPermi>
        </Space>
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
              <Select placeholder={t('pleaseSelect')} allowClear style={{ width: 120 }}>{(dict.sys_job_group || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item name="status" label={t('status')}>
              <Select placeholder={t('status')} allowClear style={{ width: 120 }}>{(dict.sys_normal_disable || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">{t('search')}</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>{t('reset')}</Button></Space></Form.Item>
          </Form>
        </Card>
      )}
      <Card>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <Space>
            <HasPermi permissions={['monitor:job:add']}><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>{t('add')}</Button></HasPermi>
            <HasPermi permissions={['monitor:job:remove']}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length} onClick={() => { if (selectedRowKeys.length) confirmDelete({ onOk: () => handleDelete() }) }}>{t('delete')}</Button></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} exportUrl="/schedule/job/export" exportParams={queryParams} exportFilename="任务数据.xlsx" />
        </div>
        <Table rowKey="jobId" columns={columns} dataSource={list} loading={loading} pagination={false} scroll={{ x: 1200 }} rowSelection={{ selectedRowKeys, onChange: (k) => setSelectedRowKeys(k as number[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
      <Modal title={title} open={open} onOk={handleSubmit} onCancel={() => setOpen(false)} confirmLoading={submitting} width={600} destroyOnClose>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="jobId" hidden><Input /></Form.Item>
          <Form.Item name="jobName" label={t('job.jobName')} rules={[{ required: true, message: t('job.jobName') }]}><Input placeholder={t('job.jobName')} /></Form.Item>
          <Form.Item name="jobGroup" label={t('job.jobGroup')} rules={[{ required: true, message: t('pleaseSelect') + t('job.jobGroup') }]}>
            <Select placeholder={t('pleaseSelect')}>{(dict.sys_job_group || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="invokeTarget" label={t('job.invokeTarget')} rules={[{ required: true, message: t('job.invokeTarget') }]}><Input placeholder={t('job.invokeTarget')} /></Form.Item>
          <Form.Item name="cronExpression" label={t('job.cronExpression')} rules={[{ required: true, message: t('job.cronExpression') }]}><Input placeholder={t('job.cronExpression')} /></Form.Item>
          <Form.Item name="status" label={t('status')} initialValue="0"><Radio.Group>{(dict.sys_normal_disable || []).map((i: any) => <Radio key={i.value} value={i.value}>{i.label}</Radio>)}</Radio.Group></Form.Item>
          <Form.Item name="misfirePolicy" label={t('job.misfirePolicy')} initialValue="1"><Radio.Group><Radio value="1">{t('job.immediate')}</Radio><Radio value="2">{t('job.executeOnce')}</Radio><Radio value="3">{t('job.abandon')}</Radio></Radio.Group></Form.Item>
          <Form.Item name="concurrent" label={t('job.concurrent')} initialValue="1"><Radio.Group><Radio value="1">{t('job.allow')}</Radio><Radio value="0">{t('job.forbid')}</Radio></Radio.Group></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
