import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Group, GroupActivity, Student } from '@/types/groups'

interface GroupsState {
  groups: Group[]
  groupTypes: GroupActivity[]
  addGroup: (group: Group) => void
  updateGroup: (group: Group) => void
  deleteGroup: (groupId: string) => void
  addGroupType: (type: GroupActivity) => void
  updateGroupType: (type: GroupActivity) => void
  deleteGroupType: (typeId: string) => void
  updateGroups: (groups: Group[]) => void // Add this action
  getGroupsByType: (typeId: string) => Group[]
}

export const useGroupsStore = create<GroupsState>()(
  persist(
    (set, get) => ({
      groups: [],
      groupTypes: [{ id: 'general', name: 'Grupos Generales' }],
      
      addGroup: (group) =>
        set((state) => ({ groups: [...state.groups, group] })),
      
      updateGroup: (group) =>
        set((state) => ({
          groups: state.groups.map((g) => (g.id === group.id ? group : g)),
        })),
      
      deleteGroup: (groupId) =>
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== groupId),
        })),
      
      addGroupType: (type) =>
        set((state) => ({ groupTypes: [...state.groupTypes, type] })),
      
      updateGroupType: (type) =>
        set((state) => ({
          groupTypes: state.groupTypes.map((t) => (t.id === type.id ? type : t)),
        })),
      
      deleteGroupType: (typeId) =>
        set((state) => ({
          groupTypes: state.groupTypes.filter((t) => t.id !== typeId),
          groups: state.groups.filter((g) => g.activityId !== typeId),
        })),
      
      updateGroups: (groups) => set({ groups }),
      
      getGroupsByType: (typeId: string) => {
        const state = get()
        return state.groups.filter(group => {
          if (typeId === 'general') {
            return group.activityId === null
          }
          return group.activityId === typeId
        })
      }
    }),
    {
      name: 'groups-storage',
    }
  )
)
