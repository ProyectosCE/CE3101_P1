import axios from 'axios';
import { API_BASE_URL } from '../stores/api';

export interface ApiSchool {
    codigo_carrera: string;
    nombre: string;
    estado: 'activo' | 'inactivo';
}

// Get all schools
export const getEscuelas = async (): Promise<ApiSchool[]> => {
    const response = await axios.get<ApiSchool[]>(`${API_BASE_URL}Carrera`);
    return response.data;
}

// Get single school
export const getEscuela = async (codigo: string): Promise<ApiSchool> => {
    const response = await axios.get<ApiSchool>(`${API_BASE_URL}Carrera/${codigo}`);
    return response.data;
}

// Create school
export const createEscuela = async (escuela: Omit<ApiSchool, 'estado'>): Promise<ApiSchool> => {
    const response = await axios.post<ApiSchool>(`${API_BASE_URL}Carrera`, escuela);
    return response.data;
}

// Update school
export const updateEscuela = async (codigo: string, escuela: ApiSchool): Promise<ApiSchool> => {
    const response = await axios.patch<ApiSchool>(`${API_BASE_URL}Carrera/${codigo}`, escuela);
    return response.data;
}

// Toggle school state
export const toggleEscuela = async (codigo: string): Promise<ApiSchool> => {
    const response = await axios.patch<ApiSchool>(`${API_BASE_URL}Carrera/${codigo}/toggle`);
    return response.data;
}

// Upload schools from Excel
export function uploadEscuelasExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_BASE_URL}Carrera/upload-excel`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(response => response.data);
}
