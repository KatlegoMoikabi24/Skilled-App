<script setup lang="ts">
import {onMounted, PropType, ref} from 'vue'
import { Project } from '../types'
import ProjectStatusBadge from '../components/ProjectStatusBadge.vue'
import { db } from '../../../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

defineProps({
  projects: {
    type: Array as PropType<Project[]>,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
})

defineEmits<{
  (event: 'edit', project: Project): void
  (event: 'delete', project: Project): void
}>()

const role = ref<string | null>(null);

const fetchUserRole = async () => {
  const guid = localStorage.getItem('guid');
  if (guid) {
    const userRef = doc(db, 'users', guid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      role.value = userData.role;

      console.log(role.value);
    } else {
      console.error('No such user found!');
    }
  } else {
    console.error('No GUID found in localStorage!');
  }
}

onMounted(() => {
  fetchUserRole();
});
const avatarColor = (userName: string) => {
  const colors = ['primary', '#FFD43A', '#ADFF00', '#262824', 'danger']
  const index = userName.charCodeAt(0) % colors.length
  return colors[index]
}

const joinProject = async (project: Project) => {
  const guid = localStorage.getItem('guid');
  if (guid) {
    const projectRef = doc(db, 'projects', project.id);
    await updateDoc(projectRef, {
      team: arrayUnion(guid)
    });
   alert(`Successfully Joined ${project.project_name} Project, Good Luck`);
   location.reload();
  } else {
    console.error('No GUID found in localStorage!');
  }
}

const leaveProject = async (project: Project) => {

  const hasUnsavedChanges = true;
  if (hasUnsavedChanges) {
    const agreed = confirm({
      maxWidth: '380px',
      message: 'Form has unsaved changes. Are you sure you want to close it?',
      size: 'small',
    });

    if (!agreed) {
      return;
    }
  }

  if (localStorage.getItem('guid')) {
    const projectRef = doc(db, 'projects', project.id);
    await updateDoc(projectRef, {
      team: arrayRemove(localStorage.getItem('guid'))
    });
   alert(`You Successfully left ${project.project_name} project`);
   location.reload();
  } else {
    console.error('No GUID found in localStorage!');
  }
}


const isUserInProjectTeam = (project: Project) => {
  const userGuid = localStorage.getItem('guid');
  return Array.isArray(project.team) && userGuid ? project.team.includes(userGuid) : false;
}

</script>

<template>
  <VaInnerLoading
    v-if="projects.length > 0 || loading"
    :loading="loading"
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[4rem]"
  >
    <VaCard
      v-for="project in projects"
      :key="project.project_name"
      :style="{ '--va-card-outlined-border': '1px solid var(--va-background-element)' }"
      outlined
    >
      <VaCardContent class="flex flex-col h-full">
        <div class="text-[var(--va-secondary)]">Closing: {{ project.endDate }}</div>
        <div class="flex flex-col items-center gap-4 grow">

          <h4 style="color: #063970" class="va-h4 text-center self-stretch overflow-hidden line-clamp-2 text-ellipsis">
            {{ project.project_name }}
          </h4>

          <h2 class="va-h6" style="color: #34495e"> Industry: {{ project.industry.value }} </h2>

        <!-- <ProjectStatusBadge :status="project.status" />-->

        </div><hr>

        <div>
          <p><b>Prize:</b> R {{ project.prize }} </p>
          <p><b>Project Owner:</b> {{ project.project_owner }}</p>
          <p><b>Description:</b> {{ project.description }} </p>
          <p><b>Participants/Teams:</b> {{ project.team.length }} </p>
          <br>

          <a href="#" style="color: blue; float: right"><u> Download Project Scope</u></a>

        </div>

        <VaDivider class="my-6" />
        <div class="flex ju">
          <Button
              class="default"
              v-if="role === 'Student' && isUserInProjectTeam(project)"
              style="background-color: red; width: 115px; font-weight: bold; height: 35px; color: white; border-radius: 5px;"
              @click="leaveProject(project)"
          >
            Leave Project
          </Button>

          <VaButton
              v-else-if="role === 'Student'"
              @click="joinProject(project)"
          >
            Join Project
          </VaButton>

          <VaButton
              v-if="role === 'Client'"
              preset="secondary"
              icon="mso-edit"
              color="secondary"
              @click="$emit('edit', project)"
          />

          <VaButton
              v-if="role === 'Client'"
              preset="secondary"
              icon="mso-delete"
              color="danger"
              @click="$emit('delete', project)"
          />
        </div>

      </VaCardContent>
    </VaCard>
  </VaInnerLoading>
  <div v-else class="p-4 flex justify-center items-center text-[var(--va-secondary)]">No projects</div>
</template>
