import { AuthProvider, useAuth } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { PanelPage } from './pages/PanelPage'

function AppRouter() {
  const { isAuthenticated } = useAuth()
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
