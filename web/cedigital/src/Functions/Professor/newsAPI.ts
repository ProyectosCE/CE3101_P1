import axios from 'axios';
import { API_BASE_URL } from '@/stores/api';

interface Author {
  id: string;
  nombre: string;
}

interface APINewsItem {
  id: string;
  titulo: string;
  fecha: string;
  autor: Author;
  cuerpo: string;
}

interface NewsResponse {
  noticias: APINewsItem[];
}

export interface CreateNewsDTO {
  titulo: string;
  cuerpo: string;
  fecha: string;
  autorId: string;
  cursoId: string;
}

const BASE_URL = `${API_BASE_URL}/professor`;

export const getNews = async (): Promise<APINewsItem[]> => {
  const response = await axios.get<NewsResponse>(`${BASE_URL}/news`);
  return response.data.noticias;
};

export const createNews = async (news: CreateNewsDTO) => {
  const response = await axios.post(`${BASE_URL}/news`, news);
  return response.data;
};

export const updateNews = async (id: string, news: Partial<CreateNewsDTO>) => {
  const response = await axios.patch(`${BASE_URL}/news/${id}`, news);
  return response.data;
};

export const deleteNews = async (id: string) => {
  await axios.delete(`${BASE_URL}/news/${id}`);
};
