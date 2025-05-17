// src/pages/index.tsx
import React from 'react'
import Link from 'next/link'

const Home: React.FC = () => (
  <div className="home-wrapper">
    <div className="home-card">
      <img
        src="/images/LogoTransparente.png"
        alt="CEDigital Logo"
        className="home-logo"
      />
      <Link href="/login" className="home-button">
        Ir a Login
      </Link>
    </div>
  </div>
)

export default Home
