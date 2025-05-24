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

// Crear profesor
export function createProfesor(profesor: {
    cedula: string;
    nombre: string;
    correo: string;
}) {
    return apiRequest('post', 'Profesor', profesor);
}

// Actualizar profesor
export function updateProfesor(id: string, data: Partial<{
    id: string;
    cedula: string;
    nombre: string;
    apellidos: string;
    estado: string;
    password: string;
    correo: string;
    telefono: string;
    isAdmin: boolean;
}>) {
    return apiRequest('patch', `Profesor/${id}`, data);
}

// Activar/desactivar profesor
export function toggleProfesorState(id: string) {
    return apiRequest('patch', `Profesor/${id}/toggle`);
}

// Subir profesores por Excel
export function uploadProfesoresExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('post', 'Profesor/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

// Obtener todos los profesores
export function getProfesores() {
    return apiRequest('get', 'Profesor');
}

// Eliminar profesor
export function deleteProfesor(id: string) {
    return apiRequest('delete', `Profesor/${id}`);
}
