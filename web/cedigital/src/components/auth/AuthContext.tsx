// src/components/auth/LoginForm.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'

interface LoginFormProps {
  /** Ruta a la que redirigir tras el login */
  nextRoute: string
}

const LoginForm: React.FC<LoginFormProps> = ({ nextRoute }) => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: aquí irá la llamada al API de autenticación
    router.push(nextRoute)
  }

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center">
      <form
        onSubmit={handleSubmit}
        className="border rounded p-4 shadow"
        style={{ maxWidth: 400, width: '100%' }}
      >
        {/* Logo */}
        <div className="text-center mb-4">
          <img
            src="/images/LogoTransparente.png"
            alt="CEDigital Logo"
            style={{ maxWidth: 150 }}
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Correo electrónico
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-envelope"></i>
            </span>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Contraseña */}
        <div className="mb-4">
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-lock"></i>
            </span>
            <input
              type={showPwd ? 'text' : 'password'}
              id="password"
              className="form-control"
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
          Iniciar sesión
        </button>
      </form>
    </div>
  )
}

export default LoginForm
