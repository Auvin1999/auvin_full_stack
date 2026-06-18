import logo from '@/assets/logo/logo.png'

export default function Logo() {
  return (
    <div className="sidebar-logo-container">
      <img src={logo} alt="logo" className="sidebar-logo" />
      <span className="sidebar-title">若依管理系统</span>
    </div>
  )
}
