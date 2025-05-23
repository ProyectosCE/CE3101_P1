import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import Header from '@/components/global/Header'
import SemesterSection from '@/components/courses/SemesterSection'
import { Semester } from '@/types/course'
import { getMainGroups } from '@/Functions/mainGroupsApi'

const Main: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getMainGroups()
      .then(({ groups }) => {
        // Agrupar por periodo
        const semesterGroups = groups.reduce((acc, group) => {
          const semesterId = `${group.periodo}-${group.annio}`
          if (!acc[semesterId]) {
            acc[semesterId] = {
              id: semesterId,
              name: `${group.periodo} SEMESTRE ${group.annio}`,
              isActive: group.estado === 'Activo',
              courses: []
            }
          }
          
          acc[semesterId].courses.push({
            code: group.courseCode,
            name: group.courseCode, // TODO: get course name from another API
            group: group.groupNumber,
            professor: group.profesores.map(p => p.nombre).join(', ')
          })
          
          return acc
        }, {} as Record<string, Semester>)

        setSemesters(Object.values(semesterGroups))
      })
      .catch(error => {
        console.error('Error loading groups:', error)
        setSemesters([])
      })
      .finally(() => setLoading(false))
  }, [])

  if (!user) return null

  return (
    <div className="main-layout">
      <Header username={user.username} />
      <div className="container py-4">
        {loading ? (
          <div className="text-center">Cargando grupos...</div>
        ) : semesters.length > 0 ? (
          semesters.map(semester => (
            <SemesterSection key={semester.id} semester={semester} />
          ))
        ) : (
          <div className="text-center text-muted">No hay grupos disponibles</div>
        )}
      </div>
    </div>
  )
}

export default Main
