'use client'

import { getAppVersion } from '@/lib/version'

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-2">
        <div className="flex flex-col items-center space-y-1">
          <div className="text-sm text-muted-foreground">
            Powered by Next.js • Developed by TORPONG • Version{' '}
            {getAppVersion()}
          </div>
        </div>
      </div>
    </footer>
  )
}
