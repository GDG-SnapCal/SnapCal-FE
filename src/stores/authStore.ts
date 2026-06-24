import { create } from 'zustand'
import type { User } from '../types'
import { loginWithEmail, loginWithSocial, signup } from '../api/auth'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithSocial: (provider: 'kakao' | 'google', accessToken: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: async (email, password) => {
    const { data } = await loginWithEmail(email, password)
    localStorage.setItem('accessToken', data.accessToken)
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true })
  },

  loginWithSocial: async (provider, accessToken) => {
    const { data } = await loginWithSocial(provider, accessToken)
    localStorage.setItem('accessToken', data.accessToken)
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true })
  },

  signup: async (name, email, password) => {
    const { data } = await signup(name, email, password)
    localStorage.setItem('accessToken', data.accessToken)
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    set({ user: null, accessToken: null, isAuthenticated: false })
  },
}))
