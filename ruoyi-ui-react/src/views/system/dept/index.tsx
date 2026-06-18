import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, TreeSelect, Radio, InputNumber, Modal, Space, Card, message, Row, Col } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { confirmDelete } from '@/utils/confirm'
import { listDept, getDept, addDept, updateDept, delDept, listDeptExcludeChild } from '@/api/system/dept'
import { HasPermi } from '@/components/Permission'
import RightToolbar from '@/components/RightToolbar'
import DictTag from '@/components/DictTag'
import { useDict } from '@/utils/dict'
import { parseTime, handleTree } from '@/utils/ruoyi'

export default function DeptIndex() {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()
  const dict = useDict('sys_normal_disable')
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showSearch, setShowSearch] = useState(true)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([])

  const getList = useCallback(async (query?: any) => {
    setLoading(true)
    try {
      const res: any = await listDept(query || {})
      const data = handleTree(res.data || res.rows || [], 'deptId')
      setList(data)
      setExpandedRowKeys(data.map((d: any) => d.deptId))
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { getList() }, [getList])

  const handleQuery = () => { getList(queryForm.getFieldsValue()) }
  const resetQuery = () => { queryForm.resetFields(); getList() }

  const handleAdd = async (row?: any) => {
    form.resetFields()
    if (row) {
      form.setFieldsValue({ parentId: row.deptId })
    }
    setTitle(t('dept.addDept'))
    setOpen(true)
  }

  const handleUpdate = async (row: any) => {
    form.resetFields()
    const res: any = await getDept(row.deptId)
    const data = res.data || res
    form.setFieldsValue(data)
    setTitle(t('dept.editDept'))
    setOpen(true)
  }

  const handleDelete = async (row: any) => {
    await delDept(row.deptId); message.success(t('deleteSuccess')); getList()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); setSubmitting(true)
      values.deptId ? await updateDept(values) : await addDept(values)
      message.success(values.deptId ? t('editSuccess') : t('addSuccess')); setOpen(false); getList()
    } finally { setSubmitting(false) }
  }

  // 构造部门树选择器数据
  const buildTreeData = (data: any[]): any[] => {
    return data.map((item) => ({
      title: item.deptName,
      value: item.deptId,
      key: item.deptId,
      children: item.children ? buildTreeData(item.children) : []
    }))
  }

  const columns = [
    { title: t('dept.deptName'), dataIndex: 'deptName', width: 260 },
    { title: t('dept.sort'), dataIndex: 'orderNum', width: 100 },
    { title: t('status'), dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_normal_disable || []} value={v} /> },
    { title: t('createTime'), dataIndex: 'createTime', width: 170, render: (v: string) => parseTime(v) },
    {
      title: t('operation'), width: 250, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <HasPermi permissions={['system:dept:add']}><Button type="link" size="small" icon={<PlusOutlined />} onClick={() => handleAdd(record)}>{t('add')}</Button></HasPermi>
          <HasPermi permissions={['system:dept:edit']}><Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>{t('edit')}</Button></HasPermi>
          <HasPermi permissions={['system:dept:remove']}><Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete({ onOk: () => handleDelete(record) })}>{t('delete')}</Button></HasPermi>
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
              <Col span={8}><Form.Item name="deptName" label={t('dept.deptName')}><Input placeholder={t('dept.deptName')} allowClear /></Form.Item></Col>
              <Col span={8}><Form.Item name="status" label={t('status')}>
                <Select placeholder={t('status')} allowClear style={{ width: '100%' }}>{(dict.sys_normal_disable || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
              </Form.Item></Col>
              <Col span={8}><Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">{t('search')}</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>{t('reset')}</Button></Space></Form.Item></Col>
            </Row>
          </Form>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: showSearch ? '1px solid #f0f0f0' : 'none', paddingTop: showSearch ? 12 : 0 }}>
          <Space>
            <HasPermi permissions={['system:dept:add']}><Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>{t('add')}</Button></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} exportUrl="/system/dept/list/export" exportParams={{}} exportFilename="部门数据.xlsx" />
        </div>
      </Card>
      <Card>
        <Table rowKey="deptId" columns={columns} dataSource={list} loading={loading} pagination={false} scroll={{ x: 900 }}
          expandable={{ expandedRowKeys, onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as React.Key[]) }} />
      </Card>
      <Modal title={title} open={open} onOk={handleSubmit} onCancel={() => setOpen(false)} confirmLoading={submitting} width={550} destroyOnHidden>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="deptId" hidden><Input /></Form.Item>
          <Form.Item name="parentId" label={t('dept.parentDept')}>
            <TreeSelect placeholder={t('dept.parentDept')} allowClear treeData={buildTreeData(list)} treeDefaultExpandAll />
          </Form.Item>
          <Form.Item name="deptName" label={t('dept.deptName')} rules={[{ required: true, message: t('dept.deptName') }]}><Input placeholder={t('dept.deptName')} /></Form.Item>
          <Form.Item name="orderNum" label={t('dept.sort')} rules={[{ required: true, message: t('dept.sort') }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="leader" label={t('dept.leader')}><Input placeholder={t('dept.leader')} /></Form.Item>
          <Form.Item name="phone" label={t('dept.phone')}><Input placeholder={t('dept.phone')} /></Form.Item>
          <Form.Item name="email" label={t('user.email')}><Input placeholder={t('user.email')} /></Form.Item>
          <Form.Item name="status" label={t('status')} initialValue="0"><Radio.Group>{(dict.sys_normal_disable || []).map((i: any) => <Radio key={i.value} value={i.value}>{i.label}</Radio>)}</Radio.Group></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
