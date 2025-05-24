// src/pages/index.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '../stores/authStore'

const Home = () => {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && user) { 
        router.push('/main')
    } else {
      router.push('/login')
    }
  }, [])

  return null
}

export default Home
