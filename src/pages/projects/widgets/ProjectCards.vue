<script setup lang="ts">
import {onMounted, PropType, ref} from 'vue'
import { Project } from '../types'
import ProjectStatusBadge from '../components/ProjectStatusBadge.vue'
import { db } from '../../../firebase';
import { doc, getDoc } from 'firebase/firestore';

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
          <p><b>Project Scope:</b>
            <VaIcon
                icon="mso-file-pdf"
                aria-label="PDF file icon"
            />
          </p>
        </div>

        <VaDivider class="my-6" />
        <div class="flex ju">

          <VaButton v-if="role === 'Student'" icon="" @click="createNewProject">Join Project</VaButton>

          <VaButton v-if="role === 'Client'" preset="secondary" icon="mso-edit" color="secondary" @click="$emit('edit', project)" />
          <VaButton v-if="role === 'Client'" preset="secondary" icon="mso-delete" color="danger" @click="$emit('delete', project)" />

        </div>
      </VaCardContent>
    </VaCard>
  </VaInnerLoading>
  <div v-else class="p-4 flex justify-center items-center text-[var(--va-secondary)]">No projects</div>
</template>
