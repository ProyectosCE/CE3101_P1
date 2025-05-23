import React, { useState } from 'react'
import ProtectedRoute        from '../../components/auth/ProtectedRoute'
import { useAuthStore }      from '../../stores/authStore'
import Header                from '../../components/global/Header'
import CourseManager         from '../../components/admin/CourseManager'
import SchoolManager         from '../../components/admin/SchoolManager'
import SemesterInitializer   from '../../components/admin/SemesterInitializer'
import GroupManager          from '../../components/admin/GroupManager'
import ProfessorManager      from '../../components/admin/ProfessorManager'
import StudentManager        from '../../components/admin/StudentManager'

const AdminDashboard: React.FC = () => {
  const [view, setView] = useState<
    'courses' | 'schools' | 'semester' | 'groups' | 'professors' | 'students'
  >('courses')
  const [studentTabKey, setStudentTabKey] = useState(0)
  const user = useAuthStore((state) => state.user)

  return (
    <ProtectedRoute>
      <div className="admin-dashboard">
        <Header username={user?.username || 'Administrador'} />

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
              className={`nav-link ${view === 'schools' ? 'active' : ''}`}
              onClick={() => setView('schools')}
            >
              Gestión de Escuelas
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
          <li className="nav-item">
            <button
              className={`nav-link ${view === 'groups' ? 'active' : ''}`}
              onClick={() => setView('groups')}
            >
              Gestión de Grupos
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${view === 'professors' ? 'active' : ''}`}
              onClick={() => setView('professors')}
            >
              Gestión de Profesores
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${view === 'students' ? 'active' : ''}`}
              onClick={() => {
                setView('students')
                setStudentTabKey(k => k + 1)
              }}
            >
              Gestión de Estudiantes
            </button>
          </li>
        </ul>

        <div className="admin-content">
          {view === 'courses'     && <CourseManager />}
          {view === 'schools'     && <SchoolManager />}
          {view === 'semester'    && <SemesterInitializer />}
          {view === 'groups'      && <GroupManager />}
          {view === 'professors'  && <ProfessorManager />}
          {view === 'students'    && <StudentManager reloadKey={studentTabKey} />}
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default AdminDashboard
