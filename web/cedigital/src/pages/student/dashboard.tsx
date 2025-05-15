import React, { useState } from 'react'
import type { NextPage } from 'next'
import DocumentViewer     from '../../components/student/DocumentViewer'
import StudentEvaluations from '../../components/student/StudentEvaluations'
import NewsViewer         from '../../components/student/NewsViewer'

const tabs = [
  { key: 'docs',  label: 'Documentos' },
  { key: 'evals', label: 'Evaluaciones' },
  { key: 'news',  label: 'Noticias' },
] as const

type TabKey = typeof tabs[number]['key']

const StudentDashboard: NextPage = () => {
  const [active, setActive] = useState<TabKey>('docs')

  const renderContent = () => {
    switch (active) {
      case 'docs':  return <DocumentViewer />
      case 'evals': return <StudentEvaluations />
      case 'news':  return <NewsViewer />
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
        <h1 className="professor-title">Vista Estudiante</h1>
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

export default StudentDashboard
