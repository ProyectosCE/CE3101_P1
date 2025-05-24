import React from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/stores/authStore'
import Header from '@/components/global/Header'
import { ParsedUrlQueryInput } from 'querystring'

// Professor components
import DocumentManager from '@/components/professor/DocumentManager'
import NewsEditor from '@/components/professor/NewsEditor'
import ReportNotes from '@/components/professor/ReportNotes'
import ReportStudents from '@/components/professor/ReportStudents'
import GroupManager from '@/components/professor/GroupManager'

// Student components
import DocumentViewer from '@/components/student/DocumentViewer'
import StudentEvaluations from '@/components/student/StudentEvaluations'
import NewsViewer from '@/components/student/NewsViewer'
import EvaluationManager from '@/components/professor/EvaluationManager'
import ReportNotesStudent from '@/components/student/ReportNotesStudent'

// Reuse the tabs from student/professor dashboards
const professorTabs = [
  { key: 'documents', label: 'Gestión de Documentos' },
  { key: 'rubrics', label: 'Rubros' },
  { key: 'news', label: 'Noticias' },
  { key: 'notes', label: 'Reporte de Notas' },
  { key: 'students', label: 'Reporte de Estudiantes' },
  { key: 'groups', label: 'Gestión de Grupos' },
]

const studentTabs = [
  { key: 'documents', label: 'Documentos' },
  { key: 'evaluations', label: 'Evaluaciones' },
  { key: 'news', label: 'Noticias' },
  { key: 'notes', label: 'Reporte Notas' },
]

interface CourseQuery {
  semester?: string
  code?: string
  group?: string
  tab?: string
  id_curso?: string
  tabEv?: 'rubrics' | 'assignments' | 'submissions'
}

const CoursePage = () => {
  const router = useRouter()
  const { semester, code, group, id_curso, tab, tabEv = 'rubrics' } = router.query as CourseQuery
  const user = useAuthStore(state => state.user)

  if (!user) return null

  const tabs = user.role === 'professor' ? professorTabs : studentTabs
  
  const handleTabChange = (newTab: string) => {
    const query: ParsedUrlQueryInput = {
      tab: newTab,
      //tabEv // Preserve the current tabEv
    }

    router.push({ 
      pathname: `/courses/${semester}/${code}/${group}/${id_curso}/${newTab}`,
      query 
    })
  }

  const renderContent = () => {
    if (user.role === 'professor') {
      switch (tab) {
        case 'documents': return <DocumentManager courseId={id_curso} groupId={group} />
        case 'rubrics': return <EvaluationManager groupId={id_curso} />
        case 'news': return <NewsEditor groupId={id_curso} />
        case 'notes': return <ReportNotes courseId={code} groupId={id_curso} />
        case 'students': return <ReportStudents groupId={id_curso} />
        case 'groups': return <GroupManager courseId={id_curso} />
        default: return <div className="text-center">Página no encontrada</div> // Handle invalid tabs
      }
    } else {
      switch (tab) {
        case 'documents': return <DocumentViewer />
        case 'evaluations': return <StudentEvaluations />
        case 'news': return <NewsViewer />
        case 'notes': return <ReportNotesStudent /> 
        default: return <div className="text-center">Página no encontrada</div> // Handle invalid tabs
      }
    }
  }

  return (
    <div className="course-page">
      <Header username={user.username} />
      <div className="container py-4">
        <h2>{code} - Grupo {group}</h2>
        <div className="card mt-4">
          <div className="card-header">
            <ul className="nav nav-tabs card-header-tabs">
              {tabs.map(t => (
                <li key={t.key} className="nav-item">
                  <button
                    className={`nav-link ${tab === t.key ? 'active' : ''}`}
                    onClick={() => handleTabChange(t.key)}
                  >
                    {t.label}
                  </button>
                </li>
              ))}
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

export default CoursePage
