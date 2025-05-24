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

// Crear estudiante
export function createEstudiante(estudiante: {
    carnet: string;
    cedula: string;
    nombre: string;
    correo: string;
    telefono: string;
}) {
    return apiRequest('post', '/estudiantes', estudiante);
}

// Actualizar estudiante
export function updateEstudiante(id: string, data: Partial<{
    carnet: string;
    cedula: string;
    nombre: string;
    correo: string;
    telefono: string;
}>) {
    return apiRequest('patch', `/estudiantes/${id}`, data);
}

// Activar/desactivar estudiante
export function toggleEstudiante(id: string) {
    return apiRequest('patch', `/estudiantes/${id}/toggle`);
}

// Subir estudiantes por Excel
export function uploadEstudiantesExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('post', '/estudiantes/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

// Obtener todos los estudiantes
export function getEstudiantes() {
    return apiRequest('get', '/estudiantes');
}

// Eliminar estudiante
export function deleteEstudiante(id: string) {
    return apiRequest('delete', `/estudiantes/${id}`);
}
