import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { agentsApi, boxesApi } from '../services/api'
import { useApiCall } from '../hooks/useApi'
import Card, { CardBody } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

export default function Marketplace() {
  const { isAuthenticated } = useAuth0()
  const { data: agents, loading, error, execute } = useApiCall(agentsApi.list)
  const { data: boxes, execute: loadBoxes } = useApiCall(boxesApi.list)

  useEffect(() => {
    execute()
    if (isAuthenticated) {
      loadBoxes()
    }
  }, [execute, loadBoxes, isAuthenticated])

  const runningBoxes = boxes?.filter(b => b.status === 'running') || []

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Agent Marketplace</h1>
          <p className="text-xl text-gray-400">
            Browse and install AI agents in your boxes
          </p>
        </div>

        {/* Quick Box Info */}
        {isAuthenticated && (
          <div className="mb-8">
            {runningBoxes.length > 0 ? (
              <Card>
                <CardBody className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">
                      You have <strong className="text-white">{runningBoxes.length}</strong> running box{runningBoxes.length !== 1 ? 'es' : ''} ready for agents
                    </p>
                  </div>
                  <Link to="/dashboard">
                    <Button variant="secondary" size="sm">View Boxes</Button>
                  </Link>
                </CardBody>
              </Card>
            ) : (
              <Card>
                <CardBody className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">
                      Create a box first to install agents
                    </p>
                  </div>
                  <Link to="/boxes/create">
                    <Button size="sm">Create Box</Button>
                  </Link>
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={execute} variant="secondary">
              Try Again
            </Button>
          </div>
        )}

        {agents && agents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No agents available yet.</p>
          </div>
        )}

        {agents && agents.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                runningBoxes={runningBoxes}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AgentCard({ agent, runningBoxes, isAuthenticated }) {
  return (
    <Card hover className="h-full">
      <CardBody>
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-16 h-16 rounded-lg bg-gradient-accent flex items-center justify-center text-3xl flex-shrink-0">
            🦞
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold mb-1">{agent.name}</h3>
            <p className="text-gray-400 text-sm line-clamp-2">
              {agent.description}
            </p>
          </div>
        </div>

        <Link to={`/marketplace/${agent.slug}`}>
          <p className="text-gray-400 text-sm mb-4 hover:text-white cursor-pointer">
            View Details →
          </p>
        </Link>

        <div className="border-t border-surface-border pt-4">
          {isAuthenticated && runningBoxes.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 mb-2">Install in:</p>
              {runningBoxes.slice(0, 2).map((box) => (
                <Link key={box.id} to={`/boxes/${box.id}/install`}>
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    📦 {box.name}
                  </Button>
                </Link>
              ))}
              {runningBoxes.length > 2 && (
                <Link to="/dashboard">
                  <Button variant="secondary" size="sm" className="w-full">
                    +{runningBoxes.length - 2} more boxes
                  </Button>
                </Link>
              )}
            </div>
          ) : isAuthenticated ? (
            <Link to="/boxes/create">
              <Button className="w-full">Create Box to Install</Button>
            </Link>
          ) : (
            <Link to={`/marketplace/${agent.slug}`}>
              <Button variant="secondary" className="w-full">
                View Details
              </Button>
            </Link>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
