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
