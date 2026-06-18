import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, TreeSelect, Radio, InputNumber, Modal, Space, Card, message, Popconfirm, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { listMenu, getMenu, addMenu, updateMenu, delMenu } from '@/api/system/menu'
import { HasPermi } from '@/components/Permission'
import RightToolbar from '@/components/RightToolbar'
import { handleTree } from '@/utils/ruoyi'

export default function MenuIndex() {
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()
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
      const res: any = await listMenu(query || {})
      const data = handleTree(res.data || res.rows || [], 'menuId')
      setList(data)
      setExpandedRowKeys(data.map((d: any) => d.menuId))
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { getList() }, [getList])

  const handleQuery = () => { getList(queryForm.getFieldsValue()) }
  const resetQuery = () => { queryForm.resetFields(); getList() }
  const handleAdd = async (row?: any) => {
    form.resetFields()
    if (row) form.setFieldsValue({ parentId: row.menuId })
    setTitle('添加菜单'); setOpen(true)
  }
  const handleUpdate = async (row: any) => {
    form.resetFields(); const res: any = await getMenu(row.menuId); form.setFieldsValue(res.data || res); setTitle('修改菜单'); setOpen(true)
  }
  const handleDelete = async (row: any) => { await delMenu(row.menuId); message.success('删除成功'); getList() }
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); setSubmitting(true)
      values.menuId ? await updateMenu(values) : await addMenu(values)
      message.success(values.menuId ? '修改成功' : '新增成功'); setOpen(false); getList()
    } finally { setSubmitting(false) }
  }

  const buildTreeData = (data: any[]): any[] => {
    return [{ title: '主类目', value: 0, key: 0, children: data.map((item) => ({
      title: item.menuName, value: item.menuId, key: item.menuId,
      children: item.children ? buildTreeData(item.children) : []
    }))}]
  }

  const menuType = Form.useWatch('menuType', form)

  const columns = [
    { title: '菜单名称', dataIndex: 'menuName', width: 200 },
    { title: '图标', dataIndex: 'icon', width: 100 },
    { title: '排序', dataIndex: 'orderNum', width: 80 },
    { title: '权限标识', dataIndex: 'perms', width: 180, ellipsis: true },
    { title: '组件路径', dataIndex: 'component', width: 180, ellipsis: true },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => v === '0' ? '正常' : '停用' },
    { title: '创建时间', dataIndex: 'createTime', width: 170 },
    {
      title: '操作', width: 250, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <HasPermi permissions={['system:menu:add']}><Button type="link" size="small" icon={<PlusOutlined />} onClick={() => handleAdd(record)}>新增</Button></HasPermi>
          <HasPermi permissions={['system:menu:edit']}><Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>修改</Button></HasPermi>
          <HasPermi permissions={['system:menu:remove']}><Popconfirm title="确认删除？" onConfirm={() => handleDelete(record)}><Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm></HasPermi>
        </Space>
      )
    }
  ]

  return (
    <div className="app-container">
      {showSearch && (
        <Card style={{ marginBottom: 16 }}>
          <Form form={queryForm} layout="inline" onFinish={handleQuery}>
            <Form.Item name="menuName" label="菜单名称"><Input placeholder="请输入菜单名称" allowClear /></Form.Item>
            <Form.Item name="status" label="状态"><Select placeholder="菜单状态" allowClear style={{ width: 120 }}><Select.Option value="0">正常</Select.Option><Select.Option value="1">停用</Select.Option></Select></Form.Item>
            <Form.Item><Space><Button type="primary" icon={<SearchOutlined />} htmlType="submit">搜索</Button><Button icon={<ReloadOutlined />} onClick={resetQuery}>重置</Button></Space></Form.Item>
          </Form>
        </Card>
      )}
      <Card>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <Space><HasPermi permissions={['system:menu:add']}><Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>新增</Button></HasPermi></Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} />
        </div>
        <Table rowKey="menuId" columns={columns} dataSource={list} loading={loading} pagination={false} scroll={{ x: 1100 }}
          expandable={{ expandedRowKeys, onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as React.Key[]) }} />
      </Card>
      <Modal title={title} open={open} onOk={handleSubmit} onCancel={() => setOpen(false)} confirmLoading={submitting} width={600} destroyOnClose>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="menuId" hidden><Input /></Form.Item>
          <Form.Item name="parentId" label="上级菜单"><TreeSelect placeholder="选择上级菜单" allowClear treeData={buildTreeData(list)} treeDefaultExpandAll /></Form.Item>
          <Form.Item name="menuType" label="菜单类型" initialValue="M"><Radio.Group><Radio value="M">目录</Radio><Radio value="C">菜单</Radio><Radio value="F">按钮</Radio></Radio.Group></Form.Item>
          <Form.Item name="menuName" label="菜单名称" rules={[{ required: true, message: '请输入菜单名称' }]}><Input placeholder="请输入菜单名称" /></Form.Item>
          <Form.Item name="icon" label="菜单图标"><Input placeholder="请输入菜单图标" /></Form.Item>
          <Form.Item name="orderNum" label="显示排序" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          {menuType !== 'F' && <Form.Item name="path" label="路由地址"><Input placeholder="请输入路由地址" /></Form.Item>}
          {menuType === 'C' && <Form.Item name="component" label="组件路径"><Input placeholder="请输入组件路径" /></Form.Item>}
          {menuType !== 'M' && <Form.Item name="perms" label="权限标识"><Input placeholder="请输入权限标识" /></Form.Item>}
          <Form.Item name="status" label="状态" initialValue="0"><Radio.Group><Radio value="0">正常</Radio><Radio value="1">停用</Radio></Radio.Group></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
