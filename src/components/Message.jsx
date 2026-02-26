export function Message({ text, type = 'info', className = '' }) {
  if (!text) return null
  return (
    <div className={`msg ${type} ${className}`.trim()} role="alert">
      {text}
    </div>
  )
}
