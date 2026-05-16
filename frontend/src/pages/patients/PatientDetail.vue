<template>
  <Layout :title="patientTitle" >
    <div v-if="loading || !id" class="p-4"><PatientDetailSkeleton /></div>

    <div v-else-if="error" class="m-4 p-4 bg-red-50 rounded-xl border border-red-200">
      <p class="text-red-700 font-semibold">Patient not found</p>
      <p class="text-red-500 text-sm mt-1">Patient #{{ id }} could not be loaded.</p>
    </div>

    <div v-else class="space-y-4 pb-4">
      <div class="bg-gradient-to-br from-primary-600 to-primary-700 px-4 pt-4 pb-6">
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span class="text-white font-bold text-lg">{{ initials }}</span>
          </div>
          <div>
            <h1 class="text-white font-bold text-lg leading-tight">{{ patient.first_name }} {{ patient.last_name }}</h1>
            <p class="text-primary-100 text-sm">{{ age }} yrs · {{ patient.gender }} <span v-if="patient.bmi">· BMI {{ patient.bmi }}</span></p>
          </div>
        </div>
      </div>

      <section class="px-4">
        <h2 class="section-title mb-3">Latest Readings</h2>
        <div class="grid grid-cols-2 gap-3">
          <div class="card text-center">
            <p class="text-xs text-gray-500 mb-1">HbA1c</p>
            <div v-if="summary.latest_hba1c"><HbA1cBadge :value="summary.latest_hba1c.value_percent" size="lg" /></div>
            <div v-else><span class="text-gray-300 text-lg">—</span></div>
          </div>
          <div class="card text-center">
            <p class="text-xs text-gray-500 mb-1">Glucose</p>
            <div v-if="summary.latest_glucose"> <span class="stat-number">{{ Math.round(summary.latest_glucose.value_mgdl) }}<span class="text-xs text-gray-400 ml-0.5">mg/dL</span></span></div>
            <div v-else><span class="text-gray-300 text-lg">—</span></div>
          </div>
        </div>
      </section>

      <section class="px-4">
        <h2 class="section-title mb-3">Active Medications</h2>
        <MedicationList :medications="summary.active_medications || []" />
      </section>

      <section class="px-4">
        <h2 class="section-title mb-3">Upcoming Appointments</h2>
        <AppointmentList :appointments="summary.upcoming_appointments || []" />
      </section>

      <section class="px-4">
        <h2 class="section-title mb-3">Glucose History</h2>
        <div v-if="glucoseReadings.length>0" class="card mb-3 overflow-hidden">
          <p class="text-xs text-gray-400 mb-2">Last {{ glucoseReadings.length }} readings</p>
          <GlucoseChart :readings="glucoseReadings" />
        </div>

        <div class="space-y-2">
          <div v-for="r in glucoseReadings" :key="r.id" class="card flex items-center justify-between py-2.5">
            <div>
              <p class="text-sm text-gray-700">{{ r.reading_type }}</p>
              <p class="text-xs text-gray-400">{{ formatDateTime(r.reading_datetime) }}</p>
            </div>
            <div class="text-right">
              <span class="font-bold text-lg" :style="{ color: classifyGlucose(r.value_mgdl).color }">{{ Math.round(r.value_mgdl) }}</span>
              <span class="text-xs text-gray-400 ml-0.5">mg/dL</span>
              <p class="text-xs" :style="{ color: classifyGlucose(r.value_mgdl).color }">{{ classifyGlucose(r.value_mgdl).label }}</p>
            </div>
          </div>
        </div>

        <LoadMoreButton :isLoading="glucoseLoading" :hasMore="glucoseHasMore" @click="fetchGlucose(glucoseSkip)" label="Load More Readings" />
      </section>

    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Layout from '../../components/Layout.vue'
import PatientDetailSkeleton from '../../components/PatientDetailSkeleton.vue'
import MedicationList from '../../components/MedicationList.vue'
import AppointmentList from '../../components/AppointmentList.vue'
import LoadMoreButton from '../../components/LoadMoreButton.vue'
import GlucoseChart from '../../components/GlucoseChart.vue'
import HbA1cBadge from '../../components/HbA1cBadge.vue'
import { buildGlucoseUrl, classifyGlucose, formatDateTime, calculateAge } from '../../lib/api'
import client from '../../lib/api'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const summary = ref(null)
const loading = ref(true)
const error = ref(null)

const glucoseReadings = ref([])
const glucoseSkip = ref(0)
const glucoseHasMore = ref(false)
const glucoseLoading = ref(false)

const patientTitle = computed(() => summary.value ? `${summary.value.patient.first_name} ${summary.value.patient.last_name}` : 'Patient')
const patient = computed(() => summary.value?.patient || {})
const initials = computed(() => (patient.value.first_name ? (patient.value.first_name[0]||'') : '') + (patient.value.last_name ? (patient.value.last_name[0]||'') : ''))
const age = computed(() => patient.value.date_of_birth ? calculateAge(patient.value.date_of_birth) : '')

async function loadSummary() {
  loading.value = true
  error.value = null
  try {
    const res = await client.get(`/api/v1/patients/${id}/summary`)
    summary.value = res.data || res
  } catch (err) {
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}

async function fetchGlucose(currentSkip) {
  glucoseLoading.value = true
  try {
    const url = buildGlucoseUrl(id, currentSkip, 20)
    const res = await client.get(url)
    const data = res.data || res
    glucoseReadings.value = currentSkip === 0 ? data.readings : [...glucoseReadings.value, ...data.readings]
    glucoseHasMore.value = data.has_more
    glucoseSkip.value = currentSkip + 20
  } catch (err) {
    console.error(err)
  } finally {
    glucoseLoading.value = false
  }
}

onMounted(async () => {
  if (!id) return
  await loadSummary()
  fetchGlucose(0)
})
</script>
