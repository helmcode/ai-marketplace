import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { boxesApi, boxAgentsApi, usersApi } from '../services/api'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import StatusIndicator from '../components/ui/StatusIndicator'

const tierNames = {
  basic: 'Basic',
  medium: 'Medium',
  pro: 'PRO'
}

export default function BoxDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [box, setBox] = useState(null)
  const [agents, setAgents] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [syncingSSH, setSyncingSSH] = useState(false)

  const mountedRef = useRef(true)

  // Load box, agents, and user
  const loadData = async () => {
    try {
      const [boxRes, agentsRes, userRes] = await Promise.all([
        boxesApi.get(id),
        boxAgentsApi.list(id),
        usersApi.me()
      ])
      if (mountedRef.current) {
        setBox(boxRes.data)
        setAgents(agentsRes.data)
        setUser(userRes.data)
        setError(null)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.response?.data?.detail || 'Failed to load box')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  // Sync SSH key to box
  const handleSyncSSH = async () => {
    setSyncingSSH(true)
    try {
      const res = await boxesApi.syncSsh(id)
      setBox(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to sync SSH key')
    } finally {
      setSyncingSSH(false)
    }
  }

  // Initial load
  useEffect(() => {
    mountedRef.current = true
    loadData()
    return () => {
      mountedRef.current = false
    }
  }, [id])

  // Poll for status updates while provisioning
  useEffect(() => {
    if (box && (box.status === 'pending' || box.status === 'provisioning')) {
      const interval = setInterval(async () => {
        try {
          const res = await boxesApi.get(id)
          if (mountedRef.current) {
            setBox(res.data)
          }
        } catch (err) {
          console.error('Poll error:', err)
        }
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [box?.status, id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await boxesApi.delete(id)
      navigate('/dashboard', { state: { deletedBoxId: id } })
    } catch (err) {
      console.error('Failed to delete box:', err)
      setError('Failed to delete box. Please try again.')
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }


  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    )
  }

  if (!box) return null

  const isRunning = box.status === 'running'

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-3xl font-bold">{box.name}</h1>
              <StatusIndicator status={box.status} />
            </div>
            <p className="text-gray-400">
              {tierNames[box.tier] || box.tier} • {box.region}
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Box
          </Button>
        </div>

        {/* Provisioning Status - only show while box is being created */}
        {(box.status === 'pending' || box.status === 'provisioning') && box.status_message && (
          <Card className="mb-8 border-yellow-500/30 bg-yellow-900/10">
            <CardBody>
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-yellow-500" />
                <p className="text-yellow-200">{box.status_message}</p>
              </div>
            </CardBody>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Box Info */}
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Box Information</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Tier</p>
                  <p className="font-medium">{tierNames[box.tier] || box.tier}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Resources</p>
                  <p className="font-medium">
                    {box.tier_cpu || 1} vCPU • {box.tier_ram_gb || 2} GB RAM
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">IP Address</p>
                  <p className="font-mono">{box.ip_address || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Region</p>
                  <p className="font-medium">{box.region}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">SSH Access</p>
                  {!box.ip_address ? (
                    <p className="text-gray-500 text-sm mt-1">Available when running</p>
                  ) : !user?.ssh_public_key ? (
                    <div className="mt-1">
                      <p className="text-gray-500 text-sm">
                        Configure your SSH key in Settings (click your profile in the sidebar)
                      </p>
                    </div>
                  ) : !box.user_ssh_synced ? (
                    <div className="mt-1">
                      <p className="text-gray-500 text-sm mb-2">
                        Sync your SSH key to enable access to this box
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleSyncSSH}
                        loading={syncingSSH}
                      >
                        {syncingSSH ? 'Syncing...' : 'Sync SSH Key'}
                      </Button>
                    </div>
                  ) : (
                    <code className="text-sm bg-gray-800 px-2 py-1 rounded block mt-1">
                      ssh root@{box.ip_address}
                    </code>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Agents */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Installed Agents</h2>
                  {isRunning && (
                    <Link to={`/boxes/${id}/install`}>
                      <Button size="sm">Install Agent</Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                {!agents || agents.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🤖</div>
                    <p className="text-gray-400 mb-4">No agents installed yet</p>
                    {isRunning && (
                      <Link to={`/boxes/${id}/install`}>
                        <Button>Install Your First Agent</Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center text-xl overflow-hidden">
                            {agent.agent_icon_url ? (
                              <img src={agent.agent_icon_url} alt={agent.agent_name} className="w-full h-full object-cover" />
                            ) : (
                              '🤖'
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{agent.instance_name}</h3>
                            <p className="text-sm text-gray-400">{agent.agent_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <StatusIndicator status={agent.status} size="sm" />
                          {agent.status === 'pending' && (
                            <Link to={`/boxes/${id}/agents/${agent.id}/setup`}>
                              <Button size="sm" variant="secondary">
                                Continue Setup
                              </Button>
                            </Link>
                          )}
                          {agent.status === 'running' && (
                            <Link to={`/boxes/${id}/agents/${agent.id}/tui`}>
                              <Button size="sm" variant="secondary">
                                Open TUI
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardBody>
                <h3 className="text-xl font-bold mb-4">Delete Box?</h3>
                <p className="text-gray-400 mb-6">
                  This will permanently delete <strong>{box.name}</strong> and all
                  installed agents. This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    loading={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
