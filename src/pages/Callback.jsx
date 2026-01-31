import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

export default function Callback() {
  const { isLoading, isAuthenticated, error } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        const returnTo = sessionStorage.getItem('returnTo') || '/dashboard'
        sessionStorage.removeItem('returnTo')
        navigate(returnTo, { replace: true })
      } else if (error) {
        navigate('/', { replace: true })
      }
    }
  }, [isLoading, isAuthenticated, error, navigate])

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary mx-auto mb-4" />
        <p className="text-gray-400">
          {error ? 'Authentication failed...' : 'Completing login...'}
        </p>
      </div>
    </div>
  )
}
