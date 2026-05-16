<template>
  <div>
    <div v-if="appointments.length===0" class="text-sm text-gray-500">No upcoming appointments</div>
    <ul v-else class="space-y-2">
      <li v-for="a in appointments" :key="a.id" class="card">
        <div class="flex justify-between">
          <div>
            <p class="font-semibold">{{ a.title || a.type || 'Appointment' }}</p>
            <p class="text-xs text-gray-500">{{ formatDate(a.start_datetime) }}</p>
          </div>
          <div class="text-xs text-gray-400">{{ a.location || '' }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { formatDate } from '../lib/api'
defineProps({ appointments: { type: Array, default: () => [] } })
</script>
