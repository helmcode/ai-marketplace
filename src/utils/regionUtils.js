// Region mapping utilities
// Maps Digital Ocean region codes to user-friendly display names

export const REGIONS = {
  nyc1: {
    code: 'nyc1',
    name: 'USA',
    flag: '🇺🇸',
    display: '🇺🇸 USA'
  },
  fra1: {
    code: 'fra1',
    name: 'EU',
    flag: '🇪🇺',
    display: '🇪🇺 EU'
  }
}

// Default region
export const DEFAULT_REGION = 'nyc1'

// Get display string for a region code (e.g., "nyc1" -> "🇺🇸 USA")
export function getRegionDisplay(regionCode) {
  return REGIONS[regionCode]?.display || regionCode
}

// Get just the flag for a region code
export function getRegionFlag(regionCode) {
  return REGIONS[regionCode]?.flag || '🌍'
}

// Get just the name for a region code
export function getRegionName(regionCode) {
  return REGIONS[regionCode]?.name || regionCode
}

// Get all regions as array for selectors
export function getRegionOptions() {
  return Object.values(REGIONS)
}
