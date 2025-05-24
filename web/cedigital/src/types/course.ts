export interface Course {
  code: string
  name: string
  group: number // Changed from string to number
  professor: string
}

export interface Semester {
  id: string
  name: string
  isActive: boolean
  courses: Course[]
}

export interface SemesterInfo {
  anio: number;
  periodo: string;
}

export interface Professor {
  cedula: string;
  nombre: string;
  apellidos: string;
  correo: string;
}

export interface UserGroup {
  id_grupo: number;
  numero_grupo: number;
  codigo_curso: string;
  nombre_curso: string;
  semestre: SemesterInfo;
  profesor: Professor;
}

export interface ApiCourse {
  codigo_curso: string;
  nombre: string;
  creditos: number;
  estado: string;
  codigo_carrera: string;
}
