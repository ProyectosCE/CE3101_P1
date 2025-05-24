import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LoginResponse } from '@/Functions/authApi'

interface AuthState {
  user: {
    id: string
    username: string
    role: string
  } | null
  isAuthenticated: boolean
  login: (response: LoginResponse) => void
  logout: () => void
  checkExpiration: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (response: LoginResponse) => {
        set({
          user: {
            id: response.id,
            username: response.carnet, // Updated from correo to carnet
            role: response.role,
          },
          isAuthenticated: true,
        })
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      checkExpiration: () => {
        // ...existing code...
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
