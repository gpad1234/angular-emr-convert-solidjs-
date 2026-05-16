import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../pages/Dashboard.vue'
import PatientsIndex from '../pages/patients/Index.vue'
import PatientDetail from '../pages/patients/PatientDetail.vue'
import Settings from '../pages/Settings.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/patients', name: 'Patients', component: PatientsIndex },
  { path: '/patients/:id', name: 'PatientDetail', component: PatientDetail, props: true },
  { path: '/settings', name: 'Settings', component: Settings },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
