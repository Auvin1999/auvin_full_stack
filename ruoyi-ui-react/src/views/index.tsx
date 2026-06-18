import { Card, Row, Col, Tag, Divider, Collapse, Typography, Space } from 'antd'
import {
  GithubOutlined,
  HomeOutlined,
  GlobalOutlined,
  TeamOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

const { Title, Paragraph, Link } = Typography

export default function Index() {
  const { t } = useTranslation()

  return (
    <div style={{ padding: 0 }}>
      {/* 欢迎横幅 */}
      <Card
        bordered={false}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          marginBottom: 16,
          borderRadius: 8,
        }}
      >
        <Row align="middle" gutter={24}>
          <Col flex="1">
            <Title level={3} style={{ color: '#fff', marginBottom: 4 }}>
              {t('dashboard.title')}
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}>
              {t('dashboard.subtitle')}
            </Paragraph>
            <Space>
              <Tag color="#f50">{t('dashboard.freeOpenSource')}</Tag>
              <Tag color="blue">v1.0.0</Tag>
              <Tag color="green">TypeScript</Tag>
            </Space>
          </Col>
          <Col>
            <Space>
              <a href="https://gitee.com/y_project/RuoYi-Cloud" target="_blank" rel="noreferrer">
                <GithubOutlined style={{ fontSize: 28, color: '#fff' }} />
              </a>
              <a href="http://ruoyi.vip" target="_blank" rel="noreferrer">
                <HomeOutlined style={{ fontSize: 28, color: '#fff' }} />
              </a>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        {/* 技术栈 */}
        <Col span={12}>
          <Card title={t('dashboard.techStack')} bordered={false} style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Title level={5}>{t('dashboard.backendTech')}</Title>
                <ul style={{ paddingLeft: 16, color: '#666' }}>
                  <li>SpringBoot</li>
                  <li>Spring Cloud</li>
                  <li>Nacos</li>
                  <li>Sentinel</li>
                  <li>Seata</li>
                  <li>Minio</li>
                  <li>MyBatis Plus</li>
                  <li>JWT</li>
                </ul>
              </Col>
              <Col span={12}>
                <Title level={5}>{t('dashboard.frontendTech')}</Title>
                <ul style={{ paddingLeft: 16, color: '#666' }}>
                  <li>React 18</li>
                  <li>TypeScript</li>
                  <li>Ant Design 5</li>
                  <li>Zustand</li>
                  <li>React Router 6</li>
                  <li>Axios</li>
                  <li>ECharts</li>
                  <li>Vite</li>
                </ul>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 功能特性 */}
        <Col span={12}>
          <Card title={t('dashboard.features')} variant="borderless" style={{ marginBottom: 16 }}>
            <ul style={{ paddingLeft: 16, color: '#666', lineHeight: 2 }}>
              {(t('dashboard.featureList', { returnObjects: true }) as string[]).map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Card>
        </Col>
      </Row>

      {/* 更新日志 */}
      <Card title={t('dashboard.changelog')} variant="borderless" style={{ marginBottom: 16 }}>
        <Collapse
          defaultActiveKey={['v1']}
          items={[
            {
              key: 'v1',
              label: <Tag color="blue">v1.0.0</Tag>,
              children: (
                <ul style={{ paddingLeft: 16, color: '#666' }}>
                  {(t('dashboard.changelogV1', { returnObjects: true }) as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ),
            },
          ]}
        />
      </Card>

      {/* 底部信息 */}
      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false} style={{ textAlign: 'center' }}>
            <GlobalOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
            <div style={{ fontWeight: 600 }}>{t('dashboard.website')}</div>
            <Link href="http://ruoyi.vip" target="_blank">http://ruoyi.vip</Link>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ textAlign: 'center' }}>
            <TeamOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
            <div style={{ fontWeight: 600 }}>{t('dashboard.techExchange')}</div>
            <div style={{ color: '#999' }}>QQ 群: 891137268</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ textAlign: 'center' }}>
            <RocketOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
            <div style={{ fontWeight: 600 }}>{t('dashboard.repo')}</div>
            <Link href="https://github.com/yangzongzhuan/RuoYi-Vue3" target="_blank">GitHub</Link>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
