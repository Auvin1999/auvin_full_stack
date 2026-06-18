import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, TreeSelect, Radio, InputNumber, Modal, Space, Card, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { listDept, getDept, addDept, updateDept, delDept, listDeptExcludeChild } from '@/api/system/dept'
import { HasPermi } from '@/components/Permission'
import RightToolbar from '@/components/RightToolbar'
import DictTag from '@/components/DictTag'
import { useDict } from '@/utils/dict'
import { parseTime, handleTree } from '@/utils/ruoyi'

export default function DeptIndex() {
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
    setTitle('添加部门')
    setOpen(true)
  }

  const handleUpdate = async (row: any) => {
    form.resetFields()
    const res: any = await getDept(row.deptId)
    const data = res.data || res
    form.setFieldsValue(data)
    setTitle('修改部门')
    setOpen(true)
  }

  const handleDelete = async (row: any) => {
    await delDept(row.deptId); message.success('删除成功'); getList()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); setSubmitting(true)
      values.deptId ? await updateDept(values) : await addDept(values)
      message.success(values.deptId ? '修改成功' : '新增成功'); setOpen(false); getList()
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
    { title: '部门名称', dataIndex: 'deptName', width: 260 },
    { title: '排序', dataIndex: 'orderNum', width: 100 },
    { title: '状态', dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_normal_disable || []} value={v} /> },
    { title: '创建时间', dataIndex: 'createTime', width: 170, render: (v: string) => parseTime(v) },
    {
      title: '操作', width: 250, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <HasPermi permissions={['system:dept:add']}><Button type="link" size="small" icon={<PlusOutlined />} onClick={() => handleAdd(record)}>新增</Button></HasPermi>
          <HasPermi permissions={['system:dept:edit']}><Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>修改</Button></HasPermi>
          <HasPermi permissions={['system:dept:remove']}><Popconfirm title="确认删除？" onConfirm={() => handleDelete(record)}><Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm></HasPermi>
        </Space>
      )
    }
  ]

  return (
    <div className="app-container">
      {showSearch && (
        <Card style={{ marginBottom: 16 }}>
          <Form form={queryForm} layout="inline" onFinish={handleQuery}>
            <Form.Item name="deptName" label="部门名称"><Input placeholder="请输入部门名称" allowClear /></Form.Item>
            <Form.Item name="status" label="状态">
              <Select placeholder="部门状态" allowClear style={{ width: 120 }}>{(dict.sys_normal_disable || []).map((i: any) => <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>)}</Select>
            </Form.Item>
            <Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">搜索</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>重置</Button></Space></Form.Item>
          </Form>
        </Card>
      )}
      <Card>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <Space>
            <HasPermi permissions={['system:dept:add']}><Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>新增</Button></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} />
        </div>
        <Table rowKey="deptId" columns={columns} dataSource={list} loading={loading} pagination={false} scroll={{ x: 900 }}
          expandable={{ expandedRowKeys, onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as React.Key[]) }} />
      </Card>
      <Modal title={title} open={open} onOk={handleSubmit} onCancel={() => setOpen(false)} confirmLoading={submitting} width={550} destroyOnClose>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="deptId" hidden><Input /></Form.Item>
          <Form.Item name="parentId" label="上级部门">
            <TreeSelect placeholder="请选择上级部门" allowClear treeData={buildTreeData(list)} treeDefaultExpandAll />
          </Form.Item>
          <Form.Item name="deptName" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }]}><Input placeholder="请输入部门名称" /></Form.Item>
          <Form.Item name="orderNum" label="显示排序" rules={[{ required: true, message: '请输入排序' }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="leader" label="负责人"><Input placeholder="请输入负责人" /></Form.Item>
          <Form.Item name="phone" label="联系电话"><Input placeholder="请输入联系电话" /></Form.Item>
          <Form.Item name="email" label="邮箱"><Input placeholder="请输入邮箱" /></Form.Item>
          <Form.Item name="status" label="状态" initialValue="0"><Radio.Group>{(dict.sys_normal_disable || []).map((i: any) => <Radio key={i.value} value={i.value}>{i.label}</Radio>)}</Radio.Group></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
