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
      <div className="grid min-h-screen place-items-center bg-gray-100 p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md">
          <h1 className="mb-6 text-center text-2xl font-bold">Administración</h1>
          {loginError && <p className="mb-4 text-sm text-red-500">{loginError}</p>}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold">Email</label>
            <input
              type="email"
              className="w-full rounded border p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold">Contraseña</label>
            <input
              type="password"
              className="w-full rounded border p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full rounded bg-blue-600 p-2 text-white font-semibold hover:bg-blue-700">
            Ingresar
          </button>
        </form>
      </div>
    )
  }

  return <AdminDashboard onLogout={handleLogout} />
}
