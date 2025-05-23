import React from 'react'
import { useRouter } from 'next/router'
import RubricList from './evaluations/RubricList'
import AssignmentManager from './evaluations/AssignmentManager'
import SubmissionManager from './evaluations/SubmissionManager'

type TabType = 'rubrics' | 'assignments' | 'submissions'

const EvaluationManager: React.FC = () => {
  const router = useRouter()
  const { semester, code, group, tab, tabEv = 'rubrics' } = router.query

  const handleTabChange = (newTab: TabType) => {
    router.push({
      pathname: `/courses/[semester]/[code]/[group]/[tab]`,
      query: { 
        semester, 
        code, 
        group, 
        tab: 'rubrics',
        tabEv: newTab 
      }
    }, undefined, { shallow: true })
  }

  return (
    <div className="evaluation-manager">
      <ul className="nav nav-tabs mb-4">
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

      <div className="tab-content">
        {tabEv === 'rubrics' && <RubricList />}
        {tabEv === 'assignments' && <AssignmentManager />}
        {tabEv === 'submissions' && <SubmissionManager />}
      </div>
    </div>
  )
}

export default EvaluationManager
