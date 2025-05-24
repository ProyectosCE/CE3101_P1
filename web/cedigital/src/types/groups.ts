export interface Student {
  carnet: string
  apellidos: string
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
