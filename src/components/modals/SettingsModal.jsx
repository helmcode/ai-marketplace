import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { usersApi, billingApi } from '../../services/api'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

const TABS = [
  { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'ssh', label: 'SSH Keys', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
  { id: 'billing', label: 'Billing', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
]

export default function SettingsModal({ isOpen, onClose }) {
  const { user: auth0User } = useAuth0()
  const [activeTab, setActiveTab] = useState('profile')
  const [userData, setUserData] = useState(null)
  const [sshKey, setSshKey] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const hasExistingKey = !!userData?.ssh_public_key

  useEffect(() => {
    if (isOpen) {
      loadUser()
      setIsEditing(false)
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
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSSH = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await usersApi.update({ ssh_public_key: sshKey.trim() })
      setUserData(res.data)
      setIsEditing(false)
      setSuccess('SSH key saved successfully!')
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError('Failed to save SSH key')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSSH = async () => {
    setDeleting(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await usersApi.update({ ssh_public_key: '' })
      setUserData(res.data)
      setSshKey('')
      setSuccess('SSH key deleted successfully!')
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError('Failed to delete SSH key')
    } finally {
      setDeleting(false)
    }
  }

  const handleManageBilling = async () => {
    setBillingLoading(true)
    setError(null)
    try {
      const res = await billingApi.createPortalSession()
      window.location.href = res.data.portal_url
    } catch (err) {
      setError('No billing account found. Create a box first.')
    } finally {
      setBillingLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setSuccess(null)
    setIsEditing(false)
    onClose()
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setError(null)
    setSuccess(null)
    if (tabId !== 'ssh') setIsEditing(false)
  }

  const isReadonly = hasExistingKey && !isEditing

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Settings" size="xl">
      <div className="flex min-h-[450px] max-h-[70vh]">
        {/* Sidebar */}
        <nav className="w-48 flex-shrink-0 border-r border-surface-border p-3 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'bg-accent-primary/20 text-accent-primary'
                  : 'text-gray-400 hover:text-white hover:bg-surface-hover'
                }
              `}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-primary" />
            </div>
          ) : (
            <>
              {/* Alerts */}
              {success && (
                <div className="mb-4 p-3 rounded-lg bg-green-900/50 border border-green-700 text-green-300 flex items-center justify-between text-sm">
                  <span>{success}</span>
                  <button onClick={() => setSuccess(null)} className="text-gray-400 hover:text-white ml-2">&#10005;</button>
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-900/50 border border-red-700 text-red-300 flex items-center justify-between text-sm">
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="text-gray-400 hover:text-white ml-2">&#10005;</button>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Profile</h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    {auth0User?.picture && (
                      <img
                        src={auth0User.picture}
                        alt="Profile"
                        className="w-16 h-16 rounded-full border-2 border-surface-border"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-lg">{auth0User?.name || 'User'}</p>
                      <p className="text-gray-400">{auth0User?.email}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-surface-border space-y-3">
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider">Email</p>
                      <p className="font-medium">{auth0User?.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider">Auth Provider</p>
                      <p className="font-medium capitalize">{auth0User?.sub?.split('|')[0] || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SSH Keys Tab */}
              {activeTab === 'ssh' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">SSH Public Key</h3>
                    <p className="text-gray-400 text-sm">
                      Add your SSH public key to enable direct SSH access to your boxes.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSSH} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Public Key</label>
                      <div className="relative">
                        <textarea
                          value={sshKey}
                          onChange={(e) => setSshKey(e.target.value)}
                          placeholder="ssh-rsa AAAA... or ssh-ed25519 AAAA..."
                          readOnly={isReadonly}
                          className={`
                            w-full h-28 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                            text-gray-100 placeholder-gray-500 font-mono text-sm resize-none transition-colors
                            ${isReadonly
                              ? 'cursor-default bg-gray-900/50 text-gray-400'
                              : 'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent'
                            }
                          `}
                        />
                        {isReadonly && (
                          <button
                            type="button"
                            onClick={() => { setIsEditing(true); setError(null); setSuccess(null) }}
                            className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white hover:bg-surface-hover rounded-lg transition-colors"
                            title="Edit SSH Key"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-2">
                        Supported formats: ssh-rsa, ssh-ed25519, ecdsa-sha2-*
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        {hasExistingKey ? (
                          <span className="text-green-400">&#10003; SSH key configured</span>
                        ) : (
                          <span className="text-yellow-400">&#9888; No SSH key configured</span>
                        )}
                      </div>
                      <div className="flex space-x-3">
                        {isEditing && (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => { setIsEditing(false); setSshKey(userData?.ssh_public_key || ''); setError(null) }}
                          >
                            Cancel
                          </Button>
                        )}
                        {hasExistingKey && !isEditing ? (
                          <Button type="button" variant="danger" onClick={handleDeleteSSH} loading={deleting}>
                            {deleting ? 'Deleting...' : 'Delete SSH Key'}
                          </Button>
                        ) : (
                          <Button type="submit" loading={saving} disabled={!sshKey.trim()}>
                            {saving ? 'Saving...' : 'Save SSH Key'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </form>

                  {(!hasExistingKey || isEditing) && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
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
                  )}
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Billing</h3>
                    <p className="text-gray-400 text-sm">
                      Manage your subscriptions, update payment methods, and view invoices.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-surface-hover border border-surface-border space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Stripe Customer Portal</p>
                        <p className="text-gray-400 text-sm">Manage subscriptions, payment methods, and invoices</p>
                      </div>
                    </div>
                    <Button onClick={handleManageBilling} loading={billingLoading} className="w-full">
                      {billingLoading ? 'Opening portal...' : 'Manage Billing'}
                    </Button>
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>You will be redirected to Stripe&apos;s secure portal where you can:</p>
                    <ul className="mt-2 space-y-1 list-disc list-inside text-gray-400">
                      <li>View and manage active subscriptions</li>
                      <li>Update your payment method</li>
                      <li>Download invoices and receipts</li>
                      <li>Cancel subscriptions</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
