import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '../../stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter()
  const { user, isAuthenticated, checkExpiration } = useAuthStore()

  useEffect(() => {
    checkExpiration()
    
    if (!isAuthenticated || !user) {
      router.push('/login')
    }
  }, [isAuthenticated, user, router, checkExpiration])

  if (!isAuthenticated || !user) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute
