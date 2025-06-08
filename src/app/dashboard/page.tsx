'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import { tasksApi } from '@/lib/api'

export default function DashboardPage() {
  const { data: currentTask } = useQuery({
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

      {currentTask?.task && (
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
      )}
    </div>
  )
}
