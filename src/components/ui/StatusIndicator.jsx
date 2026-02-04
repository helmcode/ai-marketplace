const statusConfig = {
  running: {
    icon: (
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
    ),
    label: 'Running',
    color: 'text-green-400',
  },
  stopped: {
    icon: (
      <span className="relative flex h-3 w-3">
        <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
      </span>
    ),
    label: 'Stopped',
    color: 'text-gray-400',
  },
  pending: {
    icon: (
      <span className="relative flex h-3 w-3">
        <span className="animate-pulse relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
      </span>
    ),
    label: 'Pending',
    color: 'text-yellow-400',
  },
  provisioning: {
    icon: (
      <span className="relative flex h-3 w-3">
        <span className="animate-spin rounded-full h-3 w-3 border-2 border-yellow-500 border-t-transparent"></span>
      </span>
    ),
    label: 'Provisioning',
    color: 'text-yellow-400',
  },
  installing: {
    icon: (
      <span className="relative flex h-3 w-3">
        <span className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></span>
      </span>
    ),
    label: 'Installing',
    color: 'text-blue-400',
  },
  failed: {
    icon: (
      <span className="relative flex h-3 w-3">
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </span>
    ),
    label: 'Failed',
    color: 'text-red-400',
  },
  deleted: {
    icon: (
      <span className="relative flex h-3 w-3">
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-800"></span>
      </span>
    ),
    label: 'Deleted',
    color: 'text-red-600',
  },
  deleting: {
    icon: (
      <span className="relative flex h-3 w-3">
        <span className="animate-spin rounded-full h-3 w-3 border-2 border-red-500 border-t-transparent"></span>
      </span>
    ),
    label: 'Deleting',
    color: 'text-red-400',
  },
}

export default function StatusIndicator({ status, showLabel = true, size = 'md' }) {
  const config = statusConfig[status] || statusConfig.stopped

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={`flex items-center space-x-2 ${sizeClasses[size]}`}>
      {config.icon}
      {showLabel && (
        <span className={`font-medium ${config.color}`}>
          {config.label}
        </span>
      )}
    </div>
  )
}
