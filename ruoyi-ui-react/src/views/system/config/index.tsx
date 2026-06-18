import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, Radio, Modal, Space, Card, message, DatePicker, Row, Col } from 'antd'
import dayjs from 'dayjs'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { listConfig, getConfig, addConfig, updateConfig, delConfig, refreshCache as refreshCacheApi } from '@/api/system/config'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import DictTag from '@/components/DictTag'
import { useDict } from '@/utils/dict'
import { parseTime, addDateRange } from '@/utils/ruoyi'
import { useTranslation } from 'react-i18next'
import { confirmDelete } from '@/utils/confirm'

export default function ConfigIndex() {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()
  const dict = useDict('sys_yes_no')
  const [list, setList] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [queryParams, setQueryParams] = useState<any>({ pageNum: 1, pageSize: 10 })
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [dateRange, setDateRange] = useState<string[]>([])

  const getList = useCallback(async () => {
    setLoading(true)
    try { const res: any = await listConfig(addDateRange(queryParams, dateRange)); setList(res.rows || []); setTotal(res.total || 0) } finally { setLoading(false) }
  }, [queryParams, dateRange])

  useEffect(() => { getList() }, [getList])

  const handleQuery = () => { setQueryParams((p: any) => ({ ...p, ...queryForm.getFieldsValue(), pageNum: 1 })) }
  const resetQuery = () => { setDateRange([]); queryForm.resetFields(); setQueryParams({ pageNum: 1, pageSize: 10 }) }
  const handlePagination = (page: number, pageSize: number) => { setQueryParams((p: any) => ({ ...p, pageNum: page, pageSize })) }
  const handleAdd = () => { form.resetFields(); setTitle(t('configMgmt.addConfig')); setOpen(true) }
  const handleUpdate = async (row: any) => {
    form.resetFields(); const res: any = await getConfig(row.configId); form.setFieldsValue(res.data || res); setTitle(t('configMgmt.editConfig')); setOpen(true)
  }
  const handleDelete = async (row?: any) => {
    const ids = row ? [row.configId] : selectedRowKeys
    if (!ids.length) { message.warning(t('pleaseSelectData')); return }
    await delConfig(ids.join(',')); message.success(t('deleteSuccess')); getList()
  }
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); setSubmitting(true)
      values.configId ? await updateConfig(values) : await addConfig(values)
      message.success(values.configId ? t('editSuccess') : t('addSuccess')); setOpen(false); getList()
    } finally { setSubmitting(false) }
  }
  const handleRefreshCache = async () => { await refreshCacheApi(); message.success(t('refreshCache')) }

  const columns = [
    { title: t('configMgmt.configId'), dataIndex: 'configId', width: 100 },
    { title: t('configMgmt.configName'), dataIndex: 'configName', width: 200, ellipsis: true },
    { title: t('configMgmt.configKey'), dataIndex: 'configKey', width: 200, ellipsis: true },
    { title: t('configMgmt.configValue'), dataIndex: 'configValue', width: 150, ellipsis: true },
    { title: t('configMgmt.systemBuiltIn'), dataIndex: 'configType', width: 100, render: (v: string) => <DictTag options={dict.sys_yes_no || []} value={v} /> },
    { title: t('remark'), dataIndex: 'remark', width: 150, ellipsis: true },
    { title: t('createTime'), dataIndex: 'createTime', width: 170, render: (v: string) => parseTime(v) },
    {
      title: t('operation'), width: 180, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <HasPermi permissions={['system:config:edit']}><Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>{t('edit')}</Button></HasPermi>
          <HasPermi permissions={['system:config:remove']}><Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete({ onOk: () => handleDelete(record) })}>{t('delete')}</Button></HasPermi>
        </Space>
      )
    }
  ]

  return (
    <div className="app-container">
      <Card style={{ marginBottom: 16 }}>
        {showSearch && (
          <Form form={queryForm} onFinish={handleQuery}>
            <Row gutter={16}>
              <Col span={8}><Form.Item name="configName" label={t('configMgmt.configName')}><Input placeholder={t('configMgmt.configName')} allowClear /></Form.Item></Col>
              <Col span={8}><Form.Item name="configKey" label={t('configMgmt.configKey')}><Input placeholder={t('configMgmt.configKey')} allowClear /></Form.Item></Col>
              <Col span={8}><Form.Item name="configType" label={t('configMgmt.systemBuiltIn')}>
                <Select placeholder={t('configMgmt.systemBuiltIn')} allowClear style={{ width: '100%' }}>{(dict.sys_yes_no || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
              </Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}><Form.Item label={t('createTime')}>
                <DatePicker.RangePicker
                  value={dateRange.length === 2 ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : undefined}
                  onChange={(dates) => {
                    if (dates) {
                      setDateRange([dates[0]!.format('YYYY-MM-DD'), dates[1]!.format('YYYY-MM-DD')])
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
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: showSearch ? '1px solid #f0f0f0' : 'none', paddingTop: showSearch ? 12 : 0 }}>
          <Space>
            <HasPermi permissions={['system:config:add']}><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>{t('add')}</Button></HasPermi>
            <HasPermi permissions={['system:config:remove']}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length} onClick={() => { if (selectedRowKeys.length) confirmDelete({ onOk: () => handleDelete() }) }}>{t('delete')}</Button></HasPermi>
            <HasPermi permissions={['system:config:edit']}><Button type="default" onClick={handleRefreshCache}>{t('refreshCache')}</Button></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} exportUrl="/system/config/export" exportParams={queryParams} exportFilename="参数数据.xlsx" />
        </div>
      </Card>
      <Card>
        <Table rowKey="configId" columns={columns} dataSource={list} loading={loading} pagination={false} scroll={{ x: 1100 }} rowSelection={{ selectedRowKeys, onChange: (k) => setSelectedRowKeys(k as number[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
      <Modal title={title} open={open} onOk={handleSubmit} onCancel={() => setOpen(false)} confirmLoading={submitting} width={550} destroyOnHidden>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="configId" hidden><Input /></Form.Item>
          <Form.Item name="configName" label={t('configMgmt.configName')} rules={[{ required: true, message: t('configMgmt.configName') }]}><Input placeholder={t('configMgmt.configName')} /></Form.Item>
          <Form.Item name="configKey" label={t('configMgmt.configKey')} rules={[{ required: true, message: t('configMgmt.configKey') }]}><Input placeholder={t('configMgmt.configKey')} /></Form.Item>
          <Form.Item name="configValue" label={t('configMgmt.configValue')} rules={[{ required: true, message: t('configMgmt.configValue') }]}><Input.TextArea rows={3} placeholder={t('configMgmt.configValue')} /></Form.Item>
          <Form.Item name="configType" label={t('configMgmt.systemBuiltIn')} initialValue="Y"><Radio.Group>{(dict.sys_yes_no || []).map((i: any) => <Radio key={i.value} value={i.value}>{i.label}</Radio>)}</Radio.Group></Form.Item>
          <Form.Item name="remark" label={t('remark')}><Input.TextArea rows={3} placeholder={t('remark')} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
