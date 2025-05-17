// src/pages/admin/dashboard.tsx
import React, { useState } from 'react'
import CourseManager from '../../components/admin/CourseManager'
import SemesterInitializer from '../../components/admin/SemesterInitializer'

const AdminDashboard: React.FC = () => {
  const [view, setView] = useState<'courses' | 'semester'>('courses')

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <img
          src="/images/LogoTransparente.png"
          alt="CEDigital Logo"
          className="admin-logo"
        />
        <span className="admin-title">Administrador</span>
      </header>

      <ul className="nav nav-tabs admin-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${view === 'courses' ? 'active' : ''}`}
            onClick={() => setView('courses')}
          >
            Gestión de Cursos
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${view === 'semester' ? 'active' : ''}`}
            onClick={() => setView('semester')}
          >
            Inicializar Semestre
          </button>
        </li>
      </ul>

      <div className="admin-content">
        {view === 'courses' ? <CourseManager /> : <SemesterInitializer />}
      </div>
    </div>
  )
}

export default AdminDashboard
