'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, usersApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { UserUpdateRequest } from '@/types'
import { ProfileForm } from '@/components/forms/profile-form'

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const userId = user?.user_id
  const queryClient = useQueryClient()

  if (!userId) router.push('/')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => {
      return authApi.me().then((res) => res.data)
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: UserUpdateRequest) =>
      usersApi.updateProfile(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      toast.success('Profile updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        </div>
      </div>

      <ProfileForm
        mutation={updateProfileMutation}
        initialData={profile}
        title="Profile Information"
        description="Update your profile information"
        submitText="Update Profile"
        onCancel={() => router.back()}
        disabled={isLoading}
      />
    </div>
  )
}
