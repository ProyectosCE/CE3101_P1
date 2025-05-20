// src/pages/login/index.tsx
import React, { useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useAuthStore } from '../../stores/authStore'
import LoginForm from '../../components/auth/LoginForm'

const LoginPage: NextPage = () => {
  const router = useRouter()
  const { user, isAuthenticated, checkExpiration } = useAuthStore()

  useEffect(() => {
    checkExpiration()
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/main')
      }
    }
  }, [isAuthenticated, user, router])

  return <LoginForm />
}

export default LoginPage
