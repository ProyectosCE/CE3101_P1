import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'admin' | 'professor' | 'student'

interface User {
  username: string
  role: UserRole
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  expiresAt: number | null
  login: (username: string, password: string) => boolean
  logout: () => void
  checkExpiration: () => void
}

// Mock users for testing
const mockUsers = [
  { username: 'admin', password: 'admin123', role: 'admin' as UserRole },
  { username: 'prof', password: 'prof123', role: 'professor' as UserRole },
  { username: 'student', password: 'student123', role: 'student' as UserRole },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      expiresAt: null,

      login: (username: string, password: string) => {
        const user = mockUsers.find(
          (u) => u.username === username && u.password === password
        )
        
        if (user) {
          // Set expiration to 8 hours from login
          const expiresAt = Date.now() + (8 * 60 * 60 * 1000)
          set({ 
            user: { username: user.username, role: user.role }, 
            isAuthenticated: true,
            expiresAt 
          })
          return true
        }
        return false
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, expiresAt: null })
      },

      checkExpiration: () => {
        const { expiresAt, logout } = get()
        if (expiresAt && Date.now() > expiresAt) {
          logout()
        }
      }
    }),
    {
      name: 'auth-storage',
      version: 1,
    }
  )
)
