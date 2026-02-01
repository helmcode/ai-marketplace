import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { boxesApi } from '../services/api'
import { useApiCall } from '../hooks/useApi'
import Card, { CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import BoxCard from '../components/boxes/BoxCard'

export default function Dashboard() {
  const { data: boxes, loading, error, execute } = useApiCall(boxesApi.list)

  useEffect(() => {
    execute()
  }, [execute])

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Boxes</h1>
            <p className="text-gray-400">Manage your boxes and AI agents</p>
          </div>
          <Link to="/boxes/create">
            <Button>Create New Box</Button>
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

        {boxes && boxes.length === 0 && (
          <Card>
            <CardBody className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-xl font-semibold mb-2">No boxes yet</h2>
              <p className="text-gray-400 mb-6">
                Create your first box to start deploying AI agents
              </p>
              <Link to="/boxes/create">
                <Button>Create Your First Box</Button>
              </Link>
            </CardBody>
          </Card>
        )}

        {boxes && boxes.length > 0 && (
          <div className="grid gap-4">
            {boxes.map((box) => (
              <BoxCard key={box.id} box={box} />
            ))}
          </div>
        )}

        {/* Quick Links */}
        {boxes && boxes.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/boxes/create">
                <Card hover>
                  <CardBody className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center text-xl">
                      ➕
                    </div>
                    <div>
                      <h3 className="font-semibold">Create New Box</h3>
                      <p className="text-sm text-gray-400">Create a new box for your agents</p>
                    </div>
                  </CardBody>
                </Card>
              </Link>
              <Link to="/marketplace">
                <Card hover>
                  <CardBody className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center text-xl">
                      🛒
                    </div>
                    <div>
                      <h3 className="font-semibold">Browse Marketplace</h3>
                      <p className="text-sm text-gray-400">Discover available agents</p>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
