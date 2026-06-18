import { useState, useEffect, useRef } from 'react'
import { Card, Row, Col, Tabs, Form, Input, Radio, Button, Avatar, message, Upload, Descriptions } from 'antd'
import { UserOutlined, CameraOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { getUserProfile, updateUserProfile, updateUserPwd, uploadAvatar } from '@/api/system/user'
import { useUserStore } from '@/store/useUserStore'
import { parseTime } from '@/utils/ruoyi'
import type { UploadProps } from 'antd'

export default function UserProfile() {
  const { t } = useTranslation()
  const { avatar: storeAvatar, name, nickName, setAvatar } = useUserStore()
  const [infoForm] = Form.useForm()
  const [pwdForm] = Form.useForm()
  const [user, setUser] = useState<any>({})
  const [roleGroup, setRoleGroup] = useState('')
  const [postGroup, setPostGroup] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  /** 加载用户信息 */
  const loadProfile = async () => {
    setPageLoading(true)
    try {
      const res: any = await getUserProfile()
      const userData = res.data || res.user || res
      setUser(userData)
      setRoleGroup(res.roleGroup || '')
      setPostGroup(res.postGroup || '')
      setAvatarUrl(userData.avatar || '')
      infoForm.setFieldsValue({
        nickName: userData.nickName,
        phonenumber: userData.phonenumber,
        email: userData.email,
        sex: userData.sex,
      })
    } catch (e: any) {
      console.error('[profile] loadProfile error:', e)
      message.error(e?.message || '加载个人信息失败')
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => { loadProfile() }, [])

  /** 保存基本信息 */
  const handleSaveInfo = async () => {
    try {
      const values = await infoForm.validateFields()
      setLoading(true)
      await updateUserProfile(values)
      message.success('修改成功')
      loadProfile()
    } finally { setLoading(false) }
  }

  /** 修改密码 */
  const handleChangePwd = async () => {
    try {
      const values = await pwdForm.validateFields()
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致')
        return
      }
      setLoading(true)
      await updateUserPwd(values.oldPassword, values.newPassword)
      message.success('密码修改成功')
      pwdForm.resetFields()
    } finally { setLoading(false) }
  }

  /** 头像上传 */
  const handleAvatarChange: UploadProps['beforeUpload'] = (file) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('只能上传图片文件')
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB')
      return false
    }

    // 预览
    const reader = new FileReader()
    reader.onload = (e) => setAvatarUrl(e.target?.result as string)
    reader.readAsDataURL(file)

    // 上传
    const formData = new FormData()
    formData.append('avatarfile', file)
    uploadAvatar(formData).then((res: any) => {
      const imgUrl = res.imgUrl || res.data?.imgUrl
      if (imgUrl) {
        setAvatarUrl(imgUrl)
        setAvatar(imgUrl)
        message.success('头像上传成功')
      }
    }).catch(() => {
      message.error('头像上传失败')
    })

    return false // 阻止自动上传
  }

  return (
    <div style={{ padding: 0 }}>
      <Row gutter={16}>
        {/* 左侧：个人信息卡片 */}
        <Col span={6}>
          <Card loading={pageLoading}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Upload
                showUploadList={false}
                beforeUpload={handleAvatarChange}
                accept="image/*"
              >
                <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
                  <Avatar
                    size={120}
                    src={avatarUrl || storeAvatar || undefined}
                    icon={<UserOutlined />}
                    style={{ border: '2px solid #f0f0f0' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'rgba(0,0,0,0.5)', color: '#fff',
                    textAlign: 'center', padding: '4px 0', fontSize: 12,
                    borderRadius: '0 0 60px 60px',
                  }}>
                    <CameraOutlined /> 更换头像
                  </div>
                </div>
              </Upload>
            </div>

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="用户名称">{user.userName}</Descriptions.Item>
              <Descriptions.Item label="手机号码">{user.phonenumber}</Descriptions.Item>
              <Descriptions.Item label="用户邮箱">{user.email}</Descriptions.Item>
              <Descriptions.Item label="所属部门">{user.dept?.deptName} / {postGroup}</Descriptions.Item>
              <Descriptions.Item label="所属角色">{roleGroup}</Descriptions.Item>
              <Descriptions.Item label="创建日期">{parseTime(user.createTime)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* 右侧：编辑区域 */}
        <Col span={18}>
          <Card loading={pageLoading}>
            <Tabs
              defaultActiveKey="userinfo"
              items={[
                {
                  key: 'userinfo',
                  label: '基本信息',
                  children: (
                    <Form form={infoForm} layout="vertical" style={{ maxWidth: 500 }}>
                      <Form.Item name="nickName" label="用户昵称" rules={[{ required: true, message: '请输入用户昵称' }]}>
                        <Input placeholder="请输入用户昵称" maxLength={30} />
                      </Form.Item>
                      <Form.Item name="phonenumber" label="手机号码" rules={[
                        { required: true, message: '请输入手机号码' },
                        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
                      ]}>
                        <Input placeholder="请输入手机号码" maxLength={11} />
                      </Form.Item>
                      <Form.Item name="email" label="邮箱" rules={[
                        { required: true, message: '请输入邮箱' },
                        { type: 'email', message: '邮箱格式不正确' },
                      ]}>
                        <Input placeholder="请输入邮箱" maxLength={50} />
                      </Form.Item>
                      <Form.Item name="sex" label="性别">
                        <Radio.Group>
                          <Radio value="0">男</Radio>
                          <Radio value="1">女</Radio>
                        </Radio.Group>
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" loading={loading} onClick={handleSaveInfo}>保存</Button>
                      </Form.Item>
                    </Form>
                  ),
                },
                {
                  key: 'resetPwd',
                  label: '修改密码',
                  children: (
                    <Form form={pwdForm} layout="vertical" style={{ maxWidth: 500 }}>
                      <Form.Item name="oldPassword" label="旧密码" rules={[{ required: true, message: '请输入旧密码' }]}>
                        <Input.Password placeholder="请输入旧密码" />
                      </Form.Item>
                      <Form.Item name="newPassword" label="新密码" rules={[
                        { required: true, message: '请输入新密码' },
                        { min: 6, max: 20, message: '密码长度为 6-20 个字符' },
                      ]}>
                        <Input.Password placeholder="请输入新密码" />
                      </Form.Item>
                      <Form.Item name="confirmPassword" label="确认密码" rules={[
                        { required: true, message: '请再次输入新密码' },
                      ]}>
                        <Input.Password placeholder="请再次输入新密码" />
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" loading={loading} onClick={handleChangePwd}>保存</Button>
                      </Form.Item>
                    </Form>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
