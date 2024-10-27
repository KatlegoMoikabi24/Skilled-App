import { sleep } from '../../services/utils'
import { User } from './../../pages/users/types'
import usersDb from './users-db.json'
import projectsDb from './projects-db.json'
import { Project } from '../../pages/projects/types'
import { db } from '../../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

export const users = usersDb as User[]

const getUserProjects = (userId: number | string) => {
  return projectsDb
    .filter((project) => project.team.includes(Number(userId)))
    .map((project) => ({
      ...project,
      project_owner: users.find((user) => user.id === project.project_owner)!,
      team: project.team.map((userId) => users.find((user) => user.id === userId)!),
      status: project.status as Project['status'],
    }))
}

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof User | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: boolean
  search: string
}

const getSortItem = (obj: any, sortBy: string) => {
  if (sortBy === 'projects') {
    return obj.projects.map((project: any) => project.project_name).join(', ')
  }

  return obj[sortBy]
}

export const getUsers = async (filters: Partial<Filters & Pagination & Sorting>) => {
  await sleep(1000);

  const userCollection = collection(db, 'Users');

  const querySnapshot = await getDocs(userCollection);

  const filteredUsers = querySnapshot.docs.map(doc => ({
    id: doc.id,
    createdAt: doc.data().createdAt.toDate(),
    email: doc.data().email,
    isActive: doc.data().isActive,
    name: doc.data().name,
    role: doc.data().role,
    projects: [],
  }));

  return {
    data: filteredUsers,
    pagination: {
      page: 1,
      perPage: filteredUsers.length,
      total: filteredUsers.length,
    },
  };
};export const addUser = async (user: User) => {
  await sleep(1000)
  users.unshift(user)
}

export const updateUser = async (user: User) => {
  await sleep(1000)
  const index = users.findIndex((u) => u.id === user.id)
  users[index] = user
}

export const removeUser = async (user: User) => {
  await sleep(1000)
  users.splice(
    users.findIndex((u) => u.id === user.id),
    1,
  )
}
