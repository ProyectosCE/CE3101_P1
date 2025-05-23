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

export function getSemestres() {
    return apiRequest('get', '/semestres');
}

export function uploadSemestresExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('post', '/semestres/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

// Puedes agregar create, update, toggle, etc. aquí si el backend los soporta.
