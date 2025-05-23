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
        axios.get<{categorias: Category[]}>(`${API_BASE_URL}/profesor/categorias`),
    
    // Create a new category
    createCategory: (category: Omit<Category, 'id'>) =>
        axios.post<{categoria: Category}>(`${API_BASE_URL}/profesor/categorias`, category),
    
    // Update an existing category
    updateCategory: (id: string, data: Partial<Category>) =>
        axios.patch<{categoria: Category}>(`${API_BASE_URL}/profesor/categorias/${id}`, data),
    
    // Delete a category
    deleteCategory: (id: string) =>
        axios.delete(`${API_BASE_URL}/profesor/categorias/${id}`)
};

// API Functions for Minigroups
export const minigroupApi = {
    // Get all minigroups in a category
    getMinigroupsByCategory: (categoryId: string) =>
        axios.get<{minigrupos: Minigroup[]}>(`${API_BASE_URL}/profesor/categorias/${categoryId}/grupos`),
    
    // Create a new minigroup
    createMinigroup: (categoryId: string, minigroup: Omit<Minigroup, 'id'>) =>
        axios.post<{minigrupo: Minigroup}>(
            `${API_BASE_URL}/profesor/categorias/${categoryId}/grupos`,
            minigroup
        ),
    
    // Update an existing minigroup
    updateMinigroup: (categoryId: string, groupId: string, data: Partial<Minigroup>) =>
        axios.patch<{minigrupo: Minigroup}>(
            `${API_BASE_URL}/profesor/categorias/${categoryId}/grupos/${groupId}`,
            data
        ),
    
    // Delete a minigroup
    deleteMinigroup: (categoryId: string, groupId: string) =>
        axios.delete(`${API_BASE_URL}/profesor/categorias/${categoryId}/grupos/${groupId}`),
    
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
