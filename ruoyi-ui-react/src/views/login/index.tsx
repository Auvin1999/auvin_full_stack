import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Form, Input, Button, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import Cookies from 'js-cookie'
import { getCodeImg } from '@/api/login'
import { useUserStore } from '@/store/useUserStore'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import './index.css'

interface LoginForm {
  username: string
  password: string
  code: string
  uuid: string
  rememberMe: boolean
}

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useUserStore()

  const [form] = Form.useForm<LoginForm>()
  const [loading, setLoading] = useState(false)
  const [codeUrl, setCodeUrl] = useState('')
  const [captchaEnabled, setCaptchaEnabled] = useState(true)
  const [registerEnabled] = useState(false)

  /** 获取验证码 */
  const getCode = useCallback(async () => {
    try {
      const res: any = await getCodeImg()
      const enabled = res.captchaEnabled !== false
      setCaptchaEnabled(enabled)
      if (enabled) {
        setCodeUrl('data:image/gif;base64,' + res.img)
        form.setFieldValue('uuid', res.uuid)
      }
    } catch (e) {
      console.error('获取验证码失败', e)
    }
  }, [form])

  /** 从 Cookie 恢复记住的用户名密码 */
  const restoreFromCookie = useCallback(() => {
    const username = Cookies.get('username')
    const password = Cookies.get('password')
    const rememberMe = Cookies.get('rememberMe')
    form.setFieldsValue({
      username: username ?? 'admin',
      password: password ? decrypt(password) : 'admin123',
      rememberMe: rememberMe === 'true'
    })
  }, [form])

  useEffect(() => {
    getCode()
    restoreFromCookie()
  }, [])

  /** 登录提交 */
  const handleLogin = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // 记住密码
      if (values.rememberMe) {
        Cookies.set('username', values.username, { expires: 30 })
        Cookies.set('password', encrypt(values.password), { expires: 30 })
        Cookies.set('rememberMe', 'true', { expires: 30 })
      } else {
        Cookies.remove('username')
        Cookies.remove('password')
        Cookies.remove('rememberMe')
      }

      await login({
        username: values.username,
        password: values.password,
        code: values.code,
        uuid: values.uuid
      })

      const redirect = searchParams.get('redirect') || '/'
      navigate(redirect, { replace: true })
    } catch (e: any) {
      message.error(e?.message || t('login.loginFailed'))
      if (captchaEnabled) {
        getCode()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Form form={form} className="login-form" onFinish={handleLogin}>
        <h3 className="title">{import.meta.env.VITE_APP_TITLE}</h3>

        <Form.Item name="username" rules={[{ required: true, message: t('login.usernameRequired') }]}>
          <Input prefix={<UserOutlined />} placeholder={t('login.username')} size="large" />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true, message: t('login.passwordRequired') }]}>
          <Input.Password prefix={<LockOutlined />} placeholder={t('login.password')} size="large" onPressEnter={handleLogin} />
        </Form.Item>

        {captchaEnabled && (
          <>
            <Form.Item name="uuid" hidden><Input /></Form.Item>
            <Form.Item name="code" rules={[{ required: true, message: t('login.captchaRequired') }]}>
              <div style={{ display: 'flex', gap: 12 }}>
                <Input prefix={<SafetyCertificateOutlined />} placeholder={t('login.captcha')} size="large" style={{ flex: 1 }} onPressEnter={handleLogin} />
                <img src={codeUrl} alt="captcha" onClick={getCode} style={{ height: 40, cursor: 'pointer', borderRadius: 4 }} />
              </div>
            </Form.Item>
          </>
        )}

        <Form.Item name="rememberMe" valuePropName="checked">
          <Checkbox>{t('login.rememberMe')}</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            {loading ? t('login.loggingIn') : t('login.loginBtn')}
          </Button>
          {registerEnabled && (
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <a href="/register">{t('login.register')}</a>
            </div>
          )}
        </Form.Item>
      </Form>

      <div className="login-footer">
        Copyright © 2019 若依管理系统 All Rights Reserved.
      </div>
    </div>
  )
}
