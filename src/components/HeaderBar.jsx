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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '2rem', gap: '0.4rem' }}>
          <img
            src="https://osdemsdigital.com/wp-content/uploads/2026/03/QR-DIGITALSIN-FONDO.jpeg"
            alt="QR OSDEMS Digital"
            style={{ width: '100px', height: '100px', borderRadius: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}
          />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent, #1a56db)', textAlign: 'center', letterSpacing: '0.03em' }}>
            OSDEMS Digital
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
