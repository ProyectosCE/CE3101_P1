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

// Remove GradesResponse interface since API returns array directly

export const getGrades = async (codigo_curso: string, id_grupo: number): Promise<StudentGrades[]> => {
  const response = await axios.get<StudentGrades[]>(`${API_BASE_URL}calificacion`, {
    params: { codigo_curso, id_grupo }
  });
  return response.data;
};

/**
 * Obtiene el reporte de notas de un estudiante específico.
 */
export const getStudentGrades = async (
  codigo_curso: string,
  id_grupo: number,
  carnet: string
) => {
  const response = await axios.get(`${API_BASE_URL}calificacion/estudiante`, {
    params: { codigo_curso, id_grupo, carnet }
  });
  return response.data;
};

/**
 * Obtiene la entrega individual de un estudiante para una evaluación.
 */
export const getEntregaEstudiante = async (idEstudiante: string, idEvaluacion: number) => {
  const response = await axios.get(`${API_BASE_URL}Entregas/estudiante`, {
    params: { idEstudiante, idEvaluacion }
  });
  return response.data;
};

/**
 * Obtiene la entrega grupal de un estudiante para una evaluación.
 */
export const getEntregaEstudianteGrupal = async (idEstudiante: string, idEvaluacion: number) => {
  const response = await axios.get(`${API_BASE_URL}Entregas/estudiante/grupal`, {
    params: { idEstudiante, idEvaluacion }
  });
  return response.data;
};
