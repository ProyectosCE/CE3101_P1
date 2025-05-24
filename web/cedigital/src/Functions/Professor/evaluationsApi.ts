import { API_BASE_URL } from '@/stores/api';
import axios from 'axios';

// Rubros CRUD
export const rubrosApi = {
    getRubros: (id_grupo: number) =>
        axios.get(`${API_BASE_URL}Rubros/${id_grupo}`),
    getRubroById: (id: number) =>
        axios.get(`${API_BASE_URL}Rubros/${id}`),
    createRubro: (groupId: number, data: { nombre: string; porcentaje: number }) =>
        axios.post(`${API_BASE_URL}Rubros/${groupId}`, {
            ...data,
            id_grupo: groupId // Include id_grupo in the body
        }),
    updateRubro: (id: number, data: { nombre: string; porcentaje: number }) =>
        axios.patch(`${API_BASE_URL}Rubros/${id}`, data),
    deleteRubro: (id: number) =>
        axios.delete(`${API_BASE_URL}Rubros/${id}`),
    toggleRubro: (id: number) =>
        axios.patch(`${API_BASE_URL}Rubros/${id}/toggle`)
};

// Evaluaciones CRUD
export const evaluacionesApi = {
    getEvaluaciones: (id_grupo: number) =>
        axios.get(`${API_BASE_URL}Evaluaciones?idGrupo=${id_grupo}`),
    getEvaluacionById: (id: number) =>
        axios.get(`${API_BASE_URL}Evaluaciones/${id}`),
    createEvaluacion: (evaluacion: any) =>
        axios.post(`${API_BASE_URL}Evaluaciones`, evaluacion),
    updateEvaluacion: (id: number, data: any) =>
        axios.patch(`${API_BASE_URL}Evaluaciones/${id}`, data),
    deleteEvaluacion: (id: number) =>
        axios.delete(`${API_BASE_URL}Evaluaciones/${id}`),
    // Relación evaluación-grupo (si aplica)
    
    /*
    getEvaluacionesXGrupo: (id_grupo: number) =>
        axios.get(`${API_BASE_URL}/evaluacionesxgrupo?grupo=${id_grupo}`),
    createEvaluacionXGrupo: (data: any) =>
        axios.post(`${API_BASE_URL}/evaluacionesxgrupo`, data),
    deleteEvaluacionXGrupo: (evaluacionId: number) =>
       axios.delete(`${API_BASE_URL}/evaluacionesxgrupo/${evaluacionId}`)
    */
};
