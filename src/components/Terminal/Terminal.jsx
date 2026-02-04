import { useEffect, useRef, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'

import useWebSocket from './useWebSocket'

export default function Terminal({
  endpoint,
  className = '',
  onConnect,
  onDisconnect,
  onError,
  autoConnect = true,
  initialCommand = null
}) {
  const containerRef = useRef(null)
  const terminalRef = useRef(null)
  const fitAddonRef = useRef(null)
  const initialCommandSentRef = useRef(false)
  const sendInputRef = useRef(null)
  const sendResizeRef = useRef(null)

  const handleMessage = useCallback((data) => {
    if (!terminalRef.current) return

    switch (data.type) {
      case 'output':
        terminalRef.current.write(data.data)
        break
      case 'connected':
        terminalRef.current.write('\r\n\x1b[32m' + (data.message || 'Connected') + '\x1b[0m\r\n')
        // Send initial command after connection is established
        if (initialCommand && !initialCommandSentRef.current && sendInputRef.current) {
          initialCommandSentRef.current = true
          // Small delay to ensure terminal is ready
          setTimeout(() => {
            if (sendInputRef.current) {
              sendInputRef.current(initialCommand + '\n')
            }
          }, 500)
        }
        break
      case 'error':
        terminalRef.current.write('\r\n\x1b[31mError: ' + (data.message || 'Unknown error') + '\x1b[0m\r\n')
        break
      case 'status':
        terminalRef.current.write('\r\n\x1b[33mStatus: ' + (data.status || '') + ' - ' + (data.message || '') + '\x1b[0m\r\n')
        break
      default:
        break
    }
  }, [initialCommand])

  const handleConnect = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.clear()
      terminalRef.current.write('\x1b[32mConnecting...\x1b[0m\r\n')
      // Send initial resize to sync terminal size with server
      if (fitAddonRef.current && sendResizeRef.current) {
        fitAddonRef.current.fit()
        const { cols, rows } = terminalRef.current
        sendResizeRef.current(cols, rows)
      }
    }
    if (onConnect) onConnect()
  }, [onConnect])

  const handleDisconnect = useCallback((event) => {
    if (terminalRef.current) {
      terminalRef.current.write('\r\n\x1b[31mDisconnected\x1b[0m\r\n')
    }
    if (onDisconnect) onDisconnect(event)
  }, [onDisconnect])

  const handleError = useCallback((event) => {
    if (terminalRef.current) {
      terminalRef.current.write('\r\n\x1b[31mConnection error\x1b[0m\r\n')
    }
    if (onError) onError(event)
  }, [onError])

  const { isConnected, error, connect, disconnect, sendInput, sendResize } = useWebSocket(endpoint, {
    onMessage: handleMessage,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError
  })

  // Keep refs updated to avoid circular dependencies
  useEffect(() => {
    sendInputRef.current = sendInput
    sendResizeRef.current = sendResize
  }, [sendInput, sendResize])

  // Initialize terminal
  useEffect(() => {
    if (!containerRef.current) return

    const terminal = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
      theme: {
        background: '#0a0a0f',
        foreground: '#f8fafc',
        cursor: '#8b5cf6',
        cursorAccent: '#0a0a0f',
        selectionBackground: 'rgba(139, 92, 246, 0.3)',
        black: '#0a0a0f',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#8b5cf6',
        cyan: '#06b6d4',
        white: '#f8fafc',
        brightBlack: '#64748b',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightMagenta: '#a78bfa',
        brightCyan: '#22d3ee',
        brightWhite: '#ffffff'
      },
      allowProposedApi: true
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    terminal.loadAddon(fitAddon)
    terminal.loadAddon(webLinksAddon)
    terminal.open(containerRef.current)
    fitAddon.fit()

    terminalRef.current = terminal
    fitAddonRef.current = fitAddon

    // Handle user input
    terminal.onData((data) => {
      sendInput(data)
    })

    // Handle resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit()
        const { cols, rows } = terminal
        sendResize(cols, rows)
      }
    }

    window.addEventListener('resize', handleResize)

    // Initial welcome message
    terminal.write('\x1b[35m┌─────────────────────────────────────┐\x1b[0m\r\n')
    terminal.write('\x1b[35m│\x1b[0m  \x1b[1mAI Agent Marketplace Terminal\x1b[0m      \x1b[35m│\x1b[0m\r\n')
    terminal.write('\x1b[35m└─────────────────────────────────────┘\x1b[0m\r\n\r\n')

    // Auto-connect if enabled
    if (autoConnect) {
      connect()
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      terminal.dispose()
    }
  }, [endpoint, autoConnect, connect, sendInput, sendResize])

  // Fit terminal when container size changes
  useEffect(() => {
    if (fitAddonRef.current && containerRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit()
          if (terminalRef.current) {
            const { cols, rows } = terminalRef.current
            sendResize(cols, rows)
          }
        }
      })

      resizeObserver.observe(containerRef.current)

      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [sendResize])

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="w-full h-full min-h-[400px] bg-[#0a0a0f] rounded-lg overflow-hidden"
      />
      {!isConnected && (
        <div className="absolute top-2 right-2">
          <button
            onClick={connect}
            className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
          >
            Connect
          </button>
        </div>
      )}
      {error && (
        <div className="absolute bottom-2 left-2 text-red-500 text-sm">
          {error}
        </div>
      )}
      <div className="absolute top-2 left-2">
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${isConnected ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  )
}
