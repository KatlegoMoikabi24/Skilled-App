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
  team: [],
  prize: null,
  endDate: null,
  industry: null,
  description: '',
  project_name: '',
  status: 'Open',
  attachments: undefined,
  project_owner: undefined
}

const newProject = ref({ ...defaultNewProject })

const isFormHasUnsavedChanges = computed(() => {
  return Object.keys(newProject.value).some((key) => {

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
  'Agriculture',
  'Mining and Minerals',
  'Manufacturing',
  'Construction',
  'Wholesale and Retail Trade',
  'Transport and Logistics',
  'Financial Services',
  'Tourism and Hospitality',
  'Information Technology',
  'Telecommunications',
  'Energy and Utilities',
  'Healthcare and Pharmaceuticals',
  'Real Estate and Property Management',
  'Professional Services',
  'Media and Advertising',
  'Education and Training',
  'Government and Public Sector',
  'Environmental Services',
  'Retail Banking',
  'Automotive',
  'Food and Beverage',
  'Textiles and Apparel',
  'Construction Materials',
  'Biotechnology',
  'E-commerce',
]);

</script>

<template>
  <VaForm v-slot="{ validate }" class="flex flex-col gap-2">
    <VaInput v-model="newProject.project_name" label="Project name" :rules="[required]" />
    <VaSelect
        searchable
        label="Industry"
        :rules="[required]"
        :options="industries.map(industry => ({ text: industry, value: industry }))"
        v-model="newProject.industry"
        v-model:search="ownerFilters.search"
    />

    <VaInput v-model="newProject.description" label="Description/Project Scope" :rules="[required]" />

    <VaInput v-model="newProject.prize" label="Price" :rules="[required]" />

    <VaDatePicker
        v-model="newProject.endDate"
        label="Select Date"
        @close="updateText"
        :rules="[required, { validator: value => value !== '', message: 'Date is required' }]"
    />

    <VaSelect
      v-model="newProject.attachments"
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
