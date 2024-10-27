<script setup lang="ts">
import { PropType, computed, ref, watch } from 'vue'
import { useForm } from 'vuestic-ui'
import { User, UserRole } from '../types'
import UserAvatar from './UserAvatar.vue'
import { useProjects } from '../../projects/composables/useProjects'
import { validators } from '../../../services/utils'

const props = defineProps({
  user: {
    type: Object as PropType<User | null>,
    default: null,
  },
  saveButtonLabel: {
    type: String,
    default: 'Save',
  },
})

const defaultNewUser: User = {
  id: -1,
  avatar: '',
  fullname: '',
  role: 'user',
  username: '',
  notes: '',
  email: '',
  active: true,
  industry: [],
}

const newUser = ref<User>({ ...defaultNewUser })

const isFormHasUnsavedChanges = computed(() => {
  return Object.keys(newUser.value).some((key) => {
    if (key === 'projects') {
      return false
    }

    return newUser.value[key as keyof User] !== (props.user ?? defaultNewUser)?.[key as keyof User]
  })
})

defineExpose({
  isFormHasUnsavedChanges,
})

watch(
  () => props.user,
  () => {
    if (!props.user) {
      return
    }

    newUser.value = {
      ...props.user,
      avatar: props.user.avatar || '',
    }
  },
  { immediate: true },
)

const avatar = ref<File>()

const makeAvatarBlobUrl = (avatar: File) => {
  return URL.createObjectURL(avatar)
}

watch(avatar, (newAvatar) => {
  newUser.value.avatar = newAvatar ? makeAvatarBlobUrl(newAvatar) : ''
})

const form = useForm('add-user-form')

const emit = defineEmits(['close', 'save'])

const onSave = () => {
  if (form.validate()) {
    emit('save', newUser.value)
  }
}

const roleSelectOptions: { text: Capitalize<UserRole>; value: UserRole }[] = [
  { text: 'Admin', value: 'admin' },
  { text: 'User', value: 'user' },
  { text: 'Owner', value: 'owner' },
]

const { projects } = useProjects({ pagination: ref({ page: 1, perPage: 9999, total: 10 }) })

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
  <VaForm v-slot="{ isValid }" ref="add-user-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
    <VaFileUpload
      v-model="avatar"
      type="single"
      hide-file-list
      class="self-stretch justify-start items-center gap-4 inline-flex"
    >
      <UserAvatar :user="newUser" size="large" />
      <VaButton preset="primary" size="small">Add image</VaButton>
      <VaButton
        v-if="avatar"
        preset="primary"
        color="danger"
        size="small"
        icon="delete"
        class="z-10"
        @click.stop="avatar = undefined"
      />
    </VaFileUpload>
    <div class="self-stretch flex-col justify-start items-start gap-4 flex">
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newUser.fullname"
          label="Full name"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="fullname"
        />
        <VaInput
          v-model="newUser.username"
          label="Username"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="username"
        />
      </div>
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newUser.email"
          label="Email"
          class="w-full sm:w-1/2"
          :rules="[validators.required, validators.email]"
          name="email"
        />
        <VaSelect
          v-model="newUser.projects"
          label="Projects"
          class="w-full sm:w-1/2"
          :options="projects"
          :rules="[validators.required]"
          name="projects"
          text-by="project_name"
          track-by="id"
          multiple
          :max-visible-options="2"
        />
      </div>
      <VaSelect
          v-model="newUser.industry"
          label="Industry"
          class="w-full sm:w-1/2"
          :options="industries"
          :rules="[validators.required]"
          name="projects"
          text-by="fullname"
          track-by="id"
          multiple
          :max-visible-options="2"
        />
      <div class="flex gap-4 w-full">
        <div class="w-1/2">
          <VaSelect
            v-model="newUser.role"
            label="Role"
            class="w-full"
            :options="roleSelectOptions"
            :rules="[validators.required]"
            name="role"
            value-by="value"
          />
        </div>

        <div class="flex items-center w-1/2 mt-4">
          <VaCheckbox v-model="newUser.active" label="Active" class="w-full" name="active" />
        </div>
      </div>

      <VaTextarea v-model="newUser.notes" label="Skills/Description" class="w-full" name="notes" />
      <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
        <VaButton preset="secondary" color="secondary" @click="$emit('close')">Cancel</VaButton>
        <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
      </div>
    </div>
  </VaForm>
</template>
