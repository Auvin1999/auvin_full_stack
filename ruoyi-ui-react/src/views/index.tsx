import { Card, Row, Col, Tag, Divider, Collapse, Typography, Space } from 'antd'
import {
  GithubOutlined,
  HomeOutlined,
  GlobalOutlined,
  TeamOutlined,
  RocketOutlined,
} from '@ant-design/icons'

const { Title, Paragraph, Link } = Typography

export default function Index() {
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
              若依管理系统 React 版
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}>
              一套基于 React 18 + Ant Design 5 + TypeScript 的后台管理系统前端解决方案
            </Paragraph>
            <Space>
              <Tag color="#f50">免费开源</Tag>
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
          <Card title="技术栈" bordered={false} style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Title level={5}>后端技术</Title>
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
                <Title level={5}>前端技术</Title>
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
          <Card title="功能特性" bordered={false} style={{ marginBottom: 16 }}>
            <ul style={{ paddingLeft: 16, color: '#666', lineHeight: 2 }}>
              <li>使用最新技术栈，基于 React 18 + TypeScript</li>
              <li>提供 Element Plus / Ant Design 两套 UI 方案</li>
              <li>支持动态权限路由，按钮级别权限控制</li>
              <li>支持多终端自适应布局</li>
              <li>支持暗黑主题切换</li>
              <li>完善的代码生成工具</li>
              <li>完善的 XSS 入侵脚本过滤</li>
              <li>支持动态加载国际化语言包</li>
            </ul>
          </Card>
        </Col>
      </Row>

      {/* 更新日志 */}
      <Card title="更新日志" bordered={false} style={{ marginBottom: 16 }}>
        <Collapse
          defaultActiveKey={['v1']}
          items={[
            {
              key: 'v1',
              label: <Tag color="blue">v1.0.0</Tag>,
              children: (
                <ul style={{ paddingLeft: 16, color: '#666' }}>
                  <li>初始版本，完成全部系统管理模块移植</li>
                  <li>完成登录、权限、动态路由架构</li>
                  <li>完成用户管理、角色管理、菜单管理等 CRUD 页面</li>
                  <li>完成系统监控模块（在线用户、定时任务）</li>
                  <li>完成系统工具模块（代码生成器）</li>
                  <li>支持暗黑模式、全屏、标签页右键菜单</li>
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
            <div style={{ fontWeight: 600 }}>官方网站</div>
            <Link href="http://ruoyi.vip" target="_blank">http://ruoyi.vip</Link>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ textAlign: 'center' }}>
            <TeamOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
            <div style={{ fontWeight: 600 }}>技术交流</div>
            <div style={{ color: '#999' }}>QQ 群: 891137268</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ textAlign: 'center' }}>
            <RocketOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
            <div style={{ fontWeight: 600 }}>前端仓库</div>
            <Link href="https://github.com/yangzongzhuan/RuoYi-Vue3" target="_blank">GitHub</Link>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
