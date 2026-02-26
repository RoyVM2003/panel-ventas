export function FormGroup({ label, hint, id, children, className = '' }) {
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={id}>{label}</label>
      )}
      {children}
      {hint && <div className="hint">{hint}</div>}
    </div>
  )
}
