import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { tiersApi, billingApi } from '../services/api'
import { useApiCall } from '../hooks/useApi'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import TierSelector from '../components/boxes/TierSelector'
import RegionSelector from '../components/boxes/RegionSelector'
import { DEFAULT_REGION, getRegionDisplay } from '../utils/regionUtils'

export default function BoxCreate() {
  const navigate = useNavigate()
  const { user: auth0User } = useAuth0()
  const [name, setName] = useState('')
  const [selectedTier, setSelectedTier] = useState('basic')
  const [selectedRegion, setSelectedRegion] = useState(DEFAULT_REGION)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const { data: tiersData, loading: loadingTiers, execute: loadTiers } = useApiCall(tiersApi.list)

  useEffect(() => {
    loadTiers()
  }, [loadTiers])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Please enter a name for your box')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const response = await billingApi.createCheckoutSession({
        box_name: name.trim(),
        tier: selectedTier,
        region: selectedRegion,
        email: auth0User?.email || null
      })

      if (response.data.reused_subscription) {
        // Subscription reused — box created directly, go to dashboard
        navigate('/dashboard')
      } else {
        // New subscription — redirect to Stripe Checkout
        window.location.href = response.data.checkout_url
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setCreating(false)
    }
  }

  const tiers = tiersData?.tiers || []

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create a New Box</h1>
          <p className="text-gray-400">
            Choose your box specifications and give it a name
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Box Name */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Box Name</h2>
            </CardHeader>
            <CardBody>
              <Input
                label="Give your box a memorable name"
                placeholder="My AI Box"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
            </CardBody>
          </Card>

          {/* Region Selection */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Select Region</h2>
              <p className="text-gray-400 text-sm mt-1">
                Choose where your box will be located.
              </p>
            </CardHeader>
            <CardBody>
              <RegionSelector
                selectedRegion={selectedRegion}
                onSelect={setSelectedRegion}
              />
            </CardBody>
          </Card>

          {/* Tier Selection */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Select Your Tier</h2>
              <p className="text-gray-400 text-sm mt-1">
                Choose the resources for your box. You can run multiple agents in any tier.
              </p>
            </CardHeader>
            <CardBody>
              {loadingTiers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-primary" />
                </div>
              ) : (
                <TierSelector
                  tiers={tiers}
                  selectedTier={selectedTier}
                  onSelect={setSelectedTier}
                />
              )}
            </CardBody>
          </Card>

          {/* Summary */}
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    {name || 'Unnamed Box'} - {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {getRegionDisplay(selectedRegion)} • Ready for AI agents
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent-primary">
                    ${tiers.find(t => t.tier === selectedTier)?.price_cents / 100 || 0}/mo
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={creating}
              disabled={!name.trim() || creating}
            >
              {creating ? 'Redirecting to payment...' : 'Subscribe & Create Box'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
