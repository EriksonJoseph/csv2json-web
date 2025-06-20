import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, LoginRequest, RegisterRequest } from '@/types'
import { authApi } from '@/lib/api'
import { setAuthToken, removeAuthToken } from '@/lib/axios'
import toast from 'react-hot-toast'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isHydrated: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  forceLogout: () => void
  refreshUser: () => Promise<void>
  setUser: (user: User | null) => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,

      login: async (data: LoginRequest) => {
        try {
          set({ isLoading: true })
          const response = await authApi.login(data)
          const { access_token, refresh_token, user } = response.data

          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          document.cookie = `access_token=${access_token}; path=/; max-age=${30 * 24 * 60 * 60}`
          setAuthToken(access_token)

          // Update state with force persistence
          const newState = {
            user,
            isAuthenticated: true,
            isLoading: false,
            isHydrated: true,
          }

          set(newState)

          // Force the persisted storage to update immediately
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'auth-storage',
              JSON.stringify({
                state: {
                  user,
                  isAuthenticated: true,
                },
                version: 0,
              })
            )
          }

          toast.success('Successfully logged in!')
        } catch (error: any) {
          // Don't update authentication state on login failure - keep current state
          set({ isLoading: false })
          throw error // Let the component handle the error display
        }
      },

      register: async (data: RegisterRequest) => {
        try {
          set({ isLoading: true })
          const response = await authApi.register(data)
          const { access_token, refresh_token, user } = response.data

          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          document.cookie = `access_token=${access_token}; path=/; max-age=${30 * 24 * 60 * 60}`
          setAuthToken(access_token)

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            isHydrated: true,
          })

          toast.success('Account created successfully!')
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Registration failed'
          toast.error(message, { duration: 5000 })
          throw error
        }
      },

      logout: async () => {
        try {
          const refresh_token = localStorage.getItem('refresh_token') || ''
          await authApi.logout({ refresh_token })
        } catch (error) {
          console.error('[AUTH] Logout API call failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        } finally {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          document.cookie =
            'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          removeAuthToken()

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })

          toast.success('Successfully logged out!')
        }
      },

      forceLogout: () => {
        // console.log('[AUTH_STORE] Force logout called')

        // Don't force logout if we're already on login page
        if (
          typeof window !== 'undefined' &&
          window.location.pathname === '/login'
        ) {
          // console.log(
          //   '[AUTH_STORE] Already on login page, skipping force logout'
          // )
          return
        }

        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        document.cookie =
          'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        removeAuthToken()

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })

        // Force redirect using window.location
        if (typeof window !== 'undefined') {
          // console.log('[AUTH_STORE] Redirecting to login')
          window.location.href = '/login'
        }
      },

      refreshUser: async () => {
        try {
          const response = await authApi.me()
          set({
            user: response.data,
            isAuthenticated: true,
          })
        } catch (error) {
          console.error('[AUTH] User refresh failed:', {
            status: (error as any)?.response?.status,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          // Only logout if the error is not a 401 (which will be handled by axios interceptor)
          if ((error as any)?.response?.status !== 401) {
            get().logout()
          }
        }
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        })
      },

      hydrate: () => {
        const token = localStorage.getItem('access_token')
        if (token) {
          setAuthToken(token)
          // If we have a token but no user data, we need to fetch user info
          const currentState = get()
          if (!currentState.user && token) {
            set({ isAuthenticated: true }) // Set authenticated immediately if we have a token
            get()
              .refreshUser()
              .catch(() => {
                get().logout()
              })
          }
        }
        set({ isHydrated: true })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // console.log('[AUTH_STORE] Rehydrating storage:', state)
        if (state) {
          // Ensure hydrate is called after rehydration
          setTimeout(() => {
            state.hydrate()
          }, 0)
        }
      },
    }
  )
)
