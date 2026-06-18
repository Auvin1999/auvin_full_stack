import { useState, useEffect, useCallback } from 'react'
import {
  Table, Button, Form, Input, Select, Switch, Modal, Space, Row, Col,
  message, Card, DatePicker, TreeSelect, InputNumber
} from 'antd'
import dayjs from 'dayjs'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  ReloadOutlined, KeyOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { confirmDelete } from '@/utils/confirm'
import { listUser, getUser, addUser, updateUser, delUser, resetUserPwd, changeUserStatus } from '@/api/system/user'
import { HasPermi } from '@/components/Permission'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import { useDict } from '@/utils/dict'
import { parseTime, addDateRange } from '@/utils/ruoyi'

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
  const { t } = useTranslation()
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
  const [dateRange, setDateRange] = useState<string[]>([])

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
      const res: any = await listUser(addDateRange(queryParams, dateRange))
      setUserList(res.rows || [])
      setTotal(res.total || 0)
    } catch {
      // error handled by request interceptor
    } finally {
      setLoading(false)
    }
  }, [queryParams, dateRange])

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
    setDateRange([])
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
    setTitle(t('user.addUser'))
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
      setTitle(t('user.editUser'))
      setOpen(true)
    } catch {
      // handled
    }
  }

  /** 删除 */
  const handleDelete = async (row?: UserRecord) => {
    const ids = row ? [row.userId] : selectedRowKeys
    if (ids.length === 0) {
      message.warning(t('pleaseSelectData'))
      return
    }
    try {
      await delUser(ids.join(','))
      message.success(t('deleteSuccess'))
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
        message.success(t('editSuccess'))
      } else {
        await addUser(values)
        message.success(t('addSuccess'))
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
      message.success(t('user.resetPwdConfirm'))
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
      message.success(t('editSuccess'))
      getList()
    } catch {
      // handled
    }
  }

  const columns = [
    { title: t('user.userId'), dataIndex: 'userId', width: 80 },
    { title: t('user.userName'), dataIndex: 'userName', width: 120 },
    { title: t('user.nickName'), dataIndex: 'nickName', width: 120 },
    { title: t('user.dept'), dataIndex: ['dept', 'deptName'], width: 120 },
    { title: t('user.phone'), dataIndex: 'phone', width: 130 },
    {
      title: t('status'),
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
      title: t('createTime'),
      dataIndex: 'createTime',
      width: 170,
      render: (text: string) => parseTime(text)
    },
    {
      title: t('operation'),
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: UserRecord) => (
        <Space size="small">
          <HasPermi permissions={['system:user:edit']}>
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>
              {t('edit')}
            </Button>
          </HasPermi>
          <HasPermi permissions={['system:user:remove']}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete({ onOk: () => handleDelete(record) })}>
              {t('delete')}
            </Button>
          </HasPermi>
          <HasPermi permissions={['system:user:resetPwd']}>
            <Button type="link" size="small" icon={<KeyOutlined />} onClick={() => confirmDelete({ content: t('user.resetPwdConfirm'), onOk: () => handleResetPwd(record) })}>
              {t('user.resetPwd')}
            </Button>
          </HasPermi>
        </Space>
      )
    }
  ]

  return (
    <div className="app-container">
      {/* 搜索 + 操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        {showSearch && (
          <Form form={queryForm} onFinish={handleQuery}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="userName" label={t('user.userName')}>
                <Input placeholder={t('user.userName')} allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="phone" label={t('user.phone')}>
                <Input placeholder={t('user.phone')} allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label={t('status')}>
                <Select placeholder={t('status')} allowClear style={{ width: '100%' }}>
                  {(dict.sys_normal_disable || []).map((item) => (
                    <Select.Option key={item.value} value={item.value}>{item.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label={t('createTime')}>
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
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item>
                <Space>
                  <Button type="primary" icon={<SearchOutlined />} htmlType="submit">{t('search')}</Button>
                  <Button icon={<ReloadOutlined />} onClick={resetQuery}>{t('reset')}</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        )}
        {/* 操作按钮行 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
          <Space>
            <HasPermi permissions={['system:user:add']}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>{t('add')}</Button>
            </HasPermi>
            <HasPermi permissions={['system:user:edit']}>
              <Button icon={<EditOutlined />} disabled={selectedRowKeys.length !== 1} onClick={() => {
                const record = userList.find((u) => u.userId === selectedRowKeys[0])
                if (record) handleUpdate(record)
              }}>{t('edit')}</Button>
            </HasPermi>
            <HasPermi permissions={['system:user:remove']}>
              <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0} onClick={() => { if (selectedRowKeys.length) confirmDelete({ onOk: () => handleDelete() }) }}>{t('delete')}</Button>
            </HasPermi>
          </Space>
          <RightToolbar
            showSearch={showSearch}
            onToggleSearch={() => setShowSearch(!showSearch)}
            onRefresh={getList}
            exportUrl="/system/user/export"
            exportParams={queryParams}
            exportFilename="用户数据.xlsx"
          />
        </div>
      </Card>

      {/* 数据表格 */}
      <Card>
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
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="userId" hidden>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="userName" label={t('user.userName')} rules={[{ required: true, message: t('user.userName') }]}>
                <Input placeholder={t('user.userName')} disabled={!!form.getFieldValue('userId')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nickName" label={t('user.nickName')} rules={[{ required: true, message: t('user.nickName') }]}>
                <Input placeholder={t('user.nickName')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label={t('user.phone')}>
                <Input placeholder={t('user.phone')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label={t('user.email')}>
                <Input placeholder={t('user.email')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sex" label={t('user.sex')}>
                <Select placeholder={t('pleaseSelect')}>
                  {(dict.sys_user_sex || []).map((item) => (
                    <Select.Option key={item.value} value={item.value}>{item.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label={t('status')} initialValue="0">
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
                <Form.Item name="password" label={t('user.password')} rules={[{ required: true, message: t('user.password') }]}>
                  <Input.Password placeholder={t('user.password')} />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item name="remark" label={t('remark')}>
            <Input.TextArea rows={3} placeholder={t('remark')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
