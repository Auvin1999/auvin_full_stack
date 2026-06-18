import { Card, Row, Col, Typography, Space, Tag, Avatar } from 'antd'
import {
  UserOutlined, TeamOutlined, ApartmentOutlined, MenuOutlined,
  BookOutlined, SettingOutlined, BellOutlined, FileTextOutlined,
  KeyOutlined, FileSearchOutlined, LoginOutlined, DesktopOutlined,
  ScheduleOutlined, CodeOutlined, FormOutlined, SafetyOutlined,
  GithubOutlined, HomeOutlined, GlobalOutlined, RocketOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const { Title, Paragraph } = Typography

interface ModuleCard {
  title: string
  titleKey: string
  icon: React.ReactNode
  path: string
  color: string
  description: string
  descriptionKey: string
}

const modules: ModuleCard[] = [
  { title: '用户管理', titleKey: 'menu.user', icon: <UserOutlined />, path: '/system/user', color: '#1890ff', description: '管理系统用户账号', descriptionKey: 'dashboard.desc.user' },
  { title: '角色管理', titleKey: 'menu.role', icon: <TeamOutlined />, path: '/system/role', color: '#52c41a', description: '配置角色权限', descriptionKey: 'dashboard.desc.role' },
  { title: '菜单管理', titleKey: 'menu.menu', icon: <MenuOutlined />, path: '/system/menu', color: '#722ed1', description: '管理系统菜单路由', descriptionKey: 'dashboard.desc.menu' },
  { title: '部门管理', titleKey: 'menu.dept', icon: <ApartmentOutlined />, path: '/system/dept', color: '#13c2c2', description: '管理部门组织架构', descriptionKey: 'dashboard.desc.dept' },
  { title: '字典管理', titleKey: 'menu.dict', icon: <BookOutlined />, path: '/system/dict', color: '#eb2f96', description: '管理系统数据字典', descriptionKey: 'dashboard.desc.dict' },
  { title: '参数设置', titleKey: 'menu.config', icon: <SettingOutlined />, path: '/system/config', color: '#fa8c16', description: '管理系统配置参数', descriptionKey: 'dashboard.desc.config' },
  { title: '通知公告', titleKey: 'menu.notice', icon: <BellOutlined />, path: '/system/notice', color: '#f5222d', description: '发布管理系统公告', descriptionKey: 'dashboard.desc.notice' },
  { title: '岗位管理', titleKey: 'menu.post', icon: <FileTextOutlined />, path: '/system/post', color: '#2f54eb', description: '管理岗位信息', descriptionKey: 'dashboard.desc.post' },
  { title: '操作日志', titleKey: 'menu.operlog', icon: <FileSearchOutlined />, path: '/system/operlog', color: '#595959', description: '查看系统操作记录', descriptionKey: 'dashboard.desc.operlog' },
  { title: '登录日志', titleKey: 'menu.logininfor', icon: <LoginOutlined />, path: '/system/logininfor', color: '#8c8c8c', description: '查看用户登录记录', descriptionKey: 'dashboard.desc.logininfor' },
  { title: '在线用户', titleKey: 'menu.online', icon: <DesktopOutlined />, path: '/monitor/online', color: '#389e0d', description: '查看在线用户状态', descriptionKey: 'dashboard.desc.online' },
  { title: '定时任务', titleKey: 'menu.job', icon: <ScheduleOutlined />, path: '/monitor/job', color: '#d4380d', description: '管理定时调度任务', descriptionKey: 'dashboard.desc.job' },
  { title: '代码生成', titleKey: 'menu.gen', icon: <CodeOutlined />, path: '/tool/gen', color: '#08979c', description: '自动生成前后端代码', descriptionKey: 'dashboard.desc.gen' },
  { title: '表单构建', titleKey: 'menu.build', icon: <FormOutlined />, path: '/tool/build', color: '#c41d7f', description: '可视化拖拽构建表单', descriptionKey: 'dashboard.desc.build' },
]

const stats = [
  { label: 'system.user', count: 156, color: '#1890ff', icon: <UserOutlined /> },
  { label: 'system.role', count: 8, color: '#52c41a', icon: <SafetyOutlined /> },
  { label: 'system.menu', count: 128, color: '#722ed1', icon: <MenuOutlined /> },
  { label: 'system.dept', count: 12, color: '#13c2c2', icon: <ApartmentOutlined /> },
]

export default function Index() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* 欢迎横幅 */}
      <Card
        variant="borderless"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          marginBottom: 20,
          borderRadius: 8,
        }}
        styles={{ body: { padding: '24px 32px' } }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={3} style={{ color: '#fff', marginBottom: 4 }}>
              {t('dashboard.title')}
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 12 }}>
              {t('dashboard.subtitle')}
            </Paragraph>
            <Space>
              <Tag color="#f50">{t('dashboard.freeOpenSource')}</Tag>
              <Tag color="cyan">v1.0.0</Tag>
              <Tag color="blue">TypeScript</Tag>
              <Tag color="green">React 18</Tag>
            </Space>
          </Col>
          <Col>
            <Space size="large">
              <a href="https://gitee.com/y_project/RuoYi-Cloud" target="_blank" rel="noreferrer">
                <GithubOutlined style={{ fontSize: 32, color: 'rgba(255,255,255,0.85)' }} />
              </a>
              <a href="http://ruoyi.vip" target="_blank" rel="noreferrer">
                <HomeOutlined style={{ fontSize: 32, color: 'rgba(255,255,255,0.85)' }} />
              </a>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 数据概览 */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {stats.map((s) => (
          <Col span={6} key={s.label}>
            <Card variant="borderless" styles={{ body: { display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' } }}>
              <Avatar size={48} style={{ background: s.color }} icon={s.icon} />
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>{s.count}</div>
                <div style={{ color: '#999', fontSize: 13 }}>{s.label}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 功能模块导航 */}
      <Card variant="borderless" style={{ marginBottom: 20 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          <RocketOutlined style={{ marginRight: 8 }} />
          {t('dashboard.features')}
        </Title>
        <Row gutter={[16, 16]}>
          {modules.map((mod) => (
            <Col xs={12} sm={8} md={6} lg={4} key={mod.path}>
              <Card
                hoverable
                variant="borderless"
                style={{ textAlign: 'center', borderRadius: 8, cursor: 'pointer' }}
                styles={{ body: { padding: '20px 12px' } }}
                onClick={() => navigate(mod.path)}
              >
                <Avatar
                  size={48}
                  style={{ background: mod.color, marginBottom: 12 }}
                  icon={mod.icon}
                />
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                  {t(mod.titleKey)}
                </div>
                <div style={{ color: '#999', fontSize: 12, lineHeight: 1.4 }}>
                  {t(mod.descriptionKey)}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 底部信息 */}
      <Row gutter={16}>
        <Col span={8}>
          <Card variant="borderless" style={{ textAlign: 'center' }}>
            <GlobalOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
            <div style={{ fontWeight: 600 }}>{t('dashboard.website')}</div>
            <a href="http://ruoyi.vip" target="_blank" rel="noreferrer" style={{ color: '#1890ff' }}>
              http://ruoyi.vip
            </a>
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ textAlign: 'center' }}>
            <TeamOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
            <div style={{ fontWeight: 600 }}>{t('dashboard.techExchange')}</div>
            <div style={{ color: '#999' }}>QQ: 891137268</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ textAlign: 'center' }}>
            <RocketOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
            <div style={{ fontWeight: 600 }}>{t('dashboard.repo')}</div>
            <a href="https://github.com/yangzongzhuan/RuoYi-Vue3" target="_blank" rel="noreferrer" style={{ color: '#722ed1' }}>
              GitHub
            </a>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
