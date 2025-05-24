import React from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/stores/authStore'
import Header from '@/components/global/Header'
import RubricList from '@/components/professor/evaluations/RubricList'
import AssignmentManager from '@/components/professor/evaluations/AssignmentManager'
import SubmissionManager from '@/components/professor/evaluations/SubmissionManager'

const EvaluationPage = () => {
  const router = useRouter()
  const { semester, code, group, id_curso, tabEv } = router.query
  const user = useAuthStore(state => state.user)

  if (!user || user.role !== 'professor') {
    router.push('/login')
    return null
  }

  const handleTabChange = (newTab: string) => {
    router.push(`/courses/${semester}/${code}/${group}/${id_curso}rubrics/${newTab}`)
  }

  const renderContent = () => {
    switch (tabEv) {
      case 'rubrics': return <RubricList />
      case 'assignments': return <AssignmentManager />
      case 'submissions': return <SubmissionManager />
      default: return null
    }
  }

  return (
    <div className="evaluation-page">
      <Header username={user.username} />
      <div className="container py-4">
        <h2>{code} - Grupo {group}</h2>
        <div className="card mt-4">
          <div className="card-header">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${tabEv === 'rubrics' ? 'active' : ''}`}
                  onClick={() => handleTabChange('rubrics')}
                >
                  Gestión de Rubros
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${tabEv === 'assignments' ? 'active' : ''}`}
                  onClick={() => handleTabChange('assignments')}
                >
                  Gestión de Evaluaciones
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${tabEv === 'submissions' ? 'active' : ''}`}
                  onClick={() => handleTabChange('submissions')}
                >
                  Gestión de Entregas
                </button>
              </li>
            </ul>
          </div>
          <div className="card-body">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EvaluationPage
