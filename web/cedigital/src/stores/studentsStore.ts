import { create } from 'zustand'
import type { Student } from '@/types/groups'

interface StudentsState {
  students: Student[]
  getStudents: () => Student[]
  setStudents: (students: Student[]) => void
}

// Initial mock data
const initialStudents: Student[] = [
  { carnet: '2020123456', apellido1: 'Pérez', apellido2: 'García', nombre: 'Juan' },
  { carnet: '2020654321', apellido1: 'Rodríguez', apellido2: 'López', nombre: 'María' },
  { carnet: '2020111222', apellido1: 'González', apellido2: 'Martínez', nombre: 'Ana' },
]

export const useStudentsStore = create<StudentsState>((set, get) => ({
  students: initialStudents,
  getStudents: () => get().students,
  setStudents: (students) => set({ students })
}))
