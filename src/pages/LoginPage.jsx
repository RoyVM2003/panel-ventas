import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FormGroup } from '../components/FormGroup'
import { Message } from '../components/Message'
import { register } from '../services/authService'

export function LoginPage() {
  const { login } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginMsg, setLoginMsg] = useState({ text: '', type: 'info' })

  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regFirstName, setRegFirstName] = useState('')
  const [regLastName, setRegLastName] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regMsg, setRegMsg] = useState({ text: '', type: 'info' })

  const handleLogin = async (e) => {
    e.preventDefault()
    const email = loginEmail.trim()
    const password = loginPassword
    if (!email || !password) return
    setLoginLoading(true)
    setLoginMsg({ text: 'Conectando...', type: 'info' })
    try {
      await login(email, password)
      setLoginMsg({ text: '', type: 'info' })
    } catch (err) {
      const msg =
        err.data?.message ||
        err.data?.error ||
        (err.data && typeof err.data === 'object' ? JSON.stringify(err.data) : err.message)
      setLoginMsg({ text: 'Error: ' + msg, type: 'err' })
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const email = regEmail.trim()
    const password = regPassword
    const first_name = regFirstName.trim()
    const last_name = regLastName.trim()
    if (!email || !password || !first_name || !last_name) return
    setRegLoading(true)
    setRegMsg({ text: 'Creando cuenta...', type: 'info' })
    try {
      await register({ email, password, first_name, last_name })
      setLoginEmail(email)
      setLoginPassword('')
      setRegEmail('')
      setRegPassword('')
      setRegFirstName('')
      setRegLastName('')
      setShowRegister(false)
      setLoginMsg({ text: 'Cuenta creada. Ya puedes iniciar sesión con: ' + email, type: 'ok' })
      setRegMsg({ text: '', type: 'info' })
    } catch (err) {
      const msg =
        err.data?.message ||
        err.data?.error ||
        (err.data && typeof err.data === 'object' ? JSON.stringify(err.data) : err.message)
      setRegMsg({ text: 'Error al crear cuenta: ' + msg, type: 'err' })
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div id="loginPage" className="login-page">
      <div className="login-section">
        <h2>
          <i className="fas fa-lock"></i> Paso 0 · Iniciar sesión
        </h2>
        <p className="msg info">
          Front en React. APIs en el dominio del backend (cuando esté activo tras ~24h). Inicia sesión con tu cuenta.
        </p>
        <Message text={loginMsg.text} type={loginMsg.type} />
        <form id="formLogin" onSubmit={handleLogin}>
          <FormGroup label="Correo" id="loginEmail">
            <input
              type="email"
              id="loginEmail"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </FormGroup>
          <FormGroup label="Contraseña" id="loginPassword">
            <input
              type="password"
              id="loginPassword"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </FormGroup>
          <button type="submit" className="btn" id="btnLogin" disabled={loginLoading}>
            Entrar
          </button>
        </form>
        <p className="register-cta">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            className="btn-link"
            onClick={() => setShowRegister(true)}
          >
            Crear cuenta
          </button>
        </p>
      </div>

      {showRegister && (
        <div className="modal-overlay" onClick={() => setShowRegister(false)}>
          <div className="modal-box login-section" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-user-plus"></i> Crear cuenta
              </h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowRegister(false)}
                aria-label="Cerrar"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <p className="msg info">Completa los datos. La cuenta se crea con la API de registro.</p>
            <Message text={regMsg.text} type={regMsg.type} />
            <form id="formRegister" onSubmit={handleRegister}>
              <FormGroup label="Correo" id="regEmail">
                <input
                  type="email"
                  id="regEmail"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  placeholder="nuevo@email.com"
                />
              </FormGroup>
              <FormGroup label="Contraseña" id="regPassword">
                <input
                  type="password"
                  id="regPassword"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </FormGroup>
              <FormGroup label="Nombre" id="regFirstName">
                <input
                  type="text"
                  id="regFirstName"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  required
                  placeholder="Ej. Uriel"
                />
              </FormGroup>
              <FormGroup label="Apellido" id="regLastName">
                <input
                  type="text"
                  id="regLastName"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  required
                  placeholder="Ej. Pérez"
                />
              </FormGroup>
              <button type="submit" className="btn btn-secondary" id="btnRegister" disabled={regLoading}>
                <i className="fas fa-user-plus"></i> Crear cuenta
              </button>
            </form>
            <button
              type="button"
              className="btn btn-secondary modal-back"
              onClick={() => setShowRegister(false)}
            >
              Volver a iniciar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
