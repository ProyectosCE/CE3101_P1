import { API_BASE_URL } from '@/stores/api';
import axios from 'axios';

interface Professor {
    cedula: string;
    nombre: string;
    correo: string;
    telefono: string;
}

interface MainGroup {
    id_grupo: number;
    numero_grupo: string;
    annio: number;
    periodo: string;
    codigo_curso: string;
    estado: string;
    profesores: Professor[];
}

interface MainGroupsResponse {
    grupos: MainGroup[];
}

// Obtener todos los grupos principales
export async function getMainGroups(): Promise<MainGroupsResponse> {
    const response = await axios.get(`${API_BASE_URL}/grupos`);
    return { grupos: response.data };
}

// Obtener grupo por ID
export async function getMainGroupById(id_grupo: number): Promise<MainGroup> {
    const response = await axios.get(`${API_BASE_URL}/grupos/${id_grupo}`);
    return response.data;
}

// Crear grupo principal
export async function createMainGroup(group: {
    numero_grupo: string;
    annio: number;
    periodo: string;
    codigo_curso: string;
    profesores: Professor[];
}) {
    const response = await axios.post(`${API_BASE_URL}/grupos`, group);
    return response.data;
}

// Actualizar grupo principal
export async function updateMainGroup(id_grupo: number, data: Partial<MainGroup>) {
    const response = await axios.patch(`${API_BASE_URL}/grupos/${id_grupo}`, data);
    return response.data;
}

// Eliminar grupo principal
export async function deleteMainGroup(id_grupo: number) {
    const response = await axios.delete(`${API_BASE_URL}/grupos/${id_grupo}`);
    return response.data;
}

// Activar/desactivar grupo principal
export async function toggleMainGroup(id_grupo: number) {
    const response = await axios.patch(`${API_BASE_URL}/grupos/${id_grupo}/toggle`);
    return response.data;
}
