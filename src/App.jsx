import { Routes, Route } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Marketplace from './pages/Marketplace'
import AgentDetail from './pages/AgentDetail'
import Dashboard from './pages/Dashboard'
import DeploymentDetail from './pages/DeploymentDetail'
import Callback from './pages/Callback'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { isLoading } = useAuth0()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/:slug" element={<AgentDetail />} />
        <Route path="/callback" element={<Callback />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:id"
          element={
            <ProtectedRoute>
              <DeploymentDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  )
}

export default App
