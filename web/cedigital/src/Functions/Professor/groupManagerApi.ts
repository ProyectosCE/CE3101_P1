import { API_BASE_URL } from '@/stores/api';
import axios from 'axios';

// Types
export interface StudentInfo {
    carnet: string;
    nombre: string;
}

export interface Category {
    id: string;
    nombre: string;
}

export interface Minigroup {
    id: string;
    idCat: string;
    nombre: string;
    estudiantes: StudentInfo[]; // Changed from string[] to StudentInfo[]
}

// API Functions for Categories
export const categoryApi = {
    // Get all categories
    getCategories: () => 
        axios.get<{categorias: Category[]}>(`${API_BASE_URL}/categoriagrupo`),
    
    // Create a new category
    createCategory: (category: { nombre: string, id_grupo: number }) =>
        axios.post(`${API_BASE_URL}/categoriagrupo`, category),
    
    // Update an existing category
    updateCategory: (id: number, data: any) =>
        axios.patch(`${API_BASE_URL}/categoriagrupo/${id}`, data),
    
    // Delete a category
    deleteCategory: (id: number) =>
        axios.delete(`${API_BASE_URL}/categoriagrupo/${id}`)
};

// API Functions for Minigroups
export const minigroupApi = {
    // Get all minigroups in a category
    getMinigroupsByCategory: (id_categoria: number) =>
        axios.get(`${API_BASE_URL}/minigrupos/categoria/${id_categoria}`),
    
    // Create a new minigroup
    createMinigroup: (id_categoria: number, minigroup: any) =>
        axios.post(`${API_BASE_URL}/minigrupos`, { ...minigroup, id_categoria }),
    
    // Update an existing minigroup
    updateMinigroup: (id_categoria: number, id_minigrupo: number, data: any) =>
        axios.patch(`${API_BASE_URL}/minigrupos/${id_minigrupo}`, data),
    
    // Delete a minigroup
    deleteMinigroup: (id_categoria: number, id_minigrupo: number) =>
        axios.delete(`${API_BASE_URL}/minigrupos/${id_minigrupo}`),
    
    // Student management in minigroups
    addStudentToMinigroup: (categoryId: string, groupId: string, carnet: string) =>
        axios.post(
            `${API_BASE_URL}/profesor/categorias/${categoryId}/grupos/${groupId}/estudiantes`,
            { carnet }
        ),
    
    removeStudentFromMinigroup: (categoryId: string, groupId: string, carnet: string) =>
        axios.delete(
            `${API_BASE_URL}/profesor/categorias/${categoryId}/grupos/${groupId}/estudiantes/${carnet}`
        ),

    // Get all students in a minigroup
    getMinigroupStudents: (categoryId: string, groupId: string) =>
        axios.get<{estudiantes: string[]}>(
            `${API_BASE_URL}/profesor/categorias/${categoryId}/grupos/${groupId}/estudiantes`
        )
};

// Helper function to convert API types to component types if needed
export const convertApiMinigroup = (apiMinigroup: Minigroup) => ({
    id: apiMinigroup.id,
    name: apiMinigroup.nombre,
    activityId: apiMinigroup.idCat,
    members: apiMinigroup.estudiantes
});

export const convertApiCategory = (apiCategory: Category) => ({
    id: apiCategory.id,
    name: apiCategory.nombre
});
