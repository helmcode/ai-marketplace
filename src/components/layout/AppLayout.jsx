import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApiSetup } from '../../hooks/useApi'
import Sidebar from './Sidebar'
import SettingsModal from '../modals/SettingsModal'

export default function AppLayout({ children }) {
  useApiSetup()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block md:fixed md:inset-y-0 md:left-0 md:w-64 md:z-30">
        <Sidebar onSettingsClick={() => setSettingsOpen(true)} />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-background-secondary border-b border-surface-border">
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <img src="/favicon.svg" alt="Boxes" className="w-6 h-6" />
            <span className="font-bold gradient-text">Boxes</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-surface-hover rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar */}
          <div className="absolute inset-y-0 left-0 w-64 animate-slide-in">
            <Sidebar
              onSettingsClick={() => setSettingsOpen(true)}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        {/* Mobile spacer for fixed header */}
        <div className="h-16 md:hidden" />

        {children}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
