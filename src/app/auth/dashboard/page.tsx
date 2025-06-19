'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, BookOpen, Wrench, Hammer, Zap } from 'lucide-react'
import { tasksApi } from '@/lib/api'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: currentTask, isLoading } = useQuery({
    queryKey: ['current-processing'],
    queryFn: () => tasksApi.getCurrentProcessing().then((res) => res.data),
    refetchInterval: 5000,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your data.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Tutorial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Learn how to use CSV2JSON with our step-by-step tutorial guide
            </p>
            <Link href="/tutorial">
              <Button className="w-full">
                Start Tutorial
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950 dark:to-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Wrench className="h-5 w-5" />
              Under Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="flex justify-center items-center gap-2">
                <Hammer className="h-8 w-8 text-amber-600 dark:text-amber-400 animate-bounce" />
                <Zap className="h-6 w-6 text-yellow-500 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                  Dashboard Features
                </h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  We're developing new dashboard features for you
                </p>
                <p className="text-amber-600 dark:text-amber-400 text-xs mt-2">
                  • Analytics & Statistics<br />
                  • Recent Activity<br />
                  • Quick Actions<br />
                  • Performance Metrics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
              <div className="h-6 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
            </div>
          </CardHeader>
        </Card>
      ) : currentTask?.task ? (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-blue-900 dark:text-blue-100">
                Currently Processing
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
      ) : null}
    </div>
  )
}
