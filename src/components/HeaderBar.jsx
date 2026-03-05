import { useAuth } from '../context/AuthContext'

export function HeaderBar() {
  const { email, logout } = useAuth()
  const username = email ? email.split('@')[0] : 'Usuario'

  return (
    <header className="dash-header">

      {/* Línea dorada decorativa superior */}
      <div className="dash-header-accent" />

      <div className="dash-header-inner">

        {/* Izquierda: marca sobria */}
        <div className="dash-brand">
          <div>
            <div className="dash-brand-name">OSDEMS Ventas</div>
            <div className="dash-brand-tagline">Configura tu sueño en campañas reales</div>
          </div>
        </div>

        {/* Derecha: usuario */}
        <div className="dash-header-right">
          <div className="dash-user">
            <div className="dash-user-avatar">
              {username.slice(0, 2).toUpperCase()}
            </div>
            <div className="dash-user-info">
              <span className="dash-user-name">{email || 'Usuario'}</span>
              <button type="button" className="dash-logout" onClick={logout}>
                <i className="fas fa-arrow-right-from-bracket"></i>
                Salir
              </button>
            </div>
          </div>
        </div>

      </div>
    </header>
  )
}
