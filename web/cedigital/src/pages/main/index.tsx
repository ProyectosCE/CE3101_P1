import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import Header from '@/components/global/Header'
import SemesterSection from '@/components/courses/SemesterSection'
import { Semester, UserGroup } from '@/types/course'
import { getUserGroups } from '@/Functions/mainGroupsApi'

const Main: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return;
    setLoading(true)
    getUserGroups(user.username)
      .then((groups: UserGroup[]) => {
        const semesterGroups = groups.reduce((acc: Record<string, Semester>, group) => {
          const semesterId = `${group.semestre.periodo}-${group.semestre.anio}`;
          if (!acc[semesterId]) {
            acc[semesterId] = {
              id: semesterId,
              name: `${group.semestre.periodo} SEMESTRE ${group.semestre.anio}`,
              isActive: true, // You might want to determine this based on current date
              courses: []
            };
          }
          
          acc[semesterId].courses.push({
            code: group.codigo_curso,
            name: group.nombre_curso,
            group: group.numero_grupo,
            professor: `${group.profesor.nombre} ${group.profesor.apellidos}`
          });
          
          return acc;
        }, {});

        setSemesters(Object.values(semesterGroups));
      })
      .catch(error => {
        console.error('Error loading groups:', error)
        setSemesters([])
      })
      .finally(() => setLoading(false))
  }, [user])

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
