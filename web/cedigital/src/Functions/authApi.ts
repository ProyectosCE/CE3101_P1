import axios from 'axios';
import { API_BASE_URL } from '../stores/api';

export interface LoginResponse {
  message: string;
  role: 'profesor' | 'estudiante' | 'admin';
  id: string;
  carnet: string;
}

export const loginUser = async (correo: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_BASE_URL}Auth/login`, {
      correo,
      password
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Credenciales inválidas');
    }
    throw new Error('Error al iniciar sesión');
  }
};
