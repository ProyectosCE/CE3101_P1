import { API_BASE_URL } from '@/stores/api';
import axios from 'axios';

interface Professor {
    cedula: string;
    nombre: string;
    correo: string;
    telefono: string;
}

interface MainGroup {
    groupNumber: string;
    annio: string;
    periodo: string;
    courseCode: string;
    estado: string;
    profesores: Professor[];
}

interface MainGroupsResponse {
    groups: MainGroup[];
}

export async function getMainGroups(): Promise<MainGroupsResponse> {
    const response = await axios.get(`${API_BASE_URL}/main/groups`);
    return response.data;
}
