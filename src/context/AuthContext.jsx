import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getStoredToken,
  getStoredEmail,
  setSession,
  clearSession,
  login as apiLogin,
} from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getStoredToken())
  const [email, setEmailState] = useState(getStoredEmail())

  const login = useCallback(async (emailValue, password) => {
    const { token: t, email: e } = await apiLogin(emailValue, password)
    setSession(t, e)
    setTokenState(t)
    setEmailState(e)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setTokenState(null)
    setEmailState(null)
  }, [])

  const isAuthenticated = !!token

  useEffect(() => {
    setTokenState(getStoredToken())
    setEmailState(getStoredEmail())
  }, [])

  return (
    <AuthContext.Provider value={{ token, email, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
