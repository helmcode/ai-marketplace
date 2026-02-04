import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { usersApi } from '../../services/api'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

export default function SettingsModal({ isOpen, onClose }) {
  const { user: auth0User } = useAuth0()
  const [userData, setUserData] = useState(null)
  const [sshKey, setSshKey] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Load user data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUser()
    }
  }, [isOpen])

  const loadUser = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await usersApi.me()
      setUserData(res.data)
      setSshKey(res.data.ssh_public_key || '')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await usersApi.update({ ssh_public_key: sshKey.trim() })
      setUserData(res.data)
      setSuccess('SSH key saved successfully!')
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save SSH key')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setSuccess(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Settings" size="lg">
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            {success && (
              <div className="p-4 rounded-lg bg-green-900/50 border border-green-700 text-green-300 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>&#10003;</span>
                  <span>{success}</span>
                </div>
                <button onClick={() => setSuccess(null)} className="text-gray-400 hover:text-white">
                  &#10005;
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-900/50 border border-red-700 text-red-300 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>&#10005;</span>
                  <span>{error}</span>
                </div>
                <button onClick={() => setError(null)} className="text-gray-400 hover:text-white">
                  &#10005;
                </button>
              </div>
            )}

            {/* Profile Section */}
            <div className="pb-6 border-b border-surface-border">
              <h3 className="text-lg font-semibold mb-4">Profile</h3>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="font-medium">{auth0User?.email}</p>
              </div>
            </div>

            {/* SSH Key Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">SSH Public Key</h3>
              <p className="text-gray-400 text-sm mb-4">
                Add your SSH public key to enable direct SSH access to your boxes.
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
                    className="w-full h-28 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                             text-gray-100 placeholder-gray-500 font-mono text-sm
                             focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent
                             resize-none"
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Supported formats: ssh-rsa, ssh-ed25519, ecdsa-sha2-*
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    {userData?.ssh_public_key ? (
                      <span className="text-green-400">&#10003; SSH key configured</span>
                    ) : (
                      <span className="text-yellow-400">&#9888; No SSH key configured</span>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleClose}
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
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="font-semibold mb-3 text-sm">How to generate an SSH key</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>If you don&apos;t have an SSH key, generate one with:</p>
                  <code className="block bg-gray-800 px-3 py-2 rounded text-gray-300 text-xs">
                    ssh-keygen -t ed25519 -C &quot;your_email@example.com&quot;
                  </code>
                  <p>Then copy your public key:</p>
                  <code className="block bg-gray-800 px-3 py-2 rounded text-gray-300 text-xs">
                    cat ~/.ssh/id_ed25519.pub
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
