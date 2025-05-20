// src/components/auth/LoginForm.tsx
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '../../stores/authStore'

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const login = useAuthStore((state) => state.login)
  const checkExpiration = useAuthStore((state) => state.checkExpiration)
  const router = useRouter()

  useEffect(() => {
    checkExpiration()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = login(username, password)
    
    if (success) {
      const user = useAuthStore.getState().user
      if (user?.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/main')
      }
    } else {
      alert('Credenciales inválidas')
    }
  }

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-card text-center">
        <img
          src="/images/LogoTransparente.png"
          alt="CEDigital Logo"
          className="login-logo mx-auto d-block"
        />
        <h3 className="mb-4">Iniciar Sesión</h3>

        <div className="mb-3 text-start">
          <label htmlFor="email" className="form-label">Usuario</label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-user"></i>
            </span>
            <input
              type="text"
              id="username"
              className="form-control"
              placeholder="Nombre de usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mb-4 text-start">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-lock"></i>
            </span>
            <input
              type={showPwd ? 'text' : 'password'}
              id="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPwd(v => !v)}
              tabIndex={-1}
            >
              <i className={`fas fa-eye${showPwd ? '-slash' : ''}`}></i>
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Entrar
        </button>
      </form>
    </div>
  )
}

export default LoginForm
