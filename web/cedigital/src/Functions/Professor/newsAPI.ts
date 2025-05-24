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

export const getNews = async (id_grupo: number) => {
  const response = await axios.get(`${API_BASE_URL}/noticia/grupo/${id_grupo}`);
  return response.data;
};

export const createNews = async (news: any) => {
  const response = await axios.post(`${API_BASE_URL}/noticia`, news);
  return response.data;
};

export const updateNews = async (id: number, news: any) => {
  const response = await axios.patch(`${API_BASE_URL}/noticia/${id}`, news);
  return response.data;
};

export const deleteNews = async (id: number) => {
  await axios.delete(`${API_BASE_URL}/noticia/${id}`);
};
