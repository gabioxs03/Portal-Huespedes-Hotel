import { useEffect, useState } from 'react'
import { contentRepository } from '../lib/contentRepository'
import { AdminDashboard } from '../components/admin/AdminDashboard'

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    contentRepository.isAuthenticated().then(setIsAuthenticated).catch(() => setIsAuthenticated(false))
  }, [])

  useEffect(() => {
    // Force Light Mode ONLY for the login screen
    if (isAuthenticated === false) {
      document.documentElement.classList.remove('dark')
      document.documentElement.dataset.theme = 'light'
      document.documentElement.style.colorScheme = 'light'
    }
  }, [isAuthenticated])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    try {
      await contentRepository.signIn(email, password)
      setIsAuthenticated(true)
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    }
  }

  const handleLogout = async () => {
    await contentRepository.signOut()
    setIsAuthenticated(false)
  }

  if (isAuthenticated === null) {
    return <div className="grid min-h-screen place-items-center">Cargando...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-mist p-4 font-sans text-ink">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-luxury border border-stone">
          <h1 className="mb-6 text-center text-3xl font-display font-bold text-deepblue">Administración</h1>
          {loginError && <p className="mb-5 text-sm font-semibold text-red-500 text-center">{loginError}</p>}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-bold text-ink">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-stone bg-white p-3 text-ink outline-none focus:border-transparent focus:ring-2 focus:ring-deepblue placeholder-steel/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-8">
            <label className="mb-2 block text-sm font-bold text-ink">Contraseña</label>
            <input
              type="password"
              className="w-full rounded-xl border border-stone bg-white p-3 text-ink outline-none focus:border-transparent focus:ring-2 focus:ring-deepblue placeholder-steel/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full rounded-xl bg-deepblue py-3 px-4 text-white font-bold transition-colors hover:opacity-90 shadow-sm">
            Ingresar
          </button>
        </form>
      </div>
    )
  }

  return <AdminDashboard onLogout={handleLogout} />
}
