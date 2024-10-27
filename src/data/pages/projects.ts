import { sleep } from '../../services/utils'
import projectsDb from './projects-db.json'
import usersDb from './users-db.json'
import { db } from '../../firebase';
import {collection, doc, getDocs, setDoc, addDoc } from 'firebase/firestore';

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof (typeof projectsDb)[number] | undefined
  sortingOrder: 'asc' | 'desc' | null
}

const getSortItem = (obj: any, sortBy: keyof (typeof projectsDb)[number]) => {
  if (sortBy === 'project_owner') {
    return obj.project_owner
  }

  if (sortBy === 'industry') {
    return obj.industry.map((user: any) => user.fullname).join(', ')
  }

  if (sortBy === 'creation_date') {
    return new Date(obj[sortBy])
  }

  return obj[sortBy]
}

export const getProjects = async (options: Sorting & Pagination) => {
  await sleep(1000);

  const projectsRef = collection(db, 'projects');
  const querySnapshot = await getDocs(projectsRef);

  const projects = querySnapshot.docs.map((doc) => {
    const project = { id: doc.id, ...doc.data() };
    return {
      ...project,
      project_owner: usersDb.find((user) => user.id === project.project_owner)! as (typeof usersDb)[number],
    };
  });

  if (options.sortBy && options.sortingOrder) {
    projects.sort((a, b) => {
      const sortA = getSortItem(a, options.sortBy);
      const sortB = getSortItem(b, options.sortBy);
      if (sortA < sortB) {
        return options.sortingOrder === 'asc' ? -1 : 1;
      }
      if (sortA > sortB) {
        return options.sortingOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Pagination
  const normalizedProjects = projects.slice((options.page - 1) * options.perPage, options.page * options.perPage);

  return {
    data: normalizedProjects,
    pagination: {
      page: options.page,
      perPage: options.perPage,
      total: projects.length, // Total projects retrieved
    },
  };
};
export const addProject = async (project: Omit<(typeof projectsDb)[number], 'id' | 'creation_date'>) => {
  await sleep(1000);

  const newProject = {
    ...project,
    creation_date: new Date().toLocaleDateString('gb', { day: 'numeric', month: 'short', year: 'numeric' }),
  };

  const projectsCollection = collection(db, 'projects');
  const docRef = await addDoc(projectsCollection, newProject);

  return {
    id: docRef.id,
    ...newProject,
  };
};

export const updateProject = async (project: (typeof projectsDb)[number]) => {
  await sleep(1000);

  const projectRef = doc(db, 'projects', project.id);

  await setDoc(projectRef, project, { merge: true });

  return project;
};

export const removeProject = async (project: (typeof projectsDb)[number]) => {
  await sleep(1000)

  const index = projectsDb.findIndex((p) => p.id === project.id)
  projectsDb.splice(index, 1)

  return project
}
