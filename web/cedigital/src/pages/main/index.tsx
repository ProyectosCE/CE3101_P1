import React from 'react'
import { useAuthStore } from '../../stores/authStore'
import Header from '@/components/global/Header'
import SemesterSection from '@/components/courses/SemesterSection'
import { Semester } from '@/types/course'

// Mock data - replace with actual API call later
const mockSemesters: Semester[] = [
  {
    id: '1-2025',
    name: '1 SEMESTRE 2025',
    isActive: true,
    courses: [
      { code: 'CE3101', name: 'BASES DE DATOS', group: '01', professor: 'Juan Perez' },
      { code: 'CE1104', name: 'PROGRAMACIÓN', group: '02', professor: 'Maria Rodriguez' },
    ]
  },
  {
    id: 'V-2024',
    name: 'VERANO 2024',
    isActive: false,
    courses: [
      { code: 'MA1101', name: 'MATEMÁTICA', group: '01', professor: 'Pedro Gomez' },
    ]
  },
  // ...add more semesters
]

const Main: React.FC = () => {
  const user = useAuthStore((state) => state.user)

  if (!user) return null

  return (
    <div className="main-layout">
      <Header username={user.username} />
      <div className="container py-4">
        {mockSemesters.map(semester => (
          <SemesterSection key={semester.id} semester={semester} />
        ))}
      </div>
    </div>
  )
}

export default Main
