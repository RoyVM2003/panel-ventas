export function Panel({ title, icon = 'fas fa-circle', children, className = '' }) {
  return (
    <div className={`panel ${className}`.trim()}>
      <div className="panel-accent-bar" />
      <div className="panel-hd">
        <div className="panel-hd-icon">
          <i className={icon}></i>
        </div>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  )
}
