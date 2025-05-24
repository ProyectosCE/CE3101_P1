import type { Group } from '@/types/groups'

export interface Rubric {
  id: string
  name: string
  weight: number
}

export interface Assignment {
  id: string
  title: string
  description: string
  rubricId: string
  weight: number
  dueDate: string
  dueTime: string
  isGroupWork: boolean
  instructionsFile: string | null
  linkedCategoryId?: string
  groupOption?: 'existing' | 'new'
  groupTypeId?: string
}

export interface GroupMember {
  carnet: string
  name: string
}

export interface Submission {
  id: string
  studentId: string
  studentName: string
  carnet: string
  submittedAt: string | null
  file: string | null
  grade: number | null
  feedback: string | null
  published: boolean
  group?: Group
}

export interface Activity {
  id: string
  name: string
  published: boolean
  students: Submission[]
}

export interface RubricWithActivities extends Rubric {
  activities: Activity[]
}

export interface EvaluacionGrupo {
  idEvaluacion: string
  idCategoria: string
}

export interface Rubro {
  id: string
  nombre: string
  porcentaje: number
}

export interface Evaluacion {
  id: string
  nombreRubro: string
  descripcion: string
  idRubro: string
  porcentaje: number
  fechaEntrega: string
  horaEntrega: string
  trabajoGrupal: boolean
  idDocumentoInstrucciones: string
}
