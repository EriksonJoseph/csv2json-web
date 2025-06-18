'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store'
import { Home, ListTodo, Search, Menu, X } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/auth/dashboard', icon: Home },
  { name: 'Tasks', href: '/auth/tasks', icon: ListTodo },
  { name: 'Matching', href: '/auth/search', icon: Search },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <>
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out dark:border-gray-700 dark:bg-gray-900',
          sidebarCollapsed
            ? '-translate-x-full lg:w-16 lg:translate-x-0'
            : 'translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          <div
            className={`flex h-12 items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-200 p-2 dark:border-gray-700`}
          >
            {!sidebarCollapsed && (
              <h1 className="pb-1 text-xl font-bold text-gray-900 dark:text-white">
                CSV2JSON
              </h1>
            )}
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      sidebarCollapsed && 'justify-center px-2'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {!sidebarCollapsed && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  )
}

export function SidebarToggle() {
  const { toggleSidebar } = useUIStore()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="lg:hidden"
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
}
