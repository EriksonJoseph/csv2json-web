'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
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

  if (!isHydrated || !isAuthenticated || !user) {
    return <LoadingOverlay message="Authenticating..." />
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-200 ease-in-out',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
      >
        <Header />
        <main className="p-6">{children}</main>
      </div>
      <Analytics debug={false} />
    </div>
  )
}
