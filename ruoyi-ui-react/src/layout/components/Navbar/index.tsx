import { useNavigate } from 'react-router-dom'
import { Breadcrumb, Dropdown, Avatar, Space } from 'antd'
import type { MenuProps } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'

export default function Navbar() {
  const navigate = useNavigate()
  const { sidebar, toggleSideBar } = useAppStore()
  const { name, nickName, logOut } = useUserStore()

  const handleLogout = async () => {
    await logOut()
    navigate('/login')
  }

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/user/profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <div className="navbar">
      <div className="hamburger-container" onClick={() => toggleSideBar()}>
        {sidebar.opened ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
      </div>

      <div className="breadcrumb-container">
        <Breadcrumb items={[
          { title: '首页' },
          { title: '系统管理' },
        ]} />
      </div>

      <div className="right-menu">
        <Dropdown menu={{ items }} placement="bottomRight">
          <div className="right-menu-item">
            <Space>
              <Avatar size="small" icon={<UserOutlined />} />
              <span>{nickName || name}</span>
            </Space>
          </div>
        </Dropdown>
      </div>
    </div>
  )
}
