import { useAuth } from '../context/AuthContext'

export function HeaderBar() {
  const { email, logout } = useAuth()
  const username = email ? email.split('@')[0] : 'Usuario'

  return (
    <header className="nav-bar">
      <div className="nav-bar-accent" />
      <div className="nav-bar-inner">
        <div className="nav-bar-brand">
          <img
            src="https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=80&q=90"
            alt=""
            className="nav-bar-logo"
          />
          <div className="nav-bar-brand-text">
            <span className="nav-bar-name">OSDEMS Ventas</span>
            <span className="nav-bar-tag">Configura tu sueño</span>
          </div>
        </div>
        <div className="nav-bar-right">
          <span className="nav-bar-user">{username}</span>
          <div className="nav-bar-divider" />
          <button type="button" className="nav-bar-logout" onClick={logout} aria-label="Cerrar sesión">
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
