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
    <div id="loginPage" className="login-screen">

      <div className="login-screen-bg">
        <video
          src="https://osdemsdigital.com/wp-content/uploads/2026/03/video-fondo.mp4"
          className="login-screen-bg-video"
          muted
          playsInline
          preload="metadata"
        />
      </div>
      <div className="login-screen-overlay" />

      <div className="login-screen-inner">
        <p className="login-screen-eyebrow">OSDEMS Ventas</p>
        <h1 className="login-screen-headline">CONFIGURA TU SUEÑO</h1>
        <p className="login-screen-tagline">
          Email marketing con IA. Para quien piensa en ventas, no en cupones.
        </p>

        <Message text={loginMsg.text} type={loginMsg.type} />

        <form id="formLogin" onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            id="loginEmail"
            className="login-input"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
            placeholder="Correo electrónico"
          />
          <input
            type="password"
            id="loginPassword"
            className="login-input"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
            placeholder="Contraseña"
          />
          <button type="submit" className="login-cta" id="btnLogin" disabled={loginLoading}>
            {loginLoading ? <span className="btn-spinner" aria-hidden="true" /> : null}
            {loginLoading ? 'Conectando...' : 'Entrar'}
          </button>
        </form>

        <button
          type="button"
          className="login-forgot"
          onClick={() => {
            setForgotEmail(loginEmail)
            setForgotMsg({ text: '', type: 'info' })
            setShowForgot(true)
          }}
        >
          ¿Olvidaste tu contraseña?
        </button>

        {showVerify && (
          <div className="login-verify">
            <div className="login-verify-title">Verificar correo</div>
            <p className="login-verify-info">Código enviado a <strong>{loginEmail}</strong></p>
            <Message text={verifyMsg.text} type={verifyMsg.type} />
            <form onSubmit={handleVerify}>
              <FormGroup label="Código" id="verifyCode">
                <input
                  type="text"
                  id="verifyCode"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="one-time-code"
                  className="login-input"
                />
              </FormGroup>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button type="submit" className="login-cta login-cta--secondary" disabled={verifyLoading || verifyCode.length < 6}>
                  {verifyLoading ? 'Verificando...' : 'Verificar'}
                </button>
                <button type="button" className="login-forgot" onClick={() => { setShowVerify(false); setVerifyCode(''); setVerifyMsg({ text: '', type: 'info' }); }}>
                  Cancelar
                </button>
              </div>
              <p style={{ marginTop: '0.75rem' }}>
                <button type="button" className="login-forgot" onClick={handleResendCode} disabled={resendLoading}>
                  {resendLoading ? 'Enviando...' : 'Reenviar código'}
                </button>
              </p>
            </form>
          </div>
        )}
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
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
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
