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
          Lanza campañas de correo en minutos usando tu propia base de contactos.
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
