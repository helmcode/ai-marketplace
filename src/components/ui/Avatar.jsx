export default function Avatar({ email, size = 'md', className = '' }) {
  // Get first letter of email
  const initial = email ? email.charAt(0).toUpperCase() : '?'

  // Generate consistent color from email
  const getColorFromEmail = (email) => {
    if (!email) return 'bg-accent-primary'

    let hash = 0
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash)
    }

    const colors = [
      'bg-violet-600',
      'bg-purple-600',
      'bg-indigo-600',
      'bg-blue-600',
      'bg-cyan-600',
      'bg-teal-600',
      'bg-emerald-600',
      'bg-pink-600',
    ]

    return colors[Math.abs(hash) % colors.length]
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  }

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${getColorFromEmail(email)}
        rounded-full flex items-center justify-center
        font-semibold text-white
        ${className}
      `}
    >
      {initial}
    </div>
  )
}
