export interface Course {
  code: string
  name: string
  group: string
  professor: string
}

export interface Semester {
  id: string
  name: string
  isActive: boolean
  courses: Course[]
}
