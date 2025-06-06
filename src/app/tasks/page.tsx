'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TaskCreate } from '@/components/tasks/task-create'
import { TaskList } from '@/components/tasks/task-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, List } from 'lucide-react'

export default function TasksPage() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('action') === 'create' ? 'create' : 'list'
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Create and manage your data processing tasks
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <List className="h-4 w-4" />
            <span>Task List</span>
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Task</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <TaskList />
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <TaskCreate onSuccess={() => setActiveTab('list')} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
