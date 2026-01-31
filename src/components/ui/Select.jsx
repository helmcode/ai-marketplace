import { forwardRef } from 'react'

const Select = forwardRef(function Select(
  { label, error, options = [], className = '', ...props },
  ref
) {
  return (
    <div className="space-y-1">
      {label && <label className="label">{label}</label>}
      <select
        ref={ref}
        className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
})

export default Select
