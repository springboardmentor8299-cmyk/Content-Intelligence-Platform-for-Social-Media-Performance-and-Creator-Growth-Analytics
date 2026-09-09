import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

const notifyClient = (title, message, variant = 'error') => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('creatoriq:toast', { detail: { title, message, variant } }))
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('creatoriq_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const detail = error.response?.data?.detail || error.message || 'Unexpected API response'

    if (status === 401) {
      localStorage.removeItem('creatoriq_token')
      localStorage.removeItem('creatoriq_user')
      notifyClient('Session expired', 'Please sign in again to continue.', 'warning')
      const isPublicRoute = ['/', '/login'].includes(window.location.pathname)
      if (!isPublicRoute) window.location.assign('/')
    } else if (error.code === 'ERR_NETWORK') {
      notifyClient('Network issue', 'Please check your connection and try again.', 'error')
    } else if (status >= 500) {
      notifyClient('Service unavailable', 'The CreatorIQ API is temporarily unavailable.', 'error')
    } else if (detail) {
      notifyClient('Request failed', detail, 'error')
    }

    return Promise.reject(error)
  },
)

export default apiClient