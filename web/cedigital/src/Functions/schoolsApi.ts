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

// Crear escuela
export function createEscuela(escuela: {
    codigo: string;
    nombre: string;
}) {
    return apiRequest('post', '/escuelas', escuela);
}

// Actualizar escuela
export function updateEscuela(id: string, data: Partial<{
    codigo: string;
    nombre: string;
}>) {
    return apiRequest('patch', `/escuelas/${id}`, data);
}

// Activar/desactivar escuela
export function toggleEscuela(id: string) {
    return apiRequest('patch', `/escuelas/${id}/toggle`);
}

// Subir escuelas por Excel
export function uploadEscuelasExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('post', '/escuelas/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

// Obtener todas las escuelas
export function getEscuelas() {
    return apiRequest('get', '/escuelas');
}

// Eliminar escuela
export function deleteEscuela(id: string) {
    return apiRequest('delete', `/escuelas/${id}`);
}
