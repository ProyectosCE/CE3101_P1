import React from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '../../stores/authStore'

interface HeaderProps {
  username: string;
}

const Header: React.FC<HeaderProps> = ({ username }) => {
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="admin-header d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center">
        <img
          src="/images/LogoTransparente.png"
          alt="CEDigital Logo"
          className="admin-logo"
        />
        <span className="admin-title">{username}</span>
      </div>
      <button 
        onClick={handleLogout}
        className="btn btn-outline-danger"
      >
        <i className="fas fa-sign-out-alt me-2"></i>
        Cerrar Sesión
      </button>
    </header>
  )
}

export default Header
