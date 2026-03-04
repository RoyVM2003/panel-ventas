import { useAuth } from '../context/AuthContext'

export function HeaderBar() {
  const { email, logout } = useAuth()
  const username = email ? email.split('@')[0] : 'Usuario'

  return (
    <header className="dash-header">

      {/* Línea dorada decorativa superior */}
      <div className="dash-header-accent" />

      <div className="dash-header-inner">

        {/* Izquierda: marca */}
        <div className="dash-brand">
          <div className="dash-brand-icon">
            <i className="fas fa-paper-plane"></i>
          </div>
          <div>
            <div className="dash-brand-name">OSDEMS Ventas</div>
            <div className="dash-brand-tagline">Panel de campañas de email</div>
          </div>
        </div>

        {/* Centro: métrica decorativa */}
        <div className="dash-header-stats">
          <div className="dash-stat">
            <i className="fas fa-envelope-open-text"></i>
            <span>Email Marketing</span>
          </div>
          <div className="dash-stat-sep" />
          <div className="dash-stat">
            <i className="fas fa-robot"></i>
            <span>IA incluida</span>
          </div>
          <div className="dash-stat-sep" />
          <div className="dash-stat">
            <i className="fas fa-shield-halved"></i>
            <span>100% seguro</span>
          </div>
        </div>

        {/* Derecha: QR + usuario */}
        <div className="dash-header-right">

          {/* QR */}
          <div className="dash-qr-block">
            <div className="dash-qr-label">
              <i className="fas fa-qrcode"></i> OSDEMS Digital
            </div>
            <img
              src="https://osdemsdigital.com/wp-content/uploads/2026/03/QR-DIGITALSIN-FONDO.jpeg"
              alt="QR OSDEMS Digital"
              className="dash-qr-img"
            />
          </div>

          {/* Usuario */}
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
