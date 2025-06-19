'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Footer } from '@/components/layout/footer'
import { useAuthStore, useUIStore } from '@/store'
import { cn } from '@/lib/utils'
import { LoadingOverlay } from '@/components/ui/loading'
import { Analytics } from '@vercel/analytics/next'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated, isHydrated } = useAuthStore()
  const { sidebarCollapsed } = useUIStore()

  useEffect(() => {
    if (!isHydrated) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }
  }, [isAuthenticated, isHydrated, router])

  // Show loading while hydrating or when authenticated but no user data yet
  if (!isHydrated || (isAuthenticated && !user)) {
    return <LoadingOverlay message="Authenticating..." />
  }

  // If not authenticated after hydration, let the useEffect handle redirect
  if (!isAuthenticated) {
    return <LoadingOverlay message="Redirecting..." />
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Sidebar />
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-200 ease-in-out',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
      >
        <Header />
        <main className="flex-1 p-6">{children}</main>
        <Footer />
      </div>
      <Analytics debug={false} />
    </div>
  )
}
