import { Link, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

export default function Header() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <header className="border-b border-surface-border bg-background-secondary/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🤖</span>
              <span className="font-bold text-lg gradient-text">AI Marketplace</span>
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
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-accent-primary'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  My Agents
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400 hidden sm:block">
                  {user?.email}
                </span>
                <Link
                  to="/settings"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/settings'
                      ? 'text-accent-primary'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Settings
                </Link>
                <button
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  className="btn-secondary text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="btn-primary text-sm"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
