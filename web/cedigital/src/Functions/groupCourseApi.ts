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

// Crear grupo
export function createGroup(group: {
    numero_grupo: string;
    annio: number;
    periodo: string;
    codigo_curso: string;
    profesores: any[];
}) {
    return apiRequest('post', '/grupos', group);
}

// Actualizar grupo
export function updateGroup(id: string, data: Partial<{
    numero_grupo: string;
    annio: number;
    periodo: string;
    codigo_curso: string;
    profesores: any[];
}>) {
    return apiRequest('patch', `/grupos/${id}`, data);
}

// Activar/desactivar grupo
export function toggleGroup(id: string) {
    return apiRequest('patch', `/grupos/${id}/toggle`);
}

// Subir grupos por Excel
export function uploadGroupsExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('post', '/grupos/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

// Obtener todos los grupos
export function getGroups() {
    return apiRequest('get', '/grupos');
}

// Eliminar grupo
export function deleteGroup(id: string) {
    return apiRequest('delete', `/grupos/${id}`);
}
