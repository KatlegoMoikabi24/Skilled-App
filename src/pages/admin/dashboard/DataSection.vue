<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    <DataSectionItem
      v-for="metric in dashboardMetrics"
      :key="metric.id"
      :title="metric.title"
      :value="metric.value"
      :change-text="metric.changeText"
      :up="metric.changeDirection === 'up'"
      :icon-background="metric.iconBackground"
      :icon-color="metric.iconColor"
    >
      <template #icon>
        <VaIcon :name="metric.icon" size="large" />
      </template>
    </DataSectionItem>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import {useColors} from 'vuestic-ui'
import DataSectionItem from './DataSectionItem.vue'
import {db} from "../../../firebase";
import {collection, getDocs} from "firebase/firestore";

interface DashboardMetric {
  id: string
  title: string
  value: string
  icon: string
  changeText: string
  changeDirection: 'up' | 'down'
  iconBackground: string
  iconColor: string
}

const { getColor } = useColors()

let projects = ref(0);
let recruiters = ref(0);
let mentors = ref(0);
let students = ref(0);

const fetchMetrics = async () => {
  const usersSnapshot = await getDocs(collection(db, 'Users'));
  const projectsSnapshot = await getDocs(collection(db, 'projects'));

  projects.value = projectsSnapshot.size;

  usersSnapshot.forEach((doc) => {
    const userData = doc.data();
    console.log(userData.role);
    if (userData.role === 'mentor') {
      mentors.value++;
    } else if (userData.role === 'Recruiter/Business') {
      recruiters.value++;
    } else if (userData.role === 'student') {
      students.value++;
    }
  });
}
onMounted(() => {
  fetchMetrics();
});

const dashboardMetrics = computed<DashboardMetric[]>(() => [
  {
    id: 'ongoingProjects',
    title: 'Skill-led Projects',
    value: projects,
    icon: 'mso-folder_open',
    changeText: '25.36%',
    changeDirection: 'up',
    iconBackground: getColor('info'),
    iconColor: getColor('on-info'),
  },
  {
    id: 'openInvoices',
    title: 'Students',
    value: students,
    icon: 'mso-account_circle',
    changeText: '25.36%',
    changeDirection: 'down',
    iconBackground: getColor('success'),
    iconColor: getColor('on-success'),
  },
  {
    id: 'recruiters',
    title: 'Recruiters',
    value: recruiters,
    icon: 'mso-account_circle',
    changeText: '2.5%',
    changeDirection: 'up',
    iconBackground: getColor('danger'),
    iconColor: getColor('on-danger'),
  },
  {
    id: 'mentors',
    title: 'Mentors',
    value: mentors,
    icon: 'mso-account_circle',
    changeText: '2.5%',
    changeDirection: 'up',
    iconBackground: getColor('danger'),
    iconColor: getColor('on-danger'),
  },
])
</script>
