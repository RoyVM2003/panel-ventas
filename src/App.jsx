import { AuthProvider, useAuth } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { PanelPage } from './pages/PanelPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'

function AppRouter() {
  const { isAuthenticated } = useAuth()
  const path = window.location.pathname

  if (path === '/reset-password') {
    return <ResetPasswordPage />
  }

  return isAuthenticated ? <PanelPage /> : <LoginPage />
}

export default function App() {
  return (
    <AuthProvider>
      <div className="wrap">
        <AppRouter />
      </div>
    </AuthProvider>
  )
}
