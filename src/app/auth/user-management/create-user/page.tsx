'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { UserCreateRequest } from '@/types'
import { CreateUserForm } from '@/components/forms/create-user-form'

export default function CreateUserPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const createUserMutation = useMutation({
    mutationFn: (data: UserCreateRequest) => usersApi.createProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success(
        'User created successfully! A verification email has been sent to set up their password.'
      )
      router.push('/auth/user-management')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user')
    },
  })

  // Check if user is admin
  if (!user?.roles?.includes('admin')) {
    router.push('/auth/dashboard')
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/auth/user-management')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to User Management
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
          <p className="text-muted-foreground">
            Create a new user account for the system
          </p>
        </div>
      </div>

      <CreateUserForm
        mutation={createUserMutation}
        title="New User Information"
        description="Enter the details for the new user account. A verification email will be sent for password setup."
        submitText="Create User"
        onCancel={() => router.push('/auth/user-management')}
      />
    </div>
  )
}
