import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Group, GroupActivity } from '@/types/groups'

interface GroupsState {
  groups: Group[]
  groupTypes: GroupActivity[]
  addGroup: (group: Group, categoryId: string) => void
  updateGroup: (group: Group) => void
  deleteGroup: (groupId: string) => void
  addGroupType: (type: GroupActivity) => void
  updateGroupType: (type: GroupActivity) => void
  deleteGroupType: (typeId: string) => void
  updateGroups: (groups: Group[]) => void // Add this action
  getGroupsByType: (typeId: string) => Group[]
  subscribeToGroupsByCategory: (categoryId: string, callback: (groups: Group[]) => void) => () => void
  subscribe: <T>(
    selector: (state: GroupsState) => T,
    listener: (selectedState: T) => void,
    options?: { equalityFn?: (a: T, b: T) => boolean }
  ) => () => void;
}

type StoreWithSubscribe = GroupsState & {
  subscribe: GroupsState['subscribe'];
};

export const useGroupsStore = create<StoreWithSubscribe>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        groups: [],
        groupTypes: [{ id: 'general', name: 'Grupos Generales' }],
        
        addGroup: (group, categoryId) => {
          if (!categoryId) throw new Error('Un grupo debe pertenecer a una categoría')
          set((state) => ({ 
            groups: [...state.groups, { ...group, activityId: categoryId }] 
          }))
        },
        
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
        },
        
        subscribe: (selector, listener, options) => {
          // This will be provided by subscribeWithSelector middleware
          return () => {}
        },

        subscribeToGroupsByCategory: (categoryId: string, callback: (groups: Group[]) => void) => {
          return get().subscribe(
            (state: GroupsState) => state.groups.filter((g: Group) => {
              if (categoryId === 'general') {
                return g.activityId === null
              }
              return g.activityId === categoryId
            }),
            callback
          )
        }
      }),
      {
        name: 'groups-storage',
      }
    )
  )
)
