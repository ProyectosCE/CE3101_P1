import { API_BASE_URL } from '@/stores/api';
import axios from 'axios';

interface Folder {
    id: string;
    nombre: string;
}

interface File {
    id: string;
    idCarpeta: string;
    nombre: string;
    fecha: string;
    tamano: string;
}

interface FoldersResponse {
    carpetas: Folder[];
}

interface FilesResponse {
    archivos: File[];
}

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

// Obtener todas las carpetas
export function getFolders(): Promise<FoldersResponse> {
    return apiRequest('get', '/profesor/carpetas');
}

// Obtener archivos de una carpeta específica
export function getFilesByFolder(folderId: string): Promise<FilesResponse> {
    return apiRequest('get', `/profesor/carpetas/${folderId}/archivos`);
}

// TODO: Agregar más funciones según se necesiten (crear carpeta, subir archivo, etc.)
