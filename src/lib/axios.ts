import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL

const addInterceptors = (instance: ReturnType<typeof axios.create>) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  instance.interceptors.response.use(
    (res) => {
      if (res.data && 'success' in res.data) res.data = res.data.data
      return res
    },
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return instance
}

const api = addInterceptors(axios.create({ baseURL, timeout: 15000 }))

export const uploadApi = addInterceptors(axios.create({ baseURL, timeout: 300000 }))

export default api
