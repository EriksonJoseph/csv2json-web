import axios, { AxiosError, AxiosResponse } from 'axios'
import toast from 'react-hot-toast'
import { AuthResponse, TokenRefreshResponse } from '@/types'

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post<TokenRefreshResponse>(
          `${baseURL}/auth/refresh`,
          { refresh_token: refreshToken }
        )

        const { access_token } = response.data
        localStorage.setItem('access_token', access_token)

        api.defaults.headers.common.Authorization = `Bearer ${access_token}`
        processQueue(null, access_token)

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)

        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')

        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    const errorMessage =
      (error.response?.data as any)?.message ||
      (error as Error).message ||
      'An error occurred'

    if (error.response?.status !== 401) {
      toast.error(errorMessage)
    }

    return Promise.reject(error)
  }
)

export const setAuthToken = (token: string) => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}

export const removeAuthToken = () => {
  delete api.defaults.headers.common.Authorization
}

export default api
