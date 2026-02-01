import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

const WS_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/^http/, 'ws')

export default function useWebSocket(endpoint, options = {}) {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const { onMessage, onConnect, onDisconnect, onError, autoReconnect = true } = options

  const connect = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Not authenticated')
      return
    }

    try {
      const token = await getAccessTokenSilently()
      const wsUrl = `${WS_BASE_URL}${endpoint}?token=${token}`

      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        setIsConnected(true)
        setError(null)
        if (onConnect) onConnect()
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (onMessage) onMessage(data)
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e)
        }
      }

      wsRef.current.onerror = (event) => {
        console.error('WebSocket error:', event)
        setError('Connection error')
        if (onError) onError(event)
      }

      wsRef.current.onclose = (event) => {
        setIsConnected(false)
        if (onDisconnect) onDisconnect(event)

        // Auto-reconnect if enabled and not a normal closure
        if (autoReconnect && event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, 3000)
        }
      }
    } catch (e) {
      console.error('Failed to connect:', e)
      setError(e.message)
    }
  }, [endpoint, isAuthenticated, getAccessTokenSilently, onMessage, onConnect, onDisconnect, onError, autoReconnect])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected')
      wsRef.current = null
    }
    setIsConnected(false)
  }, [])

  const send = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data))
    }
  }, [])

  const sendInput = useCallback((input) => {
    send({ type: 'input', data: input })
  }, [send])

  const sendResize = useCallback((cols, rows) => {
    send({ type: 'resize', cols, rows })
  }, [send])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    isConnected,
    error,
    connect,
    disconnect,
    send,
    sendInput,
    sendResize
  }
}
