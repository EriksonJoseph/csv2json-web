'use client'

import { usePathname } from 'next/navigation'
import AppLayout from '@/components/layout/app-layout'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Pages that should not use the app layout
  const authPages = ['/login', '/register']
  const isAuthPage = authPages.includes(pathname)

  if (isAuthPage) {
    return <>{children}</>
  }

  return <AppLayout>{children}</AppLayout>
}
