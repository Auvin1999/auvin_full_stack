import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Form, Input, Select, Radio, InputNumber, Modal, Space, Card, message, Popconfirm, Tree } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { listRole, getRole, addRole, updateRole, delRole } from '@/api/system/role'
import { treeselect as menuTreeselect, roleMenuTreeselect } from '@/api/system/menu'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import DictTag from '@/components/DictTag'
import { useDict } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'

export default function RoleIndex() {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()
  const dict = useDict('sys_normal_disable')
  const [list, setList] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [queryParams, setQueryParams] = useState<any>({ pageNum: 1, pageSize: 10 })
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // 菜单权限树
  const [menuTreeData, setMenuTreeData] = useState<any[]>([])
  const [menuCheckedKeys, setMenuCheckedKeys] = useState<number[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentRoleId, setCurrentRoleId] = useState<number | null>(null)

  const getList = useCallback(async () => {
    setLoading(true)
    try { const res: any = await listRole(queryParams); setList(res.rows || []); setTotal(res.total || 0) } finally { setLoading(false) }
  }, [queryParams])

  useEffect(() => { getList() }, [getList])

  const handleQuery = () => { setQueryParams((p: any) => ({ ...p, ...queryForm.getFieldsValue(), pageNum: 1 })) }
  const resetQuery = () => { queryForm.resetFields(); setQueryParams({ pageNum: 1, pageSize: 10 }) }
  const handlePagination = (page: number, pageSize: number) => { setQueryParams((p: any) => ({ ...p, pageNum: page, pageSize })) }
  const handleAdd = () => { form.resetFields(); setTitle(t('role.addRole')); setOpen(true) }
  const handleUpdate = async (row: any) => {
    form.resetFields(); const res: any = await getRole(row.roleId); form.setFieldsValue(res.data || res); setTitle(t('role.editRole')); setOpen(true)
  }
  const handleDelete = async (row?: any) => {
    const ids = row ? [row.roleId] : selectedRowKeys
    if (!ids.length) { message.warning(t('pleaseSelectData')); return }
    await delRole(ids.join(',')); message.success(t('deleteSuccess')); getList()
  }
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); setSubmitting(true)
      values.roleId ? await updateRole(values) : await addRole(values)
      message.success(values.roleId ? t('editSuccess') : t('addSuccess')); setOpen(false); getList()
    } finally { setSubmitting(false) }
  }

  /** 打开菜单权限弹窗 */
  const handleMenuPerm = async (row: any) => {
    setCurrentRoleId(row.roleId)
    const [treeRes, roleMenuRes]: any[] = await Promise.all([menuTreeselect(), roleMenuTreeselect(row.roleId)])
    setMenuTreeData(treeRes.data || treeRes.menus || [])
    setMenuCheckedKeys(roleMenuRes.checkedKeys || roleMenuRes.menus?.filter((m: any) => m.checked).map((m: any) => m.id) || [])
    setMenuOpen(true)
  }

  const columns = [
    { title: t('role.roleId'), dataIndex: 'roleId', width: 100 },
    { title: t('role.roleName'), dataIndex: 'roleName', width: 150 },
    { title: t('role.roleKey'), dataIndex: 'roleKey', width: 150 },
    { title: t('role.roleSort'), dataIndex: 'roleSort', width: 100 },
    { title: t('status'), dataIndex: 'status', width: 100, render: (v: string) => <DictTag options={dict.sys_normal_disable || []} value={v} /> },
    { title: t('createTime'), dataIndex: 'createTime', width: 170, render: (v: string) => parseTime(v) },
    {
      title: t('operation'), width: 260, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <HasPermi permissions={['system:role:edit']}><Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>{t('edit')}</Button></HasPermi>
          <HasPermi permissions={['system:role:remove']}><Popconfirm title={t('confirmDelete')} onConfirm={() => handleDelete(record)}><Button type="link" size="small" danger icon={<DeleteOutlined />}>{t('delete')}</Button></Popconfirm></HasPermi>
          <HasPermi permissions={['system:role:edit']}><Button type="link" size="small" onClick={() => handleMenuPerm(record)}>{t('role.menuPerm')}</Button></HasPermi>
        </Space>
      )
    }
  ]

  return (
    <div className="app-container">
      {showSearch && (
        <Card style={{ marginBottom: 16 }}>
          <Form form={queryForm} layout="inline" onFinish={handleQuery}>
            <Form.Item name="roleName" label={t('role.roleName')}><Input placeholder={t('role.roleName')} allowClear /></Form.Item>
            <Form.Item name="roleKey" label={t('role.roleKey')}><Input placeholder={t('role.roleKey')} allowClear /></Form.Item>
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
            <HasPermi permissions={['system:role:add']}><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>{t('add')}</Button></HasPermi>
            <HasPermi permissions={['system:role:remove']}><Popconfirm title={t('confirmDelete')} onConfirm={() => handleDelete()} disabled={!selectedRowKeys.length}><Button type="default" danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length}>{t('delete')}</Button></Popconfirm></HasPermi>
          </Space>
          <RightToolbar showSearch={showSearch} onToggleSearch={() => setShowSearch(!showSearch)} onRefresh={getList} />
        </div>
        <Table rowKey="roleId" columns={columns} dataSource={list} loading={loading} pagination={false} scroll={{ x: 1000 }} rowSelection={{ selectedRowKeys, onChange: (k) => setSelectedRowKeys(k as number[]) }} />
        <Pagination total={total} page={queryParams.pageNum} limit={queryParams.pageSize} onChange={handlePagination} />
      </Card>
      {/* 新增/编辑弹窗 */}
      <Modal title={title} open={open} onOk={handleSubmit} onCancel={() => setOpen(false)} confirmLoading={submitting} width={550} destroyOnClose>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="roleId" hidden><Input /></Form.Item>
          <Form.Item name="roleName" label={t('role.roleName')} rules={[{ required: true, message: t('role.roleName') }]}><Input placeholder={t('role.roleName')} /></Form.Item>
          <Form.Item name="roleKey" label={t('role.roleKey')} rules={[{ required: true, message: t('role.roleKey') }]}><Input placeholder={t('role.roleKey')} /></Form.Item>
          <Form.Item name="roleSort" label={t('role.roleSort')} rules={[{ required: true, message: t('role.roleSort') }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="status" label={t('status')} initialValue="0"><Radio.Group>{(dict.sys_normal_disable || []).map((i: any) => <Radio key={i.value} value={i.value}>{i.label}</Radio>)}</Radio.Group></Form.Item>
          <Form.Item name="remark" label={t('remark')}><Input.TextArea rows={3} placeholder={t('remark')} /></Form.Item>
        </Form>
      </Modal>
      {/* 菜单权限弹窗 */}
      <Modal title={t('role.menuPerm')} open={menuOpen} onCancel={() => setMenuOpen(false)} width={500}
        onOk={() => { message.success(t('role.menuPermUpdateSuccess')); setMenuOpen(false) }}>
        <Tree checkable defaultExpandAll treeData={menuTreeData} checkedKeys={menuCheckedKeys}
          onCheck={(keys: any) => setMenuCheckedKeys(keys as number[])} fieldNames={{ title: 'label', key: 'id', children: 'children' }} />
      </Modal>
    </div>
  )
}
