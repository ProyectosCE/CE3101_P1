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
  // Get all submissions for a specific evaluation
  getEntregasByEvaluacion: (evaluacionId: string) =>
    axios.get<EntregasResponse>(`${API_BASE_URL}/profesor/evaluaciones/${evaluacionId}/entregas`),

  // Get all submissions for a rubric
  getEntregasByRubro: async (rubroId: string) => {
    const response = await axios.get<{evaluaciones: {id: string}[]}>(
      `${API_BASE_URL}/profesor/rubros/${rubroId}/evaluaciones`
    );
    
    const entregasPromises = response.data.evaluaciones.map(evaluacion => 
      axios.get<EntregasResponse>(`${API_BASE_URL}/profesor/evaluaciones/${evaluacion.id}/entregas`)
    );
    
    const entregasResponses = await Promise.all(entregasPromises);
    return entregasResponses.flatMap(res => res.data.entregas);
  },

  // Update submission grade and feedback
  updateCalificacion: (entregaId: string, data: {
    calificacion: number;
    comentario?: string;
  }) =>
    axios.patch(`${API_BASE_URL}/profesor/entregas/${entregaId}/calificacion`, data),

  // Upload feedback document
  uploadRetroalimentacion: (entregaId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(
      `${API_BASE_URL}/profesor/entregas/${entregaId}/retroalimentacion`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  // Toggle grade publication status
  togglePublicacion: (entregaId: string) =>
    axios.post(`${API_BASE_URL}/profesor/entregas/${entregaId}/publicar`),

  // Download submission file
  downloadEntrega: (entregaId: string) =>
    axios.get(`${API_BASE_URL}/profesor/entregas/${entregaId}/documento`, {
      responseType: 'blob'
    }),

  // Download feedback file
  downloadRetroalimentacion: (entregaId: string) =>
    axios.get(`${API_BASE_URL}/profesor/entregas/${entregaId}/retroalimentacion`, {
      responseType: 'blob'
    }),

  // Helper function to load all submissions for all rubrics
  getAllEntregas: async () => {
    const response = await axios.get<EntregasResponse>(
      `${API_BASE_URL}/profesor/entregas`
    );
    return response.data.entregas;
  }
};
