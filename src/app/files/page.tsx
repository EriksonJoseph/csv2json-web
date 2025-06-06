'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { FileUpload } from '@/components/files/file-upload'
import { FileList } from '@/components/files/file-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, List } from 'lucide-react'

export default function FilesPage() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('action') === 'upload' ? 'upload' : 'list'
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Files</h1>
          <p className="text-muted-foreground">
            Upload and manage your data files
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
            <span>File List</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Upload Files</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <FileList />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <FileUpload />
        </TabsContent>
      </Tabs>
    </div>
  )
}
