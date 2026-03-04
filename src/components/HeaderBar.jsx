import { useAuth } from '../context/AuthContext'

export function HeaderBar() {
  const { email, logout } = useAuth()

  const initials = email ? String(email).split('@')[0].slice(0, 2).toUpperCase() : 'U'

  return (
    <div className="header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>

      {/* Marca: avatar + título */}
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
      </div>

      {/* Derecha: QR + usuario */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

        {/* QR OSDEMS Digital */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.75rem 1rem',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.12)',
        }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'rgba(212,168,58,0.85)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            Escanea y visita
          </span>
          <img
            src="https://osdemsdigital.com/wp-content/uploads/2026/03/QR-DIGITALSIN-FONDO.jpeg"
            alt="QR OSDEMS Digital"
            style={{ width: '90px', height: '90px', borderRadius: '10px', background: '#fff', padding: '5px', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
          />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', letterSpacing: '0.03em' }}>
            OSDEMS Digital
          </span>
        </div>

        {/* Info usuario + logout */}
        <div className="user-info">
          <span>{email || 'Usuario'}</span>
          <button type="button" className="logout-btn" onClick={logout}>
            <i className="fas fa-sign-out-alt" style={{ marginRight: '0.4rem' }}></i>
            Cerrar sesión
          </button>
        </div>

      </div>
    </div>
  )
}
