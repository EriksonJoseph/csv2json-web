'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SidebarToggle } from './sidebar'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'
import { useAuthStore } from '@/store'

export function Header() {
  const { user } = useAuthStore()
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 w-full items-center px-4">
        <div className="flex items-center space-x-4">
          <SidebarToggle />
          <div className="hidden lg:flex">
            <span className="text-lg font-semibold">CSV2JSON Web</span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Button onClick={() => router.push('/login')}>Sign In</Button>
          )}
        </div>
      </div>
    </header>
  )
}
