import { API_BASE_URL } from '@/stores/api';
import axios from 'axios';

// Obtener todos los semestres
export function getSemestres() {
    return axios.get(`${API_BASE_URL}/semestre`).then(res => res.data);
}

// Obtener semestre por ID
export function getSemestreById(id: number) {
    return axios.get(`${API_BASE_URL}/semestre/${id}`).then(res => res.data);
}

// Crear semestre
export function createSemestre(data: { anio: number; periodo: string; estado?: string }) {
    return axios.post(`${API_BASE_URL}/semestre`, data).then(res => res.data);
}

// Actualizar semestre
export function updateSemestre(id: number, data: { anio?: number; periodo?: string; estado?: string }) {
    return axios.patch(`${API_BASE_URL}/semestre/${id}`, data).then(res => res.data);
}

// Eliminar semestre
export function deleteSemestre(id: number) {
    return axios.delete(`${API_BASE_URL}/semestre/${id}`).then(res => res.data);
}

// Activar/desactivar semestre
export function toggleSemestre(id: number) {
    return axios.patch(`${API_BASE_URL}/semestre/${id}/toggle`).then(res => res.data);
}

// Subir Excel para inicializar semestre
export function uploadSemestresExcel(file: File) {
    const formData = new FormData();
    formData.append('archivoExcel', file);
    return axios.post(`${API_BASE_URL}/iniciarsemestre/upload_excel`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

// Inicializar semestre (desde datos ya procesados)
export function inicializarSemestre(data: any) {
    return axios.post(`${API_BASE_URL}/iniciarsemestre/inicializar`, data);
}
