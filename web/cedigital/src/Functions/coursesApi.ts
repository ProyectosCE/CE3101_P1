import { API_BASE_URL } from '@/stores/api';
import axios from 'axios';

async function apiRequest<T = any>(
    method: 'get' | 'post' | 'patch' | 'put' | 'delete',
    url: string,
    data?: any,
    config?: any
): Promise<T> {
    const response = await axios({
        method,
        url: `${API_BASE_URL}${url}`,
        data,
        ...config,
    });
    return response.data;
}

export function createCurso(curso: {
    codigo: string;
    nombre: string;
    creditos: number;
    horasLectivas: number;
}) {
    return apiRequest('post', '/cursos', curso);
}

export function updateCurso(id: string, data: Partial<{
    codigo: string;
    nombre: string;
    creditos: number;
    horasLectivas: number;
}>) {
    return apiRequest('patch', `/cursos/${id}`, data);
}

export function toggleCurso(id: string) {
    return apiRequest('patch', `/cursos/${id}/toggle`);
}

export function uploadCursosExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('post', '/cursos/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export function getCursos() {
    return apiRequest('get', '/cursos');
}
