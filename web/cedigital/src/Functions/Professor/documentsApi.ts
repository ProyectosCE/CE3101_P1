import { API_BASE_URL } from '@/stores/api';
import axios from 'axios';

// Tipos alineados con backend
export interface Folder {
    id_carpeta: number;
    nombre: string;
    id_grupo: number;
    cedula_profesor?: string;
}
export interface File {
    id_documento: number;
    nombre_archivo: string;
    size: number;
    fecha_subida: string;
    id_carpeta: number;
}

// CRUD Carpetas
export function getFoldersByGroup(id_grupo: number) {
    return axios.get(`${API_BASE_URL}/carpeta/grupo/${id_grupo}`).then(res => res.data);
}
export function getFolderById(id_carpeta: number) {
    return axios.get(`${API_BASE_URL}/carpeta/${id_carpeta}`).then(res => res.data);
}
export function createFolder(id_grupo: number, cedula_profesor: string, nombre: string) {
    return axios.post(`${API_BASE_URL}/carpeta/${id_grupo}/${cedula_profesor}`, { nombre });
}
export function updateFolder(id_carpeta: number, nombre: string) {
    return axios.patch(`${API_BASE_URL}/carpeta/${id_carpeta}`, { nombre });
}
export function deleteFolder(id_carpeta: number) {
    return axios.delete(`${API_BASE_URL}/carpeta/${id_carpeta}`);
}

// CRUD Archivos
export function getFilesByFolder(id_carpeta: number) {
    return axios.get(`${API_BASE_URL}/documento/${id_carpeta}`).then(res => res.data);
}
export function uploadFileToFolder(id_carpeta: number, file: File) {
    const formData = new FormData();
    formData.append('archivo', file as any);
    return axios.post(`${API_BASE_URL}/documento/upload/${id_carpeta}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}
export function renameFile(id_documento: number, newName: string) {
    return axios.patch(`${API_BASE_URL}/documento/${id_documento}`, { nombre: newName });
}
export function deleteFile(id_documento: number) {
    return axios.delete(`${API_BASE_URL}/documento/${id_documento}`);
}
