import { useAuth } from '../context/AuthContext'

export function HeaderBar() {
  const { email, logout } = useAuth()

  const initials = email ? String(email).split('@')[0].slice(0, 2).toUpperCase() : 'U'
  return (
    <div className="header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>

      {/* Izquierda: avatar + título */}
      <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
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
      </div>

      {/* Centro: usuario + cerrar sesión */}
      <div className="user-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
        <span>{email || 'Usuario'}</span>
        <button type="button" className="logout-btn" onClick={logout}>
          Cerrar sesión
        </button>
      </div>

      {/* Derecha: QR OSDEMS Digital */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.07)',
        borderRadius: '1rem',
        border: '1px solid rgba(255,255,255,0.15)',
      }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent, #90cdf4)', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.85 }}>
          Escanea y visita
        </span>
        <img
          src="https://osdemsdigital.com/wp-content/uploads/2026/03/QR-DIGITALSIN-FONDO.jpeg"
          alt="QR OSDEMS Digital"
          style={{ width: '110px', height: '110px', borderRadius: '0.75rem', boxShadow: '0 4px 14px rgba(0,0,0,0.25)', background: '#fff', padding: '4px' }}
        />
        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', textAlign: 'center', letterSpacing: '0.04em' }}>
          OSDEMS Digital
        </span>
      </div>

    </div>
  )
}
