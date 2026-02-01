import { Link } from 'react-router-dom'
import Card, { CardBody } from '../ui/Card'
import Badge from '../ui/Badge'

const tierIcons = {
  basic: '📦',
  medium: '🚀',
  pro: '⚡'
}

const tierNames = {
  basic: 'Basic',
  medium: 'Medium',
  pro: 'PRO'
}

export default function BoxCard({ box }) {
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
      case 'stopped':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <Link to={`/boxes/${box.id}`}>
      <Card hover>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center text-2xl">
                {tierIcons[box.tier] || '📦'}
              </div>
              <div>
                <h3 className="font-semibold">{box.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>{tierNames[box.tier] || box.tier}</span>
                  <span>•</span>
                  <span>{box.ip_address || 'Provisioning...'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <Badge variant={getStatusVariant(box.status)}>
                  {box.status}
                </Badge>
                {box.agent_count > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {box.agent_count} agent{box.agent_count !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <span className="text-accent-primary text-sm">
                Manage →
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}
