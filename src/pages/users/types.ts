import { Project } from '../projects/types'

export type UserRole = 'admin' | 'user' | 'owner'

export type BaseUser = {
  id: number
  fullname: string
  email: string
  username: string
  role: UserRole
  avatar: string
  notes: string
  active: boolean
}

export interface User {
  id: string;
  createdAt: Date;
  email: string;
  isActive: boolean;
  name: string;
  role: UserRole;
  projects: Project[];
}

export type User = BaseUser & { projects: Project[] }
