import axios from 'axios';
import { API_BASE_URL } from '../stores/api';
import { ApiCourse } from '@/types/course';

export const getCursos = async (): Promise<ApiCourse[]> => {
  const response = await axios.get<ApiCourse[]>(`${API_BASE_URL}Curso`);
  return response.data;
};

export const createCurso = async (curso: ApiCourse): Promise<ApiCourse> => {
  const response = await axios.post<ApiCourse>(`${API_BASE_URL}Curso`, curso);
  return response.data;
};

export const updateCurso = async (curso: ApiCourse): Promise<ApiCourse> => {
  const response = await axios.patch<ApiCourse>(`${API_BASE_URL}Curso/${curso.codigo_curso}`, curso);
  return response.data;
};

export const toggleCursoState = async (codigoCurso: string): Promise<ApiCourse> => {
  const response = await axios.patch<ApiCourse>(`${API_BASE_URL}Curso/${codigoCurso}/toggle`);
  return response.data;
};
