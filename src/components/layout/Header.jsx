import { Link, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

export default function Header() {
  const { loginWithRedirect } = useAuth0()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <header className="border-b border-surface-border bg-background-secondary/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/favicon.svg" alt="Boxes" className="w-7 h-7" />
              <span className="font-bold text-lg gradient-text">Boxes</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/marketplace"
                className={`text-sm font-medium transition-colors ${
                  isActive('/marketplace')
                    ? 'text-accent-primary'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Marketplace
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => loginWithRedirect()}
              className="btn-primary text-sm"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
