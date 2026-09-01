import type { InputHTMLAttributes } from 'react'
import './TextField.css'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function TextField({
  label,
  error,
  hint,
  id,
  className = '',
  ...props
}: TextFieldProps) {
  const fieldId = id ?? props.name

  return (
    <div className={`text-field ${error ? 'text-field--error' : ''} ${className}`.trim()}>
      <label className="text-field__label" htmlFor={fieldId}>
        {label}
      </label>
      <input
        id={fieldId}
        className="text-field__input"
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
        }
        {...props}
      />
      {hint && !error && (
        <p className="text-field__hint" id={`${fieldId}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-field__error" id={`${fieldId}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
