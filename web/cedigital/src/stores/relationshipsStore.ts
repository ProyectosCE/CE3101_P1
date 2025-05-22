import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Student } from '@/types/groups'

interface RelationshipStore {
  studentGroups: {
    studentId: string
    groupId: string
  }[]
  groupCategories: {
    groupId: string
    categoryId: string
  }[]
  categoryAssignments: {
    categoryId: string
    assignmentId: string
  }[]

  // Estudiantes x Grupo (N:M)
  addStudentToGroup: (studentId: string, groupId: string) => void
  removeStudentFromGroup: (studentId: string, groupId: string) => void
  getStudentsInGroup: (groupId: string) => string[]
  getGroupsForStudent: (studentId: string) => string[]

  // Grupos x Categoría (N:1)
  linkGroupToCategory: (groupId: string, categoryId: string) => void
  unlinkGroupFromCategory: (groupId: string, categoryId: string) => void
  getGroupsInCategory: (categoryId: string) => string[]
  getCategoryForGroup: (groupId: string) => string | null

  // Categoría x Evaluación (1:N)
  linkCategoryToAssignment: (categoryId: string, assignmentId: string) => void
  unlinkCategoryFromAssignment: (categoryId: string, assignmentId: string) => void
  getCategoryForAssignment: (assignmentId: string) => string | null
}

export const useRelationshipStore = create<RelationshipStore>()(
  persist(
    (set, get) => ({
      studentGroups: [],
      groupCategories: [],
      categoryAssignments: [],

      // Estudiantes x Grupo
      addStudentToGroup: (studentId, groupId) =>
        set(state => ({
          studentGroups: [...state.studentGroups, { studentId, groupId }]
        })),

      removeStudentFromGroup: (studentId, groupId) =>
        set(state => ({
          studentGroups: state.studentGroups.filter(
            sg => !(sg.studentId === studentId && sg.groupId === groupId)
          )
        })),

      getStudentsInGroup: (groupId) => {
        return get().studentGroups
          .filter(sg => sg.groupId === groupId)
          .map(sg => sg.studentId)
      },

      getGroupsForStudent: (studentId) => {
        return get().studentGroups
          .filter(sg => sg.studentId === studentId)
          .map(sg => sg.groupId)
      },

      // Grupos x Categoría
      linkGroupToCategory: (groupId, categoryId) =>
        set(state => ({
          groupCategories: [
            ...state.groupCategories.filter(gc => gc.groupId !== groupId),
            { groupId, categoryId }
          ]
        })),

      unlinkGroupFromCategory: (groupId, categoryId) =>
        set(state => ({
          groupCategories: state.groupCategories.filter(gc => gc.groupId !== groupId)
        })),

      getGroupsInCategory: (categoryId) => {
        return get().groupCategories
          .filter(gc => gc.categoryId === categoryId)
          .map(gc => gc.groupId)
      },

      getCategoryForGroup: (groupId) => {
        const relation = get().groupCategories.find(gc => gc.groupId === groupId)
        return relation ? relation.categoryId : null
      },

      // Categoría x Evaluación
      linkCategoryToAssignment: (categoryId, assignmentId) =>
        set(state => ({
          categoryAssignments: [
            ...state.categoryAssignments.filter(ca => ca.assignmentId !== assignmentId),
            { categoryId, assignmentId }
          ]
        })),

      unlinkCategoryFromAssignment: (categoryId, assignmentId) =>
        set(state => ({
          categoryAssignments: state.categoryAssignments.filter(
            ca => ca.assignmentId !== assignmentId
          )
        })),

      getCategoryForAssignment: (assignmentId) => {
        const relation = get().categoryAssignments.find(ca => ca.assignmentId === assignmentId)
        return relation ? relation.categoryId : null
      }
    }),
    {
      name: 'relationships-storage'
    }
  )
)
