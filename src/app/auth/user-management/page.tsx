'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users, Search, Edit, Unlock, Mail } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { authApi, usersApi } from '@/lib/api'
import { UserListResult, PaginationParams } from '@/types'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'

export default function UserManagementPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(9)
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()

  const queryParams: PaginationParams = {
    page: page,
    limit: limit,
  }

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', page, searchTerm, limit],
    queryFn: () => usersApi.list(queryParams).then((res) => res.data),
    enabled: !!user?.roles?.includes('admin'),
  })

  const unlockUserMutation = useMutation({
    mutationFn: (userId: string) => authApi.unlock(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User unlocked successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unlock user')
    },
  })

  const resendVerificationMutation = useMutation({
    mutationFn: (userId: string) => usersApi.resendVerificationEmail(userId),
    onSuccess: () => {
      toast.success('Verification email sent successfully!')
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to send verification email'
      )
    },
  })

  // Check if user is admin
  if (!user?.roles?.includes('admin')) {
    router.push('/auth/dashboard')
    return null
  }

  const handleEditProfile = (userId: string) => {
    router.push(`/auth/user-management/edit-profile/${userId}`)
  }

  const handleUnlockUser = (userId: string) => {
    unlockUserMutation.mutate(userId)
  }

  const handleResendVerification = (userId: string) => {
    resendVerificationMutation.mutate(userId)
  }

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'default' : 'secondary'
  }

  const getStatusBadgeVariant = (isLocked: boolean) => {
    return isLocked ? 'destructive' : 'default'
  }

  const getVerificationBadgeVariant = (isVerified: boolean) => {
    return isVerified ? 'default' : 'secondary'
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">
              User Management
            </h1>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-6 flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading users...</div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Email Verified</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData?.list?.map((userItem: UserListResult) => (
                      <TableRow key={userItem._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {[
                                userItem.first_name,
                                userItem.middle_name,
                                userItem.last_name,
                              ]
                                .filter(Boolean)
                                .join(' ') || userItem.username}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              @{userItem.username}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{userItem.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getRoleBadgeVariant(
                              userItem.roles[0] || 'user'
                            )}
                          >
                            {userItem.roles[0] || 'user'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(userItem.is_locked)}
                          >
                            {userItem.is_locked ? 'Locked' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getVerificationBadgeVariant(
                              userItem.is_verify_email
                            )}
                          >
                            {userItem.is_verify_email
                              ? 'Verified'
                              : 'Unverified'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleEditProfile(userItem._id)
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Profile</p>
                              </TooltipContent>
                            </Tooltip>
                            {userItem.is_locked && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleUnlockUser(userItem._id)
                                    }
                                    disabled={unlockUserMutation.isPending}
                                  >
                                    <Unlock className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Unlock User</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {!userItem.is_verify_email && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleResendVerification(userItem._id)
                                    }
                                    disabled={
                                      resendVerificationMutation.isPending
                                    }
                                  >
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Resend Verification Email</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Pagination
                  currentPage={page}
                  totalItems={usersData?.total || 0}
                  itemsPerPage={limit}
                  onPageChange={setPage}
                  onItemsPerPageChange={(newPerPage) => {
                    setLimit(newPerPage)
                    setPage(1)
                  }}
                  itemsPerPageOptions={[1, 6, 9, 12, 15, 24]}
                  className="pt-4"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
