import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import apiClient from './apiClient'
import useAuthStore from './store/authStore'
import { AudiencePage, ContentPage, Layout, OverviewPage, PlatformsPage } from './pages'

function App() {
  const { user, token, setSession, clearSession } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '', display_name: '' })
  const [isRegistering, setIsRegistering] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handleToast = (event) => {
      const toast = event.detail
      setToasts((current) => [...current, { id: Date.now() + Math.random(), ...toast }])
    }

    window.addEventListener('creatoriq:toast', handleToast)
    return () => window.removeEventListener('creatoriq:toast', handleToast)
  }, [])

  useEffect(() => {
    if (!token) return
    apiClient
      .get('/auth/me')
      .then(({ data }) => setSession(token, data))
      .catch(() => clearSession())
  }, [clearSession, setSession, token])

  useEffect(() => {
    if (toasts.length === 0) return undefined
    const timeoutId = window.setTimeout(() => {
      setToasts((current) => current.slice(1))
    }, 3600)
    return () => window.clearTimeout(timeoutId)
  }, [toasts])

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = isRegistering
        ? await apiClient.post('/auth/register', form)
        : await apiClient.post(
            '/auth/login',
            new URLSearchParams({ username: form.email, password: form.password }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
          )

      const result = response.data
      const nextUser = result.user || (await apiClient.get('/auth/me')).data
      setSession(result.access_token, nextUser)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message || 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    clearSession()
  }

  const authPanel = (
    <main className="auth-page">
      <div className="auth-glow" />
      <section className="auth-panel">
        <p className="eyebrow">CREATORIQ / ANALYTICS PLATFORM</p>
        <h1>{isRegistering ? 'Create your workspace' : 'Welcome back'}</h1>
        <p className="muted">A secure command center for your creator intelligence.</p>
        <form onSubmit={submit}>
          {isRegistering && (
            <input
              required
              placeholder="Display name"
              value={form.display_name}
              onChange={(event) => setForm({ ...form, display_name: event.target.value })}
            />
          )}
          <input
            required
            type="email"
            placeholder="Work email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <input
            required
            minLength="8"
            type="password"
            placeholder="Password (8+ characters)"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          {error && <p className="error">{error}</p>}
          <button disabled={loading} type="submit">
            {loading ? 'Connecting...' : isRegistering ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setIsRegistering(!isRegistering)
            setError('')
          }}
        >
          {isRegistering ? 'Already have an account? Sign in' : 'New to CreatorIQ? Create an account'}
        </button>
      </section>
    </main>
  )

  if (!user) {
    return (
      <>
        {authPanel}
        <div className="toast-stack">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.variant || 'info'}`}>
              <strong>{toast.title}</strong>
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard" element={<Layout user={user} logout={logout} />}>
            <Route index element={<OverviewPage />} />
            <Route path="content" element={<ContentPage />} />
            <Route path="audience" element={<AudiencePage />} />
            <Route path="platforms" element={<PlatformsPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <div className="toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.variant || 'info'}`}>
            <strong>{toast.title}</strong>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default App
