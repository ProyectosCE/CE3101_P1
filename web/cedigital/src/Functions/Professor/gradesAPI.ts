import axios from 'axios';
import { API_BASE_URL } from '@/stores/api';

interface Evaluation {
  evaluacion: string;
  nota: number;
  porcentaje: number;
}

interface GradeCategory {
  rubro: string;
  porcentaje: number;
  promedio: number;
  nota_ponderada: number;
  evaluaciones: Evaluation[];
}

interface StudentGrades {
  carnet: string;
  nombre_estudiante: string;
  calificaciones: GradeCategory[];
  nota_total: number;
}

interface GradesResponse {
  calificaciones: StudentGrades[];
}

const BASE_URL = `${API_BASE_URL}/professor`;

export const getGrades = async (courseId: string): Promise<StudentGrades[]> => {
  const response = await axios.get<GradesResponse>(`${BASE_URL}/courses/${courseId}/grades`);
  return response.data.calificaciones;
};
