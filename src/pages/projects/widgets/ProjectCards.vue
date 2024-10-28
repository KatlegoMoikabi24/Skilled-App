<script setup lang="ts">
import {onMounted, PropType, ref} from 'vue'
import { Project } from '../types'
import { db } from '../../../firebase';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  getDocs,
  where,
  query
} from 'firebase/firestore';

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

const replyAnswer = async () => {
  const guid = localStorage.getItem('guid');
  if (guid) {
    const projectRef = doc(db, 'requests', requests.id);
    await updateDoc(projectRef, {
      comments: arrayUnion(guid)
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

const showMentorModal = ref(false);
const showDiscussionModal = ref(false);
const selectedProject = ref<Project | null>(null);
const description = ref('');
const projectName = ref('');
const projectId = ref('');
const projectIndustry = ref('');
const projectEndDate = ref('');

const openModal = (project: Project) => {

  selectedProject.value = project;

  projectEndDate.value = project.endDate;
  projectName.value = project.project_name;
  projectIndustry.value = project.industry.value;
  projectId.value = project.id;

  showMentorModal.value = true;
};

const requestId = ref('');
const requestName = ref('');

const fetchRequestsByProjectId = async (projectId) => {
  const requestsCollection = collection(db, 'requests');
  const q = query(requestsCollection, where("projectId", "==", projectId));

  try {
    const querySnapshot = await getDocs(q);
    const requests = [];
    querySnapshot.forEach((doc) => {
       requests.push({ id: doc.id, ...doc.data() });
       requestName.value = doc.data().description;
    });

    requestName.value = (requests[0].description);

    return requests;
  } catch (error) {
    console.error("Error fetching requests: ", error);
    return [];
  }
};

const openDiscussionModal =  (project: Project) => {
  projectId.value = project.id;
   fetchRequestsByProjectId(projectId.value)
  showDiscussionModal.value = true;
};

const submitMentorship = async () => {
  if (description.value) {
    const newRequest = {
      projectId: projectId.value,
      projectIndustry: projectIndustry.value,
      description: description.value,
      from: localStorage.getItem('guid'),
      comments: []
    };

    try {
      const requestsCollection = collection(db, 'requests');
      await addDoc(requestsCollection, newRequest);

      alert(`Requested mentorship for ${projectName.value} with description: ${description.value}`);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("There was an error submitting your request. Please try again.");
    }

  } else {
    alert("Please enter a description before submitting.");
  }
  showMentorModal.value = false;
};


const submitMentorship = async () => {
  if (description.value) {
    const newRequest = {
      projectId: projectId.value,
      projectIndustry: projectIndustry.value,
      description: description.value,
      from: localStorage.getItem('guid'),
      comments: []
    };

    try {
      const requestsCollection = collection(db, 'requests');
      await addDoc(requestsCollection, newRequest);

      alert(`Requested mentorship for ${projectName.value} with description: ${description.value}`);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("There was an error submitting your request. Please try again.");
    }

  } else {
    alert("Please enter a description before submitting.");
  }
  showMentorModal.value = false;
};

const isUserInProjectTeam = (project: Project) => {
  const userGuid = localStorage.getItem('guid');
  return Array.isArray(project.team) && userGuid ? project.team.includes(userGuid) : false;
}

</script>

<template>
  <VaModal v-model="showMentorModal" title="Mentorship Form" @open="openModal" @close="showMentorModal = false" @ok="submitMentorship()">
    <div>
      <span style="font-size: 18px">What Do You Need Help With?</span>
      <br>
      <div class="mt-3">
        <label>
          <VaTextarea style="width: 100%;" type="text" placeholder="Describe Your Problem" v-model="description" />
        </label>
      </div>
    </div>
  </VaModal>

  <VaModal
      v-model="showDiscussionModal"
      title="Mentor Reply Form"
      @open="openDiscussionModal"
      @close="showDiscussionModal = false"
      @ok="replyQuestion()">

    <div>
      <span style="font-size: 22px"> <b>Question/Request:</b> </span>
      <p class="pt-2" style="font-size: 20px">
        {{ requestName }}
      </p>
      <br>
      <br>

      <!-- Comments Section -->
      <div class="comments-section mt-3">
        <h4>Comments:</h4>
<!--        <div v-for="comment in fetchedRequests[0]?.comments" :key="comment.id" class="comment">-->
<!--          <p><strong>{{ comment.from }}:</strong> {{ comment.description }}</p>-->
<!--        </div>-->
      </div>

      <!-- Reply Text Area -->
      <div class="mt-3">
        <label>
          <VaTextarea
              style="width: 100%;"
              type="text"
              placeholder="Answer/Reply"
              v-model="description"
          />
        </label>
      </div>

      <div class="mt-2">
        <VaButton @click="submitComment">Reply</VaButton>
      </div>
    </div>
  </VaModal>


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

        <!-- <ProjectStatusBadge :status="project.status" /> -->

        </div><hr>

        <div>
          <p><b>Prize:</b> R {{ project.prize }} </p>
          <p><b>Project Owner:</b> {{ project.project_owner }}</p>
          <p><b>Description:</b> {{ project.description }} </p>
          <p><b>Participants/Teams:</b> {{ project.team.length }} </p>
          <p v-if="role === 'Mentor'"><b>Q&A's:</b> {{ project.team.length }} </p>
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

          <Button
              class="ml-2"
              v-if="role === 'Student' && isUserInProjectTeam(project)"
              style="background-color: green; width: 125px; font-weight: bold; height: 35px; color: white; border-radius: 5px;"
              @click="openModal(project)"
          >
            Request Mentor
          </Button>

          <VaButton
              v-else-if="role === 'Mentor'"
              @click="openDiscussionModal(project)"
          >
            Open Discussion Forums
          </VaButton>

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
