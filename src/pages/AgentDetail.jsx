import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import ReactMarkdown from 'react-markdown'
import { agentsApi, boxesApi } from '../services/api'
import { useApiCall } from '../hooks/useApi'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

export default function AgentDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, loginWithRedirect } = useAuth0()

  const { data: agent, loading, error, execute } = useApiCall(agentsApi.get)
  const { data: boxes, execute: loadBoxes } = useApiCall(boxesApi.list)

  useEffect(() => {
    execute(slug)
  }, [execute, slug])

  useEffect(() => {
    if (isAuthenticated) {
      loadBoxes()
    }
  }, [isAuthenticated, loadBoxes])

  const handleInstallClick = (boxId) => {
    if (!isAuthenticated) {
      loginWithRedirect({ appState: { returnTo: window.location.pathname } })
      return
    }
    navigate(`/boxes/${boxId}/install`)
  }

  const handleCreateBox = () => {
    if (!isAuthenticated) {
      loginWithRedirect({ appState: { returnTo: '/boxes/create' } })
      return
    }
    navigate('/boxes/create')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={() => navigate('/marketplace')}>Back to Marketplace</Button>
      </div>
    )
  }

  if (!agent) return null

  const runningBoxes = boxes?.filter(b => b.status === 'running') || []

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start space-x-6 mb-8">
          <div className="w-24 h-24 rounded-xl bg-gradient-accent flex items-center justify-center text-5xl flex-shrink-0 overflow-hidden">
            {agent.icon_url ? (
              <img src={agent.icon_url} alt={agent.name} className="w-full h-full object-cover" />
            ) : (
              '🤖'
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
            <p className="text-gray-400 mb-3">{agent.description}</p>
            <div className="flex items-center space-x-3">
              {agent.install_script_url && (
                <Badge variant="success">One-Click Install</Badge>
              )}
              {agent.tui_command && (
                <Badge variant="info">TUI Available</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {agent.long_description && (
          <Card className="mb-8">
            <CardBody>
              <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-ul:text-gray-300 prose-li:text-gray-300 prose-code:text-accent-secondary prose-code:bg-bg-tertiary prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                <ReactMarkdown>{agent.long_description}</ReactMarkdown>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Installation Info */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">Installation</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-gray-400">
              This agent is installed in a Box. The installation is fully automated.
            </p>

            {agent.install_command && (
              <div className="bg-surface-secondary rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Install command:</p>
                <code className="text-sm text-accent-secondary break-all">
                  {agent.install_command}
                </code>
              </div>
            )}

            {agent.tui_command && (
              <div className="bg-surface-secondary rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">TUI command:</p>
                <code className="text-sm text-accent-secondary">
                  {agent.tui_command}
                </code>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Install Options */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Install {agent.name}</h2>
          </CardHeader>
          <CardBody>
            {!isAuthenticated ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">
                  Log in to install this agent in your box
                </p>
                <Button onClick={() => loginWithRedirect({ appState: { returnTo: window.location.pathname } })}>
                  Log In to Continue
                </Button>
              </div>
            ) : runningBoxes.length > 0 ? (
              <div className="space-y-4">
                <p className="text-gray-400">
                  Select a box to install {agent.name}:
                </p>
                <div className="grid gap-3">
                  {runningBoxes.map((box) => (
                    <button
                      key={box.id}
                      onClick={() => handleInstallClick(box.id)}
                      className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg hover:bg-surface-border transition-colors text-left"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center text-xl">
                          📦
                        </div>
                        <div>
                          <h3 className="font-semibold">{box.name}</h3>
                          <p className="text-sm text-gray-400">
                            {box.tier} • {box.ip_address}
                          </p>
                        </div>
                      </div>
                      <span className="text-accent-primary">
                        Install →
                      </span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-surface-border pt-4 mt-4">
                  <Button variant="secondary" onClick={handleCreateBox} className="w-full">
                    Create New Box
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📦</div>
                <p className="text-gray-400 mb-4">
                  You need a box to install agents. Create one first!
                </p>
                <Button onClick={handleCreateBox}>
                  Create Your First Box
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
