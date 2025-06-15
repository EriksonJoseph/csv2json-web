import { Task } from '@/types/tasks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, FileText, Database, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface TaskInfoProps {
  task: Task
}

export default function TaskInfo({ task }: TaskInfoProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Task Information
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <FileText className="mr-2 h-4 w-4" />
              Topic
            </div>
            <p className="font-medium">{task.topic}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Database className="mr-2 h-4 w-4" />
              Data Summary
            </div>
            <div className="flex gap-4 text-sm">
              {task.total_rows && (
                <span>
                  <strong>{task.total_rows.toLocaleString()}</strong> rows
                </span>
              )}
              <span>
                <strong>{task?.column_names?.length || 0}</strong> columns
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarDays className="mr-2 h-4 w-4" />
              File Date Range
            </div>
            <div className="text-sm">
              <p>
                <strong>File Create Date:</strong> {task.created_file_date}
              </p>
              <p>
                <strong>File Update Date:</strong> {task.updated_file_date}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              Processing Details
            </div>
            <div className="text-sm">
              <p>
                <strong>Processing Time:</strong>{' '}
                {(task.processing_time || 0).toFixed(2)}s
              </p>
              <p>
                <strong>Created:</strong>{' '}
                {formatDistanceToNow(new Date(task.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <FileText className="mr-2 h-4 w-4" />
          References
        </div>
        <p className="text-sm">{task.references || '-'}</p>

        {task.error_message && (
          <div className="space-y-2 border-t pt-2">
            <div className="text-sm font-medium text-red-600">
              Error Message
            </div>
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {task.error_message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
