export default function Card({
  children,
  hover = false,
  className = '',
  ...props
}) {
  return (
    <div
      className={`${hover ? 'card-hover' : 'card'} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`p-6 border-b border-surface-border ${className}`}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`p-6 border-t border-surface-border ${className}`}>
      {children}
    </div>
  )
}
