import api from '../lib/axios'
import type { User } from '../types'

interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export const loginWithEmail = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password })

export const loginWithSocial = (provider: 'kakao' | 'google', accessToken: string) =>
  api.post<AuthResponse & { isNewUser: boolean }>('/auth/social', { provider, accessToken })

export const signup = (name: string, email: string, password: string) =>
  api.post<AuthResponse>('/auth/signup', { name, email, password })

export const refreshToken = (refreshToken: string) =>
  api.post<{ accessToken: string }>('/auth/refresh', { refreshToken })
