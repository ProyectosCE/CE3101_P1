import axios from 'axios';
import { API_BASE_URL } from '@/stores/api';
import type { Student as ReportStudent } from '@/components/professor/ReportStudents';
import type { Student as GroupStudent } from '@/types/groups';

interface APIStudent {
  carnet: string;
  cedula: string;
  nombre: string;
  correo: string;
  telefono: string;
}

interface StudentsResponse {
  students: APIStudent[];
}

const BASE_URL = `${API_BASE_URL}/professor`;

export const getStudentsByCourse = async (courseId: string): Promise<ReportStudent[]> => {
  const response = await axios.get<StudentsResponse>(`${BASE_URL}/courses/${courseId}/students`);
  return response.data.students.map(student => ({
    carnet: student.carnet,
    email: student.correo,
    phone: student.telefono,
    name: student.nombre
  }));
};

const convertToGroupStudent = (apiStudent: APIStudent): GroupStudent => ({
  carnet: apiStudent.carnet,
  nombre: apiStudent.nombre,
  apellido1: '',  // Add default values since API doesn't provide these
  apellido2: ''
});

export const getAllStudentsByCourse = async (courseId: string): Promise<GroupStudent[]> => {
  const response = await axios.get<StudentsResponse>(`${BASE_URL}/courses/${courseId}/students`);
  return response.data.students.map(convertToGroupStudent);
};
