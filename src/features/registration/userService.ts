import { apiClient } from '@/shared/api/apiClient'
import type { UpdateUserRequest, UpdateUserResponse } from '@/features/auth/apiTypes'

export const userService = {
  async updateProfile(payload: UpdateUserRequest): Promise<UpdateUserResponse> {
    const { data } = await apiClient.put<UpdateUserResponse>(
      '/api/users/me',
      payload,
    )

    if (data.success === false) {
      throw new Error(data.message ?? 'Unable to update profile')
    }

    if (!data.updated && data.success !== true) {
      throw new Error(data.message ?? 'Unable to update profile')
    }

    return data
  },
}
