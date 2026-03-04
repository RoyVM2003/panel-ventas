import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FormGroup } from '../components/FormGroup'
import { Message } from '../components/Message'
import { forgotPassword, verifyEmail, resendVerification } from '../services/authService'

export function LoginPage() {
  const { login } = useAuth()
  const [showForgot, setShowForgot] = useState(false)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginMsg, setLoginMsg] = useState({ text: '', type: 'info' })

  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMsg, setForgotMsg] = useState({ text: '', type: 'info' })

  const [showVerify, setShowVerify] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyMsg, setVerifyMsg] = useState({ text: '', type: 'info' })
  const [resendLoading, setResendLoading] = useState(false)

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
      setLoginMsg({ text: 'No se pudo iniciar sesión. ' + msg, type: 'err' })
      const msgLower = (msg || '').toLowerCase()
      const isUnverified =
        msgLower.includes('no verificada') ||
        msgLower.includes('verifica tu cuenta') ||
        msgLower.includes('verificación')
      if (isUnverified || err.status === 401) {
        setShowVerify(true)
      }
    } finally {
      setLoginLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const code = verifyCode.trim()
    if (!code || !loginEmail.trim()) return
    setVerifyLoading(true)
    setVerifyMsg({ text: '', type: 'info' })
    try {
      await verifyEmail(loginEmail.trim(), code)
      setVerifyMsg({ text: 'Cuenta verificada. Ya puedes iniciar sesión.', type: 'ok' })
      setShowVerify(false)
      setVerifyCode('')
      setLoginMsg({ text: 'Cuenta verificada. Vuelve a pulsar Entrar para iniciar sesión.', type: 'ok' })
    } catch (err) {
      let msg =
        err.data?.errors?.[0]?.msg ||
        err.data?.message ||
        err.data?.error ||
        err.message
      if (err.status === 404 || (typeof msg === 'undefined' && err.data)) {
        msg = 'El enlace de verificación no es válido. Si el problema continúa, contacta al administrador.'
      }
      if (!msg) msg = 'No se pudo verificar. Intenta de nuevo o contacta al administrador.'
      setVerifyMsg({ text: msg, type: 'err' })
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!loginEmail.trim()) return
    setResendLoading(true)
    setVerifyMsg({ text: '', type: 'info' })
    try {
      await resendVerification(loginEmail.trim())
      setVerifyMsg({ text: 'Código reenviado. Revisa tu correo.', type: 'ok' })
    } catch (err) {
      const msg = err.data?.message || err.data?.error || err.message
      setVerifyMsg({ text: msg ? msg : 'No hemos podido reenviar el código. Intenta de nuevo en unos minutos.', type: 'err' })
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div id="loginPage" className="login-page">

      {/* ── Lado izquierdo: hero ── */}
      <div className="login-hero">
        <img
          src="https://osdemsdigital.com/wp-content/uploads/2025/04/Logo-os-group.jpg"
          alt="OSDEMS"
          className="login-hero-logo"
        />
        <div className="login-hero-tag">
          <i className="fas fa-bolt"></i>
          Email Marketing Profesional
        </div>
        <h1>
          Envía campañas que<br />
          <span>venden más</span>
        </h1>
        <p className="login-hero-desc">
          Conecta con tus clientes, gestiona tus listas y lanza campañas de correo personalizadas en minutos — todo desde un mismo lugar.
        </p>
        <ul className="login-hero-features">
          <li>
            <span className="feat-icon"><i className="fas fa-file-excel"></i></span>
            Importa contactos desde Excel en segundos
          </li>
          <li>
            <span className="feat-icon"><i className="fas fa-pen-fancy"></i></span>
            Diseña campañas de correo personalizadas
          </li>
          <li>
            <span className="feat-icon"><i className="fas fa-robot"></i></span>
            Asistente de inteligencia artificial incluido
          </li>
          <li>
            <span className="feat-icon"><i className="fas fa-paper-plane"></i></span>
            Envía a toda tu lista con un solo clic
          </li>
        </ul>
      </div>

      {/* ── Lado derecho: formulario ── */}
      <div className="login-form-panel">
        <div className="login-form-inner">
          <div className="login-section">
            <div className="login-header">
              <img
                src="https://osdemsdigital.com/wp-content/uploads/2025/04/Logo-os-group.jpg"
                alt="OSDEMS"
                className="login-logo"
              />
              <h2>Accede a tu panel</h2>
              <p className="login-subtitle">
                Conecta con tus clientes: gestiona contactos, campañas y envíos desde un solo panel.
              </p>
            </div>

            <Message text={loginMsg.text} type={loginMsg.type} />

            <form id="formLogin" onSubmit={handleLogin}>
              <FormGroup label="Correo electrónico" id="loginEmail">
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
              <button type="submit" className="btn" id="btnLogin" disabled={loginLoading} style={{ width: '100%' }}>
                {loginLoading
                  ? <><span className="btn-spinner" aria-hidden="true" /> Conectando...</>
                  : <><i className="fas fa-sign-in-alt"></i> Entrar al panel</>
                }
              </button>
            </form>

            <button
              type="button"
              className="btn-link forgot-link"
              onClick={() => {
                setForgotEmail(loginEmail)
                setForgotMsg({ text: '', type: 'info' })
                setShowForgot(true)
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>

            {showVerify && (
              <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px' }}>
                <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#0b1e33', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fas fa-envelope-open-text"></i> Verificar correo
                </h3>
                <p className="msg info" style={{ marginBottom: '0.75rem' }}>
                  Introduce el código de 6 dígitos que te enviamos a <strong>{loginEmail}</strong>
                </p>
                <Message text={verifyMsg.text} type={verifyMsg.type} />
                <form onSubmit={handleVerify}>
                  <FormGroup label="Código de verificación" id="verifyCode">
                    <input
                      type="text"
                      id="verifyCode"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Ej. 337054"
                      maxLength={6}
                      autoComplete="one-time-code"
                    />
                  </FormGroup>
                  <button type="submit" className="btn btn-secondary" disabled={verifyLoading || verifyCode.length < 6}>
                    {verifyLoading ? 'Verificando...' : 'Verificar cuenta'}
                  </button>
                  <button
                    type="button"
                    className="btn-link"
                    style={{ marginLeft: '0.75rem' }}
                    onClick={() => { setShowVerify(false); setVerifyCode(''); setVerifyMsg({ text: '', type: 'info' }); }}
                  >
                    Cancelar
                  </button>
                  <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={handleResendCode}
                      disabled={resendLoading}
                    >
                      {resendLoading ? 'Enviando...' : 'Reenviar código por correo'}
                    </button>
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal: olvidé contraseña ── */}
      {showForgot && (
        <div className="modal-overlay" onClick={() => setShowForgot(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-key"></i> Restablecer contraseña
              </h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowForgot(false)}
                aria-label="Cerrar"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <p className="msg info">
              Ingresa el correo con el que te registraste. Te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <Message text={forgotMsg.text} type={forgotMsg.type} />
            <form
              id="formForgotPassword"
              onSubmit={async (e) => {
                e.preventDefault()
                const email = forgotEmail.trim()
                if (!email) return
                setForgotLoading(true)
                setForgotMsg({ text: 'Enviando instrucciones...', type: 'info' })
                try {
                  await forgotPassword(email)
                  setForgotMsg({
                    text: 'Si el correo existe, se enviaron las instrucciones para restablecer tu contraseña.',
                    type: 'ok',
                  })
                } catch (err) {
                  const msg =
                    err.data?.message ||
                    err.data?.error ||
                    (err.data && typeof err.data === 'object' ? JSON.stringify(err.data) : err.message)
                  setForgotMsg({ text: 'Error al solicitar restablecimiento: ' + msg, type: 'err' })
                } finally {
                  setForgotLoading(false)
                }
              }}
            >
              <FormGroup label="Correo electrónico" id="forgotEmail">
                <input
                  type="email"
                  id="forgotEmail"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  placeholder="tucorreo@ejemplo.com"
                />
              </FormGroup>
              <button type="submit" className="btn btn-secondary" disabled={forgotLoading} style={{ width: '100%' }}>
                {forgotLoading ? <><span className="btn-spinner" aria-hidden="true" /> Enviando...</> : 'Enviar enlace'}
              </button>
            </form>
            <button
              type="button"
              className="btn btn-secondary modal-back"
              onClick={() => setShowForgot(false)}
            >
              Volver a iniciar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
