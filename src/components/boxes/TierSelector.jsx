import Card, { CardBody } from '../ui/Card'

const tierIcons = {
  basic: '📦',
  medium: '🚀',
  pro: '⚡'
}

export default function TierSelector({ tiers, selectedTier, onSelect }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {tiers.map((tier) => {
        const isSelected = selectedTier === tier.tier
        const pricePerMonth = tier.price_cents / 100

        return (
          <button
            type="button"
            key={tier.tier}
            onClick={() => onSelect(tier.tier)}
            className="text-left focus:outline-none"
          >
            <Card
              className={`transition-all ${
                isSelected
                  ? 'ring-2 ring-accent-primary border-accent-primary'
                  : 'hover:border-gray-600'
              }`}
            >
              <CardBody>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center text-2xl">
                    {tierIcons[tier.tier] || '📦'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{tier.display_name}</h3>
                    <p className="text-accent-primary font-semibold">
                      ${pricePerMonth}/mo
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-400 w-16">CPU:</span>
                    <span className="font-medium">{tier.cpu} vCPU</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-400 w-16">RAM:</span>
                    <span className="font-medium">{tier.ram_gb} GB</span>
                  </div>
                </div>

                <p className="text-sm text-gray-400">{tier.description}</p>

                {isSelected && (
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-full text-sm">
                      ✓ Selected
                    </span>
                  </div>
                )}
              </CardBody>
            </Card>
          </button>
        )
      })}
    </div>
  )
}
