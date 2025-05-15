// src/pages/professor/dashboard.tsx
import React, { useState } from 'react'
import type { NextPage } from 'next'
import DocumentManager from '../../components/professor/DocumentManager'
import RubricManager from '../../components/professor/RubricManager'
import NewsEditor from '../../components/professor/NewsEditor'
import ReportNotes from '../../components/professor/ReportNotes'
import ReportStudents from '../../components/professor/ReportStudents'

const tabs = [
  { key: 'docs',     label: 'Gestión de Documentos' },
  { key: 'rubrics',  label: 'Rubros' },
  { key: 'news',     label: 'Noticias' },
  { key: 'notes',    label: 'Reporte de Notas' },
  { key: 'students', label: 'Reporte de Estudiantes' },
] as const

type TabKey = typeof tabs[number]['key']

const ProfessorDashboard: NextPage = () => {
  const [active, setActive] = useState<TabKey>('docs')

  const renderContent = () => {
    switch (active) {
      case 'docs':    return <DocumentManager />
      case 'rubrics': return <RubricManager />
      case 'news':    return <NewsEditor />
      case 'notes':   return <ReportNotes />
      case 'students':return <ReportStudents />
    }
  }

  return (
    <div className="professor-dashboard">
      <header className="professor-header">
        <img
          src="/images/LogoTransparente.png"
          alt="CEDigital Logo"
          className="professor-logo"
        />
        <h1 className="professor-title">Vista Profesor</h1>
      </header>

      <ul className="nav nav-tabs professor-tabs mb-4">
        {tabs.map(t => (
          <li key={t.key} className="nav-item">
            <button
              className={`nav-link ${active === t.key ? 'active' : ''}`}
              onClick={() => setActive(t.key)}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="professor-content">
        <div className="card">
          <div className="card-header">
            {tabs.find(t => t.key === active)!.label}
          </div>
          <div className="card-body">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfessorDashboard
