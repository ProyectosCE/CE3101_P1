import { API_BASE_URL } from '@/stores/api';
import axios from 'axios';

// Types
export interface Estudiante {
  carnet: string;
  nombre: string;
}

export interface Grupo {
  idGrupo: string;
  nombreGrupo: string;
  estudiantes: Estudiante[];
}

export interface Entrega {
  identrega: string;
  idEvaluacion: string;
  grupal: boolean;
  entregado: boolean;
  estudiante?: Estudiante;
  grupo?: Grupo;
  idDocumentoEntrega?: string;
  fechaEntrega?: string;
  horaEntrega?: string;
  calificacion?: number;
  comentario?: string;
  idDocRetroalimentacion?: string;
  calificacionPublicada: boolean;
}

interface EntregasResponse {
  entregas: Entrega[];
}

// API Functions
export const entregasApi = {
  // CRUD principal
  getEntregasByEvaluacion: (evaluacionId: number) =>
    axios.get(`${API_BASE_URL}/entregas?idEvaluacion=${evaluacionId}`),

  getEntregaById: (idEntrega: number) =>
    axios.get(`${API_BASE_URL}/entregas/${idEntrega}`),

  // Update submission grade and feedback
  updateCalificacion: (entregaId: number, data: {
    calificacion: number;
    comentario?: string;
  }) =>
    axios.patch(`${API_BASE_URL}/entregas/${entregaId}/calificacion`, data),

  // Upload feedback document
  uploadRetroalimentacion: (entregaId: number, file: File, comentario: string) => {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('comentario', comentario);
    return axios.patch(
      `${API_BASE_URL}/entregas/${entregaId}/retroalimentacion`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  // Toggle grade publication status
  togglePublicacion: (entregaId: number) =>
    axios.patch(`${API_BASE_URL}/entregas/${entregaId}/toggle-estado`, {}),

  // Download submission file
  downloadEntrega: (entregaId: number) =>
    axios.get(`${API_BASE_URL}/entregas/${entregaId}/download`, {
      responseType: 'blob'
    }),

  // Download feedback file
  downloadRetroalimentacion: (entregaId: number) =>
    axios.get(`${API_BASE_URL}/entregas/${entregaId}/retroalimentacion/download`, {
      responseType: 'blob'
    }),

  // Helper function to load all submissions for all rubrics
  getAllEntregas: () =>
    axios.get(`${API_BASE_URL}/entregas`).then(res => res.data)
};
