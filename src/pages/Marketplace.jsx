import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { agentsApi } from '../services/api'
import { useApiCall } from '../hooks/useApi'
import Card, { CardBody } from '../components/ui/Card'
import Badge from '../components/ui/Badge'

export default function Marketplace() {
  const { data: agents, loading, error, execute } = useApiCall(agentsApi.list)

  useEffect(() => {
    execute()
  }, [execute])

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Agent Marketplace</h1>
          <p className="text-xl text-gray-400">
            Browse and deploy pre-configured AI agents
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={execute} className="btn-secondary">
              Try Again
            </button>
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
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AgentCard({ agent }) {
  const price = agent.base_price / 100

  return (
    <Link to={`/marketplace/${agent.slug}`}>
      <Card hover className="h-full">
        <CardBody>
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-accent flex items-center justify-center text-3xl flex-shrink-0">
              🦞
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold mb-1">{agent.name}</h3>
              <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                {agent.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="info">${price}/month</Badge>
                <span className="text-accent-primary text-sm font-medium">
                  View Details →
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}
