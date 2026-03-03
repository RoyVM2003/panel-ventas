import { useAuth } from '../context/AuthContext'

export function HeaderBar() {
  const { email, logout } = useAuth()

  return (
    <div className="header-bar">
      <div className="header-title">
        <h1>
          <i className="fas fa-paper-plane"></i>
          Panel de promociones
        </h1>
        <p className="header-subtitle">
          Diseña, guarda y envía campañas de email desde un mismo lugar.
        </p>
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
