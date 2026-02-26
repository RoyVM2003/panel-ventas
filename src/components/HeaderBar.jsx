import { useAuth } from '../context/AuthContext'

export function HeaderBar() {
  const { email, logout } = useAuth()

  return (
    <div className="header-bar">
      <h1>
        <i className="fas fa-paper-plane"></i>
        Panel de promociones (emails + IA)
      </h1>
      <div className="user-info">
        <span>{email || 'Usuario'}</span>
        <button type="button" className="logout-btn" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
