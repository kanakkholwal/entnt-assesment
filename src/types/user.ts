export type UserRole = 'admin' | 'recruiter' | 'hiring_manager'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  department?: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserRequest {
  firstName: string
  lastName: string
  email: string
  role: UserRole
  department?: string
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  email?: string
  role?: UserRole
  department?: string
  status?: 'active' | 'inactive'
}

export interface UserFilters {
  search?: string
  role?: UserRole | 'all'
  department?: string
  status?: 'active' | 'inactive' | 'all'
  sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface GetUsersParams {
  page?: number
  limit?: number
  filters?: UserFilters
}