// src/components/auth/LoginForm.tsx
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '../../stores/authStore'
import { loginUser } from '@/Functions/authApi'

const LoginForm: React.FC = () => {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const login = useAuthStore((state) => state.login)
  const checkExpiration = useAuthStore((state) => state.checkExpiration)
  const router = useRouter()

  useEffect(() => {
    checkExpiration()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const response = await loginUser(correo, password)
      login(response)
      
      if (response.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/main')
      }
    } catch (err: any) {
      setError(err.message)
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
          <label htmlFor="correo" className="form-label">Correo</label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-envelope"></i>
            </span>
            <input
              type="email"
              id="correo"
              className="form-control"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
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

        {error && (
          <div className="alert alert-danger mb-3">{error}</div>
        )}

        <button type="submit" className="btn btn-primary w-100">
          Entrar
        </button>
      </form>
    </div>
  )
}

export default LoginForm
