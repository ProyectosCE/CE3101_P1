import React, { useState } from 'react'
import RubricList from './evaluations/RubricList'
import AssignmentManager from './evaluations/AssignmentManager'
import SubmissionManager from './evaluations/SubmissionManager'

type TabType = 'rubrics' | 'assignments' | 'submissions'

const EvaluationManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('rubrics')

  return (
    <div className="evaluation-manager">
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'rubrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('rubrics')}
          >
            Gestión de Rubros
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            Gestión de Evaluaciones
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            Gestión de Entregas
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === 'rubrics' && <RubricList />}
        {activeTab === 'assignments' && <AssignmentManager />}
        {activeTab === 'submissions' && <SubmissionManager />}
      </div>
    </div>
  )
}

export default EvaluationManager
