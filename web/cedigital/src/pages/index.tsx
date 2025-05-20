// src/pages/index.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '../stores/authStore'

const Home = () => {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/main')
      }
    } else {
      router.push('/login')
    }
  }, [])

  return null
}

export default Home
