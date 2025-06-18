'use client'

import { usePathname } from 'next/navigation'
import AppLayout from '@/components/layout/app-layout'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Pages that should not use the app layout
  const publicPages = [
    '/login',
    '/register',
    '/verify-email',
    '/reset-password',
    '/forgot-password',
  ]
  const isPublicPage = publicPages.some((page) => pathname.startsWith(page))

  if (isPublicPage) {
    return <>{children}</>
  }

  return <AppLayout>{children}</AppLayout>
}
