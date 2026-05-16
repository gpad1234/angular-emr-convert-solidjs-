<template>
  <Layout title="Dashboard">
    <div v-if="loading" class="p-4">Loading...</div>
    <div v-else-if="error" class="m-4 p-4 bg-red-50 rounded-xl border border-red-200">
      <p class="text-red-700 font-semibold text-sm">Failed to load dashboard</p>
      <p class="text-red-500 text-xs mt-1">Ensure backend is running at {{ apiUrl }}</p>
    </div>
    <div v-else class="p-4 space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <StatCard label="Total Patients" :value="stats.total_patients" icon="👥" to="/patients" />
        <StatCard label="Avg HbA1c (30d)" :value="avgHbA1c" icon="🩺" />
        <StatCard label="HbA1c > 9%" :value="stats.high_hba1c_count" icon="📈" />
        <StatCard label="Active Meds" :value="stats.active_medications_count" icon="💊" />
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Layout from '../components/Layout.vue'
import StatCard from '../components/StatCard.vue'
import { fetchDashboard, apiBaseUrl } from '../lib/api'

const stats = ref(null)
const loading = ref(true)
const error = ref(null)

const apiUrl = apiBaseUrl

const avgHbA1c = computed(() => {
  if (!stats.value || !stats.value.avg_hba1c_last_30_days) return 'N/A'
  return `${stats.value.avg_hba1c_last_30_days.toFixed(1)}%`
})

async function load() {
  loading.value = true
  error.value = null
  try {
    stats.value = await fetchDashboard()
  } catch (err) {
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}

// listen for global refresh events
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('app-refresh', load)
}

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && window.removeEventListener) {
    window.removeEventListener('app-refresh', load)
  }
})

onMounted(load)
</script>
