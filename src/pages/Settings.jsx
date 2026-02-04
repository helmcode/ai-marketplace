import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersApi } from '../services/api'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Settings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [sshKey, setSshKey] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await usersApi.me()
        setUser(res.data)
        setSshKey(res.data.ssh_public_key || '')
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load user data')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await usersApi.update({ ssh_public_key: sshKey.trim() })
      setUser(res.data)
      setSuccess('SSH key saved successfully!')
      // Auto-dismiss success message
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save SSH key')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary" />
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account settings</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-900/50 border border-green-700 text-green-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess(null)} className="text-gray-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/50 border border-red-700 text-red-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>✕</span>
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-gray-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Profile Section */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">Profile</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </CardBody>
        </Card>

        {/* SSH Key Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">SSH Public Key</h2>
          </CardHeader>
          <CardBody>
            <p className="text-gray-400 text-sm mb-4">
              Add your SSH public key to enable direct SSH access to your boxes.
              This key will be synced to your boxes so you can connect from your terminal.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Public Key
                </label>
                <textarea
                  value={sshKey}
                  onChange={(e) => setSshKey(e.target.value)}
                  placeholder="ssh-rsa AAAA... or ssh-ed25519 AAAA..."
                  className="w-full h-32 px-4 py-3 bg-surface-secondary border border-gray-700 rounded-lg
                           text-white placeholder-gray-500 font-mono text-sm
                           focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent
                           resize-none"
                />
                <p className="text-gray-500 text-xs mt-2">
                  Supported formats: ssh-rsa, ssh-ed25519, ecdsa-sha2-*
                </p>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-gray-400">
                  {user?.ssh_public_key ? (
                    <span className="text-green-400">✓ SSH key configured</span>
                  ) : (
                    <span className="text-yellow-400">⚠ No SSH key configured</span>
                  )}
                </div>
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={saving}
                  >
                    {saving ? 'Saving...' : 'Save SSH Key'}
                  </Button>
                </div>
              </div>
            </form>

            {/* Help Section */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="font-semibold mb-3">How to generate an SSH key</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <p>If you don't have an SSH key, you can generate one with:</p>
                <code className="block bg-gray-800 px-3 py-2 rounded text-gray-300">
                  ssh-keygen -t ed25519 -C "your_email@example.com"
                </code>
                <p>Then copy your public key:</p>
                <code className="block bg-gray-800 px-3 py-2 rounded text-gray-300">
                  cat ~/.ssh/id_ed25519.pub
                </code>
                <p>Paste the output above and save.</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
