import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { boxesApi, boxAgentsApi } from '../services/api'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Terminal from '../components/Terminal/Terminal'

export default function AgentTUI() {
  const { boxId, agentId } = useParams()
  const navigate = useNavigate()

  const [box, setBox] = useState(null)
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const loadData = async () => {
      try {
        const [boxRes, agentRes] = await Promise.all([
          boxesApi.get(boxId),
          boxAgentsApi.get(boxId, agentId)
        ])
        if (mountedRef.current) {
          setBox(boxRes.data)
          setAgent(agentRes.data)
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err.response?.data?.detail || 'Failed to load data')
        }
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
  }, [boxId, agentId])

  const getStatusVariant = (status) => {
    switch (status) {
      case 'running':
        return 'success'
      case 'pending':
      case 'installing':
        return 'warning'
      case 'failed':
        return 'error'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary" />
      </div>
    )
  }

  if (error || !box || !agent) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error || 'Agent or box not found'}</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    )
  }

  if (box.status !== 'running') {
    return (
      <div className="text-center py-12">
        <p className="text-yellow-400 mb-4">Box must be running to use the agent</p>
        <Link to={`/boxes/${boxId}`}>
          <Button>Back to Box</Button>
        </Link>
      </div>
    )
  }

  // Get the TUI command from agent or default to openclaw tui
  const tuiCommand = agent.tui_command || 'openclaw tui'

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to={`/boxes/${boxId}`} className="text-accent-primary text-sm mb-2 inline-block">
              ← Back to {box.name}
            </Link>
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold">{agent.instance_name}</h1>
              <Badge variant={getStatusVariant(agent.status)}>
                {agent.status}
              </Badge>
            </div>
            <p className="text-gray-400 mt-1">
              {agent.agent_name}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link to={`/boxes/${boxId}`}>
              <Button variant="secondary">Back to Box</Button>
            </Link>
          </div>
        </div>

        {/* Terminal */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Agent Interface</h2>
              <p className="text-gray-400 text-sm">
                Interact with your agent
              </p>
            </div>
            <Badge variant="info">TUI Mode</Badge>
          </CardHeader>
          <CardBody className="p-0">
            <Terminal
              endpoint={`/ws/terminal/${boxId}`}
              className="h-[600px]"
              initialCommand={tuiCommand}
            />
          </CardBody>
        </Card>

        {/* Help */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Type your message and press Enter to chat with your agent.
            Use Ctrl+C to exit.
          </p>
        </div>
      </div>
    </div>
  )
}
