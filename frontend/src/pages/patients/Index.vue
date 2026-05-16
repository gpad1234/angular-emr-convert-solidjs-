<template>
  <Layout title="Patients">
    <div class="p-4 space-y-3">

      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="search" type="search" placeholder="Search patients by name..." class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm" />
        <button v-if="search" @click="search = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">✕</button>
      </div>

      <select v-model="typeFilter" class="w-full py-2.5 px-3 rounded-xl border border-gray-200 bg-white text-sm">
        <option value="">All Diabetes Types</option>
        <option v-for="t in diabetesTypes" :key="t" :value="t">{{ t }}</option>
      </select>

      <div v-if="error" class="p-3 bg-red-50 rounded-xl border border-red-200">
        <p class="text-red-700 text-sm">Failed to load patients: {{ error }}</p>
      </div>

      <div v-if="!loading && patients.length === 0 && !error" class="text-center py-12">
        <p class="text-gray-400 text-4xl mb-2">🔍</p>
        <p class="text-gray-500 font-medium">No patients found</p>
      </div>

      <div v-for="p in patients" :key="p.id">
        <PatientCard :patient="p" />
      </div>

      <div v-if="loading && patients.length === 0" class="space-y-3">
        <div class="card animate-pulse" v-for="i in 4" :key="i"></div>
      </div>

      <LoadMoreButton :isLoading="loading && patients.length>0" :hasMore="hasMore" @click="loadMore" />

    </div>
  </Layout>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import Layout from '../../components/Layout.vue'
import PatientCard from '../../components/PatientCard.vue'
import LoadMoreButton from '../../components/LoadMoreButton.vue'
import { buildPatientsUrl } from '../../lib/api'
import client from '../../lib/api'

const PAGE_SIZE = 10
const diabetesTypes = ['Type 1','Type 2','LADA','Gestational','Prediabetes','Other']

const patients = ref([])
const skip = ref(0)
const hasMore = ref(false)
const loading = ref(false)
const error = ref(null)
const search = ref('')
const debouncedSearch = ref('')
const typeFilter = ref('')

let timer
watch(search, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => debouncedSearch.value = v, 300)
})

watch([debouncedSearch, typeFilter], () => {
  patients.value = []
  skip.value = 0
  hasMore.value = false
  error.value = null
  fetchPatients(0)
})

async function fetchPatients(currentSkip) {
  loading.value = true
  error.value = null
  try {
    const url = buildPatientsUrl(currentSkip, PAGE_SIZE, debouncedSearch.value, typeFilter.value)
    const res = await client.get(url)
    const data = res.data || res
    patients.value = currentSkip === 0 ? data.patients : [...patients.value, ...data.patients]
    hasMore.value = data.has_more
    skip.value = currentSkip + PAGE_SIZE
  } catch (err) {
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}

function loadMore() { fetchPatients(skip.value) }

onMounted(() => fetchPatients(0))
</script>
