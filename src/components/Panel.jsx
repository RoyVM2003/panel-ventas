export function Panel({ title, icon = 'fas fa-circle', children, className = '' }) {
  return (
    <div className={`panel ${className}`.trim()}>
      <h2>
        <i className={icon}></i>
        {title}
      </h2>
      {children}
    </div>
  )
}
