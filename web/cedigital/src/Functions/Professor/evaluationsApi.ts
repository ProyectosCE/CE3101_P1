import { API_BASE_URL } from '@/stores/api';
import axios from 'axios';

// Rubros CRUD
export const rubrosApi = {
    getRubros: (id_grupo: number) =>
        axios.get(`${API_BASE_URL}/rubro/grupo/${id_grupo}`),
    getRubroById: (id: number) =>
        axios.get(`${API_BASE_URL}/rubro/${id}`),
    createRubro: (data: any) =>
        axios.post(`${API_BASE_URL}/rubro`, data),
    updateRubro: (id: number, data: any) =>
        axios.patch(`${API_BASE_URL}/rubro/${id}`, data),
    deleteRubro: (id: number) =>
        axios.delete(`${API_BASE_URL}/rubro/${id}`),
    toggleRubro: (id: number) =>
        axios.patch(`${API_BASE_URL}/rubro/${id}/toggle`)
};

// Evaluaciones CRUD
export const evaluacionesApi = {
    getEvaluaciones: (id_grupo: number) =>
        axios.get(`${API_BASE_URL}/evaluaciones?idGrupo=${id_grupo}`),
    getEvaluacionById: (id: number) =>
        axios.get(`${API_BASE_URL}/evaluaciones/${id}`),
    createEvaluacion: (evaluacion: any) =>
        axios.post(`${API_BASE_URL}/evaluaciones`, evaluacion),
    updateEvaluacion: (id: number, data: any) =>
        axios.patch(`${API_BASE_URL}/evaluaciones/${id}`, data),
    deleteEvaluacion: (id: number) =>
        axios.delete(`${API_BASE_URL}/evaluaciones/${id}`),
    uploadInstrucciones: (id: number, file: File) => {
        const formData = new FormData();
        formData.append('archivo', file);
        return axios.post(`${API_BASE_URL}/evaluaciones/${id}/instrucciones`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    // Relación evaluación-grupo (si aplica)
    getEvaluacionesXGrupo: (id_grupo: number) =>
        axios.get(`${API_BASE_URL}/evaluacionesxgrupo?grupo=${id_grupo}`),
    createEvaluacionXGrupo: (data: any) =>
        axios.post(`${API_BASE_URL}/evaluacionesxgrupo`, data),
    deleteEvaluacionXGrupo: (evaluacionId: number) =>
        axios.delete(`${API_BASE_URL}/evaluacionesxgrupo/${evaluacionId}`)
};
