import { API_BASE_URL } from '@/stores/api';
import axios from 'axios';

// Export interfaces
export interface Rubric {
    id: string;
    nombre: string;
    porcentaje: number;
}

export interface Evaluacion {
    id: string;
    idRubro: string;
    nombreRubro: string;
    porcentaje: number;
    descripcion: string;
    fechaEntrega: string;
    horaEntrega: string;
    idDocumentoInstrucciones: string;
    trabajoGrupal: boolean;
}

interface Categoria {
    id: string;
    nombre: string;
}

interface Minigrupo {
    id: string;
    idCat: string;
    nombre: string;
    estudiantes: string[];
}

interface EvaluacionCategoria {
    idCategoria: string;
    idEvaluacion: string;
}

// API Functions for Rubros
export const rubrosApi = {
    getRubros: () => 
        axios.get<{rubros: Rubric[]}>(`${API_BASE_URL}/profesor/rubros`),
    
    createRubro: (rubro: Omit<Rubric, 'id'>) =>
        axios.post<{rubro: Rubric}>(`${API_BASE_URL}/profesor/rubros`, rubro),
    
    updateRubro: (id: string, data: Partial<Rubric>) =>
        axios.patch<{rubro: Rubric}>(`${API_BASE_URL}/profesor/rubros/${id}`, data),
    
    deleteRubro: (id: string) =>
        axios.delete(`${API_BASE_URL}/profesor/rubros/${id}`)
};

// API Functions for Evaluaciones
export const evaluacionesApi = {
    getEvaluaciones: () =>
        axios.get<{evaluaciones: Evaluacion[]}>(`${API_BASE_URL}/profesor/evaluaciones`),
    
    createEvaluacion: (evaluacion: Omit<Evaluacion, 'id'>) =>
        axios.post<{evaluacion: Evaluacion}>(`${API_BASE_URL}/profesor/evaluaciones`, evaluacion),
    
    updateEvaluacion: (id: string, data: Partial<Evaluacion>) =>
        axios.patch<{evaluacion: Evaluacion}>(`${API_BASE_URL}/profesor/evaluaciones/${id}`, data),
    
    deleteEvaluacion: (id: string) =>
        axios.delete(`${API_BASE_URL}/profesor/evaluaciones/${id}`),
    
    uploadInstrucciones: (id: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return axios.post(`${API_BASE_URL}/profesor/evaluaciones/${id}/instrucciones`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

// API Functions for Categorías
export const categoriasApi = {
    getCategorias: () =>
        axios.get<{categorias: Categoria[]}>(`${API_BASE_URL}/profesor/categorias`),
    
    createCategoria: (categoria: Omit<Categoria, 'id'>) =>
        axios.post<{categoria: Categoria}>(`${API_BASE_URL}/profesor/categorias`, categoria),
    
    updateCategoria: (id: string, data: Partial<Categoria>) =>
        axios.patch<{categoria: Categoria}>(`${API_BASE_URL}/profesor/categorias/${id}`, data),
    
    deleteCategoria: (id: string) =>
        axios.delete(`${API_BASE_URL}/profesor/categorias/${id}`)
};

// API Functions for Minigrupos
export const minigroupsApi = {
    getMinigrupos: (categoriaId: string) =>
        axios.get<{minigrupos: Minigrupo[]}>(`${API_BASE_URL}/profesor/categorias/${categoriaId}/grupos`),
    
    createMinigrupo: (categoriaId: string, grupo: Omit<Minigrupo, 'id'>) =>
        axios.post<{minigrupo: Minigrupo}>(`${API_BASE_URL}/profesor/categorias/${categoriaId}/grupos`, grupo),
    
    updateMinigrupo: (categoriaId: string, grupoId: string, data: Partial<Minigrupo>) =>
        axios.patch<{minigrupo: Minigrupo}>(`${API_BASE_URL}/profesor/categorias/${categoriaId}/grupos/${grupoId}`, data),
    
    deleteMinigrupo: (categoriaId: string, grupoId: string) =>
        axios.delete(`${API_BASE_URL}/profesor/categorias/${categoriaId}/grupos/${grupoId}`),
    
    addEstudiante: (categoriaId: string, grupoId: string, carnet: string) =>
        axios.post(`${API_BASE_URL}/profesor/categorias/${categoriaId}/grupos/${grupoId}/estudiantes`, { carnet }),
    
    removeEstudiante: (categoriaId: string, grupoId: string, carnet: string) =>
        axios.delete(`${API_BASE_URL}/profesor/categorias/${categoriaId}/grupos/${grupoId}/estudiantes/${carnet}`)
};

// API Functions for Evaluaciones x Categoría
export const evaluacionCategoriaApi = {
    getEvaluacionesCategoria: () =>
        axios.get<{evaluacionesXgrupo: EvaluacionCategoria[]}>(`${API_BASE_URL}/profesor/evaluaciones-categoria`),
    
    vincularEvaluacionCategoria: (evaluacionId: string, categoriaId: string) =>
        axios.post(`${API_BASE_URL}/profesor/evaluaciones-categoria`, {
            idEvaluacion: evaluacionId,
            idCategoria: categoriaId
        }),
    
    desvincularEvaluacionCategoria: (evaluacionId: string, categoriaId: string) =>
        axios.delete(`${API_BASE_URL}/profesor/evaluaciones-categoria/${evaluacionId}/${categoriaId}`)
};
