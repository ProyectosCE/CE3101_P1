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

export function createGroup(group: {
    groupNumber: string;
    annio: string;
    periodo: string;
    courseCode: string;
    profesores: any[];
}) {
    return apiRequest('post', '/grupos', group);
}

export function updateGroup(id: string, data: Partial<{
    groupNumber: string;
    annio: string;
    periodo: string;
    courseCode: string;
    profesores: any[];
}>) {
    return apiRequest('patch', `/grupos/${id}`, data);
}

export function toggleGroup(id: string) {
    return apiRequest('patch', `/grupos/${id}/toggle`);
}

export function uploadGroupsExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('post', '/grupos/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export function getGroups() {
    return apiRequest('get', '/grupos');
}
