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
export function createGroup(profesores: string[], annio: string, periodo: string, group: {
    numero_grupo: string;
    estado: 'activo' | 'inactivo';
    codigo_curso: string;
}) {
    const queryParams = [
        `anio=${annio}`,
        `periodo=${periodo}`,
        ...profesores.map(p => `profesores=${p}`)
    ].join('&');
    return apiRequest('post', `Grupo/?${queryParams}`, group);
}

// Actualizar grupo
export function updateGroup(id: string, profesores: string[], annio: string, periodo: string, data: Partial<{
    id_grupo: string;
    numero_grupo: string;
    codigo_curso: string;
    estado: string
}>) {
    const queryParams = [
        `anio=${annio}`,
        `periodo=${periodo}`,
        ...profesores.map(p => `profesores=${p}`)
    ].join('&');
    
    return apiRequest('patch', `Grupo/${id}/?${queryParams}`, data);
}

// Activar/desactivar grupo
export function toggleGroup(id: string) {
    return apiRequest('patch', `Grupo/${id}/toggle`);
}

// Subir grupos por Excel
export function uploadGroupsExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('post', 'Grupo/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

// Obtener todos los grupos
export function getGroups() {
    return apiRequest('get', 'Grupo');
}

// Eliminar grupo
export function deleteGroup(id: string) {
    return apiRequest('delete', `Grupo/${id}`);
}
