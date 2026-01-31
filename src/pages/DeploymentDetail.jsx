import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { deploymentsApi } from '../services/api'
import { useApiCall } from '../hooks/useApi'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

export default function DeploymentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: deployment, loading, error, execute } = useApiCall(deploymentsApi.get)
  const { execute: deleteDeployment, loading: deleting } = useApiCall(deploymentsApi.delete)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    execute(id)

    const interval = setInterval(() => {
      execute(id)
    }, 5000)

    return () => clearInterval(interval)
  }, [execute, id])

  const handleDelete = async () => {
    try {
      await deleteDeployment(id)
      navigate('/dashboard')
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

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

  if (loading && !deployment) {
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
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    )
  }

  if (!deployment) return null

  const isProvisioning = ['pending', 'provisioning'].includes(deployment.status)

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-accent flex items-center justify-center text-4xl">
              🦞
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">
                {deployment.agent_name || 'Agent'}
              </h1>
              <Badge variant={getStatusVariant(deployment.status)} className="text-sm">
                {deployment.status}
              </Badge>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/dashboard')}
          >
            ← Back
          </Button>
        </div>

        {/* Status Message */}
        {deployment.status_message && (
          <Card className="mb-6">
            <CardBody>
              <div className="flex items-center space-x-3">
                {isProvisioning && (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-accent-primary" />
                )}
                <span className="text-gray-300">{deployment.status_message}</span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Connection Info */}
        {deployment.ip_address && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Connection Details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="label">IP Address</label>
                <code className="block bg-background-primary px-4 py-3 rounded-lg text-accent-secondary font-mono">
                  {deployment.ip_address}
                </code>
              </div>
              <div>
                <label className="label">SSH Command</label>
                <code className="block bg-background-primary px-4 py-3 rounded-lg text-accent-secondary font-mono text-sm">
                  ssh {deployment.ssh_user}@{deployment.ip_address}
                </code>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Info */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Information</h2>
          </CardHeader>
          <CardBody>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-400">Agent Type</dt>
                <dd className="font-medium">{deployment.agent_slug}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-400">Created</dt>
                <dd className="font-medium">
                  {new Date(deployment.created_at).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-400">Droplet ID</dt>
                <dd className="font-medium font-mono text-sm">
                  {deployment.droplet_id || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-400">Last Updated</dt>
                <dd className="font-medium">
                  {new Date(deployment.updated_at).toLocaleTimeString()}
                </dd>
              </div>
            </dl>
          </CardBody>
        </Card>

        {/* Delete */}
        <Card className="border-red-500/30">
          <CardHeader>
            <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
          </CardHeader>
          <CardBody>
            {!showDeleteConfirm ? (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Delete this deployment</h3>
                  <p className="text-sm text-gray-400">
                    This will permanently destroy the server and all data.
                  </p>
                </div>
                <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                  Delete
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-red-400">
                  Are you sure? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    loading={deleting}
                  >
                    Yes, Delete Forever
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
