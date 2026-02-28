import { useEffect, useState } from 'react'
import { FormGroup } from '../components/FormGroup'
import { Message } from '../components/Message'
import { API_BASE } from '../config/api'

export function ResetPasswordPage() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: 'info' })

  useEffect(() => {
    if (!token) {
      setMsg({
        text: 'El enlace no es válido o falta el token para restablecer la contraseña.',
        type: 'err',
      })
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) return
    if (!password || !confirmPassword) {
      setMsg({ text: 'Escribe y confirma tu nueva contraseña.', type: 'err' })
      return
    }
    if (password !== confirmPassword) {
      setMsg({ text: 'Las contraseñas no coinciden.', type: 'err' })
      return
    }
    setLoading(true)
    setMsg({ text: 'Actualizando contraseña...', type: 'info' })
    try {
      // Swagger: { token, newPassword }. Si el backend devuelve 400, puede esperar "password" en lugar de "newPassword".
      const res = await fetch(API_BASE + '/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (_) {
        data = text
      }
      if (!res.ok) {
        const errMsg =
          data?.errors?.[0]?.msg || data?.message || data?.error || (data && typeof data === 'object' ? JSON.stringify(data) : String(data))
        throw new Error(errMsg)
      }
      setMsg({
        text: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.',
        type: 'ok',
      })
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      setMsg({
        text: 'Error al restablecer contraseña: ' + (error.message || 'intenta nuevamente más tarde'),
        type: 'err',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-section">
        <h2>
          <i className="fas fa-key"></i> Restablecer contraseña
        </h2>
        <p className="msg info" style={{ marginBottom: '1rem' }}>
          La contraseña debe contener al menos una mayúscula, una minúscula y un número.
        </p>
        <Message text={msg.text} type={msg.type} />
        <form onSubmit={handleSubmit}>
          <FormGroup label="Nueva contraseña" id="newPassword">
            <input
              type="password"
              id="newPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </FormGroup>
          <FormGroup label="Confirmar nueva contraseña" id="confirmPassword">
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </FormGroup>
          <button type="submit" className="btn btn-secondary" disabled={loading || !token}>
            Guardar nueva contraseña
          </button>
        </form>
        <button
          type="button"
          className="btn btn-secondary modal-back"
          style={{ marginTop: '1rem', width: '100%' }}
          onClick={() => {
            window.location.href = '/'
          }}
        >
          Volver a iniciar sesión
        </button>
      </div>
    </div>
  )
}

