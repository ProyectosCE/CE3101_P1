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

// Obtener notas por grupo (curso y grupo)
export const getGrades = async (codigo_curso: string, id_grupo: number) => {
  const response = await axios.get(`${API_BASE_URL}/calificacion`, {
    params: { codigo_curso, id_grupo }
  });
  return response.data;
};
