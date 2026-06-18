import { Card, Row, Col, Statistic } from 'antd'
import { UserOutlined, FileOutlined, TeamOutlined, SettingOutlined } from '@ant-design/icons'

export default function Index() {
  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>欢迎使用若依管理系统</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="用户数" value={1128} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="文章数" value={93} prefix={<FileOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="在线用户" value={23} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="系统配置" value={15} prefix={<SettingOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
