<template>


  <VaForm ref="form" @submit.prevent="submit">
    <h1 class="font-semibold text-4xl mb-4">Sign up</h1>
    <p class="text-base mb-4 leading-5">
      Have an account?
      <RouterLink :to="{ name: 'login' }" class="font-semibold text-primary">Login</RouterLink>
    </p>

    <VaInput
        v-model="formData.name"
        :rules="[(v) => !!v || 'Name field is required']"
        class="mb-4"
        label="Name"
    />

    <VaInput
        v-model="formData.email"
        :rules="[(v) => !!v || 'Email field is required', (v) => /.+@.+\..+/.test(v) || 'Email should be valid']"
        class="mb-4"
        label="Email"
        type="email"
    />

    <VaValue v-slot="isPasswordVisible" :default-value="false">
      <VaInput
          v-model="formData.password"
          :rules="passwordRules"
          :type="isPasswordVisible.value ? 'text' : 'password'"
          class="mb-4"
          label="Password"
          messages="Password should be 8+ characters: letters, numbers, and special characters."
          @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
      >
        <template #appendInner>
          <VaIcon
              :name="isPasswordVisible.value ? 'mso-visibility_off' : 'mso-visibility'"
              class="cursor-pointer"
              color="secondary"
          />
        </template>
      </VaInput>
      <VaInput
          v-model="formData.repeatPassword"
          :rules="[
          (v) => !!v || 'Repeat Password field is required',
          (v) => v === formData.password || 'Passwords don\'t match',
        ]"
          :type="isPasswordVisible.value ? 'text' : 'password'"
          class="mb-4"
          label="Repeat Password"
          @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
      >
        <template #appendInner>
          <VaIcon
              :name="isPasswordVisible.value ? 'mso-visibility_off' : 'mso-visibility'"
              class="cursor-pointer"
              color="secondary"
          />
        </template>
      </VaInput>
    </VaValue>

    <div class="flex justify-center mt-4">
      <VaButton class="w-full" @click="submit">Continue</VaButton>
    </div>

    <VaModal v-model="showRoleModal" title="Select Your Role" @close="showRoleModal = false">
      <div>
        <p>Please select your role:</p>
        <div>
          <label>
            <input type="radio" value="Client" v-model="selectedRole" />
            Client
          </label>
          <label>
            <input type="radio" value="Student" v-model="selectedRole" />
            Student
          </label>
          <label>
            <input type="radio" value="Mentor" v-model="selectedRole" />
            Mentor
          </label>
          <label>
            <input type="radio" value="Recruiter/Business" v-model="selectedRole" />
            Recruiter/Business
          </label>
        </div>
        <div class="flex justify-end mt-4">
          <VaButton @click="confirmRole">Confirm</VaButton>
        </div>
      </div>
    </VaModal>
  </VaForm>


<!--  const roleSelectOptions: { text: Capitalize<UserRole>; value: UserRole }[] = [-->
<!--      { text: 'Admin', value: 'admin' },-->
<!--      { text: 'User', value: 'user' },-->
<!--      { text: 'Owner', value: 'owner' },-->
<!--  ]-->

</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'
import { auth } from '../../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const { validate } = useForm('form')
const { push } = useRouter()
const { init } = useToast()

const formData = reactive({
  name: '',
  email: '',
  password: '',
  repeatPassword: '',
})

const showRoleModal = ref(false)
const selectedRole = ref('')

const submit = async () => {
  if (validate()) {
    showRoleModal.value = true
  }
}

const confirmRole = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
    const user = userCredential.user
    const db = getFirestore()

    const userDocRef = doc(db, 'Users', user.uid)
    await setDoc(userDocRef, {
      name: formData.name,
      email: formData.email,
      createdAt: new Date(),
      role: selectedRole.value
    })

    localStorage.setItem('guid', user.uid)

    init({ message: "You've successfully signed up", color: 'success' })

    showRoleModal.value = false
    await push({ name: 'dashboard' })
  } catch (error) {
    init({ message: error.message, color: 'danger' })
  }
}



const passwordRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || 'Password field is required',
  (v) => (v && v.length >= 8) || 'Password must be at least 8 characters long',
  (v) => (v && /[A-Za-z]/.test(v)) || 'Password must contain at least one letter',
  (v) => (v && /\d/.test(v)) || 'Password must contain at least one number',
  (v) => (v && /[!@#$%^&*(),.?":{}|<>]/.test(v)) || 'Password must contain at least one special character',
]
</script>
