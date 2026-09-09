import { create } from 'zustand'

const TOKEN_KEY = 'creatoriq_token'
const USER_KEY = 'creatoriq_user'

const readStoredValue = (key) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const useAuthStore = create((set) => ({
  user: readStoredValue(USER_KEY),
  token: localStorage.getItem(TOKEN_KEY) || null,
  setSession: (nextToken, nextUser) => {
    if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken)
    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    set({ token: nextToken || null, user: nextUser || null })
  },
  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ token: null, user: null })
  },
}))

export default useAuthStore
