<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { EmptyProject, Project } from '../types'
import { SelectOption } from 'vuestic-ui'
import { useUsers } from '../../users/composables/useUsers'
import ProjectStatusBadge from '../components/ProjectStatusBadge.vue'
import UserAvatar from '../../users/widgets/UserAvatar.vue'

const props = defineProps<{
  project: Project | null
  saveButtonLabel: string
}>()

defineEmits<{
  (event: 'save', project: Project): void
  (event: 'close'): void
}>()

const defaultNewProject: EmptyProject = {
  project_name: '',
  project_owner: undefined,
  team: [],
  status: undefined,
}

const newProject = ref({ ...defaultNewProject })

const isFormHasUnsavedChanges = computed(() => {
  return Object.keys(newProject.value).some((key) => {
    if (key === 'team') {
      return false
    }

    return (
      newProject.value[key as keyof EmptyProject] !== (props.project ?? defaultNewProject)?.[key as keyof EmptyProject]
    )
  })
})

defineExpose({
  isFormHasUnsavedChanges,
})

watch(
  () => props.project,
  () => {
    if (!props.project) {
      return
    }

    newProject.value = {
      ...props.project,
      project_owner: props.project.project_owner,
    }
  },
  { immediate: true },
)

const required = (v: string | SelectOption) => !!v || 'This field is required'

const { users: teamUsers, filters: teamFilters } = useUsers({ pagination: ref({ page: 1, perPage: 100, total: 10 }) })
const { users: ownerUsers, filters: ownerFilters } = useUsers({ pagination: ref({ page: 1, perPage: 100, total: 10 }) })
const industries = ref([
  { id: 1, fullname: 'Agriculture' },
  { id: 2, fullname: 'Mining and Minerals' },
  { id: 3, fullname: 'Manufacturing' },
  { id: 4, fullname: 'Construction' },
  { id: 5, fullname: 'Wholesale and Retail Trade' },
  { id: 6, fullname: 'Transport and Logistics' },
  { id: 7, fullname: 'Financial Services' },
  { id: 8, fullname: 'Tourism and Hospitality' },
  { id: 9, fullname: 'Information Technology' },
  { id: 10, fullname: 'Telecommunications' },
  { id: 11, fullname: 'Energy and Utilities' },
  { id: 12, fullname: 'Healthcare and Pharmaceuticals' },
  { id: 13, fullname: 'Real Estate and Property Management' },
  { id: 14, fullname: 'Professional Services' },
  { id: 15, fullname: 'Media and Advertising' },
  { id: 16, fullname: 'Education and Training' },
  { id: 17, fullname: 'Government and Public Sector' },
  { id: 18, fullname: 'Environmental Services' },
  { id: 19, fullname: 'Retail Banking' },
  { id: 20, fullname: 'Automotive' },
  { id: 21, fullname: 'Food and Beverage' },
  { id: 22, fullname: 'Textiles and Apparel' },
  { id: 23, fullname: 'Construction Materials' },
  { id: 24, fullname: 'Biotechnology' },
  { id: 25, fullname: 'E-commerce' },
]);

</script>

<template>
  <VaForm v-slot="{ validate }" class="flex flex-col gap-2">
    <VaInput v-model="newProject.project_name" label="Project name" :rules="[required]" />
    <VaSelect
      v-model="newProject.project_owner"
      v-model:search="ownerFilters.search"
      searchable
      label="Industry"
      text-by="fullname"
      track-by="id"
      :rules="[required]"
      :options="industries"
    >
      <template #content="{ value: user }">
        <div v-if="user" :key="user.id" class="flex items-center gap-1 mr-4">
          <UserAvatar :user="user" size="18px" />
          {{ user.fullname }}
        </div>
      </template>
    </VaSelect>
    <VaInput v-model="newProject.project_name" label="Description/Project Scope" :rules="[required]" />
    <VaSelect
      v-model="newProject.status"
      label="Attachments"
      :rules="[required]"
      track-by="value"
      value-by="value"
      :options="[
        { text: 'In progress', value: 'in progress' },
        { text: 'Archived', value: 'archived' },
        { text: 'Completed', value: 'completed' },
        { text: 'Important', value: 'important' },
      ]"
    >
      <template #content="{ value }">
        <ProjectStatusBadge v-if="value" :status="value.value" />
      </template>
    </VaSelect>
    <div class="flex justify-end flex-col-reverse sm:flex-row mt-4 gap-2">
      <VaButton preset="secondary" color="secondary" @click="$emit('close')">Cancel</VaButton>
      <VaButton @click="validate() && $emit('save', newProject as Project)">{{ saveButtonLabel }}</VaButton>
    </div>
  </VaForm>
</template>

<style lang="scss" scoped>
.va-select-content__autocomplete {
  flex: 1;
}

.va-input-wrapper__text {
  gap: 0.2rem;
}
</style>
