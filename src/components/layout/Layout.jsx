import Header from './Header'
import { useApiSetup } from '../../hooks/useApi'

export default function Layout({ children }) {
  useApiSetup()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-surface-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            AI Agent Marketplace - Deploy AI agents with one click
          </p>
        </div>
      </footer>
    </div>
  )
}
