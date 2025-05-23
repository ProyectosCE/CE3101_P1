import axios from 'axios';
import { API_BASE_URL } from '@/stores/api';
import { Student } from '../../components/professor/ReportStudents';

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

export const getStudentsByCourse = async (courseId: string): Promise<Student[]> => {
  const response = await axios.get<StudentsResponse>(`${BASE_URL}/courses/${courseId}/students`);
  return response.data.students.map(student => ({
    carnet: student.carnet,
    name: student.nombre,
    email: student.correo,
    phone: student.telefono
  }));
};
