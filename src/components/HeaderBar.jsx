import { useAuth } from '../context/AuthContext'

export function HeaderBar() {
  const { email, logout } = useAuth()

  const initials = email ? String(email).split('@')[0].slice(0, 2).toUpperCase() : 'U'
  return (
    <div className="header-bar">
      <div className="header-brand">
        <span className="header-avatar" aria-hidden="true">{initials}</span>
        <div className="header-title">
          <h1>
            <i className="fas fa-paper-plane"></i>
            Panel de promociones
          </h1>
          <p className="header-subtitle">
            Diseña, guarda y envía campañas de email desde un mismo lugar.
          </p>
          <p className="header-trust">
            Tus datos solo se usan para enviar tus campañas. No compartimos tu lista con nadie.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '1.5rem', gap: '0.3rem' }}>
          <img
            src="https://osdemsdigital.com/wp-content/uploads/2026/03/QR-DIGITALSIN-FONDO.jpeg"
            alt="QR OSDEMS Digital"
            style={{ width: '72px', height: '72px', borderRadius: '0.75rem' }}
          />
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--accent, #1a56db)', textAlign: 'center', lineHeight: 1.2 }}>
            OSDEMS Digital
          </span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted, #6b7280)', textAlign: 'center', lineHeight: 1.2 }}>
            Otra web de la empresa
          </span>
        </div>
      </div>
      <div className="user-info">
        <span>{email || 'Usuario'}</span>
        <button type="button" className="logout-btn" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
