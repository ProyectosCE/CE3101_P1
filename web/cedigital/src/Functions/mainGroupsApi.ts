import axios from 'axios';
import { API_BASE_URL } from '../stores/api';
import { UserGroup } from '@/types/course';

export const getUserGroups = async (identifier: string): Promise<UserGroup[]> => {
  const response = await axios.get<UserGroup[]>(`${API_BASE_URL}Grupo/usuario/${identifier}`);
  return response.data;
};
