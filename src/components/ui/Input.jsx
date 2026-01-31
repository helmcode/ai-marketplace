import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, className = '', type = 'text', ...props },
  ref
) {
  return (
    <div className="space-y-1">
      {label && <label className="label">{label}</label>}
      <input
        ref={ref}
        type={type}
        className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
})

export default Input
