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
    <div id="loginPage" className="lp-root">

      {/* ── Capas de fondo decorativas ── */}
      <div className="lp-bg-blob lp-bg-blob--gold" />
      <div className="lp-bg-blob lp-bg-blob--teal" />
      <div className="lp-bg-blob lp-bg-blob--purple" />
      <div className="lp-bg-dots" />

      {/* ── Formas geométricas decorativas ── */}
      <div className="lp-geo lp-geo--ring-lg" />
      <div className="lp-geo lp-geo--ring-sm" />
      <div className="lp-geo lp-geo--arc" />

      {/* ══════════════ HERO (izquierda) ══════════════ */}
      <div className="lp-hero">

        {/* Logo */}
        <div className="lp-topbar">
          <div className="lp-brand">
            <img
              src="https://osdemsdigital.com/wp-content/uploads/2026/03/logo-ventas.jpeg"
              alt="OSDEMS"
              className="lp-brand-img"
            />
            <div>
              <div className="lp-brand-name">OSDEMS Ventas</div>
              <div className="lp-brand-sub">Panel de Email Marketing</div>
            </div>
          </div>
          <div className="lp-live-pill">
            <span className="lp-live-dot" />
            En línea
          </div>
        </div>

        {/* ── Grid principal: texto izquierda | mockup derecha ── */}
        <div className="lp-hero-main">

          {/* COLUMNA IZQUIERDA: texto + stats + trust */}
          <div className="lp-hero-text">

            <div className="lp-badge-pill">
              <i className="fas fa-rocket"></i>
              Plataforma de Email Marketing con IA
            </div>

            <h1 className="lp-h1">
              Campañas<br />
              que <span className="lp-h1-grad">conectan</span><br />
              y <span className="lp-h1-outline">venden</span>
            </h1>

            <p className="lp-hero-desc">
              Importa contactos desde Excel, diseña con inteligencia artificial y lanza correos masivos en minutos.
            </p>

            {/* Stats grandes */}
            <div className="lp-big-stats">
              <div className="lp-big-stat">
                <strong>12k+</strong>
                <span>Emails al mes</span>
              </div>
              <div className="lp-big-stat-sep" />
              <div className="lp-big-stat">
                <strong>98%</strong>
                <span>Entregados</span>
              </div>
              <div className="lp-big-stat-sep" />
              <div className="lp-big-stat">
                <strong>IA</strong>
                <span>Incluida</span>
              </div>
            </div>

            {/* Trust row: avatares + texto */}
            <div className="lp-trust">
              <div className="lp-trust-avatars">
                <div className="lp-ta lp-ta--1" />
                <div className="lp-ta lp-ta--2" />
                <div className="lp-ta lp-ta--3" />
                <div className="lp-ta lp-ta--4" />
                <div className="lp-ta lp-ta--5" />
              </div>
              <span>+500 empresas confían en OSDEMS</span>
            </div>

            {/* ── Slot de imagen (reemplaza con tu foto real) ── */}
            {/* PARA USAR: sustituye este div por <img src="URL" alt="..." className="lp-img-real" /> */}
            <div className="img-slot img-slot--portrait">
              <i className="fas fa-image"></i>
              <span className="img-slot-label">Tu imagen aquí</span>
              <span className="img-slot-hint">Reemplaza con una foto de tu equipo o producto</span>
            </div>

            {/* Feature pills */}
            <div className="lp-feat-pills">
              <div className="lp-feat-pill">
                <i className="fas fa-file-excel"></i> Excel
              </div>
              <div className="lp-feat-pill">
                <i className="fas fa-robot"></i> IA
              </div>
              <div className="lp-feat-pill">
                <i className="fas fa-shield-halved"></i> Seguro
              </div>
              <div className="lp-feat-pill">
                <i className="fas fa-paper-plane"></i> Envío masivo
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: mockup app + shapes + floating cards */}
          <div className="lp-preview-wrap">

            {/* Shapes geométricas decorativas */}
            <div className="lp-shape lp-shape--sq1" />
            <div className="lp-shape lp-shape--sq2" />
            <div className="lp-shape lp-shape--sq3" />
            <div className="lp-shape lp-shape--circle1" />
            <div className="lp-shape lp-shape--circle2" />

            {/* Marco tipo browser con mini UI de la app */}
            <div className="lp-app-frame">

              {/* Chrome del browser */}
              <div className="lp-app-chrome">
                <div className="lp-app-dots">
                  <span /><span /><span />
                </div>
                <div className="lp-app-url">osdemsventas.com · Panel</div>
              </div>

              {/* Cuerpo: sidebar + contenido */}
              <div className="lp-app-body">

                {/* Sidebar mini */}
                <div className="lp-app-sidebar">
                  <div className="lp-app-logo-mini">
                    <i className="fas fa-paper-plane"></i>
                  </div>
                  <div className="lp-app-nav">
                    <div className="lp-nav-item lp-nav-item--active" title="Campañas">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div className="lp-nav-item" title="Contactos">
                      <i className="fas fa-users"></i>
                    </div>
                    <div className="lp-nav-item" title="Estadísticas">
                      <i className="fas fa-chart-bar"></i>
                    </div>
                    <div className="lp-nav-item" title="IA">
                      <i className="fas fa-robot"></i>
                    </div>
                  </div>
                </div>

                {/* Contenido principal del mockup */}
                <div className="lp-app-main">

                  <div className="lp-app-top-bar">
                    <span className="lp-app-title">Panel de campañas</span>
                    <div className="lp-app-btn-mini" />
                  </div>

                  {/* Stat cards mini */}
                  <div className="lp-app-stats-row">
                    <div className="lp-app-stat-card lp-app-stat-card--green">
                      <div className="lp-asc-num">1,250</div>
                      <div className="lp-asc-label">Enviados hoy</div>
                    </div>
                    <div className="lp-app-stat-card">
                      <div className="lp-asc-num">68%</div>
                      <div className="lp-asc-label">Apertura</div>
                    </div>
                    <div className="lp-app-stat-card">
                      <div className="lp-asc-num">485</div>
                      <div className="lp-asc-label">Contactos</div>
                    </div>
                  </div>

                  {/* Mini gráfica de barras */}
                  <div className="lp-app-chart">
                    <div className="lp-app-chart-label">Aperturas esta semana</div>
                    <div className="lp-app-chart-bars">
                      <div className="lp-mini-bar" style={{ height: '55%' }} />
                      <div className="lp-mini-bar" style={{ height: '75%' }} />
                      <div className="lp-mini-bar" style={{ height: '40%' }} />
                      <div className="lp-mini-bar" style={{ height: '90%' }} />
                      <div className="lp-mini-bar lp-mini-bar--gold" style={{ height: '68%' }} />
                      <div className="lp-mini-bar" style={{ height: '50%' }} />
                      <div className="lp-mini-bar" style={{ height: '82%' }} />
                    </div>
                  </div>

                  {/* Lista de campañas */}
                  <div className="lp-app-campaigns">
                    <div className="lp-campaign-item">
                      <div className="lp-ci-dot lp-ci-dot--green" />
                      <div className="lp-ci-info">
                        <div className="lp-ci-name">Black Friday 2025</div>
                        <div className="lp-ci-num">1,250 enviados</div>
                      </div>
                      <div className="lp-ci-tag lp-ci-tag--green">✓ Enviada</div>
                    </div>
                    <div className="lp-campaign-item">
                      <div className="lp-ci-dot lp-ci-dot--gold" />
                      <div className="lp-ci-info">
                        <div className="lp-ci-name">Promo Navidad</div>
                        <div className="lp-ci-num">Borrador guardado</div>
                      </div>
                      <div className="lp-ci-tag">En curso</div>
                    </div>
                    <div className="lp-campaign-item">
                      <div className="lp-ci-dot lp-ci-dot--blue" />
                      <div className="lp-ci-info">
                        <div className="lp-ci-name">Campaña con IA</div>
                        <div className="lp-ci-num">Generando con IA...</div>
                      </div>
                      <div className="lp-ci-tag lp-ci-tag--blue">IA activa</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Tarjetas flotantes encima del frame */}
            <div className="lp-card lp-card--ai lp-card--float-tr">
              <div className="lp-card-icon lp-card-icon--gold">
                <i className="fas fa-wand-magic-sparkles"></i>
              </div>
              <div className="lp-card-body">
                <div className="lp-card-title">Asistente IA</div>
                <div className="lp-card-typing">
                  <span className="lp-typing-dot" />
                  <span className="lp-typing-dot" />
                  <span className="lp-typing-dot" />
                  <span className="lp-typing-label">Mejorando asunto...</span>
                </div>
              </div>
            </div>

            <div className="lp-card lp-card--sent lp-card--float-bl">
              <div className="lp-card-icon lp-card-icon--green">
                <i className="fas fa-circle-check"></i>
              </div>
              <div className="lp-card-body">
                <div className="lp-card-title">Campaña enviada</div>
                <div className="lp-card-sub">Black Friday · hace 2 min</div>
              </div>
              <div className="lp-card-badge lp-card-badge--green">
                1,250 correos
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ══════════════ PANEL FORMULARIO (derecha) ══════════════ */}
      <div className="lp-panel">

        {/* Acento superior */}
        <div className="lp-panel-accent" />

        <div className="lp-panel-inner">

          {/* Logo en el panel */}
          <div className="lp-panel-logo">
            <img
              src="https://osdemsdigital.com/wp-content/uploads/2026/03/logo-ventas.jpeg"
              alt="OSDEMS"
              className="lp-panel-logo-img"
            />
          </div>

          <h2 className="lp-panel-title">Bienvenido de vuelta</h2>
          <p className="lp-panel-subtitle">
            Accede para gestionar tus campañas de email
          </p>

          <Message text={loginMsg.text} type={loginMsg.type} />

          <form id="formLogin" onSubmit={handleLogin} className="lp-form">
            <div className="lp-field">
              <label htmlFor="loginEmail" className="lp-label">
                <i className="fas fa-envelope"></i> Correo electrónico
              </label>
              <input
                type="email"
                id="loginEmail"
                className="lp-input"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                placeholder="tu@email.com"
              />
            </div>
            <div className="lp-field">
              <label htmlFor="loginPassword" className="lp-label">
                <i className="fas fa-lock"></i> Contraseña
              </label>
              <input
                type="password"
                id="loginPassword"
                className="lp-input"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="lp-btn-primary" id="btnLogin" disabled={loginLoading}>
              {loginLoading
                ? <><span className="btn-spinner" aria-hidden="true" /> Conectando...</>
                : <><i className="fas fa-arrow-right-to-bracket"></i> Entrar al panel</>
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
            <div className="lp-verify-box">
              <div className="lp-verify-header">
                <i className="fas fa-envelope-open-text"></i>
                Verificar correo
              </div>
              <p className="lp-verify-info">
                Código de 6 dígitos enviado a <strong>{loginEmail}</strong>
              </p>
              <Message text={verifyMsg.text} type={verifyMsg.type} />
              <form onSubmit={handleVerify}>
                <FormGroup label="Código de verificación" id="verifyCode">
                  <input
                    type="text"
                    id="verifyCode"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="337054"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </FormGroup>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="submit" className="btn btn-secondary" disabled={verifyLoading || verifyCode.length < 6}>
                    {verifyLoading ? 'Verificando...' : 'Verificar cuenta'}
                  </button>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => { setShowVerify(false); setVerifyCode(''); setVerifyMsg({ text: '', type: 'info' }); }}
                  >
                    Cancelar
                  </button>
                </div>
                <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={handleResendCode}
                    disabled={resendLoading}
                  >
                    {resendLoading ? 'Enviando...' : 'Reenviar código'}
                  </button>
                </p>
              </form>
            </div>
          )}

          {/* Features mini */}
          <div className="lp-panel-features">
            <div className="lp-pf-item">
              <i className="fas fa-file-excel"></i>
              <span>Importa desde Excel</span>
            </div>
            <div className="lp-pf-item">
              <i className="fas fa-robot"></i>
              <span>IA incluida</span>
            </div>
            <div className="lp-pf-item">
              <i className="fas fa-rocket"></i>
              <span>Envío masivo</span>
            </div>
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
