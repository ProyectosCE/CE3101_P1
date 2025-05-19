import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '../../stores/authStore'

interface AuthProviderProps {
  children: React.ReactNode
}

const PUBLIC_PATHS = ['/login'] // Remove root path from public paths

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user, isAuthenticated, checkExpiration } = useAuthStore()

  useEffect(() => {
    const init = async () => {
      checkExpiration()
      const isPublicPath = PUBLIC_PATHS.includes(router.pathname)
      
      if (!isAuthenticated && !isPublicPath) {
        await router.push('/login')
      }
      setIsLoading(false)
    }

    init()
  }, [isAuthenticated, router.pathname, checkExpiration, router])

  if (isLoading) {
    return null
  }

  return <>{children}</>
}

export default AuthProvider
