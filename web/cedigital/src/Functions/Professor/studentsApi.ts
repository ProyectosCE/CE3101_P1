import axios from 'axios';
import { API_BASE_URL } from '@/stores/api';
import type { Student as ReportStudent } from '@/components/professor/ReportStudents';
import type { Student as GroupStudent } from '@/types/groups';

interface APIStudent {
  carnet: string;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
}

export const getStudentsByCourse = async (courseId: string): Promise<ReportStudent[]> => {
  const response = await axios.get<APIStudent[]>(`${API_BASE_URL}Grupo/Estudiantes/${courseId}`);
  return response.data.map(student => ({
    carnet: student.carnet,
    email: student.correo,
    phone: student.telefono,
    name: `${student.nombre} ${student.apellidos}`
  }));
};



// Obtener todos los estudiantes
export const getAllStudents = async () => {
  const response = await axios.get(`${API_BASE_URL}/estudiantes`);
  return response.data;
};

// Obtener estudiantes por grupo
export const getStudentsByGroup = async (id_grupo: number) => {
  const response = await axios.get(`${API_BASE_URL}/grupo/${id_grupo}/estudiantes`);
  return response.data;
};
