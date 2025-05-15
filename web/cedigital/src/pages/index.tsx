// src/pages/index.tsx
import React from 'react'
import Link from 'next/link'

const Home: React.FC = () => (
  <div className="container py-5 text-center">
    <h1>CEDigital</h1>
    <p>Bienvenido, por favor inicie sesión:</p>
    <Link href="/login" className="btn btn-primary">
      Ir a Login
    </Link>
  </div>
)

export default Home
