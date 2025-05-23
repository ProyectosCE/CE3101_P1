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

export function createProfesor(profesor: {
    cedula: string;
    nombre: string;
    correo: string;
    telefono: string;
}) {
    return apiRequest('post', '/profesores', profesor);
}

export function updateProfesor(id: string, data: Partial<{
    cedula: string;
    nombre: string;
    correo: string;
    telefono: string;
}>) {
    return apiRequest('patch', `/profesores/${id}`, data);
}

export function toggleProfesor(id: string) {
    return apiRequest('patch', `/profesores/${id}/toggle`);
}

export function uploadProfesoresExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('post', '/profesores/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export function getProfesores() {
    return apiRequest('get', '/profesores');
}
