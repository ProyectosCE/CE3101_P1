export interface Student {
  carnet: string
  apellido1: string
  apellido2: string
  nombre: string
}

export interface GroupActivity {
  id: string
  name: string
}

export interface Group {
  id: string
  name: string
  activityId: string | null
  members: Student[]
}
