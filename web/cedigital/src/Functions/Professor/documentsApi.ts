import { API_BASE_URL } from '@/stores/api';
import axios from 'axios';

// Tipos alineados con backend
export interface Folder {
    id_carpeta: number;
    nombre: string;
    id_grupo: number;
    cedula_profesor: string | null;  // Changed from string | undefined to string | null
}
export interface File {
    id_documento: number;
    nombre_archivo: string;
    size: number;
    fecha_subida: string;
    id_carpeta: number;
}

interface FileApiResponse {
  data?: File[];
  error?: string;
}

// API response interface
interface FileApiResponse {
  data?: {
    archivos: File[];
  };
  error?: string;
}

// CRUD Carpetas
export const getFoldersByGroup = async (courseId: string): Promise<Folder[]> => {
  console.log('getFoldersByGroup called with:', courseId)
  console.log('API URL:', `${API_BASE_URL}Carpeta/Grupo/${courseId}`)
  
  try {
    const response = await fetch(`${API_BASE_URL}Carpeta/Grupo/${courseId}`)
    console.log('API Response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('API Response data:', data)
    return data
  } catch (error) {
    console.error('Error in getFoldersByGroup:', error)
    throw error
  }
}

export function getFolderById(id_carpeta: number) {
    return axios.get(`${API_BASE_URL}Carpeta/${id_carpeta}`).then(res => res.data);
}
export async function createFolder(nombre: string, id_grupo: number, cedula_profesor:string): Promise<Folder> {
  const response = await axios.post<Folder>(
    `${API_BASE_URL}Carpeta/${id_grupo}/${cedula_profesor}`,
    { nombre, id_grupo, cedula_profesor},
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
      }
    }
  );
  return response.data;
}
export function updateFolder(id_carpeta: number, nombre: string) {
    return axios.patch(`${API_BASE_URL}Carpeta/${id_carpeta}`, { nombre });
}
export function deleteFolder(id_carpeta: number) {
    return axios.delete(`${API_BASE_URL}Carpeta/${id_carpeta}`);
}

// CRUD Archivos
export async function getFilesByFolder(id_carpeta: number): Promise<FileApiResponse> {
  try {
    const response = await axios.get<File[]>(`${API_BASE_URL}Documento/${id_carpeta}`);
    return { data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        return { error: 'Error de conexión. Por favor, verifique su conexión a internet.' };
      }
      if (error.response.status === 404) {
        return { data: [] };
      }
    }
    return { error: 'Error al obtener los archivos. Por favor, intente más tarde.' };
  }
}

export async function uploadFileToFolder(id_carpeta: number, file: globalThis.File): Promise<File> {
  const formData = new FormData();
  formData.append('archivo', file);
  
  const response = await axios.post<File>(
    `${API_BASE_URL}Documento/upload/${id_carpeta}`, 
    formData, 
    {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Accept': '*/*'
      }
    }
  );
  
  return response.data;
}
export async function renameFile(id_documento: number, newName: string): Promise<File> {
  const response = await axios.patch<File>(
    `${API_BASE_URL}Documento/${id_documento}`, 
    { nombre: newName },
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
      }
    }
  );
  return response.data;
}
export function deleteFile(id_documento: number) {
    return axios.delete(`${API_BASE_URL}Documento/${id_documento}`);
}
export async function downloadFile(id_documento: number): Promise<{ url: string; filename: string }> {
  return {
    url: `${API_BASE_URL}Documento/${id_documento}/download`,
    filename: `documento_${id_documento}`  // Default filename pattern
  };
}

/**
 * Sube un archivo de instrucciones de evaluación.
 * @param id_grupo number
 * @param file File
 * @param codigo_curso string
 * @param id_semestre string|number
 * @returns Promise<{ id_documento: number }>
 */
export async function uploadEvaluationInstructions(
  id_grupo: number,
  file: File,
  codigo_curso: string,
  id_semestre: string | number
): Promise<{ id_documento: number }> {
  const params = new URLSearchParams({
    id_grupo: id_grupo.toString(),
    codigo_curso: codigo_curso.toString(),
    id_semestre: id_semestre.toString()
  });
  const formData = new FormData();
  formData.append('archivo', file);
  const response = await axios.post(
    `${API_BASE_URL}Documento/evaluaciones?${params.toString()}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
}
