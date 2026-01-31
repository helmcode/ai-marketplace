import { useState, useEffect, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { setAuthTokenGetter } from '../services/api'

export function useApiSetup() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  useEffect(() => {
    if (isAuthenticated) {
      setAuthTokenGetter(getAccessTokenSilently)
    }
  }, [isAuthenticated, getAccessTokenSilently])
}

export function useApiCall(apiFunction, { immediate = false, deps = [] } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiFunction(...args)
      setData(response.data)
      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute, ...deps])

  return { data, loading, error, execute, setData }
}
