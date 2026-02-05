import Card, { CardBody } from '../ui/Card'
import { REGIONS } from '../../utils/regionUtils'

const regionDescriptions = {
  nyc1: 'New York, United States',
  fra1: 'Frankfurt, Germany'
}

export default function RegionSelector({ selectedRegion, onSelect }) {
  const regions = Object.values(REGIONS)

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {regions.map((region) => {
        const isSelected = selectedRegion === region.code

        return (
          <button
            type="button"
            key={region.code}
            onClick={() => onSelect(region.code)}
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
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-lg bg-gradient-accent flex items-center justify-center text-3xl">
                    {region.flag}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{region.name}</h3>
                    <p className="text-sm text-gray-400">
                      {regionDescriptions[region.code]}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-full text-sm">
                      ✓
                    </span>
                  )}
                </div>
              </CardBody>
            </Card>
          </button>
        )
      })}
    </div>
  )
}
