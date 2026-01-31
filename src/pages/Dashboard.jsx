import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { deploymentsApi } from '../services/api'
import { useApiCall } from '../hooks/useApi'
import Card, { CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

export default function Dashboard() {
  const { data: deployments, loading, error, execute } = useApiCall(deploymentsApi.list)

  useEffect(() => {
    execute()
  }, [execute])

  const getStatusVariant = (status) => {
    switch (status) {
      case 'running':
        return 'success'
      case 'pending':
      case 'provisioning':
        return 'warning'
      case 'failed':
      case 'deleted':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Agents</h1>
            <p className="text-gray-400">Manage your deployed AI agents</p>
          </div>
          <Link to="/marketplace">
            <Button>Deploy New Agent</Button>
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={execute}>Try Again</Button>
          </div>
        )}

        {deployments && deployments.length === 0 && (
          <Card>
            <CardBody className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-xl font-semibold mb-2">No agents deployed yet</h2>
              <p className="text-gray-400 mb-6">
                Deploy your first AI agent from the marketplace
              </p>
              <Link to="/marketplace">
                <Button>Browse Marketplace</Button>
              </Link>
            </CardBody>
          </Card>
        )}

        {deployments && deployments.length > 0 && (
          <div className="grid gap-4">
            {deployments.map((deployment) => (
              <Link key={deployment.id} to={`/dashboard/${deployment.id}`}>
                <Card hover>
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center text-2xl">
                          🦞
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {deployment.agent_name || 'Agent'}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {deployment.ip_address || 'Provisioning...'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={getStatusVariant(deployment.status)}>
                          {deployment.status}
                        </Badge>
                        <span className="text-accent-primary text-sm">
                          View →
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
