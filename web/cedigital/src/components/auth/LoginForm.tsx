// src/components/auth/LoginForm.tsx
import React, { useState } from 'react'

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  return (
    <div className="login-page">
      <div className="login-card text-center">
        <img
          src="/images/LogoTransparente.png"
          alt="CEDigital Logo"
          className="login-logo mx-auto d-block"
        />
        <h3 className="mb-4">Iniciar Sesión</h3>

        <div className="mb-3 text-start">
          <label htmlFor="email" className="form-label">Correo electrónico</label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-envelope"></i>
            </span>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
      </div>
    </div>
  )
}

export default LoginForm
