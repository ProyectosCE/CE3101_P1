import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../stores/api';
import { UserGroup } from '@/types/course';

interface ApiResponse {
  data?: UserGroup[];
  error?: string;
}

export const getUserGroups = async (identifier: string): Promise<ApiResponse> => {
  try {
    const response = await axios.get<UserGroup[]>(`${API_BASE_URL}Grupo/usuario/${identifier}`);
    return { data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        return { error: 'Error de conexión. Por favor, verifique su conexión a internet.' };
      }
      if (error.response.status === 404) {
        return { error: 'No se encontraron grupos para este usuario.' };
      }
    }
    return { error: 'Error al obtener los grupos. Por favor, intente más tarde.' };
  }
};
