import { useState, useEffect, useCallback } from 'react'
import {
  Table, Button, Form, Input, Select, Switch, Modal, Space, Row, Col,
  message, Popconfirm, Card, DatePicker, TreeSelect, InputNumber
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  ReloadOutlined, KeyOutlined
} from '@ant-design/icons'
import { listUser, getUser, addUser, updateUser, delUser, resetUserPwd, changeUserStatus } from '@/api/system/user'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import { useDict } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'

const { RangePicker } = DatePicker

interface UserRecord {
  userId: number
  userName: string
  nickName: string
  dept?: { deptName: string }
  deptId?: number
  phone: string
  email: string
  sex: string
  status: string
  createTime: string
  remark?: string
  postIds?: number[]
  roleIds?: number[]
}

interface QueryParams {
  pageNum: number
  pageSize: number
  userName?: string
  phone?: string
  status?: string
  dateRange?: string[]
  deptId?: number
}

export default function UserIndex() {
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()

  // 字典数据
  const dict = useDict('sys_normal_disable', 'sys_user_sex')

  // 列表状态
  const [userList, setUserList] = useState<UserRecord[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(true)

  // 查询参数
  const [queryParams, setQueryParams] = useState<QueryParams>({
    pageNum: 1,
    pageSize: 10
  })

  // 弹窗状态
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  /** 获取用户列表 */
  const getList = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await listUser(queryParams)
      setUserList(res.rows || [])
      setTotal(res.total || 0)
    } catch {
      // error handled by request interceptor
    } finally {
      setLoading(false)
    }
  }, [queryParams])

  useEffect(() => {
    getList()
  }, [getList])

  /** 搜索 */
  const handleQuery = () => {
    const values = queryForm.getFieldsValue()
    setQueryParams((prev) => ({ ...prev, ...values, pageNum: 1 }))
  }

  /** 重置 */
  const resetQuery = () => {
    queryForm.resetFields()
    setQueryParams({ pageNum: 1, pageSize: 10 })
  }

  /** 分页变化 */
  const handlePagination = (page: number, pageSize: number) => {
    setQueryParams((prev) => ({ ...prev, pageNum: page, pageSize }))
  }

  /** 新增 */
  const handleAdd = () => {
    form.resetFields()
    setTitle('添加用户')
    setOpen(true)
  }

  /** 编辑 */
  const handleUpdate = async (row: UserRecord) => {
    form.resetFields()
    try {
      const res: any = await getUser(row.userId)
      const data = res.data || res
      form.setFieldsValue({
        userId: data.userId,
        userName: data.userName,
        nickName: data.nickName,
        phone: data.phone,
        email: data.email,
        sex: data.sex,
        status: data.status,
        remark: data.remark,
        deptId: data.deptId,
      })
      setTitle('修改用户')
      setOpen(true)
    } catch {
      // handled
    }
  }

  /** 删除 */
  const handleDelete = async (row?: UserRecord) => {
    const ids = row ? [row.userId] : selectedRowKeys
    if (ids.length === 0) {
      message.warning('请选择要删除的数据')
      return
    }
    try {
      await delUser(ids.join(','))
      message.success('删除成功')
      getList()
    } catch {
      // handled
    }
  }

  /** 提交表单 */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      if (values.userId) {
        await updateUser(values)
        message.success('修改成功')
      } else {
        await addUser(values)
        message.success('新增成功')
      }
      setOpen(false)
      getList()
    } catch {
      // validation or API error
    } finally {
      setSubmitting(false)
    }
  }

  /** 重置密码 */
  const handleResetPwd = async (row: UserRecord) => {
    try {
      await resetUserPwd(row.userId, 'admin123')
      message.success(`密码已重置为 admin123`)
    } catch {
      // handled
    }
  }

  /** 状态切换 */
  const handleStatusChange = async (row: UserRecord, checked: boolean) => {
    const status = checked ? '0' : '1'
    try {
      await changeUserStatus(row.userId, status)
      row.status = status
      message.success('状态修改成功')
      getList()
    } catch {
      // handled
    }
  }

  const columns = [
    { title: '用户编号', dataIndex: 'userId', width: 80 },
    { title: '用户名称', dataIndex: 'userName', width: 120 },
    { title: '用户昵称', dataIndex: 'nickName', width: 120 },
    { title: '部门', dataIndex: ['dept', 'deptName'], width: 120 },
    { title: '手机号码', dataIndex: 'phone', width: 130 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_: any, record: UserRecord) => (
        <Switch
          checked={record.status === '0'}
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 170,
      render: (text: string) => parseTime(text)
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: UserRecord) => (
        <Space size="small">
          <HasPermi permissions={['system:user:edit']}>
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>
              修改
            </Button>
          </HasPermi>
          <HasPermi permissions={['system:user:remove']}>
            <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </HasPermi>
          <HasPermi permissions={['system:user:resetPwd']}>
            <Popconfirm title="确认重置密码为 admin123？" onConfirm={() => handleResetPwd(record)}>
              <Button type="link" size="small" icon={<KeyOutlined />}>
                重置
              </Button>
            </Popconfirm>
          </HasPermi>
        </Space>
      )
    }
  ]

  return (
    <div className="app-container">
      {/* 搜索区域 */}
      {showSearch && (
        <Card style={{ marginBottom: 16 }}>
          <Form form={queryForm} layout="inline" onFinish={handleQuery}>
            <Form.Item name="userName" label="用户名称">
              <Input placeholder="请输入用户名称" allowClear />
            </Form.Item>
            <Form.Item name="phone" label="手机号码">
              <Input placeholder="请输入手机号码" allowClear />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select placeholder="用户状态" allowClear style={{ width: 150 }}>
                {(dict.sys_normal_disable || []).map((item) => (
                  <Select.Option key={item.value} value={item.value}>{item.label}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit">搜索</Button>
                <Button icon={<ReloadOutlined />} onClick={resetQuery}>重置</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* 工具栏 */}
      <Card>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <Space>
            <HasPermi permissions={['system:user:add']}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button>
            </HasPermi>
            <HasPermi permissions={['system:user:edit']}>
              <Button
                type="default"
                icon={<EditOutlined />}
                disabled={selectedRowKeys.length !== 1}
                onClick={() => {
                  const record = userList.find((u) => u.userId === selectedRowKeys[0])
                  if (record) handleUpdate(record)
                }}
              >修改</Button>
            </HasPermi>
            <HasPermi permissions={['system:user:remove']}>
              <Popconfirm title="确认删除选中的数据？" onConfirm={() => handleDelete()} disabled={selectedRowKeys.length === 0}>
                <Button type="default" danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0}>删除</Button>
              </Popconfirm>
            </HasPermi>
          </Space>
          <RightToolbar
            showSearch={showSearch}
            onToggleSearch={() => setShowSearch(!showSearch)}
            onRefresh={getList}
          />
        </div>

        {/* 数据表格 */}
        <Table
          rowKey="userId"
          columns={columns}
          dataSource={userList}
          loading={loading}
          pagination={false}
          scroll={{ x: 1000 }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as number[])
          }}
        />

        {/* 分页 */}
        <Pagination
          total={total}
          page={queryParams.pageNum}
          limit={queryParams.pageSize}
          onChange={handlePagination}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={title}
        open={open}
        onOk={handleSubmit}
        onCancel={() => setOpen(false)}
        confirmLoading={submitting}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="userId" hidden>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="userName" label="用户名称" rules={[{ required: true, message: '请输入用户名称' }]}>
                <Input placeholder="请输入用户名称" disabled={!!form.getFieldValue('userId')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nickName" label="用户昵称" rules={[{ required: true, message: '请输入用户昵称' }]}>
                <Input placeholder="请输入用户昵称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="手机号码">
                <Input placeholder="请输入手机号码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sex" label="用户性别">
                <Select placeholder="请选择">
                  {(dict.sys_user_sex || []).map((item) => (
                    <Select.Option key={item.value} value={item.value}>{item.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" initialValue="0">
                <Select>
                  {(dict.sys_normal_disable || []).map((item) => (
                    <Select.Option key={item.value} value={item.value}>{item.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* 新增时显示密码字段 */}
          {!form.getFieldValue('userId') && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="password" label="用户密码" rules={[{ required: true, message: '请输入用户密码' }]}>
                  <Input.Password placeholder="请输入用户密码" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
