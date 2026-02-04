import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { boxesApi, boxAgentsApi, agentsApi } from '../services/api'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function AgentInstall() {
  const { id: boxId } = useParams()
  const navigate = useNavigate()
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [instanceName, setInstanceName] = useState('')
  const [installing, setInstalling] = useState(false)
  const [error, setError] = useState(null)

  const [box, setBox] = useState(null)
  const [agents, setAgents] = useState(null)
  const [loading, setLoading] = useState(true)

  const mountedRef = useRef(true)

  // Load data once on mount
  useEffect(() => {
    mountedRef.current = true

    const loadData = async () => {
      try {
        const [boxRes, agentsRes] = await Promise.all([
          boxesApi.get(boxId),
          agentsApi.list()
        ])
        if (mountedRef.current) {
          setBox(boxRes.data)
          setAgents(agentsRes.data)
        }
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      mountedRef.current = false
    }
  }, [boxId])

  useEffect(() => {
    if (selectedAgent) {
      setInstanceName(selectedAgent.name)
    }
  }, [selectedAgent])

  const handleInstall = async () => {
    if (!selectedAgent || !instanceName.trim()) {
      setError('Please select an agent and enter a name')
      return
    }

    setInstalling(true)
    setError(null)

    try {
      const response = await boxAgentsApi.install(boxId, {
        agent_slug: selectedAgent.slug,
        instance_name: instanceName.trim()
      })
      // Redirect to setup page with terminal
      navigate(`/boxes/${boxId}/agents/${response.data.id}/setup`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to install agent')
      setInstalling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary" />
      </div>
    )
  }

  if (!box) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Box not found</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    )
  }

  if (box.status !== 'running') {
    return (
      <div className="text-center py-12">
        <p className="text-yellow-400 mb-4">Box must be running to install agents</p>
        <Link to={`/boxes/${boxId}`}>
          <Button>Back to Box</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={`/boxes/${boxId}`} className="text-accent-primary text-sm mb-2 inline-block">
            ← Back to {box.name}
          </Link>
          <h1 className="text-3xl font-bold mb-2">Install Agent</h1>
          <p className="text-gray-400">
            Choose an agent to install in {box.name}
          </p>
        </div>

        {/* Agent Selection */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">Select Agent</h2>
          </CardHeader>
          <CardBody>
            <div className="grid md:grid-cols-2 gap-4">
              {agents && agents.map((agent) => {
                const isSelected = selectedAgent?.slug === agent.slug
                return (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`text-left p-4 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-accent-primary bg-accent-primary/10'
                        : 'border-surface-border hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                        {agent.icon_url ? (
                          <img src={agent.icon_url} alt={agent.name} className="w-full h-full object-cover" />
                        ) : (
                          '🤖'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{agent.name}</h3>
                          {isSelected && (
                            <span className="text-accent-primary">✓</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {agent.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardBody>
        </Card>

        {/* Configuration */}
        {selectedAgent && (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-semibold">Configuration</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Instance Name"
                placeholder="My Agent"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                helperText="Give this agent instance a unique name"
                maxLength={100}
              />
            </CardBody>
          </Card>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-8">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link to={`/boxes/${boxId}`}>
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button
            onClick={handleInstall}
            disabled={!selectedAgent || !instanceName.trim() || installing}
            loading={installing}
          >
            {installing ? 'Installing...' : 'Install Agent'}
          </Button>
        </div>
      </div>
    </div>
  )
}
