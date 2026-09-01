import type { TextareaHTMLAttributes } from 'react'
import './TextArea.css'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
}

export function TextArea({
  label,
  error,
  hint,
  id,
  className = '',
  ...props
}: TextAreaProps) {
  const fieldId = id ?? props.name

  return (
    <div className={`text-area ${error ? 'text-area--error' : ''} ${className}`.trim()}>
      <label className="text-area__label" htmlFor={fieldId}>
        {label}
      </label>
      <textarea
        id={fieldId}
        className="text-area__input"
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
        }
        {...props}
      />
      {hint && !error && (
        <p className="text-area__hint" id={`${fieldId}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-area__error" id={`${fieldId}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
