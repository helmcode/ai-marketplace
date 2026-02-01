import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { boxesApi, boxAgentsApi } from '../services/api'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Terminal from '../components/Terminal/Terminal'

export default function AgentSetup() {
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

  const markAsRunning = async () => {
    try {
      await boxAgentsApi.update(boxId, agentId, { status: 'running' })
      navigate(`/boxes/${boxId}`)
    } catch (err) {
      console.error('Failed to update status:', err)
      navigate(`/boxes/${boxId}`)
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
        <p className="text-red-400 mb-4">{error || 'Not found'}</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    )
  }

  const installCommand = agent.install_script_url
    ? `curl -fsSL ${agent.install_script_url} | bash`
    : 'curl -fsSL https://openclaw.ai/install.sh | bash'

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to={`/boxes/${boxId}`} className="text-accent-primary text-sm mb-2 inline-block">
              ← Back to {box.name}
            </Link>
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold">Setup: {agent.instance_name}</h1>
              <Badge variant="warning">{agent.status}</Badge>
            </div>
            <p className="text-gray-400 mt-1">{agent.agent_name}</p>
          </div>
          <Button onClick={markAsRunning}>
            Mark as Complete
          </Button>
        </div>

        {/* Instructions */}
        <Card className="mb-6">
          <CardBody>
            <h3 className="font-semibold mb-2">Installing {agent.agent_name}</h3>
            <p className="text-gray-400 mb-4">
              The installation is running automatically below. Follow the prompts to complete the setup.
            </p>
            <p className="text-gray-500 text-sm">
              Once installation is complete, click "Mark as Complete" above.
            </p>
          </CardBody>
        </Card>

        {/* Terminal */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Terminal</h2>
              <Badge variant="info">Interactive</Badge>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <Terminal
              endpoint={`/ws/terminal/${boxId}`}
              className="h-[500px]"
              initialCommand={installCommand}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
